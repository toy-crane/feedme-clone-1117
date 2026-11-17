import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/features/auth/user-menu";
import { UrlToMarkdown } from "@/features/url-to-markdown/url-to-markdown";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <h2 className="flex items-baseline gap-2 text-lg font-semibold tracking-tight">
          URL → Markdown
          <small className="text-sm font-normal text-muted-foreground">
            LLM에 바로 넘기기
          </small>
        </h2>
        <div className="flex items-center gap-2">
          <UserMenu />
          <ThemeToggle />
        </div>
      </header>
      <UrlToMarkdown />
    </main>
  );
}
