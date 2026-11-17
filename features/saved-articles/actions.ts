"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { normalizeUrl } from "./normalize-url";

export type ArticleInput = {
  title: string;
  author: string;
  site: string;
  url: string;
  markdown: string;
};

export type SaveResult = { status: "saved" | "unauthenticated" | "error" };

async function currentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return { supabase, userId: data?.claims?.sub };
}

export async function saveArticle(article: ArticleInput): Promise<SaveResult> {
  const { supabase, userId } = await currentUser();
  if (!userId) return { status: "unauthenticated" };

  let url: string;
  try {
    url = normalizeUrl(article.url);
  } catch {
    return { status: "error" };
  }

  const { error } = await supabase.from("saved_articles").upsert(
    {
      user_id: userId,
      title: article.title,
      author: article.author,
      site: article.site,
      url,
      markdown: article.markdown,
      saved_at: new Date().toISOString(),
    },
    { onConflict: "user_id,url" },
  );
  if (error) return { status: "error" };

  revalidatePath("/saved");
  return { status: "saved" };
}

export async function getSavedStatus(url: string): Promise<boolean> {
  const { supabase, userId } = await currentUser();
  if (!userId) return false;

  let normalized: string;
  try {
    normalized = normalizeUrl(url);
  } catch {
    return false;
  }

  const { data } = await supabase
    .from("saved_articles")
    .select("id")
    .eq("user_id", userId)
    .eq("url", normalized)
    .maybeSingle();
  return Boolean(data);
}
