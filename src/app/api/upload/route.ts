import { NextRequest, NextResponse } from 'next/server';
import { uploadLogoToR2, deleteLogoFromR2, isR2Configured } from '@/lib/storage/r2';

export async function POST(req: NextRequest) {
  if (!isR2Configured) {
    return NextResponse.json(
      { error: 'Cloudflare R2 storage credentials are not configured.' },
      { status: 500 }
    );
  }

  try {
    const contentType = req.headers.get('content-type') || '';

    // Handle JSON payload with base64 dataUrl
    if (contentType.includes('application/json')) {
      const { dataUrl, fileName } = await req.json();

      if (!dataUrl) {
        return NextResponse.json({ error: 'dataUrl is required' }, { status: 400 });
      }

      const result = await uploadLogoToR2(dataUrl, fileName || 'logo.png');

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json(result);
    }

    // Handle multipart form upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadLogoToR2(buffer, file.name, file.type);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unsupported content-type' }, { status: 400 });
  } catch (error: any) {
    console.error('API /api/upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!isR2Configured) {
    return NextResponse.json(
      { error: 'Cloudflare R2 storage credentials are not configured.' },
      { status: 500 }
    );
  }

  try {
    const { keyOrUrl } = await req.json();
    if (!keyOrUrl) {
      return NextResponse.json({ error: 'keyOrUrl is required' }, { status: 400 });
    }

    const success = await deleteLogoFromR2(keyOrUrl);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
