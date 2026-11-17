import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { UrlToMarkdown } from "./url-to-markdown";

const page = {
  title: "마크다운 소개",
  author: "홍길동",
  site: "위키백과",
  url: "https://ko.wikipedia.org/wiki/x",
  markdown: "## 역사\n\n문단입니다. [링크](https://example.com)\n\n- 하나\n- 둘",
};

let writeText: ReturnType<typeof vi.fn>;
let open: ReturnType<typeof vi.fn>;

function mockApi(body: unknown, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  );
}

async function convert(user: ReturnType<typeof userEvent.setup>, url = "https://example.com/a") {
  await user.type(screen.getByLabelText("웹 페이지 URL"), url);
  await user.click(screen.getByRole("button", { name: "변환" }));
}

let user: ReturnType<typeof userEvent.setup>;
beforeEach(() => {
  user = userEvent.setup();
  writeText = vi.fn(async () => {});
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  open = vi.fn();
  vi.stubGlobal("open", open);
});
afterEach(() => vi.unstubAllGlobals());

test("변환하면 제목 헤더, 저자, 렌더링된 Markdown(제목·링크·목록)이 나온다", async () => {
  mockApi(page);
  render(<UrlToMarkdown />);
  await convert(user);

  expect(await screen.findByRole("heading", { level: 1, name: page.title })).toBeInTheDocument();
  expect(screen.getByText("홍길동")).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 2, name: "역사" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "링크" })).toHaveAttribute("href", "https://example.com");
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(fetch).toHaveBeenCalledWith("/api/convert", expect.objectContaining({ method: "POST" }));
});

test("저자가 없으면 저자 자리를 만들지 않는다", async () => {
  mockApi({ ...page, author: "" });
  render(<UrlToMarkdown />);
  await convert(user);
  await screen.findByRole("heading", { level: 1 });
  expect(document.querySelector('[data-slot="author"]')).toBeNull();
});

test.each([
  ["invalid", "올바른 URL이 아닙니다"],
  ["fetch", "페이지를 가져오지 못했습니다"],
  ["empty", "본문을 찾지 못했습니다"],
])("%s 오류는 메시지를 보이고 결과 카드를 만들지 않으며 입력창은 계속 쓸 수 있다", async (code, title) => {
  mockApi({ error: code }, 422);
  render(<UrlToMarkdown />);
  await convert(user);

  expect(await screen.findByRole("alert")).toHaveTextContent(title);
  expect(screen.queryByRole("article")).toBeNull();
  const input = screen.getByLabelText("웹 페이지 URL");
  await user.type(input, "x");
  expect(input).toHaveValue("https://example.com/ax");
});

test("지우기는 입력, 결과, 오류, 프롬프트 선택, 직접 입력을 모두 초기화한다", async () => {
  mockApi(page);
  render(<UrlToMarkdown />);
  await convert(user);
  await screen.findByRole("article");
  await user.click(screen.getByRole("button", { name: "직접 입력" }));
  await user.type(screen.getByLabelText("직접 입력 프롬프트"), "세 줄로");
  await user.click(screen.getByRole("button", { name: "지우기" }));

  expect(screen.getByLabelText("웹 페이지 URL")).toHaveValue("");
  expect(screen.queryByRole("article")).toBeNull();

  mockApi(page);
  await convert(user);
  await screen.findByRole("article");
  expect(screen.queryByLabelText("직접 입력 프롬프트")).toBeNull();
  expect(screen.getByRole("button", { name: "프롬프트 없음" })).toHaveAttribute("aria-pressed", "true");
});

test("오류 뒤 지우기는 오류 메시지도 지운다", async () => {
  mockApi({ error: "fetch" }, 422);
  render(<UrlToMarkdown />);
  await convert(user);
  await screen.findByRole("alert");
  await user.click(screen.getByRole("button", { name: "지우기" }));
  expect(screen.queryByRole("alert")).toBeNull();
});

test("복사하기는 프롬프트를 선택해도 Markdown 본문만 복사하고 피드백을 보인다", async () => {
  mockApi(page);
  render(<UrlToMarkdown />);
  await convert(user);
  await screen.findByRole("article");
  await user.click(screen.getByRole("button", { name: "요약해줘" }));
  await user.click(screen.getByRole("button", { name: /복사하기/ }));

  expect(writeText).toHaveBeenCalledWith(page.markdown);
  expect(await screen.findByRole("button", { name: /복사했습니다/ })).toBeInTheDocument();
});

