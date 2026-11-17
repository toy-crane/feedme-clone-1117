import { notFound, redirect } from "next/navigation";

import { getSavedArticle } from "@/features/saved-articles/queries";
import { SavedArticleView } from "@/features/saved-articles/saved-article-view";
import { createClient } from "@/lib/supabase/server";

export default async function SavedArticlePage({
  params,
}: PageProps<"/saved/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect(`/auth/login?next=/saved/${encodeURIComponent(id)}`);

  const article = await getSavedArticle(id);
  if (!article) notFound();

  return <SavedArticleView article={article} />;
}
