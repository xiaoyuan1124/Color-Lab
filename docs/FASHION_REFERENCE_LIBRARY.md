# Fashion Reference Library

Color Lab V1.3 adds a local fashion colour-reference layer for palette recommendation.

## Purpose

The library does **not** copy runway images or brand colour specifications.

It records colour relationships documented in official 2026 runway / collection material and normalizes those colour names into approximate sRGB HEX values for Color Lab's recommendation engine.

The important information is the relationship:

- Color 1 / Primary
- Color 2 / Structure
- Color 3 / Accent
- lightness difference
- chroma difference
- hue distance

Color 1 always remains the user's primary colour. Fashion references are transferred as relationships and never replace the user's Color 1.

## Current library

56 curated reference palettes across:

- CHANEL
- Dior
- Miu Miu
- Hermès
- Burberry
- LOEWE
- Louis Vuitton
- Bottega Veneta

## Source examples

### CHANEL — Spring Summer 2026 Ready-to-Wear

Official look pages document combinations including:

- White / Black / Red
- Burgundy / Yellow / Navy Blue
- White / Black / Aqua Green
- Brown / Burgundy / Yellow
- Ecru / Camel / Poppy Red
- Black / Gold / White
- Dark Brown / Burgundy / Beige / Black

Sources:
- https://www.chanel.com/tw/fashion/p/26S-PODIUM-054/look-54/
- https://www.chanel.com/tw/fashion/p/26S-PODIUM-060/look-60/
- https://www.chanel.com/tw/fashion/p/26S-PODIUM-058/look-58/
- https://www.chanel.com/tw/fashion/p/26S-PODIUM-051/look-51/
- https://www.chanel.com/tw/fashion/p/26S-PODIUM-067/look-67/
- https://www.chanel.com/tw/fashion/p/26S-PODIUM-022/look-22/

### Dior — Spring Summer 2026

Official collection listings include combinations and recurring colours such as:

- beige / navy / white
- stonewashed blue / white / black
- green / beige
- pink / yellow
- khaki / saddle-gold
- grey / blue / cream

Source:
- https://www.dior.com/zh_tw/fashion/womens-fashion/spring-summer-collection

### Miu Miu — 2026

Official campaign copy explicitly describes:

- French navy through cerulean
- white through sand
- dark chocolate through caramel and tan
- pale blue with pink accents
- butter shade

Sources:
- https://www.miumiu.com/tw/hk/miumiu-club/campaigns/miu-miu-l-ete-2026.html
- https://www.miumiu.com/ww/en/miumiu-club/special-projects/miu-miu-manifeste-pop-up.html

### Hermès — Spring/Summer and Fall/Winter 2026

Official runway / collection material describes:

- earth-to-ocean colour language
- red sun and Mediterranean blue
- beige / natural / brown
- black / blue / green

Sources:
- https://www.hermes.com/tw/zh/content/341542-women-spring-summer-2026-runway-show/
- https://www.hermes.com/us/en/category/women/ready-wear/spring-summer-collection/
- https://www.hermes.com/us/en/category/women/ready-wear/fall-winter-collection/

### Burberry — Summer 2026

Official show descriptions include:

- pink + green check
- green crochet knit
- blue cotton coat
- coated denim
- leather / suede browns
- check neutrals

Source:
- https://tw.burberry.com/c/burberry-world/collections/summer-2026-show/

### LOEWE — Spring Summer 2026

Official material describes elemental / natural colour and a show-space starting point of yellow with a red curve.

Sources:
- https://www.loewe.com/int/zh_TW/pd/stories-collection/ss26-women-runway.html
- https://www.loewe.com/int/en/women/ss-womens-runway

### Louis Vuitton — Spring Summer 2026

Official collection material describes delicate hues, strong contrast and a broad palette covering natural, beige, grey, blue, pink, red, yellow, brown, metallics and multicolour.

Sources:
- https://tw.louisvuitton.com/zht-tw/stories/spring-summer26-collection
- https://us.louisvuitton.com/eng-us/women/spring-summer-2026-collection/_/N-t1ym4reu

### Bottega Veneta — Summer 2026

Official collection / campaign material emphasizes precise daywear tailoring, whitewashed show space, vibrant details, colour and light, and richly textured materials.

Sources:
- https://www.bottegaveneta.com/en-us/summer-2026-campaign.html
- https://www.bottegaveneta.com/en-fi/summer-2026.html

## Recommendation method

Color Lab does not simply search for the closest stored HEX.

For every reference palette it measures an OKLCH relationship vector:

- primary → structure lightness delta
- primary → structure chroma delta
- primary → structure hue delta
- primary → accent lightness delta
- primary → accent chroma delta
- primary → accent hue delta

That relationship can then be transferred to any user-selected Color 1.

This makes the library useful even when the user's colour is not present in any runway look.

## Confidence

Directly documented colour combinations use higher confidence.

Collection-wide colour language and campaign-level relationships use lower confidence so they influence recommendations without overpowering the user's own colours.

## Important

The normalized HEX values in `data/fashion-palettes.js` are Color Lab approximations for computation and visual exploration.

They are **not official brand colour codes**.
