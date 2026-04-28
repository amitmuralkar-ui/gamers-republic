import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { MessageSquare, ChevronRight } from "lucide-react"

export default async function MessagesPage() {
  const { userId } = await verifySession()

  const rooms = await prisma.directRoom.findMany({
    where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          sender: { select: { username: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const usersInRooms = await Promise.all(
    rooms.map(async (room) => {
      const otherId = room.user1Id === userId ? room.user2Id : room.user1Id
      return prisma.user.findUnique({
        where: { id: otherId },
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      })
    })
  )

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Direct Messages</h1>

      {rooms.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg mb-1">No messages yet</p>
          <p className="text-sm">Find someone and start a conversation</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map((room, i) => {
            const other = usersInRooms[i]
            const lastMsg = room.messages[0]
            if (!other) return null
            return (
              <Link
                key={room.id}
                href={`/messages/${room.id}`}
                className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 hover:border-orange-500/40 rounded-2xl transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden shrink-0">
                  {other.avatarUrl ? (
                    <img src={other.avatarUrl} alt={other.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                      {other.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold">{other.displayName ?? other.username}</p>
                  {lastMsg && (
                    <p className="text-slate-400 text-sm truncate">
                      {lastMsg.sender.username}: {lastMsg.content}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-orange-400 transition-colors shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
