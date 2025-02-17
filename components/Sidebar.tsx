"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export function Sidebar() {
  const { data: session } = useSession()
  const [relatedVideos, setRelatedVideos] = useState([])

  useEffect(() => {
    if (session) {
      // Fetch related videos here
      // This is a placeholder, you'll need to implement the actual API call
      setRelatedVideos([
        { id: "1", title: "Related Video 1" },
        { id: "2", title: "Related Video 2" },
        { id: "3", title: "Related Video 3" },
      ])
    }
  }, [session])

  return (
    <aside className="w-64 bg-gray-100 p-4">
      <h2 className="text-lg font-semibold mb-4">Related Videos</h2>
      <ul>
        {relatedVideos.map((video) => (
          <li key={video.id} className="mb-2">
            <a href={`/video/${video.id}`} className="text-blue-600 hover:underline">
              {video.title}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}

