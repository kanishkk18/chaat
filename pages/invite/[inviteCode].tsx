import React from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface InviteCodePageProps {
  inviteCode: string;
}

export default function InviteCodePage({ inviteCode }: InviteCodePageProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing Invite...</h1>
        <p>Please wait while we process your server invitation.</p>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { inviteCode } = context.params!;
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.id) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  if (!inviteCode) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const profile = await db.profile.findUnique({
    where: { id: session.user.id }
  });

  if (!profile) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  const existingServer = await db.server.findFirst({
    where: {
      inviteCode: inviteCode as string,
      members: {
        some: {
          profileId: profile.id
        }
      }
    }
  });

  if (existingServer) {
    return {
      redirect: {
        destination: `/servers/${existingServer.id}`,
        permanent: false,
      },
    };
  }

  const server = await db.server.update({
    where: {
      inviteCode: inviteCode as string
    },
    data: {
      members: {
        create: [{ profileId: profile.id }]
      }
    }
  });

  if (server) {
    return {
      redirect: {
        destination: `/servers/${server.id}`,
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
};