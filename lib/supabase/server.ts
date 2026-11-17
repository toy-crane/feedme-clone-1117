import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 요청마다 새로 만든다. 전역 변수에 담지 않는다.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component에서 호출되면 쿠키를 쓸 수 없다.
            // proxy.ts가 세션을 갱신하므로 무시해도 된다.
          }
        },
      },
    },
  );
}
