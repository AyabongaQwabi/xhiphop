'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useVideo } from '../contexts/VideoContext';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  ThumbsUp,
  MessageCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  created_time: string;
  likesCount: number;
  commentsCount: number;
}

export function VideoSidebar() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [after, setAfter] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { selectedVideo, setSelectedVideo } = useVideo();

  const observer = useRef<IntersectionObserver | null>(null);
  const lastVideoElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchVideos();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchVideos = async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/facebook/videos?after=${after}&access_token=${process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error data:', errorData);
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }
      const data = await response.json();
      if (!data.data || data.data.length === 0) {
        throw new Error('No videos found');
      }
      setVideos((prevVideos) => [...prevVideos, ...data.data]);
      setAfter(data.paging?.cursors?.after || '');
      setHasMore(!!data.paging?.next);
      if (videos.length === 0 && data.data.length > 0) {
        setSelectedVideo(data.data[0]);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      if (retryCount < 3) {
        console.log(`Retrying in 1 second... (Attempt ${retryCount + 1})`);
        setTimeout(() => fetchVideos(retryCount + 1), 1000);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch videos');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []); // Removed fetchVideos from the dependency array

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  const formatCount = (count: number | undefined | null) => {
    if (count === undefined || count === null) {
      return '0';
    }
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  if (error) {
    return (
      <aside className='w-full lg:w-80 bg-black text-white p-4'>
        <div className='flex flex-col items-center justify-center h-full'>
          <AlertCircle className='w-12 h-12 text-red-500 mb-4' />
          <p className='text-red-500 text-center mb-4'>{error}</p>
          <Button onClick={() => fetchVideos()} variant='destructive'>
            Try Again
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <>
      <Button
        className='lg:hidden fixed bottom-4 right-4 z-50 bg-red-600 text-white'
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Close' : 'Videos'}
        <ChevronRight
          className={`ml-2 h-4 w-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </Button>
      <aside
        className={cn(
          'w-full lg:w-80 bg-black text-white overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'fixed inset-0 z-40' : 'hidden lg:block'
        )}
      >
        <div className='h-full overflow-y-auto'>
          {videos.map((video, index) => (
            <div
              key={video.id}
              ref={index === videos.length - 1 ? lastVideoElementRef : null}
              className={cn(
                'hover:bg-gray-900 p-4 cursor-pointer transition-colors duration-200 border-b border-gray-800',
                selectedVideo?.id === video.id && 'bg-gray-900'
              )}
              onClick={() => {
                setSelectedVideo(video);
                setIsOpen(false);
              }}
            >
              <div className='aspect-video relative rounded-lg overflow-hidden mb-2'>
                {video.thumbnail ? (
                  <Image
                    src={video.thumbnail || '/placeholder.svg'}
                    alt={video.title || 'Video thumbnail'}
                    fill
                    className='object-cover'
                    sizes='(max-width: 320px) 100vw, 320px'
                    priority={index < 4}
                  />
                ) : (
                  <div className='absolute inset-0 flex items-center justify-center bg-gray-800'>
                    <span className='text-gray-400 text-sm'>No thumbnail</span>
                  </div>
                )}
              </div>
              <div className='space-y-1'>
                <h3 className='text-sm font-medium line-clamp-2 text-white'>
                  {video.title || 'Untitled Video'}
                </h3>
                {video.description && (
                  <p className='text-xs text-gray-400 line-clamp-2'>
                    {truncateText(video.description, 100)}
                  </p>
                )}
                <div className='flex items-center space-x-4 text-xs text-gray-400'>
                  <div className='flex items-center'>
                    <ThumbsUp className='w-3 h-3 mr-1' />
                    <span>{formatCount(video.likesCount)}</span>
                  </div>
                  <div className='flex items-center'>
                    <MessageCircle className='w-3 h-3 mr-1' />
                    <span>{formatCount(video.commentsCount)}</span>
                  </div>
                </div>
                <p className='text-xs text-gray-500'>
                  {formatDate(video.created_time)}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className='p-4 space-y-4'>
              {[...Array(3)].map((_, i) => (
                <div key={i} className='space-y-2'>
                  <Skeleton className='w-full aspect-video rounded-lg bg-gray-800' />
                  <Skeleton className='w-3/4 h-4 rounded bg-gray-800' />
                  <Skeleton className='w-full h-8 rounded bg-gray-800' />
                  <Skeleton className='w-1/2 h-3 rounded bg-gray-800' />
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
