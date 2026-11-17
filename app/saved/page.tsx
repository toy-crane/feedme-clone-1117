import { AlertCircleIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { listSavedArticles } from "@/features/saved-articles/queries";
import { SavedList } from "@/features/saved-articles/saved-list";
import { createClient } from "@/lib/supabase/server";

export default async function SavedPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/auth/login?next=/saved");

  const articles = await listSavedArticles();

  return (
    <>
      <h1 className="text-lg font-semibold tracking-tight">저장 목록</h1>
      {articles ? (
        <SavedList articles={articles} />
      ) : (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>저장 목록을 불러오지 못했습니다</AlertTitle>
          <AlertDescription>잠시 후 새로고침해 주세요.</AlertDescription>
        </Alert>
      )}
    </>
  );
}
