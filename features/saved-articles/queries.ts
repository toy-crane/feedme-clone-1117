import { createClient } from "@/lib/supabase/server";

import type { ArticleInput } from "./actions";

export type SavedListItem = {
  id: string;
  title: string;
  site: string;
  saved_at: string;
};

// 목록은 본문(markdown)을 읽지 않는다. 소유자 제한은 RLS가 건다.
export async function listSavedArticles(): Promise<SavedListItem[] | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_articles")
    .select("id, title, site, saved_at")
    .order("saved_at", { ascending: false });
  return error ? null : data;
}

// 남의 글이나 없는 id, uuid가 아닌 id는 모두 null이다.
export async function getSavedArticle(id: string): Promise<ArticleInput | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("saved_articles")
    .select("title, author, site, url, markdown")
    .eq("id", id)
    .maybeSingle();
  return data ?? null;
}
