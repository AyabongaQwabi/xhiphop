"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export function CommentSection({ videoId }) {
  const { data: session } = useSession()
  const [comments, setComments] = useState([])

  useEffect(() => {
    if (session) {
      // Fetch comments from Facebook Graph API
      // This is a placeholder, you'll need to implement the actual API call
      setComments([
        { id: "1", user: "John Doe", content: "Great video!", timestamp: "2023-05-01T12:00:00Z" },
        { id: "2", user: "Jane Smith", content: "Thanks for sharing!", timestamp: "2023-05-01T13:30:00Z" },
      ])
    }
  }, [session])

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Comments</h2>
      <ul className="space-y-4">
        {comments.map((comment) => (
          <li key={comment.id} className="bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="font-semibold mr-2">{comment.user}</span>
              <span className="text-sm text-gray-500">{new Date(comment.timestamp).toLocaleString()}</span>
            </div>
            <p>{comment.content}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

