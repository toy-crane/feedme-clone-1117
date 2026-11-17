"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { AlertCircleIcon, Loader2Icon, XIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleHeader } from "@/components/markdown-export/article-header";
import { ExportPanel } from "@/components/markdown-export/export-panel";
import { MarkdownBody } from "@/components/markdown-export/markdown-body";

import type { ConvertErrorCode, ConvertResult } from "./convert-url";

const ERRORS: Record<ConvertErrorCode, { title: string; desc: string }> = {
  invalid: {
    title: "올바른 URL이 아닙니다",
    desc: "http:// 또는 https://로 시작하는 주소를 입력해 주세요.",
  },
  fetch: {
    title: "페이지를 가져오지 못했습니다",
    desc: "접속에 실패했거나 서버가 오류를 돌려줬습니다. 주소를 확인하고 다시 시도해 주세요.",
  },
  empty: {
    title: "본문을 찾지 못했습니다",
    desc: "HTML이 아니거나 본문이 비어 있는 페이지입니다. 스크립트로 그려지는 페이지는 변환되지 않을 수 있습니다.",
  },
};

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; code: ConvertErrorCode }
  | { kind: "done"; page: ConvertResult };

type UrlToMarkdownProps = {
  // 변환 결과 카드의 내보내기 줄 앞에 붙는 추가 동작. 조합은 상위에서 한다.
  renderActions?: (page: ConvertResult) => ReactNode;
};

export function UrlToMarkdown({ renderActions }: UrlToMarkdownProps) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const requestId = useRef(0);
  const loading = status.kind === "loading";

  async function convert(e: FormEvent) {
    e.preventDefault();
    const id = ++requestId.current;
    const isCurrent = () => id === requestId.current;
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!isCurrent()) return;
      setStatus(
        res.ok
          ? { kind: "done", page: data }
          : { kind: "error", code: data.error in ERRORS ? data.error : "fetch" },
      );
    } catch {
      if (isCurrent()) setStatus({ kind: "error", code: "fetch" });
    }
  }

  function reset() {
    requestId.current++;
    setUrl("");
    setStatus({ kind: "idle" });
  }

  const page = status.kind === "done" ? status.page : null;
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm leading-relaxed text-muted-foreground">
        읽고 싶은 웹 페이지 주소를 붙여넣으면 본문만 Markdown으로 뽑아 줍니다.
        복사하거나 파일로 받고, ChatGPT·Claude에 바로 보낼 수 있습니다.
      </p>

      <form onSubmit={convert} className="flex gap-2" noValidate>
        <div className="relative min-w-0 flex-1">
          <Input
            type="url"
            inputMode="url"
            autoComplete="off"
            placeholder="https://example.com/article"
            aria-label="웹 페이지 URL"
            aria-invalid={status.kind === "error" && status.code === "invalid"}
            className="h-11 pr-11 text-base"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          {(url || status.kind !== "idle") && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="지우기"
              className="absolute top-1.5 right-1.5 size-8"
              onClick={reset}
            >
              <XIcon />
            </Button>
          )}
        </div>
        <Button type="submit" size="lg" className="h-11 px-5" disabled={loading}>
          {loading && <Loader2Icon className="animate-spin" data-icon="inline-start" />}
          {loading ? "변환 중…" : "변환"}
        </Button>
      </form>

      {status.kind === "error" && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>{ERRORS[status.code].title}</AlertTitle>
          <AlertDescription>{ERRORS[status.code].desc}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <Card aria-busy="true" aria-label="변환 중">
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      )}

      {page && (
        <Card role="article" className="gap-0 py-0">
          <ArticleHeader {...page} />
          <ExportPanel
            title={page.title}
            markdown={page.markdown}
            actions={renderActions?.(page)}
          />
          <div className="px-6 py-5">
            <MarkdownBody markdown={page.markdown} />
          </div>
        </Card>
      )}
    </div>
  );
}
