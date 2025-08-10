import React from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";
import { ServerSidebar } from "@/components/server/server-sidebar";

interface ServerIdPageProps {
  serverId: string;
}

export default function ServerIdPage({ serverId }: ServerIdPageProps) {
  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar />
      </div>
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0 ml-[72px]">
        <ServerSidebar serverId={serverId} />
      </div>
      <main className="h-full md:pl-[332px]">
        <div className="flex items-center justify-center h-full">
          <p className="text-zinc-500">Select a channel to start messaging</p>
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { serverId } = context.params!;
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.id) {
    return {
      redirect: {
        destination: "/sign-in",
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

  const server = await db.server.findUnique({
    where: {
      id: serverId as string,
      members: {
        some: {
          profileId: profile.id
        }
      }
    },
    include: {
      channels: {
        where: {
          name: "general"
        },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!server) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const initialChannel = server.channels[0];

  if (initialChannel?.name === "general") {
    return {
      redirect: {
        destination: `/servers/${serverId}/channels/${initialChannel.id}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      serverId: serverId as string,
    },
  };
};