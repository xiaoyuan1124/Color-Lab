# Color Lab — App Store v1.0 Readiness

## Release identity

- Product: Color Lab
- Native shell version: 1.0.0
- Web engine: Color Lab V2.53.0
- Bundle ID (provisional until App Store Connect registration): `com.sy1124.colorlab`
- Platform: iPhone
- Minimum deployment target: Capacitor 8 default, iOS 15+
- Native runtime: Capacitor 8.5.2 / WKWebView / Swift Package Manager
- Web assets: bundled locally inside the app
- Remote `server.url`: forbidden
- Login/account: none
- Backend: none
- Analytics/tracking/ads: none
- Initial monetization: none; v1.0 ships without IAP

## Why this is not a website wrapper

The App Store build does not load the GitHub Pages site as its application shell. It bundles the Color Lab application locally and exposes an app-like, offline-first design workflow:

- three-role 75 / 18 / 7 palette composition
- on-device camera/photo color extraction
- local Library, projects, tags, backup and recovery
- accessibility / vision validation
- Context Preview and SVG snapshot export
- local SVG import and role mapping
- LAB D50 / CMYK reference / Display-P3 handoff
- design-token and platform export formats
- native iOS share/download paths where available

This is the core defense against App Review Guideline 4.2 Minimum Functionality.

## Apple 2026 submission baseline

- Build with Xcode 26 or newer and iOS 26 SDK or newer.
- Capacitor is on Apple's listed SDKs that require a privacy manifest; CI must verify the pinned SDK ships one and the built app contains at least one aggregated/bundled `PrivacyInfo.xcprivacy`.
- App Store upload must target at least iOS 13; this project intentionally uses Capacitor 8's iOS 15+ baseline.
- A Privacy Policy URL is required for iOS apps.
- App Privacy answers must match actual app and third-party SDK behavior.
- App Store screenshots: prepare at least one accepted 6.9-inch iPhone set; up to 10 screenshots can be uploaded.
- Updated age-rating questions must be completed in App Store Connect.

## Privacy declaration draft

Current expected App Privacy answer:

**No, we do not collect data from this app.**

Reason:
- no Color Lab server
- no account
- no ads
- no analytics SDK
- no tracking SDK
- photos and files are processed locally
- localStorage / IndexedDB data remains on-device
- user-initiated system sharing is not developer collection

Privacy Policy URL after this branch is merged and Pages deploys:

`https://xiaoyuan1124.github.io/Color-Lab/privacy.html`

Re-check this declaration before every submission if any third-party SDK or network service is added.

## Permission strings

- Camera: 拍攝照片以在此裝置上取色與分析配色。
- Photo Library: 選擇照片以在此裝置上取色與分析配色。

Both permissions are only requested after explicit user action.

## App Store metadata draft

- Name: Color Lab
- Subtitle: 理解、驗證並交付你的配色
- Primary category candidate: Graphics & Design
- Secondary category candidate: Utilities
- Primary language: Traditional Chinese (zh-Hant)

### Short positioning

Color Lab 不只是找顏色，而是理解顏色為什麼成立。

從三色 75 / 18 / 7 角色系統開始，完成取色、分析、可讀性驗證、情境預覽與專業色彩交付。資料預設只保存在你的裝置上，不需要帳號。

### App Review notes draft

Color Lab is a local-first color design utility. The app does not require an account or network connection for its core workflow. Camera and photo-library access are only requested when the reviewer explicitly chooses Photo > 拍照取色 or 從相簿選擇. Photos are processed on device.

Recommended review path:
1. Compose: choose three colors and inspect 75 / 18 / 7 roles.
2. Open advanced analysis for accessibility and context preview.
3. Photo: choose a photo and generate local palette suggestions.
4. Library: save a palette, search locally, export a backup.
5. Export: view LAB D50 / CMYK reference / Display-P3 handoff and export Context Preview SVG.

There is no login, subscription, ad SDK, analytics SDK, or hidden paid content in v1.0.

## Completed no-cost readiness

- Capacitor 8.5.2 local native shell foundation.
- Provisional Bundle ID: `com.sy1124.colorlab`.
- Xcode 26 / iOS Simulator unsigned build CI.
- Camera / Photo Library permission strings and non-exempt-encryption declaration.
- Capacitor privacy-manifest verification in the built app.
- Deterministic 1024×1024 no-alpha AppIcon generation.
- Traditional Chinese App Store metadata draft and public privacy policy.
- Deterministic 6.9-inch screenshot pack: six 1320×2868 no-alpha images.
- Official `@capacitor/app` lifecycle bridge so backgrounding persists draft and resilience state.
- Fresh iOS Simulator install → UIKit process → screenshot smoke gate passed before merge.
- Pages deployment identity proof: main `899ec2e4d4d49e46c3ae1f185fd43cc02c75f10e` deployed with matching `pages_build_version`.
- Canonical App Store submission packet + metadata validator with external blockers kept explicit.
- PWA service worker remains disabled inside the native shell; GitHub Pages remains independent.

## Remaining release blockers

These require real device/account/release operations and are intentionally not faked in source control:

1. Native iPhone smoke test: safe area, keyboard, camera, photo picker, local persistence, Web Share / file export, SVG/JSON import/export.
2. Confirm final support contact/Support URL.
3. Supply App Review contact (name / email / phone) and copyright owner string.
4. Confirm Content Rights and DSA trader/non-trader account status where applicable.
5. Create the App Store Connect app record with the final Bundle ID.
6. Confirm Apple Developer signing/team configuration.
7. Enter and publish current App Privacy / age-rating answers and configure pricing/availability/review notes in App Store Connect.
8. Archive/sign/upload a TestFlight build.
9. Native TestFlight acceptance gate before App Review submission.

See `docs/APP_STORE_READINESS_AUDIT.md` for the Web API → WKWebView audit and native validation matrix.

## Paid feature policy for v1.0

Do not add paywalls during the first native packaging pass. A digital Pro unlock would require a separate monetization decision and App Store-compliant in-app purchase implementation. Keep packaging/review risk separate from monetization risk.

The paid-feature study should decide which advanced workflows are worth gating only after the native app is stable.
