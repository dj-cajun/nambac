# GTM — Custom Events

Configure in [Google Tag Manager](https://tagmanager.google.com) → Container `GTM-P56XG75Q`

App events are pushed from `src/lib/analytics.js` via `window.dataLayer.push`.

## 1. Data Layer Variables

| Variable Name | Type | Data Layer Variable Name |
|---------------|------|--------------------------|
| DLV - quiz_id | Data Layer Variable | `quiz_id` |
| DLV - quiz_category | Data Layer Variable | `quiz_category` |
| DLV - result_score | Data Layer Variable | `result_score` |
| DLV - share_platform | Data Layer Variable | `share_platform` |
| DLV - fortune_kind | Data Layer Variable | `fortune_kind` |
| DLV - feature_kind | Data Layer Variable | `feature_kind` |
| DLV - feature_action | Data Layer Variable | `feature_action` |
| DLV - page_path | Data Layer Variable | `page_path` |
| DLV - utm_source | Data Layer Variable | `utm_source` |
| DLV - utm_medium | Data Layer Variable | `utm_medium` |
| DLV - utm_campaign | Data Layer Variable | `utm_campaign` |

## 2. Triggers (Custom Event)

| Trigger Name | Event name |
|--------------|------------|
| CE - quiz_start | `quiz_start` |
| CE - quiz_complete | `quiz_complete` |
| CE - share_zalo | `share_zalo` |
| CE - compat_start | `compat_start` |
| CE - fortune_view | `fortune_view` |
| CE - fortune_reveal | `fortune_reveal` |
| CE - fortune_share | `fortune_share` |
| CE - fortune_like | `fortune_like` |
| CE - fortune_download | `fortune_download` |
| CE - feature_view | `feature_view` |
| CE - feature_engage | `feature_engage` |
| CE - feature_share | `feature_share` |
| CE - push_prompt | `push_prompt` |
| CE - ad_impression | `ad_impression` |

## 3. GA4 Event Tags

For each trigger, add **Google Analytics: GA4 Event** (use your GA4 Configuration tag):

| Tag | Event Name | Parameters |
|-----|------------|------------|
| GA4 - quiz_start | `quiz_start` | `quiz_id`, `quiz_category` |
| GA4 - quiz_complete | `quiz_complete` | `quiz_id`, `result_score`, `quiz_category` |
| GA4 - share | `share` | `method` ← `share_platform`, `quiz_id` |
| GA4 - compat_start | `compat_start` | `quiz_id` |
| GA4 - fortune_view | `fortune_view` | `fortune_kind` |
| GA4 - fortune_reveal | `fortune_reveal` | `fortune_kind` |
| GA4 - fortune_share | `fortune_share` | `fortune_kind` |
| GA4 - fortune_like | `fortune_like` | `fortune_kind` |
| GA4 - fortune_download | `fortune_download` | `fortune_kind` |
| GA4 - feature_view | `feature_view` | `feature_kind` |
| GA4 - feature_engage | `feature_engage` | `feature_kind`, `feature_action` |
| GA4 - feature_share | `feature_share` | `feature_kind`, `share_platform` |
| GA4 - push_prompt | `push_prompt` | `push_action` |
| GA4 - ad_impression | `ad_impression` | `ad_location`, `ad_slot` |

## 4. Publish

1. GTM **Preview** → open `https://www.nambac.xyz`
2. Confirm `quiz_start` / `feature_view` / `fortune_view` fire
3. **Submit → Publish**

## Quick checklist

- [ ] Variables created
- [ ] Triggers created
- [ ] GA4 tags linked to triggers
- [ ] Preview verified on www
- [ ] Container published
