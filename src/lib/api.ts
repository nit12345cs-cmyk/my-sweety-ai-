export function getApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  try {
    const customKey = localStorage.getItem('swatea_custom_api_key');
    if (customKey && customKey.trim()) {
      headers['x-custom-api-key'] = customKey.trim();
    }
  } catch (err) {
    console.error('Error reading custom API key:', err);
  }
  return headers;
}

/**
 * Universal safe JSON fetcher for mobile and Vercel hosting.
 * Handles HTML error pages (e.g., Vercel 500 / 502 / 504 server errors) gracefully
 * to avoid "Unexpected token 'A', 'A server e'... is not valid JSON" crashes.
 */
export async function safeFetchJson<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    ...getApiHeaders(),
    ...(options.headers as Record<string, string>),
  };

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (netErr: any) {
    throw new Error(
      `இணைய இணைப்பு பிழை: சேவையகத்துடன் தொடர்பு கொள்ள முடியவில்லை. (Network connection error: ${netErr?.message || netErr})`
    );
  }

  const contentType = response.headers.get('content-type') || '';
  let responseText = '';
  try {
    responseText = await response.text();
  } catch (textErr) {
    throw new Error(`சேவையக பதிலைப் படிக்க முடியவில்லை (${response.status})`);
  }

  let data: any;
  const trimmed = responseText.trim();
  if (contentType.includes('application/json') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      data = { error: responseText || 'Invalid JSON response from server' };
    }
  } else {
    // Non-JSON response (e.g. Vercel 500 HTML error page)
    if (!response.ok) {
      // Extract title or body preview if HTML
      const match = responseText.match(/<title>(.*?)<\/title>/i);
      const title = match ? match[1] : 'Server Error';
      throw new Error(
        `சேவையக பிழை (${response.status}): ${title}. Vercel / Server error page returned.`
      );
    }
    data = { reply: responseText, html: responseText, text: responseText };
  }

  if (!response.ok) {
    const errorMsg =
      data?.error ||
      data?.message ||
      `சேவையக பிழை (Server Status Code: ${response.status})`;
    throw new Error(errorMsg);
  }

  return data as T;
}

