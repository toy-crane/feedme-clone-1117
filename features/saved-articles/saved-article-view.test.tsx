import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";

import { SavedArticleView } from "./saved-article-view";

const article = {
  title: "저장된 제목",
  author: "홍길동",
  site: "예시",
  url: "https://example.com/a",
  markdown: "## 소제목\n\n본문",
};

test("헤더에 제목·저자·사이트·원문 링크, 본문과 내보내기 버튼을 보인다", () => {
  render(<SavedArticleView article={article} />);
  expect(screen.getByRole("heading", { level: 1, name: "저장된 제목" })).toBeInTheDocument();
  expect(screen.getByText("홍길동")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "example.com/a" })).toHaveAttribute("href", article.url);
  expect(screen.getByRole("heading", { level: 2, name: "소제목" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "복사하기" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: ".md 다운로드" })).toBeInTheDocument();
});

test("저자가 비어 있으면 저자 자리를 만들지 않는다", () => {
  render(<SavedArticleView article={{ ...article, author: "" }} />);
  expect(document.querySelector('[data-slot="author"]')).toBeNull();
});

test("복사하기는 저장된 본문만 클립보드에 넣는다", async () => {
  const writeText = vi.fn(async () => {});
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  render(<SavedArticleView article={article} />);
  await userEvent.click(screen.getByRole("button", { name: "복사하기" }));
  expect(writeText).toHaveBeenCalledWith(article.markdown);
});
