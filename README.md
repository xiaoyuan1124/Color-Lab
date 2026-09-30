# Color Lab

手機優先、Local-first、零後端的私人配色實驗室。

**目前版本：V2.21.0**

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
5. Aesthetic Gate（明暗節奏、彩度意圖、色相結構、角色分工）
6. Cohesion pass
7. sRGB gamut protection
8. Multi-factor quality ranking
9. V2.3 本機偏好微調

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

現在 textFor() 對動態彩色背景使用 #000 / #FFF 兩端並直接計算實際 contrast ratio，永遠選兩者中較高的一個；75 / 18 / 7 比例文字也直接落在色塊上，不再加半透明 glass pill，讓 contrast 計算與實際背景一致。Torture Gate 也加入中間橄欖色 regression case，以及 Photo role / recommendation direction 基本契約測試。

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

## V2.21.0 Color Relationship Map

把既有推薦引擎已經理解、但過去只以文字呈現的三色關係直接視覺化：

- 在「深入理解」加入 read-only Color Relationship Map，不增加主導航或首屏資訊密度
- Hue 使用色環位置顯示 Base / Structure / Accent 三個角色，並以三條關係線呈現三色幾何距離
- Lightness 與 Chroma 各自用三角色條帶呈現，不再只靠一句摘要判斷
- 75 / 18 / 7 role weight 直接與目前三個 exact source colors 並列，維持 Color 1 → Base、Color 2 → Structure、Color 3 → Accent
- Relationship verdict 分開解釋 Hue continuity、Base / Structure 明暗節奏與 Accent chroma lift
- 分析完全只讀，不寫入 selectedColors、palette、收藏或匯出，也不重新排序使用者原色
- 只有 Compose「深入理解」展開時才 render，不增加首屏 startup 工作
- runtime 與 stylesheet 都是本地檔案並加入 Service Worker offline cache

## V2.20.0 Professional Export 2.0

Professional Handoff 在既有 CSS / JSON / Design Tokens 上增加真正能直接進工程流程的格式，但不增加首頁資訊噪音：

- 第一層仍只保留 CSS / JSON / Tokens；Tailwind / SwiftUI / SVG Sheet 收在「更多格式」
- Tailwind 產出可直接放入設定檔的 `theme.extend.colors`，使用 Base / Structure / Accent semantic names
- SwiftUI 直接把 exact HEX 轉成 `Color(red:green:blue:)` 的 sRGB 0–1 數值，不依賴額外 Hex helper
- SVG Palette Sheet 產出 1200 × 720 可縮放交付圖，色塊依 75 / 18 / 7 幾何比例呈現並附三色 HEX
- 原本的「圖片」PNG 匯出仍保留，沒有重複新增另一顆 PNG 按鈕
- 所有新格式都從 `paletteArtifactBase()` 讀取目前 Base / Structure / Accent exact source colors
- Light / Dark Context Preview、Tone Explorer preview、Accessibility 建議都不會滲入匯出，除非使用者已明確套用到 Compose
- 檔名沿用既有 palette name sanitizer，支援 Web Share file；不支援時仍回退本機下載
- 不新增第三方 SDK、後端、帳號或付費 API

## V2.19.0 Photo → Palette 2.0

照片功能從「找主要色」進一步變成可以直接形成 75 / 18 / 7 三色系統：

- 保留原本精準單點取色與區域分析，不犧牲 pixel-level 手動控制
- 新增 Balanced / Muted / Vivid 三種三色抽取策略
- Balanced：兼顧照片主體占比、明暗分工、感知距離與焦點彩度
- Muted：優先較克制的 chroma，但仍要求三色有足夠 perceptual distance
- Vivid：把高彩、與主體／結構有距離、且不是大面積邊緣背景的顏色優先放到 7% Focus
- 三色直接映射為「主體 75 / 結構 18 / 焦點 7」，並在套用前顯示比例預覽
- 策略只從照片實際偵測到的 cluster 選色，不憑空生成新顏色
- 新增第二層 perceptual dedupe，減少 RGB 不同但肉眼幾乎相同的候選
- 五個既有語意色票仍保留，可繼續單獨點選加入目前 Color Slot
- 只有按「使用照片三色」才會寫入 Compose；策略切換本身不修改 palette
- 策略偏好只保存在 localStorage，所有照片分析仍完全在裝置端
- `runtime/photo-palette.js` 與 `runtime/photo-palette.css` 都加入 Service Worker 離線快取

