import Link from "next/link";
import { FileQuestionIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function SavedArticleNotFound() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileQuestionIcon />
        </EmptyMedia>
        <EmptyTitle>찾을 수 없음</EmptyTitle>
        <EmptyDescription>없거나 볼 수 없는 저장한 글입니다.</EmptyDescription>
      </EmptyHeader>
      <Link href="/saved" className={buttonVariants({ variant: "outline" })}>
        저장 목록으로
      </Link>
    </Empty>
  );
}
