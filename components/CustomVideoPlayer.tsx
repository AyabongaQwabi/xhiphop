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
  SkipBack,
  SkipForward,
  Scissors,
  Share2,
  Heart,
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
import { Badge } from '@/components/ui/badge';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
} from 'next-share';
import { useVideo } from '../contexts/VideoContext';

interface CustomVideoPlayerProps {
  src: string;
  description: string;
  title: string;
  thumbnail: string;
  id: string;
}

export default function CustomVideoPlayer({
  src,
  description,
  title,
  id,
}: CustomVideoPlayerProps) {
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

  // New state for hover and A-B repeat functionality
  const [isHovering, setIsHovering] = useState(false);
  const [pointA, setPointA] = useState<number | null>(null);
  const [pointB, setPointB] = useState<number | null>(null);
  const [isABRepeatActive, setIsABRepeatActive] = useState(false);
  const [isSettingPointA, setIsSettingPointA] = useState(false);
  const [isSettingPointB, setIsSettingPointB] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useVideo();
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', () =>
        setDuration(video.duration)
      );
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('waiting', () => setIsLoading(true));
      video.addEventListener('canplay', () => setIsLoading(false));
      video.addEventListener('play', () => {
        setPlaying(true);
        // Hide controls after 2 seconds when playing
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
          if (!isHovering) {
            setShowControls(false);
          }
        }, 2000);
      });
      video.addEventListener('pause', () => {
        setPlaying(false);
        setShowControls(true);
      });
    }

    return () => {
      if (video) {
        video.removeEventListener('loadedmetadata', () =>
          setDuration(video.duration)
        );
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('waiting', () => setIsLoading(true));
        video.removeEventListener('canplay', () => setIsLoading(false));
        video.removeEventListener('play', () => setPlaying(true));
        video.removeEventListener('pause', () => setPlaying(false));
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isHovering]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime);

    // Handle A-B repeat functionality
    if (isABRepeatActive && pointA !== null && pointB !== null) {
      if (video.currentTime >= pointB) {
        video.currentTime = pointA;
      }
    }
  };

  useEffect(() => {
    loadFFmpeg();
    setIsFavorited(isFavorite(id));
  }, [id, isFavorite]);

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

  // New function to handle A-B repeat
  const handleSetPointA = () => {
    if (videoRef.current) {
      setPointA(videoRef.current.currentTime);
      setIsSettingPointA(false);
      setIsSettingPointB(true);
    }
  };

  const handleSetPointB = () => {
    if (videoRef.current && pointA !== null) {
      const currentTime = videoRef.current.currentTime;
      if (currentTime > pointA) {
        setPointB(currentTime);
        setIsSettingPointB(false);
        setIsABRepeatActive(true);
      }
    }
  };

  const clearABPoints = () => {
    setPointA(null);
    setPointB(null);
    setIsABRepeatActive(false);
    setIsSettingPointA(false);
    setIsSettingPointB(false);
  };

  const toggleABRepeat = () => {
    if (isABRepeatActive) {
      clearABPoints();
    } else {
      setIsSettingPointA(true);
    }
  };

  // Function to download the selected section
  const downloadSection = async () => {
    if (!pointA || !pointB || pointA >= pointB) {
      alert('Please set valid A and B points first');
      return;
    }

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

      // Cut the video from point A to point B
      await ffmpeg.exec([
        '-i',
        'input.mp4',
        '-ss',
        pointA.toString(),
        '-to',
        pointB.toString(),
        '-c:v',
        'copy',
        '-c:a',
        'copy',
        'output_section.mp4',
      ]);

      const data = (await ffmpeg.readFile('output_section.mp4')) as any;
      const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
      const videoUrl = URL.createObjectURL(videoBlob);

      // Create a download link and trigger it
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `video_section_${formatTime(pointA)}_to_${formatTime(
        pointB
      )}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setConversionStep('idle');
    } catch (error) {
      console.error('Error during section download:', error);
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

  const handleMouseEnter = () => {
    setIsHovering(true);
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (playing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }
  };

  const toggleShareMenu = () => {
    setIsShareMenuOpen(!isShareMenuOpen);
  };

  const handleFavoriteToggle = () => {
    toggleFavorite(id);
    setIsFavorited(!isFavorited);
  };

  return (
    <div
      ref={containerRef}
      className='relative w-full mx-auto bg-gray-900 md:rounded-lg overflow-hidden'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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

        {/* A-B Repeat Markers */}
        {pointA !== null && (
          <div
            className='absolute bottom-12 h-2 bg-red-500 z-10'
            style={{
              left: `${(pointA / duration) * 100}%`,
              width: '2px',
            }}
          />
        )}
        {pointB !== null && (
          <div
            className='absolute bottom-12 h-2 bg-green-500 z-10'
            style={{
              left: `${(pointB / duration) * 100}%`,
              width: '2px',
            }}
          />
        )}
        {pointA !== null && pointB !== null && (
          <div
            className='absolute bottom-12 h-2 bg-blue-500 opacity-30 z-5'
            style={{
              left: `${(pointA / duration) * 100}%`,
              width: `${((pointB - pointA) / duration) * 100}%`,
            }}
          />
        )}

        {/* Video Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
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

              {/* A-B Repeat Controls */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size='icon'
                      variant={isABRepeatActive ? 'default' : 'ghost'}
                      onClick={toggleABRepeat}
                      className={`text-white ${
                        isABRepeatActive
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'hover:bg-white/20'
                      }`}
                    >
                      <SkipBack className='h-4 w-4 mr-1' />
                      <SkipForward className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {isABRepeatActive ? 'Clear A-B repeat' : 'Set A-B repeat'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {isSettingPointA && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleSetPointA}
                  className='text-white bg-red-600 hover:bg-red-700 border-none'
                >
                  Set A
                </Button>
              )}

              {isSettingPointB && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleSetPointB}
                  className='text-white bg-green-600 hover:bg-green-700 border-none'
                >
                  Set B
                </Button>
              )}

              {isABRepeatActive && (
                <Badge
                  variant='outline'
                  className='bg-blue-600 text-white border-none'
                >
                  {formatTime(pointA!)} - {formatTime(pointB!)}
                </Badge>
              )}

              {isABRepeatActive && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size='icon'
                        variant='ghost'
                        onClick={downloadSection}
                        disabled={conversionStep !== 'idle'}
                        className='text-white hover:bg-white/20'
                      >
                        <Scissors className='h-4 w-4' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download selected section</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Favorite Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size='icon'
                      variant='ghost'
                      onClick={handleFavoriteToggle}
                      className={`text-white hover:bg-white/20 ${
                        isFavorited ? 'text-red-500' : ''
                      }`}
                    >
                      <Heart
                        className='h-5 w-5'
                        fill={isFavorited ? 'currentColor' : 'none'}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {isFavorited
                        ? 'Remove from favorites'
                        : 'Add to favorites'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Share Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size='icon'
                      variant='ghost'
                      onClick={toggleShareMenu}
                      className='text-white hover:bg-white/20'
                    >
                      <Share2 className='h-5 w-5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share video</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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

      {/* Share Menu */}
      {isShareMenuOpen && (
        <div className='absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50'>
          <div className='flex space-x-4'>
            <FacebookShareButton
              url={`https://www.facebook.com/XhosaHipHopHub/posts/${id}`}
              quote={title}
            >
              <FacebookIcon size={32} round />
            </FacebookShareButton>
            <TwitterShareButton
              url={`https://www.facebook.com/XhosaHipHopHub/posts/${id}`}
              title={title}
            >
              <TwitterIcon size={32} round />
            </TwitterShareButton>
            <LinkedinShareButton
              url={`https://www.facebook.com/XhosaHipHopHub/posts/${id}`}
            >
              <LinkedinIcon size={32} round />
            </LinkedinShareButton>
          </div>
        </div>
      )}
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
