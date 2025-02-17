"use client"

import type React from "react"
import { createContext, useState, useContext } from "react"

interface Video {
  id: string
  title: string
  description: string
  thumbnail: {
    data: {
      url: string
    }
  }
}

interface VideoContextType {
  selectedVideo: Video | null
  setSelectedVideo: (video: Video) => void
}

const VideoContext = createContext<VideoContextType | undefined>(undefined)

export function VideoProvider({ children }: { children: React.ReactNode }) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  return <VideoContext.Provider value={{ selectedVideo, setSelectedVideo }}>{children}</VideoContext.Provider>
}

export function useVideo() {
  const context = useContext(VideoContext)
  if (context === undefined) {
    throw new Error("useVideo must be used within a VideoProvider")
  }
  return context
}