test(".md 다운로드는 제목으로 만든 파일명으로 본문만 저장한다", async () => {
  mockApi(page);
  const blobs: Blob[] = [];
  URL.createObjectURL = vi.fn((b: Blob) => (blobs.push(b), "blob:x"));
  URL.revokeObjectURL = vi.fn();
  const names: string[] = [];
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
    names.push(this.download);
  });
  render(<UrlToMarkdown />);
  await convert(user);
  await screen.findByRole("article");
  await user.click(screen.getByRole("button", { name: /\.md 다운로드/ }));

  expect(names).toEqual(["마크다운-소개.md"]);
  expect(await blobs[0].text()).toBe(page.markdown);
});

test("프리셋을 고르고 ChatGPT로 열기를 누르면 프롬프트+본문을 복사하고 ?q=로 새 탭을 연다", async () => {
  mockApi({ ...page, markdown: "짧은 본문" });
  render(<UrlToMarkdown />);
  await convert(user);
  await screen.findByRole("article");
  await user.click(screen.getByRole("button", { name: "요약해줘" }));
  await user.click(screen.getByRole("button", { name: /ChatGPT로 열기/ }));

  expect(writeText).toHaveBeenCalledWith("요약해줘\n\n짧은 본문");
  expect(open).toHaveBeenCalledWith(
    `https://chatgpt.com/?q=${encodeURIComponent("요약해줘\n\n짧은 본문")}`,
    "_blank",
    "noopener",
  );
});

test("프롬프트 없음이면 본문만 복사한다", async () => {
  mockApi({ ...page, markdown: "짧은 본문" });
  render(<UrlToMarkdown />);
  await convert(user);
  await screen.findByRole("article");
  await user.click(screen.getByRole("button", { name: /Claude로 열기/ }));
  expect(writeText).toHaveBeenCalledWith("짧은 본문");
});

test("인코딩 길이가 6,000자를 넘으면 ?q= 없이 열고 붙여넣기 안내를 보인다", async () => {
  mockApi({ ...page, markdown: "가".repeat(1200) });
  render(<UrlToMarkdown />);
  await convert(user);
  await screen.findByRole("article");
  await user.click(screen.getByRole("button", { name: /Claude로 열기/ }));

  expect(open).toHaveBeenCalledWith("https://claude.ai/new", "_blank", "noopener");
  expect(await screen.findByRole("status")).toHaveTextContent("클립보드에 복사했습니다. 붙여넣기 하세요");
});

test("직접 입력은 입력칸을 보이고, 다른 선택지로 바꾸면 숨기며, 비어 있으면 본문만 보낸다", async () => {
  mockApi({ ...page, markdown: "짧은 본문" });
  render(<UrlToMarkdown />);
  await convert(user);
  await screen.findByRole("article");

  expect(screen.queryByLabelText("직접 입력 프롬프트")).toBeNull();
  await user.click(screen.getByRole("button", { name: "직접 입력" }));
  expect(screen.getByLabelText("직접 입력 프롬프트")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /ChatGPT로 열기/ }));
  expect(writeText).toHaveBeenLastCalledWith("짧은 본문");

  await user.type(screen.getByLabelText("직접 입력 프롬프트"), "세 줄로");
  await user.click(screen.getByRole("button", { name: /ChatGPT로 열기/ }));
  expect(writeText).toHaveBeenLastCalledWith("세 줄로\n\n짧은 본문");

  await user.click(screen.getByRole("button", { name: "프롬프트 없음" }));
  expect(screen.queryByLabelText("직접 입력 프롬프트")).toBeNull();
});

test("결과 카드는 제목 헤더, 내보내기 영역, 본문 순서이고 본문에 자체 스크롤이 없다", async () => {
  mockApi(page);
  render(<UrlToMarkdown />);
  await convert(user);
  const article = await screen.findByRole("article");
  const parts = [...article.children];
  expect(within(parts[0] as HTMLElement).getByRole("heading", { level: 1 })).toBeInTheDocument();
  expect(within(parts[1] as HTMLElement).getByRole("button", { name: /복사하기/ })).toBeInTheDocument();
  expect(within(parts[2] as HTMLElement).getByRole("heading", { level: 2 })).toBeInTheDocument();
  expect(article.className).not.toMatch(/overflow-(y-)?(auto|scroll)/);
  expect(parts[2].className).not.toMatch(/overflow-(y-)?(auto|scroll)|max-h/);
  await waitFor(() => expect(screen.queryByLabelText("변환 중")).toBeNull());
});
