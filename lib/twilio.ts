import twilio from "twilio"

let client: ReturnType<typeof twilio> | null = null

function getClient() {
  if (!client) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    )
  }
  return client
}

export async function sendOTP(phone: string, code: string): Promise<void> {
  await getClient().messages.create({
    body: `Your Gamers Republic verification code: ${code}. Valid for 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: phone,
  })
}
