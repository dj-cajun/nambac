# AdSense — 나중에 켜기

현재 **광고는 전부 숨김** 상태입니다. placeholder 박스도 표시되지 않습니다.

## 켜는 방법 (승인 + 슬롯 준비 후)

Vercel / `.env.local`에 아래를 설정하고 **Redeploy**:

```env
VITE_ADSENSE_ENABLED=true
VITE_ADSENSE_PUB_ID=ca-pub-7386903584540643
VITE_ADSENSE_SLOT_HOME=1234567890
VITE_ADSENSE_SLOT_QUIZ=1234567890
VITE_ADSENSE_SLOT_RESULT_1=1234567890
VITE_ADSENSE_SLOT_RESULT_2=1234567890
```

| 슬롯 env | 페이지 |
|----------|--------|
| `VITE_ADSENSE_SLOT_HOME` | 홈 중간 |
| `VITE_ADSENSE_SLOT_QUIZ` | 퀴즈 하단 |
| `VITE_ADSENSE_SLOT_RESULT_1` | 결과 1 |
| `VITE_ADSENSE_SLOT_RESULT_2` | 결과 2 |

슬롯 ID는 [AdSense](https://adsense.google.com) → 광고 단위에서 복사.

## 동작

- `VITE_ADSENSE_ENABLED`가 `true`가 **아니면** → 광고·placeholder 모두 미표시
- `true` + pub ID + 슬롯 ID → `adsbygoogle.js` 동적 로드 후 표시
- `?premium=nambac-vip` → 광고 제거 (프리미엄)

## 검증

`index.html`의 `google-adsense-account` 메타는 계정 연결용으로 유지됩니다.
