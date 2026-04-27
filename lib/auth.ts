import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Discord from "next-auth/providers/discord"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
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
