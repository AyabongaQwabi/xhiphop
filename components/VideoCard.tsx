import Image from "next/image"
import Link from "next/link"

export function VideoCard({ video }) {
  return (
    <Link href={`/video/${video.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Image
          src={video.thumbnail || "/placeholder.svg"}
          alt={video.title}
          width={320}
          height={180}
          className="w-full"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold truncate">{video.title}</h3>
        </div>
      </div>
    </Link>
  )
}

