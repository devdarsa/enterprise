import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'j0auc9qv',
  api_key: process.env.CLOUDINARY_API_KEY || '324621927362576',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'TagkH9NDGpI9cAxKONNhR2Qi4c8',
  secure: true,
});

/**
 * Extract public_id from a Cloudinary URL
 * Example: https://res.cloudinary.com/j0auc9qv/image/upload/v1787068225/darsa_santri/abc123xyz.png
 * Result: darsa_santri/abc123xyz
 */
export function extractCloudinaryPublicId(url: string): string | null {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
    return null;
  }
  try {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return null;

    let pathAfterUpload = url.substring(uploadIndex + '/upload/'.length);

    // Remove any transformation segments (e.g. c_limit,w_800/)
    const segments = pathAfterUpload.split('/');
    const cleanSegments: string[] = [];

    for (const seg of segments) {
      // Ignore version tags like v123456789
      if (/^v\d+$/.test(seg)) {
        continue;
      }
      // Ignore transformations like c_limit,w_800,q_auto
      if (seg.includes(',') || seg.startsWith('c_') || seg.startsWith('w_') || seg.startsWith('h_') || seg.startsWith('q_')) {
        continue;
      }
      cleanSegments.push(seg);
    }

    const fullPath = cleanSegments.join('/');
    // Remove extension (.png, .jpg, etc.)
    const lastDot = fullPath.lastIndexOf('.');
    if (lastDot !== -1) {
      return fullPath.substring(0, lastDot);
    }
    return fullPath;
  } catch {
    return null;
  }
}

/**
 * Delete an asset from Cloudinary by URL or public_id
 */
export async function deleteFromCloudinary(urlOrPublicId: string): Promise<boolean> {
  if (!urlOrPublicId || typeof urlOrPublicId !== 'string') return false;

  try {
    let publicId = urlOrPublicId;
    if (urlOrPublicId.startsWith('http://') || urlOrPublicId.startsWith('https://')) {
      const extracted = extractCloudinaryPublicId(urlOrPublicId);
      if (!extracted) return false;
      publicId = extracted;
    }

    const res = await cloudinary.uploader.destroy(publicId, { invalidate: true });
    return res.result === 'ok';
  } catch (err) {
    console.error(`Gagal menghapus aset Cloudinary (${urlOrPublicId}):`, err);
    return false;
  }
}

/**
 * Upload an image (file / base64) to Cloudinary
 */
export async function uploadToCloudinary(
  fileOrBase64: string,
  folder: string = 'darsa_photos'
): Promise<{ url: string; public_id: string }> {
  try {
    // If it's already an external HTTP(S) URL (not base64 data URI), return as is or re-host
    if (fileOrBase64.startsWith('http://') || fileOrBase64.startsWith('https://')) {
      if (fileOrBase64.includes('cloudinary.com')) {
        return { url: fileOrBase64, public_id: extractCloudinaryPublicId(fileOrBase64) || '' };
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
