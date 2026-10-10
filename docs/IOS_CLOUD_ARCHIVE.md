# Color Lab iOS — GitHub Cloud Archive Gate (zero Apple account operations)

## Goal

The user already has an Apple Developer membership used by a different app. **A personal Mac is not required for an unsigned iPhoneOS Release archive, nor necessarily for later signed cloud CI.** This gate proves that the same Color Lab 2.53 web engine can be archived for real iPhoneOS on GitHub's standard public-repository macOS runner, using Xcode 26.3. It does **not** mean a signed IPA or a TestFlight build exists.

- Workflow: `.github/workflows/ios-cloud-archive.yml` — **Color Lab iOS Cloud Archive Preflight**.
- Trigger: safe PR/main path changes above, or GitHub Actions → workflow → Run workflow.
- No Apple ID login, API key, signing certificate, private key, provisioning profile or GitHub secret is used.
- Output: one JSON proof artifact `color-lab-unsigned-device-archive-proof`, with checkout SHA, Xcode, Info.plist identity, privacy/asset gate and honest unsigned statuses.
- Not output: IPA, signed build, App Store Connect record, TestFlight invitation, release, personal iPhone PASS.
- User-facing local-first/75-18-7/source-order/PWA semantics unchanged; no paid provider or runtime plugin.

## Why this exists

The existing `Color Lab iOS Native` job compiles a *Debug iOS Simulator* binary and confirms install → PID launch → screenshot. It is not evidence that `iphoneos Release archive` succeeds, and it is not a substitute for a signed physical-device test. This separate unsigned Release gate closes only the archive/compiler/packaging gap.

## Required before signed IPA or TestFlight (NOT automated by this gate)

1. Owner confirms currently active Apple Developer membership and the **correct existing Team ID**. Do not buy another membership; do not reuse the Mahjong Tracker bundle identifier or app record.
2. Owner checks whether `com.sy1124.colorlab` has a compatible App ID and App Store Connect app record. Any **creation or modification of Apple production records requires explicit account-holder permission**; don't guess this.
3. Confirm an Apple Distribution signing certificate/private key and a matching App Store provisioning profile are legitimately available for the approved Team and Bundle ID. Use **GitHub Environments with restricted deployment branches and required reviewers (if available)** and minimum-privilege secrets. Never commit certificates/profiles/private keys or emit them in logs/artifacts, and never expose them to untrusted PRs.
4. Verify the exact current main SHA. Generate the signed Archive/IPA with Xcode 26+ and the required iOS 26 SDK; verify provisioning Team, bundle ID, version and unique build number. Keep signing/archive separate from a future **owner-authorized manual TestFlight upload**. Do not set any upload to trigger automatically on push/PR.
5. Do signed-iPhone/TestFlight acceptance from `docs/APP_STORE_FINAL_HANDOFF.md` (camera/photo allow/deny/cancel, foreground/background, offline, source ordering, persistence, safe area/keyboard, imports/exports/share, VoiceOver).
6. Compare the six existing Chromium screenshot drafts to *real native* views. Replace inappropriate screenshots before Connect upload. Complete the five external blockers `support-contact`, `app-review-contact`, `copyright`, `content-rights`, `dsa-status` with owner-supplied, accurately verified values.
7. Only with explicit permission for each account-facing stage may the team upload to TestFlight and later submit to App Review. Never mark a Simulator or unsigned archive PASS as real iPhone PASS.

## Potential future Apple/GitHub actions (NOT active here)

Apple maintains `apple-actions/import-codesign-certs@v7`, `apple-actions/download-provisioning-profiles@v4` and `apple-actions/upload-testflight-build@v5`. These require user-owned Apple credentials, correct Team/App identities and authorization. Assess against the pinned action contracts and protect them behind a manually invoked, protected environment **only after** the owner approves production operations. Do not reuse certificate secrets or Connect credentials from another project through shared repository secrets.

## Pricing

GitHub's **standard** GitHub-hosted runners are free on **public repositories** under current GitHub Actions policy. Paid larger runners or private-repo macOS minutes have different billing rules; do not switch to them without cost review.

## Sources

- https://docs.github.com/en/actions/reference/runners/github-hosted-runners
- https://developer.apple.com/news/upcoming-requirements/
- https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/
- https://github.com/Apple-Actions/import-codesign-certs
- https://github.com/Apple-Actions/download-provisioning-profiles
- https://github.com/Apple-Actions/upload-testflight-build
