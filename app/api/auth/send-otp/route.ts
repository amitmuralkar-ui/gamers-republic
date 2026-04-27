import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { sendOTP } from "@/lib/twilio"
import { generateOTP, formatPhone } from "@/lib/utils"

const schema = z.object({
  phone: z.string().min(7, { error: "Invalid phone number" }),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 })
  }

  const phone = formatPhone(parsed.data.phone)
  const code = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await prisma.otp.deleteMany({ where: { phone } })
  await prisma.otp.create({ data: { phone, code, expiresAt } })

  await sendOTP(phone, code)

  return NextResponse.json({ success: true })
}
