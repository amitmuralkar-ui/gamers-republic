"use client"

import { useState } from "react"
import { Crown, ShieldCheck, X } from "lucide-react"
import { DecorationAvatar, NameplateBadge } from "@/components/ui/DecorationAvatar"
import { TagBadge } from "@/components/ui/TagBadge"

interface Role {
  id: string
  name: string
  color: string
}

interface Decoration {
  type: string
  name: string
  style: string
}

interface Member {
  userId: string
  role: string
  joinedAt: string
  user: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
    tags: { id: string; name: string; color: string }[]
    decorations: Decoration[]
    roles: Role[]
  }
}

interface Props {
  groupId: string
  members: Member[]
  currentUserId: string
  isOwner: boolean
  groupRoles: { id: string; name: string; color: string }[]
}

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

function isTrusted(joinedAt: string) {
  return Date.now() - new Date(joinedAt).getTime() > THIRTY_DAYS
}

export function MembersBar({ groupId, members: initial, currentUserId, isOwner, groupRoles }: Props) {
  const [members, setMembers] = useState<Member[]>(initial)
  const [selected, setSelected] = useState<Member | null>(null)

  async function assignRole(memberId: string, roleId: string) {
    const res = await fetch(`/api/groups/${groupId}/members/${memberId}/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId }),
    })
    if (res.ok) {
      const role = groupRoles.find((r) => r.id === roleId)!
      setMembers((prev) =>
        prev.map((m) =>
          m.userId === memberId
            ? { ...m, user: { ...m.user, roles: [...m.user.roles.filter((r) => r.id !== roleId), role] } }
            : m
        )
      )
      setSelected((s) =>
        s?.userId === memberId
          ? { ...s, user: { ...s.user, roles: [...s.user.roles.filter((r) => r.id !== roleId), role] } }
          : s
      )
    }
  }

  async function removeRole(memberId: string, roleId: string) {
    await fetch(`/api/groups/${groupId}/members/${memberId}/roles?roleId=${roleId}`, { method: "DELETE" })
    setMembers((prev) =>
      prev.map((m) =>
        m.userId === memberId
          ? { ...m, user: { ...m.user, roles: m.user.roles.filter((r) => r.id !== roleId) } }
          : m
      )
    )
    setSelected((s) =>
      s?.userId === memberId
        ? { ...s, user: { ...s.user, roles: s.user.roles.filter((r) => r.id !== roleId) } }
        : s
    )
  }

  const owner = members.find((m) => m.role === "owner")
  const rest = members.filter((m) => m.role !== "owner")

  return (
    <aside className="w-52 shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col overflow-y-auto">
      <div className="px-3 pt-4 pb-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Members — {members.length}
        </p>

        {owner && <MemberRow member={owner} isOwner={isOwner} onSelect={setSelected} />}

        {rest.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Members</p>
            {rest.map((m) => (
              <MemberRow key={m.userId} member={m} isOwner={isOwner} onSelect={setSelected} />
            ))}
          </div>
        )}
      </div>

      {/* Role assignment panel */}
      {selected && isOwner && (
        <div className="mx-3 mb-4 bg-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-white truncate">
              {selected.user.displayName ?? selected.user.username}
            </span>
            <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {selected.user.roles.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {selected.user.roles.map((r) => (
                <span
                  key={r.id}
                  className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full cursor-pointer hover:opacity-70"
                  style={{ backgroundColor: r.color + "28", color: r.color, border: `1px solid ${r.color}50` }}
                  onClick={() => removeRole(selected.userId, r.id)}
                  title="Click to remove"
                >
                  {r.name} ×
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-slate-500 mb-1.5">Add role</p>
          <div className="flex flex-wrap gap-1">
            {groupRoles
              .filter((r) => !selected.user.roles.find((ar) => ar.id === r.id))
              .map((r) => (
                <button
                  key={r.id}
                  onClick={() => assignRole(selected.userId, r.id)}
                  className="text-xs px-1.5 py-0.5 rounded-full hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: r.color + "28", color: r.color, border: `1px solid ${r.color}50` }}
                >
                  + {r.name}
                </button>
              ))}
            {groupRoles.filter((r) => !selected.user.roles.find((ar) => ar.id === r.id)).length === 0 && (
              <p className="text-xs text-slate-600">All roles assigned</p>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}

function MemberRow({
  member,
  isOwner,
  onSelect,
}: {
  member: Member
  isOwner: boolean
  onSelect: (m: Member) => void
}) {
  const nameplate = member.user.decorations.find((d) => d.type === "nameplate")
  const trusted = isTrusted(member.joinedAt)
  const displayName = member.user.displayName ?? member.user.username

  return (
    <div
      className={`flex items-start gap-2 px-1 py-1.5 rounded-lg ${isOwner ? "hover:bg-slate-800 cursor-pointer" : ""} transition-colors`}
      onClick={() => isOwner && onSelect(member)}
    >
      <div className="relative mt-0.5">
        <DecorationAvatar
          username={member.user.username}
          avatarUrl={member.user.avatarUrl}
          decorations={member.user.decorations}
          size="sm"
        />
        {member.role === "owner" && (
          <Crown className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs text-white font-medium truncate">{displayName}</span>
          {trusted && member.role !== "owner" && (
            <ShieldCheck className="w-3 h-3 text-blue-400 shrink-0" />
          )}
        </div>
        {nameplate && <NameplateBadge style={nameplate.style} name={nameplate.name} />}
        {member.user.roles.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mt-0.5">
            {member.user.roles.map((r) => (
              <span
                key={r.id}
                className="text-[10px] px-1 py-px rounded-full"
                style={{ backgroundColor: r.color + "28", color: r.color }}
              >
                {r.name}
              </span>
            ))}
          </div>
        )}
        {member.user.tags.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mt-0.5">
            {member.user.tags.map((t) => (
              <TagBadge key={t.id} tag={t} small />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
