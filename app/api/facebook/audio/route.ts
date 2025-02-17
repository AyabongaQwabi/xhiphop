import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { randomUUID } from 'crypto';

const execPromise = promisify(exec);
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'audio');

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
    const audioPath = path.join(OUTPUT_DIR, `${filename}.mp3`);
    const publicPath = `/audio/${filename}.mp3`;

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Use FFmpeg to extract audio
    await execPromise(`ffmpeg -i "${videoUrl}" -q:a 0 -map a "${audioPath}"`);

    return NextResponse.json({ audioUrl: publicPath });
  } catch (error) {
    //console.log('Error processing video:', error);
    return NextResponse.json(
      { error: 'Error processing video' },
      { status: 500 }
    );
  }
}
