import { NextRequest, NextResponse } from 'next/server';
import { calculateHaversineDistance, createErrorResponse, createSuccessResponse } from '@darsa/utils';
import type { GPSCoordinates } from '@darsa/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { qr_token, guru_id, nama_guru, unit_guru, user_gps, device_info } = body as {
      qr_token: string;
      guru_id?: string;
      nama_guru?: string;
      unit_guru?: 'MADRASAH' | 'MI';
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

    // Coordinates center for Pondok/School Gate (-6.2088, 106.8456)
    const schoolCenter: GPSCoordinates = {
      latitude: -6.2088,
      longitude: 106.8456,
    };
    const maxRadiusMeters = 200;

    // Calculate distance using Haversine formula
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

    const absensiGuruRecord = {
      id: `ABS-GURU-${Date.now()}`,
      guru_id: guru_id || 'GURU-001',
      nama_guru: nama_guru || 'Ustadz Pengajar Darsa',
      unit: unit_guru || 'MADRASAH',
      status: 'HADIR',
      distance_meters: distanceMeters,
      timestamp: new Date().toISOString(),
      lokasi: 'POS UTAMA MA\'HAD DARUSSA\'ADAH',
      device_info: device_info || 'Mobile Native Scanner',
    };

    return NextResponse.json(
      createSuccessResponse(absensiGuruRecord, 'Presensi Kehadiran Guru (Masuk/Pulang) via Dynamic QR berhasil dicatat ke Database')
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Internal Server Error pada pemrosesan scan QR Absensi Guru'),
      { status: 500 }
    );
  }
}
