// 같은 글인지는 정규화한 URL 문자열로만 비교한다(추적 파라미터 제거 등은 하지 않는다).
export function normalizeUrl(url: string): string {
  return new URL(url).href;
}
