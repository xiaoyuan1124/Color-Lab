# Color Lab third-party notices

These notices travel with the web repository and the bundled native app.
No third-party library listed here requires a paid service. License notices
do not assert ownership of Color Lab or decide App Store Content Rights.

| Distributed component | License | Full notice | Upstream |
| --- | --- | --- | --- |
| iro.js 5.5.2 (`vendor/iro.min.js`) | MPL-2.0 | `vendor/iro.LICENSE.txt` | https://github.com/jaames/iro.js |
| Poline 0.13.1 (`vendor/poline.umd.js`) | MIT | `vendor/poline.LICENSE.txt` | https://github.com/meodai/poline |
| Sortable 1.15.7 (`vendor/Sortable.min.js`) | MIT | `vendor/Sortable.LICENSE.txt` | https://github.com/SortableJS/Sortable/tree/1.15.7 |
| qrcodejs (`vendor/qrcode.min.js`) | MIT | `vendor/qrcode.LICENSE.txt` | https://github.com/davidshimjs/qrcodejs |
| Capacitor core / iOS 8.5.2 | MIT | `vendor/capacitor.LICENSE.txt` | https://github.com/ionic-team/capacitor/tree/8.5.2 |
| Capacitor App 8.1.1 | MIT | `vendor/capacitor-app.LICENSE.txt` | https://github.com/ionic-team/capacitor-plugins |
| Preact (embedded in iro.js; exact embedded version not established) | MIT | `vendor/preact.LICENSE.txt` | https://github.com/preactjs/preact |
| iro-core 1.2.1 (embedded color/math implementation) | MPL-2.0 | `vendor/iro-core.LICENSE.txt` | https://github.com/irojs/iro-core |
| TinyColor (regular expressions credited by iro-core) | MIT | `vendor/TinyColor.LICENSE.txt` | https://github.com/bgrins/TinyColor |
| color-temperature (math credited by iro-core) | MIT | `vendor/color-temperature.LICENSE.txt` | https://github.com/neilbartlett/color-temperature |
| Cordova portions / CapacitorCordova native framework | Apache-2.0 | `vendor/cordova.LICENSE.txt`, `vendor/cordova.NOTICE.txt` | https://github.com/apache/cordova-ios |

## iro.js source availability

The vendored iro.js file retains its original MPL-2.0 header and is unmodified
in this readiness change. Its source is published by James Daniel in the
upstream repository. The versioned npm package identifies the distribution
(compiled JavaScript and declarations, not the original TypeScript):
https://www.npmjs.com/package/@jaames/iro/v/5.5.2

The package's published `gitHead` is
`1825363da88e1971befb6c6b827951594f388798`; corresponding source:
https://github.com/jaames/iro.js/tree/1825363da88e1971befb6c6b827951594f388798/src

The embedded MPL-covered iro-core implementation also has corresponding
source. The 1.2.1 package's published `gitHead` is
`bd46ac36225cc4de5ea2a8453cec4f69b8f40ba6`:
https://github.com/irojs/iro-core/tree/bd46ac36225cc4de5ea2a8453cec4f69b8f40ba6/src

These source links apply to the current bundled distribution, as well as
future source-availability obligations. The vendored iro minified file's
SHA-256 matches the upstream 5.5.2 npm distribution exactly. Preact's package
dependency range is `^10.0.0`; that alone does not identify its exact bundled
version. The included Preact MIT notice credits Jason Miller.

Capacitor core/iOS's MIT license does not replace Apache-2.0 for the Cordova
portions. Capacitor iOS 8.5.2 contains ASF-licensed CapacitorCordova source,
and its Swift Package Manager distribution supplies `Cordova.xcframework`:
https://github.com/ionic-team/capacitor-swift-pm/blob/8.5.2/Package.swift
The Apache license and Cordova NOTICE are distributed alongside the MIT
notices. No Cordova plugin is added by this change.

MPL-2.0 applies to the covered iro.js files. Any future modification of those
files must retain the notices and make corresponding source available under
MPL-2.0. Do not imply that this grants ownership of the upstream code.

## Asset and dependency scope

The native build copies local `core`, `data`, `runtime`, and `vendor` assets.
It bundles no downloaded photographs or font files. Font-family names use
device fonts. User-imported photos/files stay on the device. AppIcon artwork
is generated locally by `scripts/prepare-ios-assets.mjs`; the screenshot
workflow renders the application with a fixed sample palette.

This inventory covers runtime components; development-only Playwright,
Lighthouse, axe, fast-check, pixelmatch, and pngjs are not native app assets.
Final ownership of application code, reference datasets, icon and listing
content still requires the account holder's confirmation.

## Vendored JavaScript SHA-256 inventory

| File | SHA-256 |
| --- | --- |
| `vendor/iro.min.js` | `5d08eedbac9af7212f5fdf7e336aeb2da87ac47b2364818ad4bbd7fcbdd18d0d` |
| `vendor/poline.umd.js` | `f158c6590cfc800665cc72383fcd36804c5404631a3dcdbd29c4ba6b50f28383` |
| `vendor/Sortable.min.js` | `bf4241bc73fef7f11c59a283a69fe8051cdd31c6d8ff5a2b9ba219e7831fcf76` |
| `vendor/qrcode.min.js` | `c541ef06327885a8415bca8df6071e14189b4855336def4f36db54bde8484f36` |
