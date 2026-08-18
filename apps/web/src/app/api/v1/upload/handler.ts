import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let base64OrUrl = '';
    let folder = 'darsa_photos';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      base64OrUrl = body.file || body.image || body.avatar_url || body.foto_url;
      if (body.folder) folder = body.folder;
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (file) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const mime = file.type || 'image/jpeg';
        base64OrUrl = `data:${mime};base64,${buffer.toString('base64')}`;
      }
      const fld = formData.get('folder') as string | null;
      if (fld) folder = fld;
    }

    if (!base64OrUrl) {
      return NextResponse.json(
        { success: false, error: 'File atau data gambar tidak ditemukan dalam request.' },
        { status: 400 }
      );
    }

    const uploaded = await uploadToCloudinary(base64OrUrl, folder);

    return NextResponse.json({
      success: true,
      url: uploaded.url,
      public_id: uploaded.public_id,
      message: 'Foto berhasil disimpan di penyimpanan awan media.',
    });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses unggah foto.' },
      { status: 500 }
    );
  }
}
