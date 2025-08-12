import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const { name, type } = req.body;
    const { serverId } = req.query;

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!serverId) {
      return res.status(400).json({ error: "Server ID is Missing" });
    }

    if (name === "general") {
      return res.status(400).json({ error: "Name cannot be 'general'" });
    }

    const server = await db.server.update({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: session.user.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR]
            }
          }
        }
      },
      data: {
        channels: {
          create: {
            profileId: session.user.id,
            name,
            type
          }
        }
      }
    });

    return res.status(200).json(server);
  } catch (error) {
    console.error("[CHANNELS_POST]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}