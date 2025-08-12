import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { channelId } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "PATCH") {
    try {
      const { serverId } = req.query;
      const { name, type } = req.body;

      if (!serverId) {
        return res.status(400).json({ error: "Server ID Missing" });
      }

      if (!channelId) {
        return res.status(400).json({ error: "Channel ID Missing" });
      }

      if (!name || !type || name === "general") {
        return res.status(400).json({ error: "Name / Type cannot be empty or general" });
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
            update: {
              where: {
                id: channelId as string,
                NOT: {
                  name: "general"
                }
              },
              data: {
                name,
                type
              }
            }
          }
        }
      });

      return res.status(200).json(server);
    } catch (error) {
      console.error("[CHANNEL_PATCH]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { serverId } = req.query;

      if (!serverId) {
        return res.status(400).json({ error: "Server ID Missing" });
      }

      if (!channelId) {
        return res.status(400).json({ error: "Channel ID Missing" });
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
            delete: {
              id: channelId as string,
              name: {
                not: "general"
              }
            }
          }
        }
      });

      return res.status(200).json(server);
    } catch (error) {
      console.error("[CHANNEL_DELETE]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}