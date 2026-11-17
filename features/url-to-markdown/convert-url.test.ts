// @vitest-environment node
import { describe, expect, test } from "vitest";

import { ConvertError, convertUrl } from "./convert-url";

const article = (extra = "") => `<!doctype html><html><head><title>마크다운 소개</title>
${extra}</head><body><nav>메뉴 광고</nav><article><h1>마크다운 소개</h1>
<p>첫 문단입니다. <a href="https://example.com/a">링크</a>가 있습니다.</p>
<p>둘째 문단은 조금 더 길게 써서 본문으로 인식되도록 합니다. 충분히 긴 문장이 필요합니다.</p>
<h2>문법</h2><p>다음은 기본 문법의 목록이며 각 항목은 한 문장으로 설명한다.</p><ul><li>제목은 샵 기호의 개수로 단계를 나타내며 최대 여섯 단계까지 쓴다.</li><li>목록은 하이픈이나 숫자로 시작하고 들여쓰기로 중첩한다.</li></ul></article></body></html>`;

const html = (body: string, status = 200, type = "text/html; charset=utf-8") =>
  (async () => new Response(body, { status, headers: { "content-type": type } })) as typeof fetch;

describe("convertUrl", () => {
  test("기사 HTML에서 제목과 Markdown 본문을 뽑는다", async () => {
    const r = await convertUrl("https://example.com/post", html(article()));
    expect(r.title).toBe("마크다운 소개");
    expect(r.markdown).toContain("첫 문단입니다.");
    expect(r.markdown).toContain("[링크](https://example.com/a)");
    expect(r.markdown).toMatch(/^[-*] 제목은 샵/m);
    expect(r.markdown).not.toContain("메뉴 광고");
    expect(r.url).toBe("https://example.com/post");
  });

  test("저자 메타가 있으면 author를 돌려주고 없으면 빈 문자열이다", async () => {
    const withAuthor = await convertUrl(
      "https://example.com/post",
      html(article('<meta name="author" content="홍길동">')),
    );
    expect(withAuthor.author).toBe("홍길동");
    const without = await convertUrl("https://example.com/post", html(article()));
    expect(without.author).toBe("");
  });

  test.each(["not a url", "ftp://example.com/file", "javascript:alert(1)", ""])(
    "URL 형식이 아니거나 http(s)가 아니면 invalid 오류: %s",
    async (input) => {
      await expect(convertUrl(input, html(article()))).rejects.toMatchObject({
        code: "invalid",
      });
    },
  );

  test("4xx/5xx 응답은 fetch 오류다", async () => {
    await expect(
      convertUrl("https://example.com/x", html("nope", 404)),
    ).rejects.toMatchObject({ code: "fetch" });
    await expect(
      convertUrl("https://example.com/x", html("boom", 500)),
    ).rejects.toMatchObject({ code: "fetch" });
  });

  test("접속 실패는 fetch 오류다", async () => {
    const failing = (async () => {
      throw new TypeError("fetch failed");
    }) as typeof fetch;
    await expect(convertUrl("https://example.com/x", failing)).rejects.toMatchObject({
      code: "fetch",
    });
  });

  test("HTML이 아닌 응답은 empty 오류다", async () => {
    await expect(
      convertUrl("https://example.com/x.json", html("{}", 200, "application/json")),
    ).rejects.toMatchObject({ code: "empty" });
  });

  test("추출된 본문이 비어 있으면 empty 오류다", async () => {
    await expect(
      convertUrl("https://example.com/x", html("<html><body></body></html>")),
    ).rejects.toBeInstanceOf(ConvertError);
    await expect(
      convertUrl("https://example.com/x", html("")),
    ).rejects.toMatchObject({ code: "empty" });
  });
});
