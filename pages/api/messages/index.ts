import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Message } from "@prisma/client";

const MESSAGES_BATCH = 10;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const { cursor, channelId } = req.query;

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!channelId) {
      return res.status(400).json({ error: "Channel ID Missing" });
    }

    let messages: Message[] = [];

    if (cursor) {
      messages = await db.message.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor as string
        },
        where: {
          channelId: channelId as string
        },
        include: {
          member: {
            include: {
              profile: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });
    } else {
      messages = await db.message.findMany({
        take: MESSAGES_BATCH,
        where: { channelId: channelId as string },
        include: {
          member: {
            include: {
              profile: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });
    }

    let nextCursor = null;

    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[MESSAGES_BATCH - 1].id;
    }

    return res.status(200).json({ items: messages, nextCursor });
  } catch (error) {
    console.error("[MESSAGES_GET]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}