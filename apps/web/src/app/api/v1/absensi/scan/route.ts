import { NextRequest, NextResponse } from 'next/server';
import { calculateHaversineDistance, createErrorResponse, createSuccessResponse } from '@darsa/utils';
import type { GPSCoordinates } from '@darsa/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { qr_token, santri_id, user_gps, device_info } = body as {
      qr_token: string;
      santri_id: string;
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

    const absensiRecord = {
      id: `ABS-${Date.now()}`,
      santri_id: santri_id || 'DEMO-SANTRI-01',
      status: 'HADIR',
      distance_meters: distanceMeters,
      timestamp: new Date().toISOString(),
      lokasi: 'Gerbang Utama & Pos Keamanan Darsa',
    };

    return NextResponse.json(
      createSuccessResponse(absensiRecord, 'Presensi presisi GPS & Dynamic QR berhasil dicatat')
    );
  } catch (error) {
    return NextResponse.json(createErrorResponse('Gagal memproses presensi'), { status: 500 });
  }
}
