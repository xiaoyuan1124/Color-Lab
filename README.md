# Color Lab

手機優先、Local-first、零後端的私人配色實驗室。

**目前版本：V2.6.3**

Color Lab 的核心不是替使用者決定「最好看的顏色」，而是把顏色之間的關係變得可看、可比較、可保存、可反覆學習。

## 核心契約

- Color 1 = 75% 主體
- Color 2 = 18% 結構
- Color 3 = 7% 點綴
- 使用者選滿三色時，系統不重新排序、不偷偷改色
- 只選 1–2 色時，系統才補缺少的角色
- 無登入、無 Supabase、無付費 API
- 偏好、收藏、草稿與照片分析都留在裝置端
- PWA 可加入 iPhone 主畫面並支援離線使用

## 推薦引擎

目前推薦由多層訊號組成：

1. OKLCH 感知距離與明暗關係
2. Poline 色彩路徑
3. Fashion Reference Library
4. Instagram Styling Relationship Library
5. Cohesion pass
6. sRGB gamut protection
7. Multi-factor quality ranking
8. V2.3 本機偏好微調

品質排序會考慮：

- hierarchy
- distinctiveness
- cohesion
- focus
- practicality
- reference affinity
- accessibility
- personal affinity
- gamut safety

個人偏好只是一個低權重訊號，不會凌駕基本配色品質，也不會改掉 Color 1 / 2 / 3 的使用者順序。

## V2.3 本機個人化

Color Lab 只從明確行為學習：

- 收藏新配色：強訊號
- 重複收藏同一組：弱訊號
- 套用推薦：弱訊號
- 套用靈感變體 / A-B 方案：弱訊號
- 再次打開已收藏配色：弱訊號

不使用：

- 停留時間
- 被動瀏覽
- 自動生成結果
- 照片內容
- 背景追蹤

偏好模型只儲存角色的聚合 OKLCH 統計，以及色相距離／結構對比等關係統計，不保存完整操作歷史。

使用者可隨時在收藏頁按「重置偏好」。重置不會刪除收藏，而且會留下明確的空偏好狀態，避免舊 IndexedDB 快照把已重置的偏好重新復活。


## V2.4.1 Corner Fan Navigation

V2.4.1 把 V2.4 的右側常駐 Edge Rail 收斂成右下角按需出現的 Corner Fan：

- 平時只保留一顆約 50px 的四點入口，不再長期覆蓋右側內容
- 點擊後由右下角展開 90° 四分之一扇面
- Compose / Inspire / Photo / Library 沿弧線分布
- 選擇導航後自動收起；點外部或按 Escape 也會收起
- 關閉狀態下四個導航不可被鍵盤焦點誤觸，展開時才進入 tab order
- Active 狀態以細線與文字辨識，不用大面積膠囊底
- 扇面使用接近紙張的實色層，不使用厚重 glass / blur
- Library 去框化仍保留，讓收藏顏色而不是 utility 控制成為主角

核心原則是：**Navigation appears on demand, not as permanent chrome.**

## V2.5 Editorial Hierarchy

V2.5 把功能完整度轉換成更清楚的閱讀節奏：

- Corner Fan 在捲動時自動退到右側並降低存在感，停止捲動後再回來
- Compose 第一層只保留選色、75/18/7、主要預覽與角色關係
- 明暗／色相解釋、色覺模擬與 App / Brand / Room / Outfit / Slides 收進「深入理解」
- 深度能力沒有刪除，只在使用者需要時展開
- Library 從 list cell 改為較大的個人色彩檔案條目
- 收藏色塊可直接套用；Pinned palette 取得更大的展示比例
- 新增 Visual Quality Audit Gate，專門防止 Bottom Tab 回歸、永久側欄、無理由 glass 與資訊層級 regression

## V2.6 Color Reasoning

V2.6 把「功能」往「理解與決策」推進：

- 推薦會說明它想把配色帶往更安靜、更銳利、更有焦點、更有張力或更平衡哪個方向
- 明暗、色相、焦點可以直接點開短篇概念說明，不新增第五個主導航
- Photo 可以一鍵把主體／結構／焦點三色帶回 Compose
- Photo 會描述照片三色與目前 Compose 三色是接近、可見差異或方向差異明顯
- Personalization 詳細偏好改為按需查看，平時只說明它只微調排序、不改三色
- Lighthouse 日誌開始列出真正失敗的 accessibility audits，後續只針對實際問題修正

## V2.6.1 Accessibility Hardening

