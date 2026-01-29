import Link from "next/link";
import Image from "next/image";
import NavItems from "@/components/NavItems";
import UserDropdown from "@/components/UserDropdown";
import { searchStocks } from "@/lib/actions/finnhub.actions";

// Adjusting the local interface to ensure email is recognized
interface HeaderProps {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
}

const Header = async ({ user }: HeaderProps) => {
  // Fetch initial stocks for the search command
  const initialStocks = await searchStocks();

  // Extract the email safely
  const userEmail = user?.email || "";

  return (
    <header className="sticky top-0 header">
      <div className="container header-wrapper">
        <Link href="/">
          <Image
            src="/assets/icons/logo.svg"
            alt="Signalist logo"
            width={140}
            height={32}
            className="h-8 w-auto cursor-pointer"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden sm:block">
          <NavItems initialStocks={initialStocks} userEmail={userEmail} />
        </nav>

        <UserDropdown
          user={user}
          initialStocks={initialStocks}
          userEmail={userEmail || ""}
        />
      </div>
    </header>
  );
};

export default Header;
