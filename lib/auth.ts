import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Discord from "next-auth/providers/discord"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      checks: ["state"],
    }),
    ...(process.env.NODE_ENV === "development"
      ? [
          Credentials({
            id: "dev",
            name: "Dev Login",
            credentials: { username: { label: "Username", type: "text" } },
            async authorize(credentials) {
              const username = (credentials?.username as string | undefined)?.trim()
              if (!username) return null
              const isAdmin = process.env.ADMIN_USERNAME === username
              let user = await prisma.user.findUnique({ where: { username } })
              if (!user) {
                user = await prisma.user.create({
                  data: { username, displayName: username, isAdmin },
                })
              } else if (isAdmin && !user.isAdmin) {
                user = await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } })
              }
              return { id: user.id, name: user.displayName ?? user.username }
            },
          }),
        ]
      : []),
    Credentials({
      name: "Phone",
      credentials: {
        phone: { label: "Phone Number", type: "tel" },
        otp: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null

        const phone = credentials.phone as string
        const otp = credentials.otp as string

        const otpRecord = await prisma.otp.findFirst({
          where: { phone, code: otp, expiresAt: { gt: new Date() } },
        })

        if (!otpRecord) return null

        await prisma.otp.delete({ where: { id: otpRecord.id } })

        let user = await prisma.user.findUnique({ where: { phone } })
        if (!user) {
          user = await prisma.user.create({
            data: {
              phone,
              username: `gamer_${Date.now()}`,
              phoneVerified: new Date(),
            },
          })
        }

        return { id: user.id, name: user.displayName ?? user.username }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "discord") {
        try {
          const email = user.email ?? null
          const discordId = account.provider === "discord" ? account.providerAccountId : null

          // find by email first, then by discordId
          let dbUser =
            (email ? await prisma.user.findUnique({ where: { email } }) : null) ??
            (discordId ? await prisma.user.findUnique({ where: { discordId } }) : null)

          if (!dbUser) {
            const base = (user.name ?? email ?? "gamer")
              .toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 18) || "gamer"
            let username = base
            let n = 0
            while (await prisma.user.findUnique({ where: { username } })) {
              username = `${base}${++n}`
            }
            dbUser = await prisma.user.create({
              data: {
                username,
                displayName: user.name ?? username,
                email,
                avatarUrl: user.image ?? null,
                emailVerified: email ? new Date() : null,
                discordId,
                isAdmin: process.env.ADMIN_USERNAME === username,
              },
            })
          } else if (discordId && !dbUser.discordId) {
            dbUser = await prisma.user.update({ where: { id: dbUser.id }, data: { discordId } })
          }

          user.id = dbUser.id
          return true
        } catch (e) {
          console.error("OAuth signIn error:", e)
          return false
        }
      }
      return true
    },
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
  pages: { signIn: "/login" },
})
