'use client';

import { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Download,
  Music,
  Loader,
  Maximize,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function CustomVideoPlayer({ src, description }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [mp3Url, setMp3Url] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [conversionStep, setConversionStep] = useState<
    'idle' | 'downloading' | 'converting'
  >('idle');

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', () =>
        setDuration(video.duration)
      );
      video.addEventListener('timeupdate', () =>
        setCurrentTime(video.currentTime)
      );
      video.addEventListener('waiting', () => setIsLoading(true));
      video.addEventListener('canplay', () => setIsLoading(false));
      video.addEventListener('play', () => setPlaying(true));
      video.addEventListener('pause', () => setPlaying(false));
    }

    return () => {
      if (video) {
        video.removeEventListener('loadedmetadata', () =>
          setDuration(video.duration)
        );
        video.removeEventListener('timeupdate', () =>
          setCurrentTime(video.currentTime)
        );
        video.removeEventListener('waiting', () => setIsLoading(true));
        video.removeEventListener('canplay', () => setIsLoading(false));
        video.removeEventListener('play', () => setPlaying(true));
        video.removeEventListener('pause', () => setPlaying(false));
      }
    };
  }, []);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';
    const ffmpeg = ffmpegRef.current;

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm'
      ),
    });
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.volume = value[0];
      setVolume(value[0]);
      setIsMuted(value[0] === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      setVolume(videoRef.current.muted ? 0 : 1);
    }
  };

  const convertToMP3 = async () => {
    setConversionStep('downloading');
    setIsDownloading(true);
    const ffmpeg = ffmpegRef.current;

    ffmpeg.on('progress', ({ progress }) => {
      setProgress(progress * 100);
    });

    try {
      const videoData = await fetchFile(src);
      setIsDownloading(false);
      setConversionStep('converting');

      await ffmpeg.writeFile('input.mp4', videoData);

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

      const data = (await ffmpeg.readFile('output.mp3')) as any;
      const audioBlob = new Blob([data.buffer], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setMp3Url(audioUrl);

      setConversionStep('idle');
    } catch (error) {
      console.error('Error during conversion:', error);
      setConversionStep('idle');
    }

    setProgress(0);
  };

  const getConversionButtonText = () => {
    switch (conversionStep) {
      case 'downloading':
        return 'Downloading...';
      case 'converting':
        return `Converting... ${progress.toFixed(0)}%`;
      default:
        return mp3Url ? 'Download MP3' : 'Convert to MP3';
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className='relative w-full mx-auto bg-gray-900 md:rounded-lg overflow-hidden'
    >
      <div className='relative aspect-video'>
        <video
          ref={videoRef}
          src={src}
          className='w-full h-full object-cover'
          onClick={togglePlay}
        />
        {isLoading && (
          <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50'>
            <Loader className='animate-spin text-white' size={48} />
          </div>
        )}
        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4'>
          <div className='flex items-center justify-between text-white mb-2'>
            <span>{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration}
              step={0.1}
              onValueChange={handleSeek}
              className='w-full mx-4'
            />
            <span>{formatTime(duration)}</span>
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <Button
                size='icon'
                variant='ghost'
                onClick={togglePlay}
                className='text-white hover:bg-white/20'
              >
                {playing ? (
                  <Pause className='h-6 w-6' />
                ) : (
                  <Play className='h-6 w-6' />
                )}
              </Button>
              <Button
                size='icon'
                variant='ghost'
                onClick={toggleMute}
                className='text-white hover:bg-white/20'
              >
                {isMuted ? (
                  <VolumeX className='h-6 w-6' />
                ) : (
                  <Volume2 className='h-6 w-6' />
                )}
              </Button>
              <Slider
                value={[volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className='w-24'
              />
            </div>
            <Button
              size='icon'
              variant='ghost'
              onClick={toggleFullscreen}
              className='text-white hover:bg-white/20'
            >
              <Maximize className='h-6 w-6' />
            </Button>
          </div>
        </div>
      </div>
      <div className='flex flex-col items-center justify-center mt-4 space-y-4 p-4'>
        <div className='flex items-center justify-center space-x-4'>
          <Button
            onClick={() => window.open(src, '_blank')}
            className='bg-white text-gray-900 hover:bg-gray-200'
          >
            <Download className='h-4 w-4 mr-2' />
            <span>Download Video</span>
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={
                    mp3Url ? () => window.open(mp3Url, '_blank') : convertToMP3
                  }
                  disabled={conversionStep !== 'idle'}
                  className='bg-white text-gray-900 hover:bg-gray-200'
                >
                  <Music className='h-4 w-4 mr-2' />
                  <span>{getConversionButtonText()}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Converting to MP3 requires downloading the video first.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {conversionStep !== 'idle' && (
          <p className='text-sm text-white'>
            {conversionStep === 'downloading'
              ? 'Downloading video before conversion...'
              : 'Converting video to MP3...'}
          </p>
        )}
      </div>
    </div>
  );
}
