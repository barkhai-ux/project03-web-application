import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/top-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="relative flex min-h-screen items-start justify-center p-6 md:p-7">
      <div className="shell w-full max-w-[1360px] min-h-[calc(100vh-3rem)] md:min-h-[calc(100vh-3.5rem)]">
        <div className="hero-photo" aria-hidden />
        <div className="hero-tint" aria-hidden />
        <div className="shell-inner">
          <TopNav />
          <main className="flex-1 min-h-0 flex flex-col">{children}</main>
        </div>
      </div>
    </div>
  );
}
