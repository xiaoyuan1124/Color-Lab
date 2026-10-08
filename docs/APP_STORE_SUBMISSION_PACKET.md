# Color Lab — App Store v1.0 Submission Packet

Date: 2026-10-02  
Source main at branch start: `899ec2e4d4d49e46c3ae1f185fd43cc02c75f10e`

This file is the human checklist for `app-store/submission.v1.0.json`. The JSON file is the canonical machine-readable draft and `npm run test:app-store-metadata` validates the fields that can be verified in source control.

## Current no-cost readiness

- Web engine: Color Lab V2.53.0.
- Native version: 1.0.0.
- Provisional Bundle ID: `com.sy1124.colorlab`.
- Local Capacitor shell; no remote `server.url`.
- iPhone-only target.
- Xcode 26 / iOS 26 SDK-compatible CI.
- Built-app privacy-manifest check.
- Camera / Photo Library usage descriptions.
- `ITSAppUsesNonExemptEncryption=false`.
- No account, analytics, tracking, ads, paid API, backend or cloud AI.
- Six 1320×2868 App Store screenshot artifacts.
- Fresh iOS Simulator install/launch/screenshot gate.
- GitHub Pages deployment proof: the deployed artifact must contain `deploy-info.json` whose `sha` matches the current main commit.

## Apple metadata limits enforced in CI

- App Name: 2–30 characters.
- Subtitle: at most 30 characters.
- Promotional Text: at most 170 characters.
- Description: at most 4,000 characters.
- Keywords: at most 100 characters.
- Privacy Policy URL: HTTPS and present.
- Sign-in requirement: NONE for v1.0.
- App Privacy draft: no developer data collection.
- Non-exempt encryption: false.
- Age-rating behavior answers must match current v1.0 behavior.

Current zh-Hant keywords intentionally use 3+ character phrases and currently use 38 of Apple's 100-character limit:

`配色工具,色彩設計,調色盤,取色工具,對比檢查,品牌配色,簡報配色,室內配色`

## App Store Connect values prepared

- Name: `Color Lab`
- Subtitle: `理解、驗證並交付你的配色`
- Primary category: Graphics & Design
- Secondary category: Utilities
- Primary language: Traditional Chinese (zh-Hant)
- Privacy Policy URL: `https://xiaoyuan1124.github.io/Color-Lab/privacy.html`
- Marketing URL: `https://xiaoyuan1124.github.io/Color-Lab/`
- Planned price: Free
- Sign-in required: No
- App Privacy: No, we do not collect data from this app
- Tracking: No
- Ads: No
- Analytics SDK: No
- Account data: None
- Photos/files: processed locally after explicit user action
- Review Notes: stored in the canonical JSON packet and metadata draft
- Screenshot set: six 6.9-inch portrait images

## External blockers intentionally not fabricated

These are required account/legal/contact facts and must remain blank until supplied or confirmed by the account holder:

1. **Support URL / support contact** — Apple's Support URL must lead to actual contact information.
2. **App Review contact** — name, email and phone number.
3. **Copyright owner string**.
4. **Content Rights answer** — confirm against the final bundled assets/datasets.
5. **Digital Services Act status** — trader/non-trader account/legal status where applicable.
6. **Final App Store Connect record / Bundle ID registration**.
7. **Signing team and certificates**.
8. **Real-device iPhone validation**.
9. **Archive / TestFlight upload and TestFlight acceptance**.

The source-control gate must report these as external blockers rather than inventing values.

## Apple 2026 references

- App information limits:
  https://developer.apple.com/help/app-store-connect/reference/app-information/app-information
- Platform version information / metadata limits / Support URL:
  https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information
- Required properties:
  https://developer.apple.com/help/app-store-connect/reference/app-information/required-localizable-and-editable-properties
- App privacy:
  https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/
- Age rating:
  https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating
- Current SDK requirements:
  https://developer.apple.com/news/upcoming-requirements/

## Release rule

Do not call v1.0 App Store-ready until the real-device matrix passes and the external blockers above are filled in App Store Connect. Do not create the production App ID, sign/archive, upload TestFlight, publish privacy responses, or submit for review without the user's production authorization when that action is irreversible or account-facing.
