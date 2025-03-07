import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v12.0/${id}?fields=id,title,description,source,picture,created_time&access_token=${process.env.FACEBOOK_ACCESS_TOKEN}`
    );

    if (!response.ok) {
      throw new Error(`Facebook API responded with status: ${response.status}`);
    }

    const data = await response.json();

    const video = {
      id: data.id,
      title: data.title || 'Untitled Video',
      description: data.description || '',
      source: data.source,
      thumbnail: data.picture,
      createdTime: data.created_time,
      facebookPostId: data.id, // Using the video ID as the post ID
    };

    res.status(200).json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Failed to fetch video details' });
  }
}
