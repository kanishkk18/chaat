import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { DirectMessage } from "@prisma/client";

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
    const { cursor, conversationId } = req.query;

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID Missing" });
    }

    let messages: DirectMessage[] = [];

    if (cursor) {
      messages = await db.directMessage.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor as string
        },
        where: {
          conversationId: conversationId as string
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
      messages = await db.directMessage.findMany({
        take: MESSAGES_BATCH,
        where: { conversationId: conversationId as string },
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
    console.error("[DIRECT_MESSAGES_GET]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}