import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const session = await getServerSession(req, res, authOptions);
      
      if (!session?.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const servers = await db.server.findMany({
        where: {
          members: {
            some: {
              profileId: session.user.id
            }
          }
        }
      });

      return res.status(200).json(servers);
    } catch (error) {
      console.error("[SERVERS_GET]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  // Handle POST request (existing server creation logic)
  if (req.method === "POST") {
    try {
      const { name, imageUrl } = req.body;
      const session = await getServerSession(req, res, authOptions);

      if (!session?.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { v4: uuidv4 } = require("uuid");
      const { MemberRole } = require("@prisma/client");

      const server = await db.server.create({
        data: {
          profileId: session.user.id,
          name,
          imageUrl,
          inviteCode: uuidv4(),
          channels: { create: [{ name: "general", profileId: session.user.id }] },
          members: { create: [{ profileId: session.user.id, role: MemberRole.ADMIN }] }
        }
      });

      return res.status(200).json(server);
    } catch (error) {
      console.error("[SERVERS_POST]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}