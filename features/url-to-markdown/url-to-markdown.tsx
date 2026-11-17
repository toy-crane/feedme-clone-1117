"use client";

import { useRef, useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import {
  AlertCircleIcon,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  InfoIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import type { ConvertErrorCode, ConvertResult } from "./convert-url";
import {
  buildChatUrl,
  buildExportText,
  downloadFilename,
  type ChatService,
} from "./export";

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

const PRESETS = [
  { value: "none", label: "프롬프트 없음", text: "" },
  { value: "summary", label: "요약해줘", text: "요약해줘" },
  { value: "translate", label: "한국어로 번역해줘", text: "한국어로 번역해줘" },
  { value: "explain", label: "쉽게 설명해줘", text: "쉽게 설명해줘" },
  { value: "custom", label: "직접 입력", text: "" },
] as const;

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; code: ConvertErrorCode }
  | { kind: "done"; page: ConvertResult };

export function UrlToMarkdown() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [preset, setPreset] = useState<string>("none");
  const [custom, setCustom] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  const requestId = useRef(0);
  const loading = status.kind === "loading";

  async function convert(e: FormEvent) {
    e.preventDefault();
    setNotice("");
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
    setPreset("none");
    setCustom("");
    setNotice("");
    setCopied(false);
  }

  const page = status.kind === "done" ? status.page : null;
  const promptText =
    preset === "custom"
      ? custom
      : (PRESETS.find((p) => p.value === preset)?.text ?? "");

  async function copy() {
    if (!page) return;
    await navigator.clipboard.writeText(page.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function download() {
    if (!page) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([page.markdown], { type: "text/markdown;charset=utf-8" }),
    );
    a.download = downloadFilename(page.title);
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function openIn(service: ChatService) {
    if (!page) return;
    const text = buildExportText(promptText, page.markdown);
    await navigator.clipboard.writeText(text);
    const { url: target, filled } = buildChatUrl(service, text);
    window.open(target, "_blank", "noopener");
    const name = service === "chatgpt" ? "ChatGPT" : "Claude";
    setNotice(
      filled
        ? `클립보드에 복사했고, ${name} 입력창을 채워 새 탭으로 열었습니다.`
        : "클립보드에 복사했습니다. 붙여넣기 하세요",
    );
  }

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
          <CardHeader className="gap-2 border-b py-5 [&>*]:min-w-0">
            <h1 className="font-heading text-xl leading-snug font-semibold text-balance break-keep [overflow-wrap:anywhere]">
              {page.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {page.author && (
                <span data-slot="author" className="font-medium text-foreground">
                  {page.author}
                </span>
              )}
              <Badge variant="secondary">{page.site}</Badge>
              <a
                href={page.url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all underline underline-offset-4"
              >
                {page.url.replace(/^https?:\/\//, "")}
              </a>
            </div>
          </CardHeader>

          <div className="flex flex-col gap-4 border-b px-6 py-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">
                LLM에 보낼 프롬프트{" "}
                <span className="font-normal text-muted-foreground">
                  · ChatGPT·Claude로 열 때만 앞에 붙습니다
                </span>
              </span>
              <ToggleGroup
                variant="outline"
                spacing={2}
                className="flex-wrap"
                value={[preset]}
                onValueChange={(v) => {
                  if (v[0]) {
                    setPreset(v[0]);
                    setNotice("");
                  }
                }}
              >
                {PRESETS.map((p) => (
                  <ToggleGroupItem key={p.value} value={p.value} className="rounded-full">
                    {p.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              {preset === "custom" && (
                <Input
                  autoComplete="off"
                  placeholder="예: 핵심만 3줄로 정리해줘"
                  aria-label="직접 입력 프롬프트"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  autoFocus
                />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">내보내기</span>
              <div className="flex flex-wrap gap-2 max-sm:[&>button]:flex-1">
                <Button variant="outline" onClick={copy}>
                  {copied ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}
                  {copied ? "복사했습니다" : "복사하기"}
                </Button>
                <Button variant="outline" onClick={download}>
                  <DownloadIcon data-icon="inline-start" />
                  .md 다운로드
                </Button>
                <Button onClick={() => openIn("chatgpt")}>
                  ChatGPT로 열기
                  <ExternalLinkIcon data-icon="inline-end" />
                </Button>
                <Button onClick={() => openIn("claude")}>
                  Claude로 열기
                  <ExternalLinkIcon data-icon="inline-end" />
                </Button>
              </div>
            </div>

            {notice && (
              <Alert role="status">
                <InfoIcon />
                <AlertDescription>{notice}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="px-6 py-5">
            <MarkdownBody markdown={page.markdown} />
          </div>
        </Card>
      )}
    </div>
  );
}

function MarkdownBody({ markdown }: { markdown: string }) {
  return (
    <div className="text-[15px] leading-7 break-keep [overflow-wrap:anywhere] [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:mb-3.5 [&_blockquote]:border-l-[3px] [&_blockquote]:pl-3.5 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_h1]:mt-6 [&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mt-7 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:mb-1.5 [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:mb-3.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3.5 [&_pre]:mb-3.5 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_ul]:mb-3.5 [&_ul]:list-disc [&_ul]:pl-5 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}
