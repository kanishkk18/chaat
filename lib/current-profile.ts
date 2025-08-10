import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { db } from "@/lib/db";

export const currentProfile = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const profile = await db.profile.findUnique({
    where: { id: session.user.id }
  });

  return profile;
};
