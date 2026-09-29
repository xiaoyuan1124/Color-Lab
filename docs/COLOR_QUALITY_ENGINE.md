# Color Quality Engine — V1.5

Color Lab V1.5 adds a final quality layer after palette generation.

The goal is not to add more palette data. The goal is to make already-reasonable colours feel more coherent without overriding the user's intent.

## Pipeline

Color 1
→ Fashion Reference Library
→ Instagram Styling Relationship Library
→ Poline / generated candidates
→ Cohesion pass
→ sRGB gamut protection
→ final Color 2 / Color 3

The fixed user contract remains:

- Color 1 = 75% primary
- Color 2 = 18% structure
- Color 3 = 7% accent

If the user selected all three colours, V1.5 does not alter any of them.

If only one or two colours are selected, V1.5 may refine only the generated colours.

## Cohesion pass

The cohesion stage is conceptually inspired by Cohesive Colors:

https://github.com/Cohesive-Colors/cohesive-colors.github.io

Its public README describes a cohesion workflow based on:

- a shared key colour
- preserving perceptual lightness
- pulling hue toward a common axis
- contrast and vibrancy guards

Color Lab does **not** copy Cohesive Colors source code.

At the time this engine was implemented, no repository LICENSE file was found in the upstream repo, so only the publicly documented design idea was studied. The V1.5 implementation is independent and uses Color Lab's existing OKLCH math.

Color Lab's implementation:

- keeps Color 1 unchanged
- gently pulls generated Color 2 / Color 3 hue toward Color 1
- keeps the original generated lightness
- applies only a small chroma blend
- adds a minimum contrast guard for a generated Color 2
- prevents the generated accent from losing too much chroma

## Gamut protection

Color.js was researched as the reference for serious gamut handling:

https://github.com/color-js/color.js

Color.js is MIT licensed and supports real gamut mapping, OKLCH, Display-P3 and multiple DeltaE methods.

For V1.5, Color Lab does not add Color.js as a runtime dependency. The current upstream GitHub main branch does not commit a ready-to-use browser global bundle, and Color Lab prioritizes a fully offline PWA.

Instead, V1.5 adds a local OKLCH → linear-sRGB gamut check and binary-search chroma reduction:

- preserve OKLCH lightness
- preserve hue
- reduce chroma only until the colour fits sRGB

This avoids naive channel clipping while keeping the app dependency-free.

## Semantic photo swatches

Color Thief v3 was researched as the reference for image-palette UX:

https://github.com/lokesh/color-thief

Color Thief is MIT licensed and documents semantic swatches such as:

- Vibrant
- Muted
- Dark Vibrant
- Dark Muted
- Light Vibrant
- Light Muted

Color Lab keeps its own local image clustering to preserve offline behavior, but V1.5 upgrades the output into semantic roles:

- 主體
- 鮮明
- 柔和
- 深色
- 淺色

Each semantic swatch is selected from local clusters using:

- population share
- OKLCH chroma
- OKLCH lightness

The displayed percentage is the cluster's approximate share of the sampled image or selected region.

## Why no new runtime dependencies

The V1.5 rule is:

> Better colour science should not make the app less reliable offline.

Therefore:

- no CDN scripts were added
- no new runtime network dependency was added
- the Service Worker still precaches all required local runtime assets
- Color 1 remains untouched
- all-three-user-selected palettes remain untouched

## V2.7 Inspiration Scoring

Color Lab now separates the quality floor from inspiration value.

The normal quality engine still protects role order, gamut and minimum usable structure contrast. Inspiration ranking then adds surprise, cross-route diversity, relation distance and an archetype novelty prior.

Recommendation lanes are editorial, atmospheric, fashion, expressive and unexpected. The selector tries to return different lanes before filling extra slots, so the five visible cards cannot all come from the same safe visual neighborhood.

For inspiration candidates, inspirationRefineGenerated() intentionally does not pull generated hue toward the base color. It only applies gamut mapping and a minimum structure contrast guard.
