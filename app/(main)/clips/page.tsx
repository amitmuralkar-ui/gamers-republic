import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ClipCard } from "@/components/clips/ClipCard"
import Link from "next/link"
import { Plus, Play } from "lucide-react"

export default async function ClipsPage() {
  const session = await auth()

  const clips = await prisma.clip.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      uploader: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true } },
    },
  })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Clips</h1>
        <Link
          href="/clips/upload"
          className="flex items-center gap-1.5 text-sm font-medium bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Upload
        </Link>
      </div>

      {clips.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Play className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg mb-1">No clips yet</p>
          <p className="text-sm">Be the first to share a highlight</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clips.map((clip) => (
            <ClipCard
              key={clip.id}
              clip={{ ...clip, createdAt: clip.createdAt.toISOString() }}
              currentUserId={session?.user?.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
