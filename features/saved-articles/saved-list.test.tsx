import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";

import { SavedList } from "./saved-list";

test("저장한 글이 없으면 빈 상태 안내와 홈으로 가는 링크를 보인다", () => {
  render(<SavedList articles={[]} />);
  expect(screen.getByText("저장한 글이 없습니다")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "변환하러 가기" })).toHaveAttribute("href", "/");
});

test("각 항목은 제목, 사이트, 저장일을 보이고 상세 주소로 연결되며 받은 순서를 지킨다", () => {
  render(
    <SavedList
      articles={[
        { id: "b", title: "두번째", site: "사이트B", saved_at: "2026-11-17T03:00:00Z" },
        { id: "a", title: "첫번째", site: "사이트A", saved_at: "2026-11-16T03:00:00Z" },
      ]}
    />,
  );
  const links = screen.getAllByRole("link");
  expect(links.map((l) => l.getAttribute("href"))).toEqual(["/saved/b", "/saved/a"]);
  expect(within(links[0]).getByText("두번째")).toBeInTheDocument();
  expect(within(links[0]).getByText("사이트B")).toBeInTheDocument();
  expect(within(links[0]).getByText("2026. 11. 17.")).toBeInTheDocument();
});
