import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    let fileName = 'brand-qrcode.png';
    let mimeType = 'image/png';
    let base64Data = '';
    let svgData = '';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      fileName = body.fileName || fileName;
      mimeType = body.mimeType || (fileName.endsWith('.svg') ? 'image/svg+xml' : 'image/png');
      base64Data = body.data || '';
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      fileName = (formData.get('fileName') as string) || fileName;
      mimeType = (formData.get('mimeType') as string) || (fileName.endsWith('.svg') ? 'image/svg+xml' : 'image/png');
      base64Data = (formData.get('data') as string) || '';
    }

    if (!base64Data) {
      return new NextResponse('Missing image data', { status: 400 });
    }

    // Clean up filename to prevent header injection
    const cleanFileName = fileName.replace(/[^\w\.\-\s]/gi, '_');

    let fileBuffer: Buffer;

    if (mimeType.includes('svg') || cleanFileName.endsWith('.svg')) {
      // Check if data is already raw SVG or data URL
      if (base64Data.startsWith('data:image/svg+xml;base64,')) {
        const rawBase64 = base64Data.replace('data:image/svg+xml;base64,', '');
        fileBuffer = Buffer.from(rawBase64, 'base64');
      } else if (base64Data.startsWith('data:image/svg+xml;charset=utf-8,') || base64Data.startsWith('data:image/svg+xml,')) {
        const urlEncoded = base64Data.replace(/^data:image\/svg\+xml(;charset=utf-8)?,/, '');
        fileBuffer = Buffer.from(decodeURIComponent(urlEncoded), 'utf-8');
      } else {
        fileBuffer = Buffer.from(base64Data, 'utf-8');
      }
      mimeType = 'image/svg+xml; charset=utf-8';
    } else {
      // PNG raster
      const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      fileBuffer = Buffer.from(cleanBase64, 'base64');
      mimeType = 'image/png';
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${cleanFileName}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error('Download route error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
