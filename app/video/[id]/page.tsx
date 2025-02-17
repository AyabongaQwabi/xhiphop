"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { VideoPlayer } from "../../../components/VideoPlayer"
import { CommentSection } from "../../../components/CommentSection"
import { Navbar } from "../../../components/Navbar"
import { Sidebar } from "../../../components/Sidebar"

export default function VideoPage({ params }) {
  const { data: session } = useSession()
  const [video, setVideo] = useState(null)

  useEffect(() => {
    if (session) {
      // Fetch video details from Facebook Graph API
      // This is a placeholder, you'll need to implement the actual API call
      setVideo({
        id: params.id,
        title: "Sample Video",
        description: "This is a sample video description.",
        url: "https://www.facebook.com/facebook/videos/10153231379946729/",
      })
    }
  }, [session, params.id])

  if (!video) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex">
        <Sidebar />
        <div className="flex-grow p-6">
          <VideoPlayer video={video} />
          <h1 className="text-2xl font-bold mt-4">{video.title}</h1>
          <p className="mt-2">{video.description}</p>
          <CommentSection videoId={video.id} />
        </div>
      </main>
    </div>
  )
}

