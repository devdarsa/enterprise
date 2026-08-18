import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@darsa/database';
import { authenticateRequest } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  try {
    let gedungs = await prisma.gedungAsrama.findMany({
      include: {
        kamar: {
          include: {
            santri: {
              select: { id: true, nama_lengkap: true, status: true },
            },
          },
          orderBy: { nama_kamar: 'asc' },
        },
      },
      orderBy: { nama_gedung: 'asc' },
    });

    // Auto-seed default gedung and kamar if empty
    if (gedungs.length === 0) {
      const defaultGedung = await prisma.gedungAsrama.create({
        data: {
          nama_gedung: 'Gedung A (Al-Farabi)',
          gender: 'LAKI_LAKI',
          keterangan: 'Asrama Santri Putra Pusat',
          kamar: {
            create: [
              { nama_kamar: 'Kamar 101', kapasitas: 15 },
              { nama_kamar: 'Kamar 102', kapasitas: 15 },
              { nama_kamar: 'Kamar 103', kapasitas: 15 },
              { nama_kamar: 'Kamar 201', kapasitas: 20 },
              { nama_kamar: 'Kamar 202', kapasitas: 20 },
            ],
          },
        },
        include: {
          kamar: {
            include: {
              santri: { select: { id: true, nama_lengkap: true, status: true } },
            },
          },
        },
      });
      gedungs = [defaultGedung];
    }

    // Flatten into list of kamar with gedung details
    const kamarList = gedungs.flatMap((g) =>
      g.kamar.map((k) => ({
        id: k.id,
        gedung_id: g.id,
        nama_gedung: g.nama_gedung,
        gender: g.gender,
        nama_kamar: k.nama_kamar,
        kapasitas: k.kapasitas,
        terisi: k.santri.filter((s) => s.status === 'AKTIF').length,
        santri: k.santri,
        status:
          k.santri.filter((s) => s.status === 'AKTIF').length >= k.kapasitas
            ? 'PENUH'
            : 'TERSEDIA',
      }))
    );

    return NextResponse.json({
      success: true,
      data: kamarList,
      gedung: gedungs.map((g) => ({ id: g.id, nama_gedung: g.nama_gedung, gender: g.gender })),
    });
  } catch (error: any) {
    console.error('Error fetching asrama:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data asrama: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { nama_kamar, kapasitas, nama_gedung, gedung_id } = body;

    if (!nama_kamar) {
      return NextResponse.json(
        { success: false, error: 'Nama kamar wajib diisi' },
        { status: 400 }
      );
    }

    let targetGedungId = gedung_id;
    if (!targetGedungId) {
      let g = await prisma.gedungAsrama.findFirst({
        where: { nama_gedung: nama_gedung || 'Gedung A (Al-Farabi)' },
      });
      if (!g) {
        g = await prisma.gedungAsrama.create({
          data: {
            nama_gedung: nama_gedung || 'Gedung A (Al-Farabi)',
            gender: 'LAKI_LAKI',
          },
        });
      }
      targetGedungId = g.id;
    }

    const newKamar = await prisma.kamar.create({
      data: {
        nama_kamar,
        kapasitas: Number(kapasitas) || 15,
        gedung_id: targetGedungId,
      },
      include: {
        gedung: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newKamar,
      message: `Kamar ${nama_kamar} berhasil ditambahkan`,
    });
  } catch (error: any) {
    console.error('Error creating kamar:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat kamar: ' + error.message },
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
    const { id, nama_kamar, kapasitas, gedung_id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID Kamar wajib diisi' }, { status: 400 });
    }

    const updated = await prisma.kamar.update({
      where: { id },
      data: {
        ...(nama_kamar ? { nama_kamar } : {}),
        ...(kapasitas ? { kapasitas: Number(kapasitas) } : {}),
        ...(gedung_id ? { gedung_id } : {}),
      },
      include: {
        gedung: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Data kamar berhasil diperbarui',
    });
  } catch (error: any) {
    console.error('Error updating kamar:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui kamar: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID Kamar wajib diisi' }, { status: 400 });
    }

    // Check if occupied
    const occupiedCount = await prisma.santri.count({
      where: { kamar_id: id, status: 'AKTIF' },
    });

    if (occupiedCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Kamar tidak dapat dihapus karena masih dihuni oleh ${occupiedCount} santri aktif. Pindahkan santri terlebih dahulu.`,
        },
        { status: 400 }
      );
    }

    await prisma.kamar.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Kamar berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting kamar:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus kamar: ' + error.message },
      { status: 500 }
    );
  }
}
