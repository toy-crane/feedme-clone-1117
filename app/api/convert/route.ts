import { ConvertError, convertUrl } from "@/features/url-to-markdown/convert-url";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url : "";
  try {
    return Response.json(await convertUrl(url));
  } catch (e) {
    const code = e instanceof ConvertError ? e.code : "fetch";
    return Response.json({ error: code }, { status: 422 });
  }
}
