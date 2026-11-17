"use client";

import { SaveButton } from "@/features/saved-articles/save-button";
import { UrlToMarkdown } from "@/features/url-to-markdown/url-to-markdown";

// 같은 급의 두 기능(변환, 저장)을 여기서 조합한다.
export function HomeConverter() {
  return (
    <UrlToMarkdown renderActions={(page) => <SaveButton article={page} />} />
  );
}
