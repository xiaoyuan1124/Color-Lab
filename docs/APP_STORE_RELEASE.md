# Color Lab — App Store Release Baseline

## Release identity

- Product: Color Lab
- App Store marketing version: 1.0.0
- Initial build: 1
- Bundle ID: `com.sy1124.colorlab`
- Web product baseline: Color Lab V2.53.0+
- Primary language: Traditional Chinese (`zh-Hant`)
- Primary category: Graphics & Design
- Secondary category: Utilities

## Packaging architecture

Color Lab is packaged with Capacitor 8.5.2 using local bundled assets.

**Do not add `server.url` pointing to GitHub Pages.** The App Store build must remain useful when the network is unavailable. GitHub Pages remains the web/PWA distribution surface, not the iOS runtime backend.

The iOS wrapper must preserve the exact source palette contract:

1. Base = Color 1 = 75%
2. Structure = Color 2 = 18%
3. Accent = Color 3 = 7%
4. User-entered source colors are never silently reordered or replaced.
5. P3, LAB, CMYK, Tone, Vision, Dark Preview, Role Scale and Gradient remain derived unless the user explicitly applies a source change.

## App Store 4.2 minimum-functionality posture

The review build should be presented as a local design utility, not as a website shortcut. Review notes should call out these app-level utilities:

- on-device camera/photo color extraction;
- offline/local palette library and projects;
- WCAG and color-vision validation;
- context previews and SVG snapshot export;
- Display-P3, LAB D50 and CMYK reference handoff;
- design/development exports (CSS, JSON, Design Tokens, SwiftUI, Flutter, SVG);
- no login requirement and no remote service dependency for core use.

## Privacy baseline

Current product behavior:

- no account;
- no advertising SDK;
- no analytics SDK;
- no tracking;
- no cloud sync;
- no Color Lab backend;
- palette/project data stored locally;
- photo processing initiated by the user and performed locally.

App Store Connect privacy answer can remain **“No, we do not collect data from this app”** only while the above remains true.

Public URLs:

- Privacy Policy: https://xiaoyuan1124.github.io/Color-Lab/privacy.html
- Support: https://xiaoyuan1124.github.io/Color-Lab/support.html

## iOS permissions

Required because Photo supports user-initiated camera/gallery input:

- `NSCameraUsageDescription`
- `NSPhotoLibraryUsageDescription`

Do not request permissions at launch. Ask only after the corresponding user action.

## Apple tooling

Current submission baseline (October 2026):

- App Store Connect accepts iOS apps built with Xcode 26 or later and the iOS 26 SDK or later.
- Color Lab uses Capacitor 8, whose iOS baseline is Xcode 26+ / iOS 15+.
- CI uses the GitHub `macos-26` standard runner for unsigned build validation.
- Do not adopt Capacitor 9 prerelease for the 1.0 submission.

## Cost boundary

Engineering preparation and GitHub CI stay at NT$0 for this public repository using standard GitHub-hosted runners.

Actual App Store distribution requires Apple Developer Program membership (US$99/year, local price may vary). Do not trigger enrollment/purchase without explicit user approval.

## Release gates before TestFlight

- web Quality / CodeQL / Pages remain green;
- App Store preflight passes;
- bundled mobile build contains no remote runtime URL;
- generated iOS project uses Swift Package Manager;
- unsigned Xcode simulator/device-generic build passes;
- privacy manifest is valid;
- camera/photo usage strings exist;
- App Icon 1024×1024 is ready;
- screenshots and App Store metadata are complete;
- native iPhone smoke test is complete;
- only then proceed to signing, TestFlight, and App Review.
