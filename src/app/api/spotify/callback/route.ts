import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/?error=' + error, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 'http://localhost:3000';

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL('/?error=missing_credentials', request.url));
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.redirect(new URL('/?error=' + data.error, request.url));
    }

    // Redirect back to app with access token in hash
    const redirectUrl = new URL('/', request.url);
    redirectUrl.hash = `access_token=${data.access_token}&token_type=${data.token_type}&expires_in=${data.expires_in}`;
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return NextResponse.redirect(new URL('/?error=exchange_failed', request.url));
  }
}
