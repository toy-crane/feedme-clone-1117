import { beforeEach, expect, test, vi } from "vitest";

const upsert = vi.fn();
const maybeSingle = vi.fn();
const eqUrl = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq: vi.fn(() => ({ eq: eqUrl })) }));
const getClaims = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getClaims },
    from: () => ({ upsert, select }),
  }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { getSavedStatus, saveArticle } from "./actions";
import { normalizeUrl } from "./normalize-url";

const article = {
  title: "제목",
  author: "",
  site: "예시",
  url: "https://Example.com/a#frag",
  markdown: "본문",
};

beforeEach(() => {
  vi.clearAllMocks();
  getClaims.mockResolvedValue({ data: { claims: { sub: "user-1" } } });
  upsert.mockResolvedValue({ error: null });
});

test("URL은 new URL().href로 정규화한다", () => {
  expect(normalizeUrl("https://Example.com")).toBe("https://example.com/");
});

test("로그인하지 않았으면 저장하지 않고 unauthenticated를 돌려준다", async () => {
  getClaims.mockResolvedValue({ data: null });
  expect(await saveArticle(article)).toEqual({ status: "unauthenticated" });
  expect(upsert).not.toHaveBeenCalled();
});

test("저장은 (user_id, url) 기준 upsert이고 정규화한 URL과 새 저장일을 쓴다", async () => {
  expect(await saveArticle(article)).toEqual({ status: "saved" });
  const [row, options] = upsert.mock.calls[0];
  expect(row).toMatchObject({
    user_id: "user-1",
    url: "https://example.com/a#frag",
    title: "제목",
    markdown: "본문",
  });
  expect(Number.isNaN(Date.parse(row.saved_at))).toBe(false);
  expect(options).toEqual({ onConflict: "user_id,url" });
});

test("DB 오류는 error로 돌려준다", async () => {
  upsert.mockResolvedValue({ error: { message: "boom" } });
  expect(await saveArticle(article)).toEqual({ status: "error" });
});

test("저장 여부는 같은 사용자·같은 정규화 URL의 행이 있는지로 판단한다", async () => {
  maybeSingle.mockResolvedValue({ data: { id: "x" } });
  expect(await getSavedStatus("https://Example.com")).toBe(true);
  expect(eqUrl).toHaveBeenCalledWith("url", "https://example.com/");
  maybeSingle.mockResolvedValue({ data: null });
  expect(await getSavedStatus("https://example.com")).toBe(false);
});

test("로그인하지 않았으면 저장 여부는 false다", async () => {
  getClaims.mockResolvedValue({ data: null });
  expect(await getSavedStatus("https://example.com")).toBe(false);
});
