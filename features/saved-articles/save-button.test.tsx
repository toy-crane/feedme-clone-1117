import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";

const push = vi.fn();
const saveArticle = vi.fn();
const getSavedStatus = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("./actions", () => ({
  saveArticle: (...a: unknown[]) => saveArticle(...a),
  getSavedStatus: (...a: unknown[]) => getSavedStatus(...a),
}));

import { SaveButton } from "./save-button";

const article = {
  title: "제목",
  author: "",
  site: "예시",
  url: "https://example.com/a",
  markdown: "본문",
};

beforeEach(() => {
  vi.clearAllMocks();
  getSavedStatus.mockResolvedValue(false);
});

test("저장하면 저장되었다는 표시가 나오고 버튼이 '저장됨'이 된다", async () => {
  saveArticle.mockResolvedValue({ status: "saved" });
  render(<SaveButton article={article} />);
  await userEvent.click(await screen.findByRole("button", { name: "저장" }));

  expect(await screen.findByRole("button", { name: "저장됨" })).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("저장했습니다");
  expect(saveArticle).toHaveBeenCalledWith(article);
});

test("이미 저장된 URL이면 처음부터 '저장됨'이고, 다시 눌러 갱신할 수 있다", async () => {
  getSavedStatus.mockResolvedValue(true);
  saveArticle.mockResolvedValue({ status: "saved" });
  render(<SaveButton article={article} />);
  const button = await screen.findByRole("button", { name: "저장됨" });
  await userEvent.click(button);

  expect(saveArticle).toHaveBeenCalledTimes(1);
  expect(await screen.findByRole("status")).toHaveTextContent("최신 내용으로 갱신했습니다");
  expect(screen.getByRole("button", { name: "저장됨" })).toBeInTheDocument();
});

test("비로그인 사용자가 누르면 로그인 페이지로 보낸다", async () => {
  saveArticle.mockResolvedValue({ status: "unauthenticated" });
  render(<SaveButton article={article} />);
  await userEvent.click(await screen.findByRole("button", { name: "저장" }));

  expect(push).toHaveBeenCalledWith("/auth/login");
});

test("저장에 실패하면 오류 안내를 보이고 버튼은 '저장' 그대로다", async () => {
  saveArticle.mockResolvedValue({ status: "error" });
  render(<SaveButton article={article} />);
  await userEvent.click(await screen.findByRole("button", { name: "저장" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("저장하지 못했습니다");
  expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
});
