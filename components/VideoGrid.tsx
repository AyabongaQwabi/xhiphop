"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { VideoCard } from "./VideoCard"

export function VideoGrid() {
  const supabase = createClient()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    async function fetchVideos() {
      if (user) {
        setLoading(true)
        setError(null)
        try {
          const response = await fetch("/api/facebook/videos")
          if (!response.ok) {
            throw new Error("Failed to fetch videos")
          }
          const data = await response.json()
          setVideos(data.data || [])
        } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
          setLoading(false)
        }
      }
    }

    fetchVideos()
  }, [user])

  if (loading) {
    return <div className="text-center text-neon-red">Loading videos...</div>
  }

  if (error) {
    return <div className="text-center text-neon-red">Error: {error}</div>
  }

  if (!user) {
    return <div className="text-center text-neon-red">Please sign in to view videos</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  )
}

