import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { VoiceRoom } from "@/components/voice/VoiceRoom"
import { ChannelSidebar } from "@/components/groups/ChannelSidebar"
import { MembersBar } from "@/components/groups/MembersBar"
import { GroupRolesPanel } from "@/components/groups/GroupRolesPanel"
import { GroupEventsList } from "@/components/groups/GroupEventsList"
import { Hash, Users, Globe, Lock } from "lucide-react"
import type { ChatMessage } from "@/hooks/useChat"

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ channel?: string; tab?: string }>
}

export default async function GroupPage({ params, searchParams }: Props) {
  const { id } = await params
  const { channel: channelParam, tab } = await searchParams
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const group = await prisma.group.findUnique({
    where: { id },
    include: { _count: { select: { members: true } } },
  })
  if (!group) notFound()

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId } },
  })
  if (!member) redirect("/groups")

  const isOwner = group.ownerId === userId

  // Ensure at least a general channel exists
  let channels = await prisma.channel.findMany({
    where: { groupId: id },
    orderBy: { order: "asc" },
  })
  if (channels.length === 0) {
    await prisma.channel.createMany({
      data: [
        { name: "general", type: "text", groupId: id, order: 0 },
        { name: "voice", type: "voice", groupId: id, order: 1 },
      ],
    })
    channels = await prisma.channel.findMany({ where: { groupId: id }, orderBy: { order: "asc" } })
  }

  const textChannels = channels.filter((c) => c.type === "text")
  const selectedChannel = channels.find((c) => c.id === channelParam) ?? textChannels[0] ?? null

  const isDefaultChannel = textChannels.length > 0 && textChannels[0].id === selectedChannel?.id

  const [messages, membersData, groupRoles, events] = await Promise.all([
    selectedChannel
      ? prisma.message.findMany({
          where: isDefaultChannel
            ? { OR: [{ channelId: selectedChannel.id }, { groupId: id, channelId: null }] }
            : { channelId: selectedChannel.id },
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
      : [],
    prisma.groupMember.findMany({
      where: { groupId: id },
      include: {
        user: {
          select: {
            id: true, username: true, displayName: true, avatarUrl: true, bio: true,
            tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
            decorations: { where: { active: true }, select: { id: true, type: true, name: true, style: true } },
            roleAssignments: { include: { role: { select: { id: true, name: true, color: true } } } },
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    }),
    prisma.groupRole.findMany({
      where: { groupId: id },
      include: { _count: { select: { assignments: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.event.findMany({
      where: { groupId: id },
      include: { creator: { select: { id: true, username: true, displayName: true } } },
      orderBy: { startAt: "asc" },
    }),
  ])

  const initialMessages: ChatMessage[] = messages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    sender: { ...m.sender, tags: m.sender.tags.map((ut) => ut.tag) },
  }))

  const serializedMembers = membersData.map((m) => ({
    ...m,
    joinedAt: m.joinedAt.toISOString(),
    user: {
      ...m.user,
      tags: m.user.tags.map((ut) => ut.tag),
      roles: m.user.roleAssignments.map((ra) => ra.role).filter(Boolean),
    },
  }))

  const serializedEvents = events.map((e) => ({
    ...e,
    startAt: e.startAt.toISOString(),
    createdAt: e.createdAt.toISOString(),
  }))

  const displayName = session.user.name ?? "Gamer"

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left: Channel sidebar */}
      <ChannelSidebar
        groupId={id}
        channels={channels}
        selectedChannelId={selectedChannel?.id ?? ""}
        isOwner={isOwner}
      />

      {/* Center: Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="shrink-0 border-b border-slate-800 bg-slate-900 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 flex items-center justify-center">
              {selectedChannel?.type === "voice"
                ? <Users className="w-4 h-4 text-orange-400" />
                : <Hash className="w-4 h-4 text-orange-400" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-white font-semibold text-sm">{group.name}</h1>
                {group.isPublic ? <Globe className="w-3.5 h-3.5 text-slate-500" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
                {selectedChannel && <span className="text-slate-500 text-xs">#{selectedChannel.name}</span>}
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

        {/* Tab bar for owner: chat / events / roles */}
        {isOwner && (
          <div className="flex border-b border-slate-800 bg-slate-900 px-4 gap-1">
            {[
              { key: undefined, label: "Chat" },
              { key: "events", label: "Events" },
              { key: "roles", label: "Roles" },
            ].map(({ key, label }) => (
              <a
                key={label}
                href={key ? `/groups/${id}?tab=${key}` : `/groups/${id}${channelParam ? `?channel=${channelParam}` : ""}`}
                className={`text-xs font-medium px-3 py-2 border-b-2 transition-colors ${
                  tab === key
                    ? "border-orange-500 text-orange-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                {label}
              </a>
            ))}
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {(!isOwner || !tab) && selectedChannel?.type === "text" && (
            <ChatWindow
              roomId={selectedChannel.id}
              roomType="channel"
              initialMessages={initialMessages}
            />
          )}
          {(!isOwner || !tab) && selectedChannel?.type === "voice" && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-slate-400 text-sm">Voice channel: {selectedChannel.name}</p>
              <VoiceRoom roomName={`group-${id}-${selectedChannel.id}`} displayName={displayName} />
            </div>
          )}
          {isOwner && tab === "events" && (
            <div className="p-4">
              <GroupEventsList
                groupId={id}
                initialEvents={serializedEvents}
                currentUserId={userId}
                isOwner={isOwner}
              />
            </div>
          )}
          {isOwner && tab === "roles" && (
            <div className="p-4">
              <GroupRolesPanel groupId={id} initialRoles={groupRoles} />
            </div>
          )}
          {!selectedChannel && !tab && (
            <div className="flex items-center justify-center h-full text-slate-500">
              <p>No channels yet. Create one above.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Members bar */}
      <MembersBar
        groupId={id}
        members={serializedMembers}
        currentUserId={userId}
        isOwner={isOwner}
        groupRoles={groupRoles.map((r) => ({ id: r.id, name: r.name, color: r.color }))}
      />
    </div>
  )
}
