# Color Lab Design System

Color Lab 的視覺原則不是「套一套 UI library」，而是把一致性變成可維護的規則。

## 核心原則

- 75% Calm：背景、留白、主要閱讀空間
- 18% Structure：字體層級、邊界、區塊、選取狀態
- 7% Attention：Primary action、focus、真正需要注意的元素
- 1 Screen = 1 Hero
- 1 Section = 1 Purpose
- 1 Primary Action
- Accent 少量使用，不讓所有按鈕搶視線

## Spacing Tokens

4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64

任何新元件優先使用以上數字，不自行新增 17px、19px、27px 等例外。

## Radius Tokens

- Small: 8px
- Medium: 12px
- Large: 16px
- XL: 24px
- Pill: 999px

## Typography

使用 fluid type，避免固定尺寸在不同 iPhone 上失衡。

- XS: 11–12px
- Small: 13–14px
- Body: 15–16px
- Large: 18–20px
- Section: 24–28px
- Display: 36–46px

權重原則：
- 700：真正主角
- 600：互動 / 次級標題
- 400–500：閱讀內容
- 不讓所有資訊都 Bold

## Color System

Color Lab 保留自有 Cream / Olive / Charcoal 語言，不直接套 Radix UI。

Olive 建立 1–12 階：
- 1–4：subtle background / selected surface
- 5–8：border / secondary UI
- 9：brand reference
- 10–11：interactive text
- 12：solid action / selected state

Semantic roles:
- surface-0：App background
- surface-1：subtle surface
- surface-2：elevated / high contrast light surface
- border-subtle：一般分隔
- border-strong：hover / stronger separation
- text-1：主要文字
- text-2：次要文字
- text-3：輔助文字

## Interaction Rules

- 所有主要 touch target 目標至少 44px
- Primary CTA 約 52px
- Focus 必須可見
- Pressed state 使用輕微 scale，不使用強烈動畫
- 支援 prefers-reduced-motion
- Input / Button 都需要明確狀態

## Component Rules

### Color Slot
- 三槽等寬
- Active 使用 focus ring，不改變 layout
- Empty 使用 dashed border
- Remove 是次級操作，不使用品牌主色

### Palette Preview
- 顏色本身是主角
- 只顯示必要比例
- 不疊加大量文字

### Recommendation Card
- 一張卡只表達一個方向
- Palette > Label > Explanation
- 不用多個 CTA

### Library
- 收藏名稱是使用者自己的名稱
- 系統模式不得取代使用者名稱
- Preview > Name > Secondary action

## UI Audit

每次新增畫面或功能前檢查：

1. 第一眼看哪裡？
2. 第二眼看哪裡？
3. 這個元素能不能刪？
4. 是否用了現有 spacing token？
5. 是否用了現有 radius token？
6. 是否新增了不必要的 accent？
7. 是否有足夠留白？
8. touch target 是否足夠？
9. focus state 是否可見？
10. 小螢幕與大螢幕的字級是否仍成立？

Color Lab 的目標是 Unity without sameness：一致，但不無聊。
