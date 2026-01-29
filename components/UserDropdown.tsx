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

interface UserDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
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

  const displayName = user?.name || "User";
  const initials = displayName[0]?.toUpperCase() || "U";

  // FIX: Ensure src is never an empty string to prevent network reload error
  const imageSrc = user?.image && user.image !== "" ? user.image : undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 text-gray-400 hover:text-yellow-500 focus-visible:ring-0"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={imageSrc} alt={displayName} />
            <AvatarFallback className="bg-yellow-500 text-yellow-900 font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:block font-medium">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-[#121212] border-gray-600 text-gray-400 min-w-[200px]">
        <DropdownMenuLabel className="py-2">
          <div className="flex flex-col">
            <span className="text-gray-100 font-medium">{displayName}</span>
            <span className="text-xs text-gray-500">{user?.email}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-gray-600" />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer focus:bg-gray-800 text-gray-100"
        >
          <LogOut className="h-4 w-4 mr-2" /> Logout
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