## V2.18.0 Context Preview 2.0

Context Preview 從色票示意升級成接近真實成品的五種使用場景：

- App / Web：側欄、Hero、資訊卡、狀態列與主要 CTA，檢查背景、文字、資訊密度與焦點
- Brand：品牌海報、包裝、社群素材與 75 / 18 / 7 色彩條，不再只顯示 Logo 色
- Room：牆面、地板、沙發、掛畫與花器，讓主體 / 家具 / 點綴的比例可直接被看見
- Outfit：主體服裝、下身輪廓、包袋與鞋，呈現穿搭中的大面積 / 結構 / 配件焦點
- Slides：標題、內文、圖表、頁碼與重點標記，模擬真正簡報層級
- App / Brand / Slides 支援既有 Light / Dark 衍生預覽；Dark 仍不回寫 Compose
- Room / Outfit 永遠使用來源原色，不用 UI Dark 變體污染實體色彩判斷
- 所有情境都以 75 / 18 / 7 分配視覺重量，而不是單純把三色平均鋪滿
- Context Preview 樣式獨立到 `runtime/context-preview.css` 並加入 Service Worker 離線快取
- 情境切換與 Light / Dark 切換都只讀取 palette，不修改收藏、匯出或 Compose 原色

## V2.17.0 Tone Explorer

Tone Explorer 把「換更多顏色」改成兩種可以理解的實驗：

- 固定 Hue · 換 Tone：保留三個角色原本的 Hue，依 Tone Family 改變 Lightness / Chroma 節奏
- 可探索 Morandi、Soft Pastel、Earth、Editorial、Quiet Luxury、Jewel、Digital、Airy 八種 Tone Family
- 固定 Tone · 換 Hue：三個角色一起做相同 Hue rotation，盡量保留各自原本的 Lightness / Chroma 與相對關係
- Hue rotation 提供 -90°、-45°、-20°、+20°、+45°、+90°、180° 七個方向
- 所有候選先以預覽比較，不會回寫 Compose
- 預覽顯示「目前 vs 預覽」兩組 75 / 18 / 7 色條
- 只有明確按「套用」才會改變 palette，並加入 Undo / Redo
- 鎖定角色永遠保留原色，不被 Tone Explorer 覆蓋
- palette 在預覽期間若已變更，舊預覽會自動失效，避免把過期候選套到新配色
- Tone Explorer 使用本地 runtime 並加入 Service Worker 離線快取，不新增後端或 API

## V2.16.0 Aesthetic Gate 2.0

審美評分從「低彩度比較安全」改成「能量是否被角色與秩序控制」：

- 移除 highChroma 計數懲罰、supportCalm 低彩度加分與固定 chromaDiscipline 階梯
- 新增 roleClarity：看三個角色是否真的有可感知的分工，而不是只看彩度大小
- 新增 energy：判斷 palette 的整體色彩能量，不把高能量本身視為缺點
- 新增 energyStructure：高彩度時要求明暗節奏、Base / Structure 層級、Hue 結構、Accent 意圖與角色距離成立
- 新增 chromaIntent / vividIntent：高彩度只要有清楚結構就能得到正向分數
- 高彩度過載現在只在「能量高但結構差」時扣分
- expressive / unexpected reference prior 不再先天低於 atmospheric / quiet 類型
- 下游 practicality 也改為判斷 Accent 是否相對失控，不再用 Accent 絕對 chroma 當作缺點
- 保留最低美感門檻；不是放寬 Gate，而是讓 Gate 對 muted 與 vivid 使用同一個「關係成立」標準
- Torture benchmark 同時驗證 quiet-good、vivid-good 與 vivid-noisy 三類 palette

## V2.15.0 Inspire History + Anti-repeat

Inspire 原有「上一批 / 下一批」穩定歷史保留，這版補上跨 session 的近期瀏覽記憶：

