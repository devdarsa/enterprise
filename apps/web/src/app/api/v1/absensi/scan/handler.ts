import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@darsa/database';
import { calculateHaversineDistance, createErrorResponse, createSuccessResponse } from '@darsa/utils';
import type { GPSCoordinates } from '@darsa/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { qr_token, santri_id, user_gps, device_info } = body as {
      qr_token: string;
      santri_id?: string;
      user_gps: GPSCoordinates;
      device_info?: string;
    };

    if (!qr_token || !user_gps || user_gps.latitude === undefined || user_gps.longitude === undefined) {
      return NextResponse.json(
        createErrorResponse('Payload tidak lengkap. Koordinat GPS dan QR token wajib diserahkan.', [
          { field: 'user_gps', message: 'Koordinat latitude dan longitude presisi wajib diisi' },
        ]),
        { status: 400 }
      );
    }

    // 1. Validasi QR Token di database — cek keberadaan & masa berlaku
    const qrSession = await prisma.qrSession.findFirst({
      where: {
        qr_token,
        expires_at: { gt: new Date() },
      },
    });

    if (!qrSession) {
      return NextResponse.json(
        createErrorResponse('QR Code tidak valid atau sudah kedaluwarsa. Silakan minta QR baru dari petugas.'),
        { status: 422 }
      );
    }

    // 2. Ambil lokasi presensi aktif dari database
    const lokasiPresensi = await prisma.lokasiPresensi.findFirst({
      orderBy: { created_at: 'desc' },
    });

    if (!lokasiPresensi) {
      return NextResponse.json(
        createErrorResponse('Lokasi presensi belum dikonfigurasi oleh admin.'),
        { status: 503 }
      );
    }

    const schoolCenter: GPSCoordinates = {
      latitude: lokasiPresensi.latitude,
      longitude: lokasiPresensi.longitude,
    };
    const maxRadiusMeters = lokasiPresensi.radius_meter;

    // 3. Hitung jarak via Haversine formula
    const distanceMeters = calculateHaversineDistance(user_gps, schoolCenter);

    if (distanceMeters > maxRadiusMeters) {
      return NextResponse.json(
        createErrorResponse(
          `Presensi ditolak. Lokasi Anda (${distanceMeters}m) berada di luar batas geofencing (${maxRadiusMeters}m).`,
          [
            {
              field: 'gps_latitude',
              message: `Jarak Anda (${distanceMeters}m) melebihi batas radius yang diizinkan`,
            },
          ]
        ),
        { status: 422 }
      );
    }

    // 4. Tentukan status absensi berdasarkan waktu
    const now = new Date();
    const jamSekarang = now.getHours() * 60 + now.getMinutes(); // menit sejak tengah malam
    const batasHadir = 7 * 60; // 07:00
    const batasTerlambat = 7 * 60 + 30; // 07:30

    let statusAbsensi: 'HADIR' | 'TERLAMBAT' = 'HADIR';
    if (jamSekarang > batasHadir && jamSekarang <= batasTerlambat) {
      statusAbsensi = 'TERLAMBAT';
    } else if (jamSekarang > batasTerlambat) {
      statusAbsensi = 'TERLAMBAT';
    }

    // 5. Tulis ke AbsensiLog jika santri_id disediakan
    let absensiRecord: any = null;
    if (santri_id) {
      const santri = await prisma.santri.findFirst({ where: { id: santri_id, deleted_at: null } });
      if (santri) {
        absensiRecord = await prisma.absensiLog.create({
          data: {
            santri_id,
            lokasi_presensi_id: lokasiPresensi.id,
            status: statusAbsensi,
            latitude_scan: user_gps.latitude,
            longitude_scan: user_gps.longitude,
            distance_meters: distanceMeters,
            device_info: device_info || null,
          },
        });
      }
    }

    return NextResponse.json(
      createSuccessResponse(
        {
          id: absensiRecord?.id || `SCAN-${Date.now()}`,
          santri_id: santri_id || null,
          status: statusAbsensi,
          distance_meters: distanceMeters,
          timestamp: now.toISOString(),
          lokasi: lokasiPresensi.nama_lokasi,
          device_info: device_info || null,
        },
        'Presensi berhasil dicatat ke Database.'
      )
    );
  } catch (error) {
    console.error('[Absensi Scan] Error:', error);
    return NextResponse.json(
      createErrorResponse('Internal Server Error pada pemrosesan scan QR Absensi'),
      { status: 500 }
    );
  }
}
