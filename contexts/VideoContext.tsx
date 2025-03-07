'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

interface Video {
  id: string;
  title: string;
  description: string;
  source: string;
  thumbnail: string;
  facebookPostId?: string;
}

interface VideoContextType {
  selectedVideo: Video | null;
  setSelectedVideo: React.Dispatch<React.SetStateAction<Video | null>>;
  favoriteVideos: string[];
  toggleFavorite: (videoId: string) => void;
  isFavorite: (videoId: string) => boolean;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [favoriteVideos, setFavoriteVideos] = useState<string[]>([]);

  useEffect(() => {
    const storedFavorites = localStorage.getItem('favoriteVideos');
    if (storedFavorites) {
      setFavoriteVideos(JSON.parse(storedFavorites));
    }
  }, []);

  const toggleFavorite = (videoId: string) => {
    setFavoriteVideos((prev) => {
      const newFavorites = prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId];
      localStorage.setItem('favoriteVideos', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const isFavorite = (videoId: string) => favoriteVideos.includes(videoId);

  return (
    <VideoContext.Provider
      value={{
        selectedVideo,
        setSelectedVideo,
        favoriteVideos,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};
