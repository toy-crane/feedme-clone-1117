import Link from "next/link";
import { BookmarkIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import type { SavedListItem } from "./queries";

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  dateStyle: "medium",
});

export function SavedList({ articles }: { articles: SavedListItem[] }) {
  if (articles.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookmarkIcon />
          </EmptyMedia>
          <EmptyTitle>저장한 글이 없습니다</EmptyTitle>
          <EmptyDescription>
            URL을 변환한 뒤 &quot;저장&quot;을 누르면 여기에서 다시 볼 수 있습니다.
          </EmptyDescription>
        </EmptyHeader>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          변환하러 가기
        </Link>
      </Empty>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {articles.map((a) => (
        <li key={a.id}>
          <Link href={`/saved/${a.id}`} className="block rounded-xl focus-visible:outline-2">
            <Card className="gap-2 py-4 transition-colors hover:bg-muted/50">
              <div className="flex flex-col gap-2 px-6">
                <span className="font-medium leading-snug break-keep [overflow-wrap:anywhere]">
                  {a.title}
                </span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <Badge variant="secondary">{a.site}</Badge>
                  <time dateTime={a.saved_at}>{dateFormat.format(new Date(a.saved_at))}</time>
                </div>
              </div>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
