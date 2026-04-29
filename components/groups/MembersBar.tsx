"use client"

import { useState } from "react"
import { Crown, ShieldCheck, X, User } from "lucide-react"
import { DecorationAvatar, NameplateBadge } from "@/components/ui/DecorationAvatar"
import { TagBadge } from "@/components/ui/TagBadge"
import Link from "next/link"

interface Role { id: string; name: string; color: string }
interface Decoration { type: string; name: string; style: string }

interface Member {
  userId: string
  role: string
  joinedAt: string
  user: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
    bio: string | null
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
  groupRoles: Role[]
}

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
function isTrusted(joinedAt: string) {
  return Date.now() - new Date(joinedAt).getTime() > THIRTY_DAYS
}

export function MembersBar({ groupId, members: initial, currentUserId, isOwner, groupRoles }: Props) {
  const [members, setMembers] = useState<Member[]>(initial)
  const [profile, setProfile] = useState<Member | null>(null)

  async function assignRole(memberId: string, roleId: string) {
    const res = await fetch(`/api/groups/${groupId}/members/${memberId}/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId }),
    })
    if (!res.ok) return
    const role = groupRoles.find((r) => r.id === roleId)!
    const update = (m: Member): Member =>
      m.userId === memberId
        ? { ...m, user: { ...m.user, roles: [...m.user.roles.filter((r) => r.id !== roleId), role] } }
        : m
    setMembers((prev) => prev.map(update))
    setProfile((p) => (p?.userId === memberId ? update(p) : p))
  }

  async function removeRole(memberId: string, roleId: string) {
    await fetch(`/api/groups/${groupId}/members/${memberId}/roles?roleId=${roleId}`, { method: "DELETE" })
    const update = (m: Member): Member =>
      m.userId === memberId
        ? { ...m, user: { ...m.user, roles: m.user.roles.filter((r) => r.id !== roleId) } }
        : m
    setMembers((prev) => prev.map(update))
    setProfile((p) => (p?.userId === memberId ? update(p) : p))
  }

  const owner = members.find((m) => m.role === "owner")
  const rest = members.filter((m) => m.role !== "owner")

  return (
    <>
      <aside className="w-52 shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col overflow-y-auto">
        <div className="px-3 pt-4 pb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Members — {members.length}
          </p>

          {owner && (
            <MemberRow
              member={owner}
              onClick={() => setProfile(owner)}
            />
          )}

          {rest.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Members</p>
              {rest.map((m) => (
                <MemberRow key={m.userId} member={m} onClick={() => setProfile(m)} />
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Profile popup modal */}
      {profile && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setProfile(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Banner + avatar */}
            <div className="h-20 bg-gradient-to-br from-orange-600/40 to-blue-600/40 relative">
              <button
                onClick={() => setProfile(null)}
                className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 pb-5 -mt-10">
              <div className="flex items-end justify-between mb-3">
                <DecorationAvatar
                  username={profile.user.username}
                  avatarUrl={profile.user.avatarUrl}
                  decorations={profile.user.decorations}
                  size="lg"
                />
                <Link
                  href={`/profile/${profile.user.id}`}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <User className="w-3.5 h-3.5" /> View Profile
                </Link>
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-white font-bold text-lg leading-tight">
                    {profile.user.displayName ?? profile.user.username}
                  </h3>
                  {profile.role === "owner" && (
                    <Crown className="w-4 h-4 text-yellow-400 shrink-0" />
                  )}
                  {isTrusted(profile.joinedAt) && profile.role !== "owner" && (
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  )}
                </div>
                <p className="text-slate-400 text-sm">@{profile.user.username}</p>
              </div>

              {profile.user.bio && (
                <p className="text-slate-300 text-sm mb-3 leading-relaxed">{profile.user.bio}</p>
              )}

              {/* Decorations */}
              {profile.user.decorations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {profile.user.decorations.map((d, i) => (
                    d.type === "nameplate"
                      ? <NameplateBadge key={i} style={d.style} name={d.name} />
                      : <span key={i} className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${d.style === "star" ? "text-yellow-400 bg-yellow-400/10 border border-yellow-400/30" : "text-blue-400 bg-blue-400/10 border border-blue-400/30"}`}>
                          {d.style === "star" ? "⭐" : "⚡"} {d.name}
                        </span>
                  ))}
                </div>
              )}

              {/* Group roles */}
              {profile.user.roles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {profile.user.roles.map((r) => (
                    <span
                      key={r.id}
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: r.color + "28", color: r.color, border: `1px solid ${r.color}50` }}
                    >
                      {r.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Tags */}
              {profile.user.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {profile.user.tags.map((t) => <TagBadge key={t.id} tag={t} small />)}
                </div>
              )}

              <p className="text-slate-600 text-xs">
                Member for{" "}
                {Math.floor((Date.now() - new Date(profile.joinedAt).getTime()) / 86400000)} days
              </p>

              {/* Owner role management */}
              {isOwner && profile.userId !== currentUserId && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Manage Roles</p>

                  {profile.user.roles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {profile.user.roles.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => removeRole(profile.userId, r.id)}
                          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full hover:opacity-70 transition-opacity"
                          style={{ backgroundColor: r.color + "28", color: r.color, border: `1px solid ${r.color}50` }}
                          title="Click to remove"
                        >
                          {r.name} ×
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {groupRoles
                      .filter((r) => !profile.user.roles.find((ar) => ar.id === r.id))
                      .map((r) => (
                        <button
                          key={r.id}
                          onClick={() => assignRole(profile.userId, r.id)}
                          className="text-xs px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: r.color + "28", color: r.color, border: `1px solid ${r.color}50` }}
                        >
                          + {r.name}
                        </button>
                      ))}
                    {groupRoles.filter((r) => !profile.user.roles.find((ar) => ar.id === r.id)).length === 0 && (
                      <p className="text-slate-600 text-xs">All roles assigned</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function MemberRow({ member, onClick }: { member: Member; onClick: () => void }) {
  const nameplate = member.user.decorations.find((d) => d.type === "nameplate")
  const trusted = isTrusted(member.joinedAt)
  const displayName = member.user.displayName ?? member.user.username

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-left group"
    >
      <div className="relative mt-0.5 shrink-0">
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
          <span className="text-xs text-white font-medium truncate group-hover:text-orange-300 transition-colors">
            {displayName}
          </span>
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
      </div>
    </button>
  )
}
