# AdSense setup

Publisher ID (already in `index.html` + `public/ads.txt`):

```text
ca-pub-7386903584540643
```

Ads stay **hidden** until all of these are true:
1. AdSense account approved for the site
2. Four ad units created
3. Vercel env set + Redeploy

## 1. Create ad units (AdSense)

[AdSense](https://adsense.google.com) → Ads → By ad unit → Display ads

| Env key | Suggested name | Placement |
|---------|----------------|-----------|
| `VITE_ADSENSE_SLOT_HOME` | nambac-home | Home mid-feed |
| `VITE_ADSENSE_SLOT_QUIZ` | nambac-quiz | Quiz bottom |
| `VITE_ADSENSE_SLOT_RESULT_1` | nambac-result-1 | Result #1 |
| `VITE_ADSENSE_SLOT_RESULT_2` | nambac-result-2 | Result #2 |

Copy each **Data ad slot** ID (numbers only).

## 2. Vercel Production env

```env
VITE_ADSENSE_ENABLED=true
VITE_ADSENSE_PUB_ID=ca-pub-7386903584540643
VITE_ADSENSE_SLOT_HOME=##########
VITE_ADSENSE_SLOT_QUIZ=##########
VITE_ADSENSE_SLOT_RESULT_1=##########
VITE_ADSENSE_SLOT_RESULT_2=##########
```

Redeploy after saving (Vite embeds these at build time).

## 3. Local (optional)

Same keys in `.env.local`, then `npm run dev`.

## Behavior

- `VITE_ADSENSE_ENABLED` ≠ `true` → no ads, no placeholders
- `true` + pub + slot → loads `adsbygoogle.js` after cookie consent
- Placeholder slot IDs (`1234567890` …) are ignored
- `?premium=CODE` / `VITE_PREMIUM_CODE` hides ads
- `ad_impression` is pushed to GTM when a unit mounts

## Verify

```bash
npm run verify:ops
```

Then open www → accept cookies → confirm ad units render (or AdSense “Getting started” shows requests).
