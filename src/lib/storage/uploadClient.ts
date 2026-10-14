/**
 * Client-side helper to upload logos to Cloudflare R2 storage via /api/upload
 */
export async function uploadLogoToStorage(
  dataUrl: string,
  fileName: string = 'logo.png'
): Promise<{ url: string; success: boolean }> {
  if (!dataUrl || !dataUrl.startsWith('data:')) {
    return { url: dataUrl, success: true };
  }

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dataUrl, fileName }),
    });

    if (!res.ok) {
      console.warn('Storage upload returned non-OK status:', res.status);
      return { url: dataUrl, success: false };
    }

    const data = await res.json();
    if (data.success && data.url) {
      return { url: data.url, success: true };
    }

    return { url: dataUrl, success: false };
  } catch (err) {
    console.error('Failed to upload logo to Cloudflare R2:', err);
    return { url: dataUrl, success: false };
  }
}
