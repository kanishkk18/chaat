import React from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";
import { InitialModal } from "@/components/modals/initial-modal";

interface SetupPageProps {
  hasServers: boolean;
}

export default function SetupPage({ hasServers }: SetupPageProps) {
  if (!hasServers) {
    return <InitialModal />;
  }

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar />
      </div>
      <main className="md:pl-[72px] h-full">
        <div className="flex items-center justify-center h-full">
          <p className="text-zinc-500">Select a server to get started</p>
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
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

  const server = await db.server.findFirst({
    where: {
      members: {
        some: {
          profileId: profile.id
        }
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
    props: {
      hasServers: false,
    },
  };
};