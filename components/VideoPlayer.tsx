'use client';

import { useEffect, useState } from 'react';
import { useVideo } from '../contexts/VideoContext';
import { AlertCircle, ThumbsUp, MessageCircle } from 'lucide-react';
import CustomVideoPlayer from './CustomVideoPlayer';
import { VideoSidebar } from './VideoSidebar';

interface Video {
  id: string;
  title: string;
  description: string;
  likesCount: number;
  commentsCount: number;
}

export function VideoPlayer() {
  const { selectedVideo, setSelectedVideo } = useVideo();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(true); // New state for visibility

  useEffect(() => {
    const fetchFirstVideo = async (retryCount = 0) => {
      if (retryCount > 3) {
        setError('Failed to fetch videos after multiple attempts');
        setLoading(false);
        return;
      }

      try {
        console.log(
          `Attempting to fetch first video (attempt ${retryCount + 1})`
        );
        const response = await fetch('/api/facebook/videos');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        console.log('API Response:', {
          hasData: !!data.data,
          videoCount: data.data?.length || 0,
        });

        if (data.data && data.data.length > 0) {
          setSelectedVideo(data.data[0]);
        } else {
          throw new Error(data.message || 'No videos found');
        }
      } catch (error) {
        console.error('Error fetching first video:', error);
        if (retryCount < 3) {
          console.log(`Retrying in 1 second... (Attempt ${retryCount + 1})`);
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
    if (selectedVideo) {
      // Reinitialize Facebook SDK when the selected video changes
      if ((window as any).FB) {
        (window as any).FB.XFBML.parse();
      }
    }
  }, [selectedVideo]);

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  const toggleDetails = () => {
    setIsDetailsVisible(!isDetailsVisible);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-red'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center h-64 text-center p-4'>
        <AlertCircle className='w-12 h-12 text-red-500 mb-4' />
        <p className='text-red-500 text-lg mb-4'>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className='px-4 py-2 bg-neon-red text-white rounded hover:bg-opacity-90 transition-colors'
        >
          Try Again
        </button>
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

  console.log('Selected Video:', selectedVideo);

  return (
    <div>
      <div className=' lg:aspect-h-9 w-full md:h-full h-80 overflow-scroll pb-4 bg-gray-100 shadow-sm lg:rounded-lg'>
        <CustomVideoPlayer
          src={selectedVideo.source}
          description={selectedVideo.description}
        />
      </div>

      {/* Collapsible Video Details Section */}
      <div className='mt-4 p-4'>
        <button
          onClick={toggleDetails}
          className='flex items-center text-gray-600 mb-4'
        >
          <span className='mr-2'>
            {isDetailsVisible ? 'Hide' : 'Show'} Details
          </span>
        </button>

        {isDetailsVisible && (
          <>
            {selectedVideo.title !== '' && (
              <h2 className='text-2xl font-bold text-gray-900'>
                {selectedVideo.title || 'Untitled Video'}
              </h2>
            )}
            <div className='flex items-center space-x-6 mt-2 text-gray-600'>
              <div className='flex items-center'>
                <ThumbsUp className='w-5 h-5 mr-2' />
                <span>{formatCount(selectedVideo.likesCount)}</span>
              </div>
              <div className='flex items-center'>
                <MessageCircle className='w-5 h-5 mr-2' />
                <span>{formatCount(selectedVideo.commentsCount)}</span>
              </div>
            </div>
            <p className='mt-4 text-gray-500'>
              {selectedVideo.description || 'No description available'}
            </p>
          </>
        )}
      </div>

      <div className='block lg:hidden'>
        <VideoSidebar />
      </div>
    </div>
  );
}
