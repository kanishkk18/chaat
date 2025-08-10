import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import React from "react";
import { UserButton } from "@/components/user-button";

import { NavigationAction } from "@/components/navigation/navigation-action";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationItem } from "@/components/navigation/navigation-item";
import { ModeToggle } from "@/components/mode-toggle";

export function NavigationSidebar() {
  const { data: session } = useSession();
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServers = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/servers');
        if (response.ok) {
          const data = await response.json();
          setServers(data);
        }
      } catch (error) {
        console.error('Failed to fetch servers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, [session]);

  if (!session?.user) return null;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4 flex flex-col h-full items-center text-primary w-full dark:bg-[#1e1f22] bg-[#e3e5e8] py-3">
      <NavigationAction />
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {servers.map((server) => (
          <div key={server.id} className="mb-4">
            <NavigationItem
              id={server.id}
              imageUrl={server.imageUrl}
              name={server.name}
            />
          </div>
        ))}
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <ModeToggle />
        <UserButton />
      </div>
    </div>
  );
}
