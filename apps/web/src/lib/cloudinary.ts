import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'j0auc9qv',
  api_key: process.env.CLOUDINARY_API_KEY || '324621927362576',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'TagkH9NDGpI9cAxKONNhR2Qi4c8',
  secure: true,
});

export async function uploadToCloudinary(
  fileOrBase64: string,
  folder: string = 'darsa_photos'
): Promise<{ url: string; public_id: string }> {
  try {
    // If it's already an external HTTP(S) URL (not base64 data URI), return as is or re-host
    if (fileOrBase64.startsWith('http://') || fileOrBase64.startsWith('https://')) {
      if (fileOrBase64.includes('cloudinary.com')) {
        return { url: fileOrBase64, public_id: '' };
      }
    }

    const result: UploadApiResponse = await cloudinary.uploader.upload(fileOrBase64, {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(error.message || 'Gagal mengunggah foto ke penyimpanan awan.');
  }
}

export default cloudinary;