- 每批仍最多顯示 5 組，上一批 → 下一批會回到完全相同的候選
- 本機記住最近看過的 24 組 palette fingerprint
- 相同輸入條件重新建立候選池時，近期看過的 palette 會排到新候選之後，降低重新從同一批開始的機率
- 最近看過的 palette 不會被刪除，只是延後，因此仍可繼續瀏覽找回
- 記憶只存在 localStorage，不新增帳號、後端或追蹤
- 換色、模式或參考資料造成候選 context 改變時，批次歷史仍會正確重置，不沿用錯誤頁碼

## V2.14.0 Actionable Accessibility Fix

Palette Validation 不再只指出「不合格」，而是給出可直接比較的修正方向：

- 任一角色配對低於 WCAG AA 4.5:1 時，產生最接近目前顏色的 AA 建議色
- 修正優先動較小比例角色：Base / Structure 改 Structure；含 Accent 的配對優先改 Accent
- 演算法維持原色 Hue / Chroma，主要沿 OKLCH Lightness 搜尋，再以 perceptual distance 選最接近原色的達標候選
- 每張建議顯示目前 HEX、建議 HEX、目前 contrast 與建議 contrast
- 「預覽」只顯示建議套入 75 / 18 / 7 後的結果，不修改目前 palette
- 只有使用者明確按「套用建議」才會把建議色寫入 Compose，並納入 Undo / Redo 歷史
- 若原本只有 1–2 個自選色，明確套用時會固定當下三個角色，避免角色重排
- Dark 驗證仍是 preview-only 衍生色，不提供直接套用建議；回 Light / 原色後才可修正來源 palette
- 不改動 CSS / JSON / Tokens 匯出的原色，除非使用者已明確套用建議

## V2.13.1 Runtime Modularization

這一版不新增產品功能，先替後續版本重新建立安全開發空間：

- 將 Professional Handoff、Palette Validation、Light / Dark Context Preview 從單一 `index.html` 抽到 `runtime/palette-tools.js`
- runtime 仍是純本地 classic script，不使用 CDN、bundler、後端或新付費服務
- Service Worker 預快取 runtime，離線 PWA 行為不變
- Playwright 直接驗證 runtime 已載入，CSS / JSON / Tokens、Dark Preview、可讀性矩陣仍可呼叫
- Verify / Torture 同時檢查 inline app 與 runtime，不因拆檔失去 regression protection
- `index.html` 從約 240 KB 降到約 231 KB，重新取得約 9 KB 的 235 KiB Size Budget 空間
- 75 / 18 / 7、使用者原色、收藏、備份與 Local-first 契約完全不變

## V2.13.0 Palette Validation

把「這組色好看」再往「這組色真的能安全使用」推進：

- Compose 首層摘要改為三組角色配對的整體可讀性，不再只檢查 Base / Structure 與 Base / Accent
- 「深入理解」新增完整 3 × 3 三色對比矩陣，Base / Structure / Accent 都能作為文字與背景互相比較
- WCAG 2.x 門檻分為 AAA 7:1、AA 4.5:1、大字 / UI 3:1、Accent / 裝飾四級
- 可在「原色」與「Dark 預覽」之間切換驗證
- Dark 驗證只使用 V2.12 的 preview-only 衍生色，不會回寫 Compose、收藏或匯出內容
- Accent 原色在 Dark 預覽與驗證中保持不變
- 矩陣與 Light / Dark Context Preview 使用同一套衍生邏輯，避免預覽與數值判斷不一致
- 維持既有 235 KiB index.html Size Budget，不因新增矩陣調高門檻

## V2.12.0 Professional Handoff

把「配色好看」往真正可以交付給設計與開發工作流推進：

- Compose 新增 CSS、JSON、Design Tokens 三種文字型交付格式
- CSS 直接輸出 Base / Structure / Accent variables 與 75 / 18 / 7 比例
- JSON 保留配色名稱、角色 HEX 與比例資料
- Tokens 使用 Base / Structure / Accent semantic role，保留角色說明
- 支援 iOS / Web Share file；不支援時回退為本機下載
- 交付內容只使用目前畫面三色，不重新生成、不排序、不偷偷改色
- Context Preview 新增 Light / Dark
- Dark 是預覽專用衍生變體，只調整 Base / Structure 的明暗以模擬深色介面；Accent 保留目前原色
- Dark 預覽不會回寫 Compose、不會影響收藏、匯出或 75 / 18 / 7 原始資料
- App preview 增加導覽、內容層級、卡片與 CTA，從單純色塊示意往真實產品情境靠近

