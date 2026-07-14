import Header from "@/components/Header";
import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/sign-in");

  const user = {
    id: session.user.id,
    name: session.user.name || "User",
    email: session.user.email,
  };

  return (
    <main className="min-h-screen text-gray-400 bg-[#050810]">
      <Header user={user} />
      <div className="w-full px-4 md:px-10 py-6">{children}</div>
    </main>
  );
};
export default Layout;
