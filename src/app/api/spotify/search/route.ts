import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const accessToken = searchParams.get('token');

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  if (!accessToken) {
    return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    const tracks = data.tracks.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      artist: item.artists[0]?.name || 'Unknown',
      album: item.album.name,
      uri: item.uri,
      embedUrl: `https://open.spotify.com/embed/track/${item.id}`,
      image: item.album.images[0]?.url || null,
      duration_ms: item.duration_ms,
    }));

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Error searching Spotify:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
