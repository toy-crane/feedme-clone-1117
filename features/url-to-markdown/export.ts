export type ChatService = "chatgpt" | "claude";

// 인코딩 후 이 길이를 넘으면 ?q= 대신 클립보드 붙여넣기 안내로 넘어간다(스펙 가정).
export const URL_QUERY_LIMIT = 6000;

const CHAT_BASE: Record<ChatService, string> = {
  chatgpt: "https://chatgpt.com/",
  claude: "https://claude.ai/new",
};

export function buildExportText(prompt: string, markdown: string): string {
  const p = prompt.trim();
  return p ? `${p}\n\n${markdown}` : markdown;
}

export function downloadFilename(title: string): string {
  const base = title
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "page"}.md`;
}

export function buildChatUrl(service: ChatService, text: string) {
  const encoded = encodeURIComponent(text);
  const filled = encoded.length <= URL_QUERY_LIMIT;
  return {
    filled,
    url: filled ? `${CHAT_BASE[service]}?q=${encoded}` : CHAT_BASE[service],
  };
}