依 Lighthouse 實際失敗 audit 修正：

- Secondary / tertiary small text 提升到可讀對比
- 次要層級改由字級、字重與留白表達，不再靠低 opacity
- 推薦卡不再用較短 aria-label 覆蓋可見文字
- ×、••• 等視覺 glyph 與 screen-reader 名稱分離
- Color Slot 與照片色票保留 visible label 在 accessible name 中

## V2.6.2 Deferred Depth

- Compose 關閉「深入理解」時，不再背景計算色覺模擬與情境預覽
- 展開時才產生最新 Vision / Context Preview
- 切回 Compose 也只在深度區已展開時更新
- 修正 drag note 與 eyebrow 使用透明度造成的小字對比問題

## V2.6.3 Contrast Choice

Lighthouse 精確定位到 75 / 18 / 7 預覽中的中間明度色塊。舊版用固定 luminance threshold 決定黑／白文字，會在部分中間色選錯。

現在 textFor() 直接計算深色字與淺色字的實際 contrast ratio，永遠選兩者中較高的一個；Torture Gate 也加入中間橄欖色 regression case，以及 Photo role / recommendation direction 基本契約測試。

## 照片分析

照片功能支援：

- 精準單點取色
- 區域分析
- 主體 / 鮮明 / 柔和 / 深色 / 淺色角色
- 近似色彩占比
- 明度、彩度與明暗跨度
- 高彩度焦點判斷
- 邊緣背景候選抑制
- 邊緣背景提示

Color Lab 會偵測瀏覽器是否具有 Display-P3 canvas 能力，但**目前照片分析仍統一轉為 sRGB / HEX**，不宣稱是真正的 P3 原色取樣。

## Fashion / IG Reference

資料層位於：

- `data/fashion-palettes.js`
- `data/ig-style-patterns.js`

研究方法與來源：

- `docs/FASHION_REFERENCE_LIBRARY.md`
- `docs/IG_STYLE_PATTERNS.md`

品牌資料使用公開系列中的色彩關係作為研究依據；程式內 HEX 是 Color Lab 為演算法建立的近似標準化值，不宣稱是品牌官方色票。

## Color Quality Engine

品質引擎包含：

- 自適應 cohesion
- structure contrast guard
- accent chroma / lightness guard
- OKLCH → sRGB gamut mapping
- recommendation diversity
- perceptual duplicate suppression

詳細方法：

- `docs/COLOR_QUALITY_ENGINE.md`

Color.js、Color Thief、Cohesive Colors 等專案曾作為研究參考；目前 Color Lab **沒有把 Color.js 或 Color Thief 作為瀏覽器 runtime dependency**。

## 資料安全

本機資料包含：

- saved palettes
- recent colors
- draft
- A/B comparison
- local preference model

資料會使用：

- localStorage
- IndexedDB resilience snapshot
- JSON backup / import

Backup V4 可攜帶本機偏好模型與個人化開關，同時保留 V1 / V2 / V3 匯入相容性。

## PWA / Offline

Service Worker 採用：

- navigation：network-first + offline fallback
- same-origin static assets：cache-first
- 所有 runtime 資源均為本地檔案
- 無 CDN runtime dependency

目前 cache generation：`color-lab-v263-contrast-choice`

## Quality Gates

每次 main 更新會自動執行：

### Deploy Color Lab

1. static verification
2. algorithm torture tests
3. fast-check property-based tests
4. GitHub Pages deploy

### Color Lab Quality

- Lighthouse Performance
- Lighthouse Accessibility
- Lighthouse Best Practices
- 報告保存為 GitHub Actions artifact

### CodeQL

- JavaScript / TypeScript security analysis

另外已啟用 Dependabot 追蹤 npm 與 GitHub Actions 版本。

## 目前限制

- 真實 iPhone Safari / PWA 體驗仍需要實機驗收，CI 無法完全取代
- Display-P3 目前只偵測顯示能力，照片演算法仍使用 sRGB
- 色覺模擬是近似模型
- 尚未加入 APCA
- 主要應用程式仍集中在單一 `index.html`，未為了架構美觀而強行拆檔
- 系統使用原生 prompt / confirm 的少數管理操作，視覺仍可再統一

## 設計原則

Color Lab 使用 75 / 18 / 7 作為視覺與配色共同語言：

- 75% Calm
- 18% Structure
- 7% Attention

詳細規範見：

- `docs/DESIGN_SYSTEM.md`

> 美，不是把漂亮的東西放在一起。美，是讓它們之間的關係成立。
