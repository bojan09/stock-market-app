"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, User, Search, LayoutDashboard, Star } from "lucide-react";
import { signOut } from "@/lib/actions/auth.actions";
import SearchCommand from "./SearchCommand";
import Link from "next/link";

interface UserDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  userEmail: string;
}

const UserDropdown = ({ user, userEmail }: UserDropdownProps) => {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.refresh(); // Clear client cache
    router.push("/sign-in");
  };

  const displayName = user?.name || "User";
  const initials = displayName[0]?.toUpperCase() || "U";
  const imageSrc = user?.image && user.image !== "" ? user.image : undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 text-gray-400 hover:text-indigo-400 focus-visible:ring-0"
        >
          <Avatar className="h-8 w-8 border border-white/10">
            <AvatarImage src={imageSrc} alt={displayName} />
            <AvatarFallback className="bg-indigo-500 text-white font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:block font-medium">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="bg-[#121212] border-white/10 text-gray-400 min-w-[220px] p-2"
      >
        <DropdownMenuLabel className="px-2 py-3">
          <div className="flex flex-col">
            <span className="text-gray-100 font-semibold">{displayName}</span>
            <span className="text-xs text-gray-500">{user?.email}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-white/5" />

        <Link href="/profile">
          <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer py-2.5">
            <User className="h-4 w-4 mr-3 text-gray-500" />
            Profile Settings
          </DropdownMenuItem>
        </Link>

        {/* Mobile Navigation Section */}
        <div className="md:hidden">
          {/* ... (existing Dashboard/Watchlist/Search items) */}
        </div>

        <DropdownMenuSeparator className="bg-white/5" />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer focus:bg-red-500/10 focus:text-red-500 py-2.5"
        >
          <LogOut className="h-4 w-4 mr-3" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
