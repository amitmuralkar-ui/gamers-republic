import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { createServer } from "http"
import { parse } from "url"
import next from "next"
import { Server as SocketIOServer } from "socket.io"
import { prisma } from "./lib/db"

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  })

  io.on("connection", (socket) => {
    socket.on("join-room", (roomId: string) => {
      socket.join(roomId)
    })

    socket.on("leave-room", (roomId: string) => {
      socket.leave(roomId)
    })

    socket.on(
      "send-message",
      async (data: {
        roomId: string
        content: string
        senderId: string
        roomType: "group" | "dm"
      }) => {
        const { roomId, content, senderId, roomType } = data
        if (!content.trim()) return

        try {
          const message = await prisma.message.create({
            data: {
              content: content.trim(),
              senderId,
              ...(roomType === "group"
                ? { groupId: roomId }
                : { directRoomId: roomId }),
            },
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          })
          io.to(roomId).emit("new-message", message)
        } catch {
          socket.emit("error", "Failed to send message")
        }
      }
    )

    socket.on("typing", (data: { roomId: string; username: string }) => {
      socket.to(data.roomId).emit("user-typing", data.username)
    })
  })

  httpServer.listen(3000, () => {
    console.log("> Ready on http://localhost:3000")
  })
})
