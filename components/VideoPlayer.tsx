'use client';

import { useEffect, useState } from 'react';
import { useVideo } from '../contexts/VideoContext';
import {
  AlertCircle,
  ThumbsUp,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import CustomVideoPlayer from './CustomVideoPlayer';
import { VideoSidebar } from './VideoSidebar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Video {
  id: string;
  title: string;
  description: string;
  likesCount: number;
  commentsCount: number;
  source: string;
}

export function VideoPlayer() {
  const { selectedVideo, setSelectedVideo } = useVideo();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(true);

  useEffect(() => {
    const fetchFirstVideo = async (retryCount = 0) => {
      if (retryCount > 3) {
        setError('Failed to fetch videos after multiple attempts');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/facebook/videos');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setSelectedVideo(data.data[0]);
        } else {
          throw new Error(data.message || 'No videos found');
        }
      } catch (error) {
        console.error('Error fetching first video:', error);
        if (retryCount < 3) {
          setTimeout(() => fetchFirstVideo(retryCount + 1), 1000);
        } else {
          setError(
            error instanceof Error ? error.message : 'Failed to fetch videos'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFirstVideo();
  }, [setSelectedVideo]);

  useEffect(() => {
    if (selectedVideo && (window as any).FB) {
      (window as any).FB.XFBML.parse();
    }
  }, [selectedVideo]);

  const formatCount = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  const toggleDetails = () => setIsDetailsVisible(!isDetailsVisible);

  if (loading) {
    return (
      <div className='space-y-4 p-4'>
        <Skeleton className='h-[300px] w-full rounded-xl' />
        <Skeleton className='h-4 w-2/3' />
        <Skeleton className='h-4 w-1/2' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center h-64 text-center p-4'>
        <AlertCircle className='w-12 h-12 text-red-500 mb-4' />
        <p className='text-red-500 text-lg mb-4'>{error}</p>
        <Button onClick={() => window.location.reload()} variant='destructive'>
          Try Again
        </Button>
      </div>
    );
  }

  if (!selectedVideo) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray-400'>No video selected</p>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto bg-white md:shadow-lg rounded-lg overflow-hidden'>
      <div className='aspect-video w-full'>
        <CustomVideoPlayer
          src={selectedVideo.source}
          description={selectedVideo.description}
        />
      </div>

      <div className='p-6'>
        <Button
          onClick={toggleDetails}
          variant='ghost'
          className='w-full flex justify-between items-center mb-4'
        >
          <span className='font-semibold'>
            {isDetailsVisible ? 'Hide' : 'Show'} Details
          </span>
          {isDetailsVisible ? (
            <ChevronUp className='h-4 w-4' />
          ) : (
            <ChevronDown className='h-4 w-4' />
          )}
        </Button>

        {isDetailsVisible && (
          <div className='space-y-4'>
            {selectedVideo.title && (
              <h2 className='text-2xl font-bold text-gray-900'>
                {selectedVideo.title}
              </h2>
            )}
            <div className='flex items-center space-x-6 text-gray-600'>
              <div className='flex items-center'>
                <ThumbsUp className='w-5 h-5 mr-2 text-blue-500' />
                <span>{formatCount(selectedVideo.likesCount)}</span>
              </div>
              <div className='flex items-center'>
                <MessageCircle className='w-5 h-5 mr-2 text-green-500' />
                <span>{formatCount(selectedVideo.commentsCount)}</span>
              </div>
            </div>
            <p className='text-gray-700 leading-relaxed'>
              {selectedVideo.description || 'No description available'}
            </p>
          </div>
        )}
      </div>

      <div className='mt-6 border-t border-gray-200 pt-6 px-6 pb-4'>
        <div className='lg:hidden'>
          <VideoSidebar />
        </div>
      </div>
    </div>
  );
}
