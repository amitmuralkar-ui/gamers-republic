import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { VoiceRoom } from "@/components/voice/VoiceRoom"
import { Users, Lock, Globe } from "lucide-react"
import type { ChatMessage } from "@/hooks/useChat"

interface Props { params: Promise<{ id: string }> }

export default async function GroupChatPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const group = await prisma.group.findUnique({
    where: { id },
    include: { _count: { select: { members: true } } },
  })
  if (!group) notFound()

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: session.user.id } },
  })
  if (!member) redirect("/groups")

  const messages = await prisma.message.findMany({
    where: { groupId: id },
    include: {
      sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  })

  const initialMessages: ChatMessage[] = messages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }))

  const displayName = session.user.name ?? "Gamer"

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="shrink-0 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-600/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-white font-semibold text-sm">{group.name}</h1>
                {group.isPublic ? <Globe className="w-3.5 h-3.5 text-slate-500" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
              </div>
              <p className="text-slate-400 text-xs">{group._count.members} members</p>
            </div>
          </div>
          {!group.isPublic && group.inviteCode && (
            <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg font-mono">
              {group.inviteCode}
            </span>
          )}
        </div>
        {/* Voice channel bar */}
        <div className="px-5 pb-3 flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">Voice:</span>
          <VoiceRoom roomName={`group-${id}`} displayName={displayName} />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ChatWindow roomId={id} roomType="group" initialMessages={initialMessages} />
      </div>
    </div>
  )
}
