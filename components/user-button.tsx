"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";

export function UserButton() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const handleSignOut = () => {
    signOut({ callbackUrl: "/sign-in" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-[48px] w-[48px] rounded-full overflow-hidden">
          <UserAvatar 
            src={session.user.image || undefined} 
            className="h-[48px] w-[48px]"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}