## V2.11.1 Inspire Session History

把 Inspire 的「換一批」從單向分頁改成真正可回頭的探索 session：

- 新增「上一批 / 下一批」，批次進度直接顯示第幾批
- 同一個推薦條件會保留已走過的批次歷史，返回後再前進會回到相同批次
- 未看完所有合格候選前不重複已拒絕批次
- 走到最後一批後停止，不再突然跳回第一批
- 使用者顏色、模式或推薦上下文改變時才重建新 session
- 仍維持最多 30 組合格候選、一次只顯示 5 組的資訊密度

## V2.11.0 Candidate Explorer

把「換一個」從單向抽換改成可理解、可返回的探索流程：

- Compose 新增三個簡單方向：和諧 / 變化 / 大膽
- 同一輪候選仍維持 Stable Candidate Session，不會亂重排
- 每個系統補色角色都有上一個 / 下一個，可從第 1 個返回原始色
- 候選進度直接顯示在畫面，不再只靠 toast
- 加入更明確的 perceptual duplicate threshold，減少「數值不同但肉眼幾乎一樣」
- 變化 / 大膽模式會適度放鬆 Tone Family 混合強度，但仍先通過 Aesthetic Gate
- 候選生成方向由 18 組擴到 20 組，並增加明度 / 彩度跨度
- 使用者自選色、75 / 18 / 7 順序與三色完整輸入契約不變

## V2.10.1 Stable Candidate Session

修正「換一個」候選編號 6 → 4 → 11 → 2 亂跳：

- 第一次按某角色的「換一個」時，建立並凍結該輪候選池
- 同一輪不會因為剛換出的顏色再次重算、重排候選
- 游標固定依序前進：第 1 / N → 第 2 / N → 第 3 / N
- 走到第 N 個後才回到第 1 個
- 只有其他角色、使用者自選色或整組條件改變時，才建立新的候選 session
- Tone Family、Aesthetic Gate 與 Tonal Cohesion 規則完全保留

## V2.10 Exploration Depth

V2.10 解決「和諧了，但可選顏色太少」：

- Compose 的「換一個」不再只從前 5 個 alternatives 隨機抽取
- 每個推薦角色依目前 Tone Family 建立最多 36 個候選，再以 Aesthetic + Tonal Cohesion + perceptual distance 篩選
- 同一個配色上下文會記住已看過的顏色，優先顯示尚未出現的候選；走完整輪才循環
- Inspire 的智慧推薦由固定 5 組擴為最多 30 組合格候選
- 畫面一次仍只顯示 5 組，新增「換一批」逐批探索，避免一次塞 30 張卡片
- 會顯示目前看到第幾組以及總共有幾組通過品質門檻
- 數量擴充不降低 V2.9 的 Aesthetic / Tonal Gate；如果某個條件只有 13 組夠好，就只提供 13 組

## V2.9 Tonal Cohesion Engine

V2.9 解決「Hue 關係合理，但三個色調不像同一個世界」的問題。

- 新增 `data/tone-families.js`，包含 Morandi、Soft Pastel、Earth、Editorial、Quiet Luxury、Jewel、Digital、Airy 八種 Tone Family
- 每個 Tone Family 都有自己的 neutral anchor、75/18/7 明度節奏、彩度節奏與角色混合強度
- 40 組 Inspiration Atlas 原型都有 tone-family 對應；Fashion / IG / 一般生成候選會依實際色彩特徵自動推斷 Tone Family
- 系統只調整尚未由使用者指定的顏色；使用者輸入或鎖定的角色不會為了統一色調而被偷偷改色
- tonal harmonization 不是單純 saturation × 0.6，而是在 OKLCH 色彩空間中往共同 neutral anchor 輕微靠攏，再重新設定角色 Lightness / Chroma
- 新增 Tonal Cohesion Score；候選除了 Aesthetic Gate，還要通過 tone-family cohesion 才有資格進前五
- 推薦卡與靈感卡會標示目前使用的 Tone Family，讓「為什麼這組看起來像同一套」可以被理解

