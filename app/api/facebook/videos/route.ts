import { NextResponse } from 'next/server';

const FACEBOOK_API_URL = 'https://graph.facebook.com/v12.0';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const after = searchParams.get('after') || '';

  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

  if (!pageId || !accessToken) {
    console.error('Missing configuration:', {
      hasPageId: !!pageId,
      hasAccessToken: !!accessToken,
    });
    return NextResponse.json(
      { error: 'Missing Facebook configuration' },
      { status: 500 }
    );
  }

  const url =
    `${FACEBOOK_API_URL}/${pageId}/videos?` +
    new URLSearchParams({
      access_token: accessToken,
      fields:
        'id,title,description,thumbnails,created_time,source,likes.summary(total_count),comments.summary(total_count)',
      limit: '10',
      ...(after ? { after } : {}),
    });

  console.log('Fetching videos from Facebook:', url);
  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Facebook API error response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return NextResponse.json(
        {
          error: `Facebook API error: ${
            errorData.error?.message || response.statusText
          }`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform the data to include the highest resolution thumbnail and count summaries
    if (data.data && data.data.length > 0) {
      data.data = data.data.map((video: any) => ({
        ...video,
        thumbnail: video.thumbnails?.data?.[0]?.uri || null,
        likesCount: video.likes?.summary?.total_count ?? 0,
        commentsCount: video.comments?.summary?.total_count ?? 0,
      }));
    } else {
      console.warn('No videos found in the Facebook API response');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error fetching videos from Facebook',
      },
      { status: 500 }
    );
  }
}
