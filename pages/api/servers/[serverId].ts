import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { serverId } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "PATCH") {
    try {
      const { name, imageUrl } = req.body;

      const server = await db.server.update({
        where: { 
          id: serverId as string, 
          profileId: session.user.id 
        },
        data: { name, imageUrl }
      });

      return res.status(200).json(server);
    } catch (error) {
      console.error("[SERVER_PATCH]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const server = await db.server.delete({
        where: { 
          id: serverId as string, 
          profileId: session.user.id 
        }
      });

      return res.status(200).json(server);
    } catch (error) {
      console.error("[SERVER_DELETE]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}