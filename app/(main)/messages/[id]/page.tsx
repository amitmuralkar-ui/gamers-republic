import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { VideoCallModal } from "@/components/voice/VideoCallModal"
import type { ChatMessage } from "@/hooks/useChat"

interface Props { params: Promise<{ id: string }> }

export default async function DMPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const room = await prisma.directRoom.findUnique({ where: { id } })
  if (!room) notFound()
  if (room.user1Id !== session.user.id && room.user2Id !== session.user.id) redirect("/messages")

  const otherId = room.user1Id === session.user.id ? room.user2Id : room.user1Id
  const other = await prisma.user.findUnique({
    where: { id: otherId },
    select: { username: true, displayName: true, avatarUrl: true },
  })

  const messages = await prisma.message.findMany({
    where: { directRoomId: id },
    include: {
      sender: {
        select: {
          id: true, username: true, displayName: true, avatarUrl: true,
          tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  })

  const initialMessages: ChatMessage[] = messages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    sender: { ...m.sender, tags: m.sender.tags.map((ut) => ut.tag) },
  }))

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-800 bg-slate-900 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 overflow-hidden shrink-0">
            {other?.avatarUrl ? (
              <img src={other.avatarUrl} alt={other.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-bold">
                {other?.username.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm">{other?.displayName ?? other?.username}</h1>
            <p className="text-slate-400 text-xs">@{other?.username}</p>
          </div>
        </div>
        <VideoCallModal roomName={`dm-${id}`} />
      </div>
      <div className="flex-1 min-h-0">
        <ChatWindow roomId={id} roomType="dm" initialMessages={initialMessages} />
      </div>
    </div>
  )
}
