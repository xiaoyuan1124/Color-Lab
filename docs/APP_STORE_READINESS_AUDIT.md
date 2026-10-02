# Color Lab — App Store Readiness Audit

Date: 2026-10-02  
Scope: Color Lab V2.53 web engine packaged as an iPhone app without changing source-palette semantics.

## Invariants

- Color 1 = Base = 75%; Color 2 = Structure = 18%; Color 3 = Accent = 7%.
- User-entered source colors keep their order and values.
- P3 / LAB / CMYK / Preview / Dark / Vision / Tone / Gradient are derived layers.
- Only an explicit Apply action may change source colors.
- Corner Fan navigation remains available.
- Web/PWA and GitHub Pages remain supported independently of the native shell.

## Runtime audit

| Area | Existing implementation | iOS / WKWebView decision | Status |
| --- | --- | --- | --- |
| App shell | Local HTML/CSS/JS copied to `dist`; no `server.url` | Bundle locally with Capacitor 8 | PASS |
| Service Worker | PWA update/offline controller | Native shell bypasses Service Worker; `dist/sw.js` is forbidden | PASS |
| Camera | `<input type="file" accept="image/*" capture="environment">` | Keep WebKit file-input capture; permission string already patched | CI-ready; device smoke pending |
| Photo Library | Local file input | Keep WebKit picker; no Camera plugin required for current workflow | CI-ready; device smoke pending |
| Local storage | localStorage + rollback helpers | Keep local-first; persist again when Capacitor App becomes inactive | PASS after native lifecycle Gate |
| IndexedDB | `color-lab-resilience` snapshot store | Keep as local resilience layer | WebKit Gate PASS; device persistence pending |
| Share | Web Share API / `navigator.canShare` | Keep standards-first path initially; validate file sharing on device before adding plugin | Device smoke pending |
| File export | Blob + object URL + download / share fallback | Validate PNG/SVG/JSON export on WKWebView; add native Filesystem/Share only if real-device evidence requires it | Device smoke pending |
| Clipboard | `navigator.clipboard.writeText` | Keep Web API; validate copy on device | Device smoke pending |
| SVG import/export | local FileReader / Blob | No server dependency | WebKit Gate PASS; device smoke pending |
| Display-P3 | CSS `color(display-p3 ...)` + `(color-gamut: p3)` detection | WebKit supports Display-P3; retain feature detection and sRGB source truth | PASS |
| Safe area | existing iPhone/PWA CSS + `viewport-fit=cover` | Native simulator/device visual smoke required | Pending device |
| Keyboard | Web form controls | Avoid Keyboard plugin until an actual WKWebView layout defect is observed | Pending device |
| Back navigation | Corner Fan + app-internal state | iPhone has no Android hardware-back requirement; preserve existing navigation | PASS |
| Offline | bundled local assets in native; PWA cache on web | Native core workflow must not depend on network | PASS by native bundle preflight |

## Official native dependencies

- `@capacitor/core` 8.5.2
- `@capacitor/cli` 8.5.2
- `@capacitor/ios` 8.5.2
- `@capacitor/app` 8.1.1

No third-party native plugin is required in this pass.

## Privacy / compliance audit

- Account/sign-in: none.
- Color Lab backend: none.
- Analytics/tracking/advertising SDKs: none.
- Cloud AI / paid API: none.
- Photos and imported files: processed locally.
- App Privacy draft: no developer data collection.
- Camera/Photo usage copy: present in generated Info.plist.
- Export compliance flag: `ITSAppUsesNonExemptEncryption=false`.
- Privacy policy: `/privacy.html` on GitHub Pages.
- Privacy manifest: Capacitor manifest presence checked in unsigned native CI.
- v1.0 monetization: no IAP/paywall.

## Native validation matrix before TestFlight

1. Launch offline; Compose renders and 75/18/7 roles are visible.
2. Enter three exact source colors; background/foreground app; verify exact colors restore.
3. Save Library palette/project; relaunch; verify local persistence.
4. Camera capture and photo-library pick both complete local analysis.
5. Keyboard does not cover essential controls.
6. Top/bottom safe areas do not overlap controls on a notched/Dynamic Island iPhone.
7. Copy palette/P3 CSS succeeds.
8. Share/export PNG, SVG and JSON through iOS share sheet or supported download path.
9. Import SVG/JSON and verify source order is unchanged until explicit Apply.
10. P3 capability/fallback messaging remains truthful.
11. Corner Fan opens, dismisses and navigates all four views.
12. Airplane-mode relaunch keeps the core workflow usable.

Failure policy: classify root cause first; add another official Capacitor plugin only when a real native failure demonstrates that the Web API path is insufficient.
