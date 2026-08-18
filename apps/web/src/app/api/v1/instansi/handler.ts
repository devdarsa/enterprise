import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@darsa/database';
import { authenticateRequest } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  try {
    let pondok = await prisma.pondok.findFirst({
      include: {
        madrasah: true,
        lokasi_presensi: true,
      },
    });

    if (!pondok) {
      pondok = await prisma.pondok.create({
        data: {
          nama: "Pondok Pesantren Ma'had Darussa'adah",
          alamat: 'Jl. Pesantren No. 01, Kediri, Jawa Timur',
          telepon: '081234567890',
          madrasah: {
            create: [
              {
                nama: "Madrasah Diniyah Ma'had Darussa'adah",
                npsn: 'MD-DARSA-001',
              },
            ],
          },
          lokasi_presensi: {
            create: [
              {
                nama_lokasi: 'Komplek Utama Pesantren',
                latitude: -7.8166,
                longitude: 112.0167,
                radius_meter: 200,
              },
            ],
          },
        },
        include: {
          madrasah: true,
          lokasi_presensi: true,
        },
      });
    }

    const instansiList = [
      {
        id: pondok.id,
        nama: pondok.nama,
        alamat: pondok.alamat,
        telepon: pondok.telepon,
        jenis: 'PONDOK',
        radius_meter: pondok.lokasi_presensi?.[0]?.radius_meter || 200,
        latitude: pondok.lokasi_presensi?.[0]?.latitude || -7.8166,
        longitude: pondok.lokasi_presensi?.[0]?.longitude || 112.0167,
      },
      ...pondok.madrasah.map((m) => ({
        id: m.id,
        nama: m.nama,
        npsn: m.npsn,
        alamat: pondok.alamat,
        telepon: pondok.telepon,
        jenis: 'MADRASAH',
        radius_meter: 200,
        latitude: -7.8166,
        longitude: 112.0167,
      })),
    ];

    return NextResponse.json({
      success: true,
      data: instansiList,
      pondok: pondok,
    });
  } catch (error: any) {
    console.error('Error fetching instansi:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data instansi: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { nama, alamat, telepon, radius_meter, latitude, longitude } = body;

    let pondok = await prisma.pondok.findFirst({
      include: { lokasi_presensi: true },
    });

    if (!pondok) {
      pondok = await prisma.pondok.create({
        data: {
          nama: nama || "Pondok Pesantren Ma'had Darussa'adah",
          alamat: alamat || 'Kediri, Jawa Timur',
          telepon: telepon || '081234567890',
        },
        include: { lokasi_presensi: true },
      });
    } else {
      pondok = await prisma.pondok.update({
        where: { id: pondok.id },
        data: {
          ...(nama ? { nama } : {}),
          ...(alamat !== undefined ? { alamat } : {}),
          ...(telepon !== undefined ? { telepon } : {}),
        },
        include: { lokasi_presensi: true },
      });
    }

    // Update or create lokasi_presensi
    if (radius_meter !== undefined || latitude !== undefined || longitude !== undefined) {
      if (pondok.lokasi_presensi.length > 0) {
        await prisma.lokasiPresensi.update({
          where: { id: pondok.lokasi_presensi[0].id },
          data: {
            ...(radius_meter ? { radius_meter: Number(radius_meter) } : {}),
            ...(latitude ? { latitude: Number(latitude) } : {}),
            ...(longitude ? { longitude: Number(longitude) } : {}),
          },
        });
      } else {
        await prisma.lokasiPresensi.create({
          data: {
            pondok_id: pondok.id,
            nama_lokasi: 'Komplek Utama Pesantren',
            latitude: Number(latitude) || -7.8166,
            longitude: Number(longitude) || 112.0167,
            radius_meter: Number(radius_meter) || 200,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: pondok,
      message: 'Konfigurasi instansi berhasil diperbarui',
    });
  } catch (error: any) {
    console.error('Error updating instansi:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui instansi: ' + error.message },
      { status: 500 }
    );
  }
}
