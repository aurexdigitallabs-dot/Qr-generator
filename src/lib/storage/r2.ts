import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID || '6d2944893413cc4b53c6fed8e1171aab';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
const bucketName = process.env.R2_BUCKET_NAME || 'qr-generator';
const endpoint = process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;
export const publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-0744d662dddc4feb8fc3a798788246d1.r2.dev';

export const isR2Configured = Boolean(accessKeyId && secretAccessKey);

export const r2Client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Uploads a logo buffer or base64 image string to Cloudflare R2
 */
export async function uploadLogoToR2(
  dataUrlOrBuffer: string | Buffer,
  fileName: string = 'logo.png',
  contentType: string = 'image/png'
): Promise<UploadResult> {
  if (!isR2Configured) {
    return { success: false, error: 'Cloudflare R2 is not configured.' };
  }

  try {
    let bodyBuffer: Buffer;
    let mime = contentType;

    if (typeof dataUrlOrBuffer === 'string') {
      if (dataUrlOrBuffer.startsWith('data:')) {
        const matches = dataUrlOrBuffer.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mime = matches[1];
          bodyBuffer = Buffer.from(matches[2], 'base64');
        } else {
          return { success: false, error: 'Invalid data URL format.' };
        }
      } else {
        // Direct URL or fetch
        const res = await fetch(dataUrlOrBuffer);
        const arrayBuf = await res.arrayBuffer();
        bodyBuffer = Buffer.from(arrayBuf);
      }
    } else {
      bodyBuffer = dataUrlOrBuffer;
    }

    const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `logos/${Date.now()}-${cleanName}`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: bodyBuffer,
        ContentType: mime,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    const publicUrl = `${publicBaseUrl.replace(/\/$/, '')}/${key}`;

    return {
      success: true,
      url: publicUrl,
      key,
    };
  } catch (error: any) {
    console.error('Error uploading to Cloudflare R2:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload to Cloudflare R2',
    };
  }
}

/**
 * Deletes a logo from Cloudflare R2 given its key or full URL
 */
export async function deleteLogoFromR2(keyOrUrl: string): Promise<boolean> {
  if (!isR2Configured) return false;

  try {
    let key = keyOrUrl;
    if (keyOrUrl.startsWith('http')) {
      const urlObj = new URL(keyOrUrl);
      key = urlObj.pathname.replace(/^\//, '');
    }

    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );

    return true;
  } catch (err) {
    console.error('Error deleting from Cloudflare R2:', err);
    return false;
  }
}
