import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import Home from "@/app/page";

// 비동기 서버 컴포넌트는 jsdom에서 렌더링할 수 없다.
vi.mock("@/features/auth/user-menu", () => ({ UserMenu: () => null }));

test("홈 화면은 서비스 제목, URL 입력창, 다크모드 토글을 보여준다", () => {
  render(<Home />);

  expect(screen.getByText("URL → Markdown")).toBeInTheDocument();
  expect(screen.getByLabelText("웹 페이지 URL")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "변환" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "다크모드 전환" })).toBeInTheDocument();
});
