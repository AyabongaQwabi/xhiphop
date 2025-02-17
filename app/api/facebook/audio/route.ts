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

    // Ensure the OUTPUT_DIR exists
    await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });

    const filename = randomUUID();
    const audioPath = path.join(OUTPUT_DIR, `${filename}.mp3`);

    // Your existing code to convert video to audio and save it to audioPath
  } catch (error) {
    console.error('Error converting video to audio:', error);
    return NextResponse.json(
      { error: 'Failed to convert video to audio' },
      { status: 500 }
    );
  }
}
