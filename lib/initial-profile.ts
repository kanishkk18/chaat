import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

import { db } from "@/lib/db";

export const initialProfile = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.id) {
    redirect("/sign-in");
  }

  const profile = await db.profile.findUnique({
    where: {
      id: session.user.id
    }
  });

  if (profile) return profile;

  // Profile should already exist from auth, but if not, redirect to sign-in
  redirect("/sign-in");
};
