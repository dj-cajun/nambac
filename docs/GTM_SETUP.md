# GTM — Custom Events (Phase 1)

Configure in [Google Tag Manager](https://tagmanager.google.com) → Container `GTM-P56XG75Q`

## 1. Create Data Layer Variables

| Variable Name | Type | Data Layer Variable Name |
|---------------|------|--------------------------|
| DLV - quiz_id | Data Layer Variable | `quiz_id` |
| DLV - result_score | Data Layer Variable | `result_score` |
| DLV - share_platform | Data Layer Variable | `share_platform` |

## 2. Create Triggers (Custom Event)

| Trigger Name | Event name |
|--------------|------------|
| CE - quiz_start | `quiz_start` |
| CE - quiz_complete | `quiz_complete` |
| CE - share_zalo | `share_zalo` |
| CE - compat_start | `compat_start` |

## 3. Create GA4 Event Tags

For each trigger, add **Google Analytics: GA4 Event** tag:

| Tag | Event Name | Parameters |
|-----|------------|------------|
| GA4 - quiz_start | `quiz_start` | `quiz_id` |
| GA4 - quiz_complete | `quiz_complete` | `quiz_id`, `result_score` |
| GA4 - share_zalo | `share` | `method` = share_platform, `quiz_id` |
| GA4 - compat_start | `compat_start` | `quiz_id` |

Use your GA4 Configuration tag as the config tag.

## 4. Publish

Preview mode → test on https://nambac.vercel.app → Submit → Publish

## App events (reference)

Events are pushed from `src/lib/analytics.js` via `window.dataLayer.push`.
