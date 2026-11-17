"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type UpdateProfileState = { ok: boolean; message: string } | null;

export async function updateDisplayName(
  _prev: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (displayName.length > 50) {
    return { ok: false, message: "이름은 50자 이하여야 합니다." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return { ok: false, message: "로그인이 필요합니다." };

  const { data: rows, error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select("id");

  if (error || !rows?.length) {
    return { ok: false, message: "저장하지 못했습니다." };
  }

  revalidatePath("/settings");
  return { ok: true, message: "저장했습니다." };
}