核心原則：**Different hues. Same atmosphere.**

## V2.8 Aesthetic Gate

V2.8 把推薦目標從「夠不一樣」改成「先好看，再驚喜」。

- 新增 paletteAestheticCore()：評估明暗節奏、角色對比、彩度節制、色相結構、Accent 意圖與能量過載
- 新增 reference affinity：Atlas / Fashion / IG 只在關係真的接近時提供美感加分
- Surprise 不再是主分數，只在已通過美感門檻的候選上提供小幅加分
- 不再強制 editorial / atmospheric / fashion / expressive / unexpected 每條都入選；某條路線不夠美就可以完全不出現
- 不同 lane 有不同最低美感門檻，但即使 unexpected 也不能只靠「怪」進前五名
- Inspiration Atlas 從 30 組擴為 40 組，新增 10 組高信心 core anchors，偏 editorial / interior / fashion 的耐看關係
- 使用者已選的 1–2 個顏色仍保持，不為了提高分數偷偷改掉

## V2.7.3 Startup Budget

V2.7.3 針對 Lighthouse 的 Total Blocking Time 做首屏工作分流：

- Compare、Photo 初始化、Install 狀態、Recent Colors、Resilience restore 不再全部卡在第一個同步 startup task
- 深度關係說明只在「深入理解」真的展開時才計算
- 對應頁面的初始化移到使用者切換到該頁時
- 非必要本機恢復工作放到 requestIdleCallback
- Lighthouse 維持 Performance ≥ 90，改跑 3 次降低單次 shared-runner 波動；不降低門檻

## V2.7.2 Lazy Intelligence

V2.7.2 把完整推薦引擎從首屏移到真正的使用者意圖：
- 首屏只用 fastInitialPalette() 建立立即可看的 75 / 18 / 7
- Poline、Fashion、IG、Inspiration Atlas 全部改為按需載入
- 進入 Inspire 時一次準備完整 reference stack
- 主動按「產生」時先載入 reference，再執行完整智慧推薦
- Service Worker 仍預快取全部本機 reference，離線能力不變

## V2.7 Inspiration Engine

V2.7 重寫靈感與推薦邏輯，目標不是再產生更多「安全的相似色」，而是讓不同候選真的代表不同審美路線。

- 新增 data/inspiration-atlas.js：30 組 Color Lab 自建關係原型，橫跨 editorial / atmospheric / fashion / expressive / unexpected
- Atlas 儲存的是角色關係，不是把固定色票硬套給使用者
- 新增 surprise score，衡量色相跨度、彩度反差、明暗跨度與 Accent lift
- 推薦改成 lane-first selection，優先各取一條不同路線，再補足剩餘候選
- Fashion / IG 在 Inspiration 模式不再經過會把 hue 拉回主色的 cohesion pass，只做色域與最低結構對比保護
- 完整三色的「不同氣氛」不再使用微小 H/C/L 位移，改為從 Atlas 轉譯真正不同的方向
- 使用者已選的顏色與 lock 規則仍然保持，不因追求驚艷而偷偷改動

## V2.7.1 Lazy Atlas

Inspiration Atlas 仍會被 Service Worker 預先快取供離線使用，但不再在 Compose 首頁 eager 執行。只有進入 Inspire 時才載入 30 組關係原型，避免推薦資料庫擴充拖慢首屏。

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

目前 cache generation：`color-lab-v2210-color-relationship-map`

## Quality Gates

每次 main 更新會自動執行：

### Deploy Color Lab

1. static verification
2. algorithm torture tests
3. fast-check property-based tests
4. Playwright Chromium 行動版 E2E
5. axe-core serious / critical accessibility gate
6. 部署前 Screenshot Regression：本次畫面與目前正式站做像素差異檢查
7. GitHub Pages deploy

### Color Lab Quality

- Lighthouse Performance
- Lighthouse Accessibility
- Lighthouse Best Practices
- Pull Request / manual run 會額外執行 Playwright + axe-core
- Playwright trace、失敗 screenshot、visual diff 與 Lighthouse 報告保存為 GitHub Actions artifact

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
