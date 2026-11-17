import { describe, expect, test } from "vitest";

import { buildChatUrl, buildExportText, downloadFilename } from "./export";

describe("buildExportText", () => {
  test("프롬프트가 있으면 프롬프트 + 빈 줄 + 본문이다", () => {
    expect(buildExportText("요약해줘", "본문")).toBe("요약해줘\n\n본문");
  });
  test("프롬프트가 비어 있으면 본문만이다 (직접 입력이 빈 경우 포함)", () => {
    expect(buildExportText("", "본문")).toBe("본문");
    expect(buildExportText("   ", "본문")).toBe("본문");
  });
});

describe("downloadFilename", () => {
  test("페이지 제목에서 파일명을 만든다", () => {
    expect(downloadFilename("마크다운 - 위키백과, 우리 모두의 백과사전")).toBe(
      "마크다운-위키백과-우리-모두의-백과사전.md",
    );
  });
  test("제목이 비면 page.md다", () => {
    expect(downloadFilename("")).toBe("page.md");
    expect(downloadFilename(" ?!/ ")).toBe("page.md");
  });
});

describe("buildChatUrl", () => {
  test("인코딩 길이가 6,000자 이하이면 ?q=로 입력창을 채운다", () => {
    const r = buildChatUrl("chatgpt", "hello world");
    expect(r.filled).toBe(true);
    expect(r.url).toBe("https://chatgpt.com/?q=hello%20world");
  });
  test("Claude는 claude.ai/new?q= 를 쓴다", () => {
    expect(buildChatUrl("claude", "hi").url).toBe("https://claude.ai/new?q=hi");
  });
  test("6,000자를 넘으면 ?q= 없이 서비스만 연다", () => {
    const r = buildChatUrl("chatgpt", "가".repeat(1100));
    expect(r.filled).toBe(false);
    expect(r.url).toBe("https://chatgpt.com/");
  });
  test("정확히 6,000자는 채우고 6,001자는 채우지 않는다", () => {
    expect(buildChatUrl("claude", "a".repeat(6000)).filled).toBe(true);
    expect(buildChatUrl("claude", "a".repeat(6001)).filled).toBe(false);
  });
});
