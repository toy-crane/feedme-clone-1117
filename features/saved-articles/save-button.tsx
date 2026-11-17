"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookmarkCheckIcon, BookmarkIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { getSavedStatus, saveArticle, type ArticleInput } from "./actions";

type Message = { kind: "saved" | "error"; text: string } | null;

export function SaveButton({ article }: { article: ArticleInput }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  useEffect(() => {
    let cancelled = false;
    getSavedStatus(article.url).then((value) => {
      if (!cancelled) setSaved(value);
    });
    return () => {
      cancelled = true;
    };
  }, [article.url]);

  async function save() {
    setPending(true);
    setMessage(null);
    let result;
    try {
      result = await saveArticle(article);
    } catch {
      result = { status: "error" as const };
    }
    setPending(false);

    if (result.status === "unauthenticated") {
      router.push("/auth/login");
    } else if (result.status === "saved") {
      setMessage({
        kind: "saved",
        text: saved ? "최신 내용으로 갱신했습니다." : "저장했습니다. 저장 목록에서 다시 볼 수 있습니다.",
      });
      setSaved(true);
    } else {
      setMessage({ kind: "error", text: "저장하지 못했습니다. 잠시 후 다시 시도해 주세요." });
    }
  }

  return (
    <>
      <Button variant="outline" onClick={save} disabled={pending}>
        {pending ? (
          <Loader2Icon className="animate-spin" data-icon="inline-start" />
        ) : saved ? (
          <BookmarkCheckIcon data-icon="inline-start" />
        ) : (
          <BookmarkIcon data-icon="inline-start" />
        )}
        {saved ? "저장됨" : "저장"}
      </Button>
      {message?.kind === "saved" && (
        <p role="status" className="basis-full text-sm text-muted-foreground">
          {message.text}
        </p>
      )}
      {message?.kind === "error" && (
        <p role="alert" className="basis-full text-sm text-destructive">
          {message.text}
        </p>
      )}
    </>
  );
}
