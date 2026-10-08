# Color Lab — App Store Metadata（zh-Hant）

## App Information

- Name: `Color Lab`
- Subtitle: `理解、驗證並交付你的配色`
- Bundle ID: `com.sy1124.colorlab`
- SKU suggestion: `COLORLAB-IOS-001`
- Primary language: Traditional Chinese (zh-Hant)
- Primary category: Graphics & Design
- Secondary category: Utilities
- Privacy Policy URL: `https://xiaoyuan1124.github.io/Color-Lab/privacy.html`
- Support URL: **BLOCKED — 需要可公開的真實支援聯絡資訊（Email / 地址 / 電話）後再建立。**

## Promotional Text

Color Lab 用三色 75 / 18 / 7 角色系統，幫你從取色、理解、比較、無障礙驗證一路做到情境預覽與專業色彩交付。

## Description

Color Lab 不只是找顏色，而是理解顏色為什麼成立。

從三色 75 / 18 / 7 角色系統開始：
Base 75% 負責主要視覺基底，Structure 18% 建立層級與秩序，Accent 7% 負責焦點與辨識。

你可以：

• 建立自己的三色配色，保留你輸入的原始順序
• 用相機或相簿在裝置上取色
• 查看色彩關係、明暗層級、調性與候選色
• 驗證 WCAG 對比與視覺辨識
• 比較 Light / Dark 與不同使用情境
• 將配色套入 App、品牌、簡報、室內、穿搭等預覽
• 收藏、搜尋、分類並建立本機專案
• 匯出 CSS、Design Tokens、SVG 與平台格式
• 查看 LAB D50、CMYK 參考值與 Display-P3 handoff
• 匯出 Context Preview SVG，交付實際設計工作

Color Lab 採 Local-first 設計。
不需要登入帳號，核心配色、收藏、專案與照片分析都在你的裝置上處理與保存。

沒有廣告追蹤。
沒有行為分析 SDK。
沒有雲端 AI API。
沒有 Color Lab 後端帳號系統。

你的三個 source colors 只有在你明確套用修改時才會改變；Dark Mode、Accessibility、Vision、Tone、Role Scale、Gradient 等衍生結果不會偷偷覆寫原始配色。

Color Lab 的目的不是產生更多顏色，而是讓你更快知道：
這組顏色為什麼成立、是否真的能用、應該放在哪裡，以及如何交付。

## Keywords

`配色工具,色彩設計,調色盤,取色工具,對比檢查,品牌配色,簡報配色,室內配色`

Length: 38 characters（Apple limit: 100 UTF-8 bytes）

Canonical machine-readable source: `app-store/submission.v1.0.json`; CI validation: `npm run test:app-store-metadata`.

## Review Notes

Color Lab is a local-first color design utility. No account or network connection is required for the core workflow.

Recommended review path:

1. Compose: choose three colors and inspect the 75 / 18 / 7 roles.
2. Open Advanced Analysis to inspect accessibility and Context Preview.
3. Photo: choose “拍照取色” or “從相簿選擇”. Camera/photo access is requested only after this explicit action; image analysis is performed on device.
4. Library: save a palette and search locally.
5. Export: inspect LAB D50 / CMYK reference / Display-P3 handoff and export CSS / tokens / SVG.
6. Context Preview: export an SVG snapshot.

The App Store build bundles its web assets locally inside the native application. It does not use the GitHub Pages website as the app shell.

There is no login, subscription, ad SDK, analytics SDK, tracking SDK, or hidden paid content in v1.0.

## App Privacy Draft

Expected App Store Connect response:

- **Data Collection:** No, we do not collect data from this app.
- Tracking: No
- Advertising: No
- Analytics SDK: No
- Account data: None
- Photos: processed locally after explicit user action
- Local palette/project data: remains in local app storage
- User-initiated system sharing: not developer collection

This declaration must be re-checked before every release if any network service, analytics, account system, advertising SDK, or cloud AI is added.

## Age Rating Draft

Current product behavior:

- Violence: None
- Sexual content / nudity: None
- Profanity / crude humor: None
- Alcohol / tobacco / drugs: None
- Gambling / contests: None
- Horror / fear themes: None
- Medical / wellness advice: None
- Unrestricted web access: No
- User-generated public content: No
- Messaging / chat: No
- Location sharing: No
- Purchases / loot boxes: None in v1.0

Final rating is determined by the current App Store Connect questionnaire and must be completed there.

## Screenshot Plan — iPhone 6.9"

Prepare 6 portrait screenshots from the native app:

1. **理解三色角色** — Compose + 75 / 18 / 7
2. **先看結論，再深入分析** — Result-first summary
3. **照片取色，在裝置上完成** — Photo workflow
4. **驗證可讀性與視覺辨識** — Accessibility / Vision
5. **放進真實情境看效果** — Context Preview
6. **交付給設計與開發** — LAB / CMYK reference / Display-P3 / Export

Accepted 6.9-inch portrait sizes include 1260×2736, 1290×2796, and 1320×2868 depending on device.

Do not include alpha/transparency in uploaded screenshot files.

## v1.0 Monetization

v1.0 ships without IAP or paywall.

Reason:
- isolate App Review / native packaging risk from monetization risk
- validate native retention and workflow first
- avoid shipping a paywall before deciding which professional workflows are worth paying for

Paid-feature research remains a separate post-native-stability workstream.
