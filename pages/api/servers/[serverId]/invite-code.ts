import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { serverId } = req.query;
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!serverId) {
      return res.status(400).json({ error: "Server ID Missing" });
    }

    const server = await db.server.update({
      where: {
        id: serverId as string,
        profileId: session.user.id
      },
      data: {
        inviteCode: uuidv4()
      }
    });

    return res.status(200).json(server);
  } catch (error) {
    console.error("[SERVER_INVITE_CODE_PATCH]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}