import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@darsa/database';
import { authenticateRequest } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || '';

    // Fetch from surat_arsip table and surat table
    const [arsipDocs, suratDocs] = await Promise.all([
      prisma.suratArsip.findMany({
        where: search
          ? {
              OR: [
                { nomor_surat: { contains: search, mode: 'insensitive' } },
                { perihal: { contains: search, mode: 'insensitive' } },
              ],
            }
          : undefined,
        orderBy: { created_at: 'desc' },
      }),
      prisma.surat.findMany({
        where: search
          ? {
              OR: [
                { nomor_surat: { contains: search, mode: 'insensitive' } },
                { perihal: { contains: search, mode: 'insensitive' } },
              ],
            }
          : undefined,
        orderBy: { tanggal: 'desc' },
        take: 50,
      }),
    ]);

    const combined = [
      ...arsipDocs.map((a) => ({
        id: a.id,
        kodeArsip: a.nomor_surat,
        kategori: a.jenis || 'DOKUMEN_RESMI',
        judul: a.perihal,
        pengirim: a.pengirim || "Sekretariat Ma'had Darussa'adah",
        penerima: a.penerima || 'Pihak Terkait',
        tahunAjaran: '2025/2026',
        tanggalArsip: a.tanggal_surat
          ? new Date(a.tanggal_surat).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '01 Jan 2026',
        fileUrl: a.file_url || null,
        fileSize: '1.2 MB',
        sumber: 'ARSIP_DIGITAL',
      })),
      ...suratDocs.map((s) => ({
        id: s.id,
        kodeArsip: s.nomor_surat || `SRT-${s.id.slice(0, 6)}`,
        kategori: s.jenis_surat || 'SURAT_RESMI',
        judul: s.perihal || 'Surat Keputusan / Izin Pesantren',
        pengirim: "Pondok Pesantren Ma'had Darussa'adah",
        penerima: s.penerima || 'Umum',
        tahunAjaran: '2025/2026',
        tanggalArsip: s.tanggal
          ? new Date(s.tanggal).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '01 Jan 2026',
        fileUrl: s.file_url || null,
        fileSize: '850 KB',
        sumber: 'PERSURATAN',
      })),
    ];

    return NextResponse.json({
      success: true,
      data: combined,
    });
  } catch (error: any) {
    console.error('Error fetching arsip:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat arsip: ' + error.message },
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
    const { nomor_surat, perihal, jenis, pengirim, penerima, file_url, keterangan } = body;

    if (!nomor_surat || !perihal) {
      return NextResponse.json(
        { success: false, error: 'Nomor arsip dan judul/perihal dokumen wajib diisi' },
        { status: 400 }
      );
    }

    const newArsip = await prisma.suratArsip.create({
      data: {
        nomor_surat,
        perihal,
        jenis: jenis || 'SURAT_MASUK',
        pengirim,
        penerima,
        file_url,
        keterangan,
      },
    });

    return NextResponse.json({
      success: true,
      data: newArsip,
      message: 'Dokumen arsip berhasil disimpan ke database',
    });
  } catch (error: any) {
    console.error('Error creating arsip:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan arsip: ' + error.message },
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
      return NextResponse.json({ success: false, error: 'ID Arsip wajib diisi' }, { status: 400 });
    }

    await prisma.suratArsip.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Dokumen arsip berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting arsip:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus arsip: ' + error.message },
      { status: 500 }
    );
  }
}
