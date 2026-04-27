import { AccessToken } from "livekit-server-sdk"

export async function generateLiveKitToken(
  room: string,
  participantIdentity: string,
  participantName: string
): Promise<string> {
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity: participantIdentity, name: participantName }
  )
  at.addGrant({
    roomJoin: true,
    room,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  })
  return at.toJwt()
}
