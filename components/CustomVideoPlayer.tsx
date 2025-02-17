import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Download, Music } from 'lucide-react';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { Save } from 'lucide-react';
import { set } from 'date-fns';

export default function CustomVideoPlayer({ src, description }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [mp3Url, setMp3Url] = useState(null);
  const [converting, setConverting] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messageRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', () =>
        setDuration(video.duration)
      );
      video.addEventListener('timeupdate', () =>
        setCurrentTime(video.currentTime)
      );
    }
    return () => {
      if (video) {
        video.removeEventListener('loadedmetadata', () =>
          setDuration(video.duration)
        );
        video.removeEventListener('timeupdate', () =>
          setCurrentTime(video.currentTime)
        );
      }
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  const load = async () => {
    setIsLoading(true);
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';
    const ffmpeg = ffmpegRef.current;

    // Log messages from FFmpeg
    ffmpeg.on('log', ({ message }) => {
      if (messageRef.current) messageRef.current.innerHTML = message;
    });

    // Load FFmpeg WebAssembly files from the unpkg CDN
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm'
      ),
    });

    setLoaded(true);
    setIsLoading(false);
    console.log('FFmpeg is ready to use');
  };

  const convertToMP3 = async () => {
    setConverting(true);
    const ffmpeg = ffmpegRef.current;

    // Download an example MP4 video file (replace this URL with your own video file URL)
    await ffmpeg.writeFile('input.mp4', await fetchFile(src));

    console.log('Extract audio from the MP4 and convert to MP3');
    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-vn',
      '-ar',
      '44100',
      '-ac',
      '2',
      '-ab',
      '192k',
      'output.mp3',
    ]);
    console.log('Audio extracted and converted to MP3');
    // Read the MP3 output file
    const data = (await ffmpeg.readFile('output.mp3')) as any;
    console.log('MP3 data:', data);
    // download the blob data
    const audioBlob = new Blob([data.buffer], { type: 'audio/mp3' });

    // Create a URL for the audio blob to allow downloading
    const audioUrl = URL.createObjectURL(audioBlob);
    setMp3Url(audioUrl);

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${description}.mp3`;
    link.click();

    setConverting(false);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className='relative w-full md:h-full h-full  lg:mx-auto lg:p-4 pb-4'>
      <div className='relative w-full bg-black lg:rounded-2xl lg:overflow-hidden lg:border-8 lg:border-red-600 lg:shadow-lg shadow-red-400'>
        <video
          ref={videoRef}
          src={src}
          className='w-full h-48 lg:h-72  lg:rounded-2xl'
          controls={false}
        ></video>
        <button
          onClick={togglePlay}
          className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700'
        >
          {playing ? <Pause size={32} /> : <Play size={32} />}
        </button>
      </div>
      <div className='flex items-center justify-between text-gray-800 mt-2 px-4 py-2'>
        <span>
          {new Date(currentTime * 1000).toISOString().substring(14, 19)}
        </span>
        <input
          type='range'
          min='0'
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className='w-full mx-2 text-red-600 bg-red-900'
        />
        <span>{new Date(duration * 1000).toISOString().substring(14, 19)}</span>
      </div>
      <div className='flex items-center justify-center mt-4 lg: gap-4 lg:h-full px-4 py-2'>
        <a
          href={src}
          download={`${description}.mp4`}
          target='_blank'
          rel='noopener noreferrer'
          className='block w-full text-center mb-4 bg-red-600 text-white py-2 rounded-lg shadow-lg hover:bg-red-700'
        >
          <Download className='inline-block mr-2' /> Gutyula iVideo
        </a>
        {mp3Url ? (
          <a
            href={mp3Url}
            download={`${description}.mp3`}
            target='_blank'
            rel='noopener noreferrer'
            className='block w-full text-center mb-4 bg-red-600 text-white py-2 rounded-lg shadow-lg hover:bg-red-700'
          >
            <Download className='inline-block mr-2' /> Gutyula iMP3
          </a>
        ) : (
          <button
            onClick={convertToMP3}
            className=' w-full text-center bg-red-600 mb-4 text-white py-2 rounded-lg shadow-lg hover:bg-red-700 flex justify-center items-center'
            disabled={converting}
          >
            <Music className='inline-block mr-2' />{' '}
            {converting ? 'Isacaphula iMp3..' : 'Gutyula iMP3'}
          </button>
        )}
      </div>
    </div>
  );
}
