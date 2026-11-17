# 클립보드 쓰기 실패 시 ChatGPT/Claude 탭이 열리지 않음

- 증상: `navigator.clipboard.writeText`가 reject되면 `openIn`이 중단되어 `window.open`과 안내가 모두 없다.
- 근거: 코드 리뷰(low) 지적, 재현하지 않음. localhost와 HTTPS에서는 정상 동작을 확인했다.
- 추정 원인: `features/url-to-markdown/url-to-markdown.tsx`의 `copy`, `openIn`이 클립보드 오류를 처리하지 않는다.
- 시도한 것: 없음(스펙 범위 밖 엣지케이스).
- 다음 단계: 실패해도 서비스는 열고 "복사하지 못했습니다" 안내를 보여 준다.
