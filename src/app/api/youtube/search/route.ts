import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  try {
    // Using YouTube Data API (requires API key)
    // For now, we'll use a simpler approach with no-auth search
    // Note: This is a simplified version. For production, you should use YouTube Data API with proper API key
    
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      // Fallback: Return mock data if no API key
      return NextResponse.json({
        videos: [],
        error: 'YouTube API key not configured'
      });
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=20&key=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    const videos = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.default?.url || item.snippet.thumbnails.medium?.url || '',
    }));

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error searching YouTube:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
