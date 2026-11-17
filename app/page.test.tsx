import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";

test("홈 화면은 서비스 제목, URL 입력창, 다크모드 토글을 보여준다", () => {
  render(<Home />);

  expect(screen.getByText("URL → Markdown")).toBeInTheDocument();
  expect(screen.getByLabelText("웹 페이지 URL")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "변환" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "다크모드 전환" })).toBeInTheDocument();
});
