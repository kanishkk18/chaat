import React from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChannelType } from "@prisma/client";
import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";
import { ServerSidebar } from "@/components/server/server-sidebar";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";

interface ChannelIdPageProps {
  serverId: string;
  channelId: string;
  channel: {
    id: string;
    name: string;
    type: ChannelType;
    serverId: string;
  };
  member: {
    id: string;
    role: string;
    profileId: string;
    serverId: string;
    profile: {
      id: string;
      name: string;
      imageUrl: string;
      email: string;
    };
  };
}

export default function ChannelIdPage({
  serverId,
  channelId,
  channel,
  member
}: ChannelIdPageProps) {
  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar />
      </div>
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0 ml-[72px]">
        <ServerSidebar serverId={serverId} />
      </div>
      <main className="h-full md:pl-[332px]">
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
          <ChatHeader
            name={channel.name}
            serverId={channel.serverId}
            type="channel"
          />
          {channel.type === ChannelType.TEXT && (
            <>
              <ChatMessages
                member={member}
                name={channel.name}
                chatId={channel.id}
                type="channel"
                apiUrl="/api/messages"
                socketUrl="/api/socket/messages"
                socketQuery={{
                  channelId: channel.id,
                  serverId: channel.serverId
                }}
                paramKey="channelId"
                paramValue={channel.id}
              />
              <ChatInput
                name={channel.name}
                type="channel"
                apiUrl="/api/socket/messages"
                query={{
                  channelId: channel.id,
                  serverId: channel.serverId
                }}
              />
            </>
          )}
          {channel.type === ChannelType.AUDIO && (
            <MediaRoom chatId={channel.id} video={false} audio={true} />
          )}
          {channel.type === ChannelType.VIDEO && (
            <MediaRoom chatId={channel.id} video={true} audio={true} />
          )}
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { serverId, channelId } = context.params!;
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

  const channel = await db.channel.findUnique({
    where: { id: channelId as string }
  });

  const member = await db.member.findFirst({
    where: { 
      serverId: serverId as string, 
      profileId: profile.id 
    },
    include: {
      profile: true
    }
  });

  if (!channel || !member) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      serverId: serverId as string,
      channelId: channelId as string,
      channel: JSON.parse(JSON.stringify(channel)),
      member: JSON.parse(JSON.stringify(member)),
    },
  };
};