// Color Lab Instagram Styling Relationship Library
// Derived from publicly indexed Instagram Reels about wearable colour pairing.
// These are relationship templates and normalized examples, not copied brand palettes.
window.IG_STYLE_PATTERNS = [
  {
    id:"analogous-soft",
    label:"類似色",
    confidence:.95,
    source:"https://www.instagram.com/petitelife_incolors/reel/C9DHW1jg5xr/",
    lesson:"analogous colours can create continuous harmony",
    structure:{dh:22,dl:.06,dc:-.02},
    accent:{dh:-24,dl:-.04,dc:.035},
    sample:["#C54D57","#D66A73","#A93E68"]
  },
  {
    id:"complementary-pop",
    label:"互補點綴",
    confidence:.95,
    source:"https://www.instagram.com/petitelife_incolors/reel/C9DHW1jg5xr/",
    lesson:"opposite-side colours create stronger contrast",
    structure:{dh:8,dl:-.18,dc:-.05},
    accent:{dh:180,dl:.02,dc:.08},
    sample:["#7D59A5","#5C437B","#D6BE3F"]
  },
  {
    id:"color-wheel-balanced",
    label:"色輪平衡",
    confidence:.92,
    source:"https://www.instagram.com/reel/C5TDPjbutLi/",
    lesson:"use the colour wheel as a practical pairing guide",
    structure:{dh:30,dl:-.13,dc:-.035},
    accent:{dh:150,dl:.03,dc:.07},
    sample:["#5F7C91","#3F5968","#D79057"]
  },
  {
    id:"color-wheel-three",
    label:"三色彩度",
    confidence:.9,
    source:"https://www.instagram.com/reel/DIMO0dFuKRh/",
    lesson:"three-colour outfits can work when hue spacing is deliberate",
    structure:{dh:120,dl:-.05,dc:.015},
    accent:{dh:240,dl:.02,dc:.045},
    sample:["#3973B7","#D06E36","#7954A8"]
  },
  {
    id:"monochrome-tonal",
    label:"同色系",
    confidence:.96,
    source:"https://www.instagram.com/zee_styledit/reel/C1pWOhqJn1_/",
    lesson:"monochrome can rely on lightness differences rather than hue changes",
    structure:{dh:0,dl:-.19,dc:-.035},
    accent:{dh:0,dl:.15,dc:-.015},
    sample:["#8A8A87","#5E5E5C","#B8B8B4"]
  },
  {
    id:"shared-colour-print",
    label:"共享色",
    confidence:.9,
    source:"https://www.instagram.com/reel/DIOyGtfpGVL/",
    lesson:"print mixing works when a shared colour anchors both pieces",
    structure:{dh:0,dl:-.15,dc:-.045},
    accent:{dh:165,dl:.03,dc:.065},
    sample:["#5C7A5C","#3F5741","#C9745F"]
  },
  {
    id:"earth-sage-chocolate",
    label:"大地雙色",
    confidence:.93,
    source:"https://www.instagram.com/reel/DcoXIqnvhAf/",
    lesson:"sage green and chocolate brown create a rich low-chroma pairing",
    structure:{dh:-75,dl:-.2,dc:-.015},
    accent:{dh:18,dl:.08,dc:-.035},
    sample:["#78866B","#5C3E32","#B6A27F"]
  },
  {
    id:"black-base-festival",
    label:"深色基底",
    confidence:.88,
    source:"https://www.instagram.com/reel/C_vJuTOhR8A/",
    lesson:"a dark neutral base can support two more colourful elements",
    structure:{dh:0,dl:-.28,dc:-.09},
    accent:{dh:145,dl:.08,dc:.11},
    sample:["#3B3B3A","#181918","#CA5B72"]
  },
  {
    id:"warm-caramel-winter-white",
    label:"暖色層次",
    confidence:.95,
    source:"https://www.instagram.com/pantone/reel/DHJDgKiu8ZV/",
    lesson:"warm honey and caramel can be balanced by dark contrast and winter white",
    structure:{dh:-8,dl:-.21,dc:.015},
    accent:{dh:0,dl:.28,dc:-.09},
    sample:["#B8874D","#6A4A2F","#F1EEE7"]
  },
  {
    id:"dopamine-bold",
    label:"高彩度",
    confidence:.84,
    source:"https://www.instagram.com/reel/DJP-p-6gWVE/",
    lesson:"dopamine dressing uses confident colour and texture rather than neutral safety",
    structure:{dh:105,dl:-.04,dc:.07},
    accent:{dh:-120,dl:.04,dc:.1},
    sample:["#D54F76","#53A06D","#5E79D1"]
  },
  {
    id:"safe-everyday",
    label:"日常安全",
    confidence:.82,
    source:"https://www.instagram.com/anjali_archives/reel/DHQSTA-IQrt/",
    lesson:"repeatable everyday combinations should preserve one clear dominant colour",
    structure:{dh:12,dl:-.22,dc:-.07},
    accent:{dh:42,dl:.12,dc:-.015},
    sample:["#79828A","#49515A","#C6B081"]
  },
  {
    id:"stylist-wheel",
    label:"實穿色輪",
    confidence:.9,
    source:"https://www.instagram.com/a.cup.of.vish/reel/C9PjJWLq8TN/",
    lesson:"colour-wheel relationships can be chosen according to styling intent",
    structure:{dh:-35,dl:-.12,dc:-.025},
    accent:{dh:145,dl:.03,dc:.065},
    sample:["#6D7FA4","#526078","#C88069"]
  },
  {
    id:"neutral-plus-red",
    label:"中性＋亮點",
    confidence:.82,
    source:"https://www.instagram.com/reel/C5TDPjbutLi/",
    lesson:"keep most of the look restrained and let one accent carry attention",
    structure:{dh:0,dl:-.27,dc:-.085},
    accent:{dh:155,dl:.02,dc:.12},
    sample:["#D5D0C7","#3B3C3B","#C8433D"]
  },
  {
    id:"tonal-warm",
    label:"暖色同調",
    confidence:.88,
    source:"https://www.instagram.com/pantone/reel/DHJDgKiu8ZV/",
    lesson:"adjacent warm values can feel rich when lightness is layered",
    structure:{dh:-8,dl:-.16,dc:.015},
    accent:{dh:10,dl:.12,dc:-.025},
    sample:["#B98557","#825C3B","#D2B080"]
  },
  {
    id:"soft-contrast",
    label:"柔和對比",
    confidence:.86,
    source:"https://www.instagram.com/reel/C5TDPjbutLi/",
    lesson:"contrast can be visible without pushing every colour to high saturation",
    structure:{dh:35,dl:-.18,dc:-.06},
    accent:{dh:165,dl:.08,dc:.015},
    sample:["#9D8D83","#6C625C","#8FA9A5"]
  },
  {
    id:"triadic-muted",
    label:"低彩三色",
    confidence:.85,
    source:"https://www.instagram.com/reel/DIMO0dFuKRh/",
    lesson:"three-colour spacing can be softened by reducing chroma",
    structure:{dh:118,dl:-.08,dc:-.025},
    accent:{dh:-122,dl:.04,dc:-.01},
    sample:["#8C8378","#637C70","#7A6D8D"]
  }
];
