# Instagram Styling Relationship Library

Color Lab V1.4 adds a second recommendation layer based on publicly indexed Instagram Reels about wearable colour pairing.

## Why this layer exists

The Fashion Reference Library learns from runway and collection colour relationships.

The Instagram Styling Relationship Library learns from **wearable styling logic** repeatedly demonstrated in Reels:

- analogous colour harmony
- complementary accents
- monochrome / tonal dressing
- neutral base + bright accent
- sage + chocolate earthy pairing
- dark base + colourful detail
- three-colour spacing
- shared-colour print mixing
- dopamine dressing
- softer low-chroma contrast

These are stored as relationship templates rather than fixed palettes.

## Important rule

Color 1 always remains the user-selected 75% primary colour.

IG patterns never replace Color 1.

For one selected colour, a pattern generates Color 2 and Color 3 by applying:

- hue delta
- lightness delta
- chroma delta

For two selected colours, Color Lab measures how well the user's Color 2 matches each template's expected structure colour, then only proposes Color 3.

## Current indexed Reel sources

### Barbara Aleks — colour wheel inspiration
https://www.instagram.com/reel/C5TDPjbutLi/

Publicly indexed caption: colour wheel / colour theory can be used as inspiration when deciding which colours to wear together.

### Natalia / Fashion Tips — analogous and complementary
https://www.instagram.com/petitelife_incolors/reel/C9DHW1jg5xr/

Publicly indexed caption explicitly discusses:
- red + pink as analogous colours
- purple pairing with yellow or green as opposite-side / complementary relationships

### Kalianna — three-colour outfit using the colour wheel
https://www.instagram.com/reel/DIMO0dFuKRh/

Used as evidence for deliberate three-colour hue spacing.

### India de Beaufort — print mixing through shared colour
https://www.instagram.com/reel/DIOyGtfpGVL/

Publicly indexed caption recommends:
- pulling complementary colours from prints
- using the same shade across print and stripe
- monochromatic matching when appropriate

### Pantone — Dualities / Oyuna
https://www.instagram.com/pantone/reel/DHJDgKiu8ZV/

Publicly indexed caption describes:
- honey and caramel warm hues
- deep dark-sky contrast
- crisp winter whites

### Jessica Brown / Fashionablyjess — sage + chocolate brown
https://www.instagram.com/reel/DcoXIqnvhAf/

Publicly indexed caption highlights sage green + chocolate brown as a 2026 fall pairing.

### Z O I L A GARCIA — grey on grey
https://www.instagram.com/zee_styledit/reel/C1pWOhqJn1_/

Used for monochrome / tonal value relationships.

### Vish / Personal Stylist — colour wheel for outfit combinations
https://www.instagram.com/a.cup.of.vish/reel/C9PjJWLq8TN/

Used for practical colour-wheel styling intent.

### Anjali — repeatable colour combinations
https://www.instagram.com/anjali_archives/reel/DHQSTA-IQrt/

Used as a lower-confidence everyday-wear relationship reference.

### Mel — dopamine dressing
https://www.instagram.com/reel/DJP-p-6gWVE/

Publicly indexed caption discusses colourful outfits, bold prints, and dopamine dressing.

### Styleyouraura — black base with colourful accessories
https://www.instagram.com/reel/C_vJuTOhR8A/

Publicly indexed caption describes using a simple black skirt / crop top with two colourful dupattas.

## Data representation

Each template in `data/ig-style-patterns.js` contains:

- `id`
- `label`
- `confidence`
- source Reel URL
- short source-supported lesson
- structure delta: hue / lightness / chroma
- accent delta: hue / lightness / chroma
- normalized sample colours

The sample colours are Color Lab normalization examples and are **not claimed to be exact colours from the Reel frames**.

## Recommendation weighting

IG styling patterns are a soft signal alongside:

- OKLCH perceptual distance
- Color Lab structural contrast
- Poline-generated colour paths
- Fashion Reference Library runway relationships

No single source automatically wins.

The user-selected order always remains:

- Color 1 = 75%
- Color 2 = 18%
- Color 3 = 7%
