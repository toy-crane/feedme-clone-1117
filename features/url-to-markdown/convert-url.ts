import { parseHTML } from "linkedom";
import { Defuddle } from "defuddle/node";

export type ConvertErrorCode = "invalid" | "fetch" | "empty";

export class ConvertError extends Error {
  constructor(public code: ConvertErrorCode) {
    super(code);
  }
}

export type ConvertResult = {
  title: string;
  author: string;
  site: string;
  url: string;
  markdown: string;
};

export async function convertUrl(
  input: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ConvertResult> {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new ConvertError("invalid");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ConvertError("invalid");
  }

  let res: Response;
  try {
    res = await fetchImpl(url, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; url-to-markdown)" },
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new ConvertError("fetch");
  }
  if (!res.ok) throw new ConvertError("fetch");
  if (!/html/i.test(res.headers.get("content-type") ?? "")) {
    throw new ConvertError("empty");
  }

  const html = await res.text();
  let parsed: Awaited<ReturnType<typeof Defuddle>>;
  try {
    const { document } = parseHTML(html);
    parsed = await Defuddle(document, url.href, { markdown: true });
  } catch {
    throw new ConvertError("empty");
  }

  const markdown = (parsed.content ?? "").trim();
  if (!markdown) throw new ConvertError("empty");

  return {
    title: parsed.title ?? "",
    author: parsed.author ?? "",
    site: parsed.site || url.hostname,
    url: url.href,
    markdown,
  };
}
