"use client";

import { useState, type ReactNode } from "react";
import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  InfoIcon,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import {
  buildChatUrl,
  buildExportText,
  downloadFilename,
  type ChatService,
} from "./export";

const PRESETS = [
  { value: "none", label: "프롬프트 없음", text: "" },
  { value: "summary", label: "요약해줘", text: "요약해줘" },
  { value: "translate", label: "한국어로 번역해줘", text: "한국어로 번역해줘" },
  { value: "explain", label: "쉽게 설명해줘", text: "쉽게 설명해줘" },
  { value: "custom", label: "직접 입력", text: "" },
] as const;

type ExportPanelProps = {
  title: string;
  markdown: string;
  // 내보내기 버튼 줄 맨 앞에 붙는 추가 동작(예: 저장).
  actions?: ReactNode;
};

export function ExportPanel({ title, markdown, actions }: ExportPanelProps) {
  const [preset, setPreset] = useState<string>("none");
  const [custom, setCustom] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  const promptText =
    preset === "custom"
      ? custom
      : (PRESETS.find((p) => p.value === preset)?.text ?? "");

  async function copy() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function download() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([markdown], { type: "text/markdown;charset=utf-8" }),
    );
    a.download = downloadFilename(title);
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function openIn(service: ChatService) {
    const text = buildExportText(promptText, markdown);
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
          {actions}
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
  );
}
