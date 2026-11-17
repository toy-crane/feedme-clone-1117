import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { LogoutButton } from "@/features/auth/logout-button";
import { createClient } from "@/lib/supabase/server";

export async function UserMenu() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email;

  if (!data?.claims) {
    return (
      <Link
        href="/auth/login"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        로그인
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/settings"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        {typeof email === "string" ? email : "설정"}
      </Link>
      <LogoutButton />
    </div>
  );
}
