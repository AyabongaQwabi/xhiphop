'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useVideo } from '../contexts/VideoContext';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ThumbsUp, MessageCircle, AlertCircle } from 'lucide-react';

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
  }, []);

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
      <aside className='w-80 bg-gray-900 h-screen overflow-hidden border-r border-red-200 shadow-md rounded-md p-4 m-4'>
        <div className='flex flex-col items-center justify-center h-full p-4'>
          <AlertCircle className='w-12 h-12 text-red-500 mb-4' />
          <p className='text-red-500 text-center mb-4'>{error}</p>
          <button
            onClick={() => fetchVideos()}
            className='px-4 py-2 bg-neon-red text-white rounded hover:bg-opacity-90 transition-colors'
          >
            Try Again
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className='w-full lg:w-80 bg-gray-200 h-96 md:h-screen overflow-hidden border-r md:shadow-lg border-gray-200'>
      <div className='h-full overflow-y-auto'>
        {videos.map((video, index) => (
          <div
            key={video.id}
            ref={index === videos.length - 1 ? lastVideoElementRef : null}
            className={cn(
              'hover:bg-red-200 bg-gray-50 md:shadow-md md:rounded-md border-b border-gray-900 p-4 lg:m-4 cursor-pointer transition-colors duration-200',
              selectedVideo?.id === video.id &&
                'bg-red-200 md:shadow-md rounded-md p-4 m-4'
            )}
            onClick={() => setSelectedVideo(video)}
          >
            <div className='aspect-video relative rounded-lg overflow-hidden bg-red-200 shadow-md rounded-md p-4 m-4'>
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
                <div className='absolute inset-0 flex items-center justify-center bg-gray-700'>
                  <span className='text-gray-600 text-sm'>No thumbnail</span>
                </div>
              )}
            </div>
            <div className='mt-2 space-y-1'>
              <h3 className='text-sm font-medium line-clamp-2 text-gray-700'>
                {video.title || 'Untitled Video'}
              </h3>
              {video.description && (
                <p className='text-xs text-gray-400 line-clamp-2'>
                  {truncateText(video.description, 100)}
                </p>
              )}
              <div className='flex items-center space-x-4 text-xs text-gray-500'>
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
          <div className='p-3 space-y-3'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='w-full aspect-video rounded-lg bg-red-200 shadow-md rounded-md p-4 m-4' />
                <Skeleton className='w-3/4 h-4 rounded bg-red-200 shadow-md rounded-md p-4 m-4' />
                <Skeleton className='w-full h-8 rounded bg-red-200 shadow-md rounded-md p-4 m-4' />
                <Skeleton className='w-1/2 h-3 rounded bg-red-200 shadow-md rounded-md p-4 m-4' />
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
