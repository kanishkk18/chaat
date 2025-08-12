import { NextApiRequest, NextApiResponse } from "next";
import { AccessToken } from "livekit-server-sdk";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { room, username } = req.query;

  if (!room) {
    return res.status(400).json({ error: 'Missing "room" query parameter' });
  }

  if (!username) {
    return res.status(400).json({ error: 'Missing "username" query parameter' });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const at = new AccessToken(apiKey, apiSecret, { identity: username as string });

  at.addGrant({
    room: room as string,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true
  });

  return res.status(200).json({ token: at.toJwt() });
}