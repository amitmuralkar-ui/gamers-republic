"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, Users, Play, Settings, Gamepad2, Search } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/messages", icon: MessageSquare, label: "Messages" },
  { href: "/groups", icon: Users, label: "Groups" },
  { href: "/clips", icon: Play, label: "Clips" },
]

interface SidebarProps {
  userId: string
  avatarUrl?: string | null
  username: string
}

export function Sidebar({ userId, avatarUrl, username }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-slate-900 border-r border-slate-800 h-screen sticky top-0 shrink-0">
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-800">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shrink-0">
            <Gamepad2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">Gamers Republic</span>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-violet-600/20 text-violet-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-2 border-t border-slate-800">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === "/settings"
                ? "bg-violet-600/20 text-violet-400"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <Settings className="w-5 h-5 shrink-0" />
            Settings
          </Link>
          <Link
            href={`/profile/${userId}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors mt-0.5"
          >
            <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                  {username.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-white truncate">{username}</span>
          </Link>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex z-50">
        {[...navItems, { href: "/settings", icon: Settings, label: "Settings" }].map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
              pathname.startsWith(href) ? "text-violet-400" : "text-slate-500"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="hidden xs:block">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
