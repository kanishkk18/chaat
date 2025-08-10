import { getServerSession } from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/lib/auth";

import { db } from "@/lib/db";

export const currentProfilePages = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) return null;

  const profile = await db.profile.findUnique({
    where: { id: session.user.id }
  });

  return profile;
};
