import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

export default function SavedLayout({ children }: LayoutProps<"/saved">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/"
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            ← 홈으로
          </Link>
          <Link
            href="/saved"
            className="font-semibold underline-offset-4 hover:underline"
          >
            저장 목록
          </Link>
        </nav>
        <ThemeToggle />
      </header>
      {children}
    </main>
  );
}
