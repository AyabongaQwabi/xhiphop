import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { randomUUID } from 'crypto';

const execPromise = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { videoUrl } = await req.json();
    console.log('Converting video to audio:', videoUrl);
    if (!videoUrl) {
      return NextResponse.json(
        { error: 'No video URL provided' },
        { status: 400 }
      );
    }

    const filename = randomUUID();
    const audioPath = path.join(process.cwd(), `${filename}.mp3`);
    console.log('\n\nAudio path:', audioPath);

    // Use FFmpeg to extract audio
    await execPromise(`ffmpeg -i "${videoUrl}" -q:a 0 -map a "${audioPath}"`);

    // Stream the file in the response for client download
    const fileStream = fs.createReadStream(audioPath);
    const response = new NextResponse(fileStream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${filename}.mp3"`,
      },
    });

    return response;
  } catch (error) {
    console.log('\n\nError processing video:', error);
    return NextResponse.json(
      { error: 'Failed to convert video to audio' },
      { status: 500 }
    );
  }
}
