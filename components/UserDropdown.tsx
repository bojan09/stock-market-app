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
import { LogOut } from "lucide-react";
import NavItems from "@/components/NavItems";
import { signOut } from "@/lib/actions/auth.actions";

// FIXED: Interface matches the session user types (nullable/optional)
interface UserDropdownProps {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
  initialStocks: any[];
  userEmail: string;
}

const UserDropdown = ({
  user,
  initialStocks,
  userEmail,
}: UserDropdownProps) => {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  // Safe Fallbacks
  const displayName = user?.name || "User";
  const initials = displayName[0]?.toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 text-gray-400 hover:text-yellow-500 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={
                user?.image ||
                "https://avatars.githubusercontent.com/u/153423955?s=280&v=4"
              }
            />
            <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-base font-medium text-gray-400">
              {displayName}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-[#121212] border-gray-600 text-gray-400 min-w-[200px]">
        <DropdownMenuLabel>
          <div className="flex relative items-center gap-3 py-2">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-base font-medium text-gray-100">
                {displayName}
              </span>
              <span className="text-sm text-gray-500">{user?.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-gray-600" />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-gray-100 text-md font-medium focus:bg-gray-800 focus:text-yellow-500 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>

        <div className="sm:hidden">
          <DropdownMenuSeparator className="bg-gray-600" />
          <nav>
            <NavItems initialStocks={initialStocks} userEmail={userEmail} />
          </nav>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
