import { NextResponse } from 'next/server';

const FACEBOOK_API_URL = 'https://graph.facebook.com/v12.0';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json(
      { error: 'Video ID is required' },
      { status: 400 }
    );
  }

  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

  if (!accessToken) {
    console.error('Missing configuration: Facebook Access Token');
    return NextResponse.json(
      { error: 'Missing Facebook configuration' },
      { status: 500 }
    );
  }

  const url =
    `${FACEBOOK_API_URL}/${videoId}/comments?` +
    new URLSearchParams({
      access_token: accessToken,
      fields:
        'id,message,created_time,from{id,name,picture},likes.summary(true),comments.summary(true)',
      limit: '50',
    });

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

    // Enrich comments with detailed information
    const enrichedComments = await Promise.all(
      data.data.map(async (comment) => {
        const commentUrl =
          `${FACEBOOK_API_URL}/${comment.id}?` +
          new URLSearchParams({
            access_token: accessToken,
            fields: 'id,message,created_time,from,like_count,comment_count',
          });

        console.log('\n\ncommentUrl:', commentUrl);

        // const repliesUrl =
        //   `${FACEBOOK_API_URL}/${comment.id}/comments?` +
        //   new URLSearchParams({
        //     access_token: accessToken,
        //     fields:
        //       'id,message,created_time,from{id,name,picture},likes.summary(true)',
        //     limit: '10',
        //   });

        const enrichedResp = await fetch(commentUrl);
        const enrichedData = await enrichedResp.json();

        return {
          ...comment,
          ...enrichedData,
        };
      })
    );

    return NextResponse.json({ data: enrichedComments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error fetching comments from Facebook',
      },
      { status: 500 }
    );
  }
}
