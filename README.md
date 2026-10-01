# Color Lab

手機優先、Local-first、零後端的私人配色實驗室。

**目前版本：V2.40.0**

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

## V2.40.0 Inspire Action Lifecycle Hardening

這一版延續 V2.38 的 render scheduling hardening，把仍繞過 scheduler 的 Inspire 互動收進同一套 route-aware async boundary：

- 新增 `inspirationRouteActive()`，集中判斷目前是否仍停留在 Inspire
- 新增 `runInspirationAction()`；上一批 / 下一批推薦在 lazy resources resolve 後會再次檢查 route 與 render token
- 使用者在資源載入途中切到 Compose / Photo / Library，舊 action 不再改 recommendation batch state，也不背景 render
- 開啟 / 關閉個人化與重置偏好不再直接 `ensureInspirationResources().then(render...)`，改走既有 coalesced secondary scheduler
- stale action 的錯誤也不會在使用者離開 Inspire 後跳出過期 toast
- 推薦公式、排序、候選內容、75 / 18 / 7、source palette 與 Local-first 契約完全不變
- Chromium / WebKit regression 覆蓋 delayed Inspire action + route invalidation
- 不新增後端、登入、Supabase、AI、付費 API 或網路依賴

## V2.39.0 Photo Load Lifecycle Hardening

這一版不改照片分析演算法，專門修正快速換圖與 Blob URL 生命週期的競態：

- 每次照片載入都有獨立 token、Image 與 Object URL ownership；新請求會先取消舊請求
- 舊圖片即使晚到 onload / onerror，也必須通過 current-request guard，不能覆蓋較新的照片
- 成功、失敗、被取代與 pagehide 都會集中釋放 request-local Object URL，避免長時間使用後累積 Blob URL
- 成功解碼後不再用 Blob URL 是否存在判斷照片狀態；改用 `photoLoaded` + 本機 canvas，讓 Reference Board 仍能安全使用已載入照片
- 載入新照片失敗時，不會因舊 callback 誤清除新請求，也不會改寫 Compose source palette
- Chromium regression 模擬 stale callback / rapid replacement；WebKit regression 驗證實際 SVG decode 後 URL 已釋放、canvas 照片仍可用
- Size / Verify / Visual / Torture / Property / Playwright + axe / Lighthouse / CodeQL 門檻維持不變
- 不新增後端、登入、Supabase、AI、付費 API 或新的網路依賴

## V2.38.0 Render Scheduling Hardening

這一版不增加新功能，專門處理快速切換與啟動階段可能造成的重複重型 render：

- Deep Dive 的 visible-section render 改為單一 animation-frame coalescing；同一 frame 內多次觸發只計算一次
- Compose startup / Deep Dive restore / tab switch 即使同時要求更新，也只保留最新可見 section 的工作
- Inspire secondary render 增加單一 pending idle task，快速重複切頁不再排出多個重型 callback
- 每次 tab route 變更都會推進 render token；離開 Inspire 後尚未完成的 lazy promise 會被視為 stale，不再背景更新隱藏頁面
- promise resolve / reject 都重新確認 token 與目前 active route，避免切頁後出現隱藏 render 或過期錯誤 toast
- 不改推薦公式、排序、候選內容、Deep Dive UI、source palette 或 75 / 18 / 7
- Chromium 與 WebKit regression 覆蓋 rapid route switching、stale async invalidation、Deep Dive frame coalescing
- Size / Verify / Visual / Torture / Property / Playwright + axe / Lighthouse / CodeQL 門檻全部維持原值
- 不新增後端、登入、Supabase、AI 或付費 API

## V2.37.0 Color Quality Architecture

這一版延續架構硬化，不增加配色功能，也不改任何既有判斷公式：

- 將共用色彩數學、OKLCH / gamut、contrast、relation vector 與 generated-palette quality guards 從 `index.html` 移到 `core/color-quality.js`
- core 以本機 classic script 在 `palette-tools.js` 之前載入，讓 Accessibility、Context、Photo、Inspire 與 Compose 共用單一實作
- 完整三色仍原樣保留；`qualityRefineGenerated(..., 3)` 不改色、不重排，Base / Structure / Accent 與 75 / 18 / 7 契約不變
- core 不讀寫 localStorage / IndexedDB、不發網路請求，也不持有 `selectedColors` / `palette` 狀態
- Service Worker 預快取 core，離線與 PWA 更新仍維持同一版本世代
- 既有 `runtime/` 140 KiB budget 完全不放寬；新增獨立 16 KiB core module budget，並把 core 納入既有 440 KiB aggregate gate
- Torture / Property / Chromium E2E / WebKit 都新增或調整為直接驗證抽離後的同一套品質函式
- 不新增後端、登入、Supabase、AI 或付費 API

## V2.36.0 Recommendation Architecture

這一版不改推薦公式、排序或 UI，專門把 Inspire 最大的責任群從主檔移出並延後載入：

- 將 Atlas archetype、diversity selection、recommendation batch/history、推薦說明與推薦卡 render 從 `index.html` 移到 `data/recommendation-engine.js`
- `index.html` 約從 230 KB 降到 213 KB，保留更多主檔 budget 與後續維護空間
- Recommendation Engine 不列入 eager runtime；只有進入 Inspire、原本就載入 Atlas / Fashion / IG / Tone references 時才一起載入
- Compose 頁面首屏不注入、不解析、不執行 recommendation-engine；Service Worker 仍可在背景預快取它，確保離線進入 Inspire 可用
- 新 lazy engine 納入既有 112 KiB intelligence budget，沒有放寬 140 KiB runtime modules budget
- Service Worker 預先快取 recommendation engine，因此離線進入 Inspire 仍可使用
- exact source colors、75 / 18 / 7、Aesthetic Gate、Tonal Cohesion、anti-repeat、personal preference ranking 與推薦批次語意全部保持不變
- 不新增後端、API、依賴或資料格式

## V2.35.0 PWA / iPhone Update Hardening

這一版不新增配色能力，專門處理安裝到主畫面後最容易出問題的「版本更新中途接管」：

- Service Worker 不再在 install 階段自動 `skipWaiting()`，避免使用中的舊頁面突然被新版 worker 接管
- 偵測到 waiting worker 時才顯示「新版已準備好」，不增加永久狀態列或首屏噪音
- 使用者按「更新」後會先保存目前 draft 與 IndexedDB resilience snapshot，再要求新 worker 啟用
- `controllerchange` 只在使用者主動更新後 reload 一次，避免 reload loop
- 離線時顯示輕量「離線使用中」狀態；恢復連線後會重新檢查更新
- App 回到前景與 pageshow 時會節流檢查更新，不會每次互動都發出 update request
- 新增 PWA runtime / stylesheet 並加入離線快取；仍維持 Local-first、零後端與零付費 API
- 保留 V2.30 的 network-first code asset + offline fallback，因此更新確認前仍可安全使用舊版，確認後才切換整個 runtime 世代
- 此版本強化 Safari / PWA 更新安全，但仍不宣稱等同真實 iPhone 實機驗收

## V2.34.0 WebKit / Safari Compatibility Gate

這一版不增加產品功能，先把 iPhone Safari 類風險納入自動驗收：

- GitHub Actions 新增獨立 WebKit job，不取代既有 Chromium / axe / Lighthouse / CodeQL
- 使用 390 × 844、touch、mobile WebKit 設定模擬手機 Safari 類執行環境
- 核心 Gate 驗證 Compose 啟動、75 / 18 / 7、Corner Fan 導航
- 驗證 exact Base / Structure / Accent 在 Deep Dive 操作後不被改寫，並驗證 accordion section 本機記憶
- 驗證 LocalStorage 收藏跨 reload 保留 exact palette
- 驗證 Share Snapshot hash 可在 WebKit 還原 exact 三色與 context / theme
- 驗證本機圖片 Blob → Image → Canvas → cluster analysis 路徑可在 WebKit 執行
- WebKit 報告與 failure artifacts 獨立保存 7 天
- 此 Gate 是 Safari 類相容性自動測試，**不宣稱等同真實 iPhone Safari / PWA 實機驗收**

## V2.33.0 Photo Analysis Architecture

延續架構瘦身，不新增照片功能，也不改任何取色/配色演算法：

- 將 `photoCompositionProfile` 與 `photoCurrentRelationship` 從 `index.html` 移入既有 `runtime/photo-palette.js`
- 兩個 helper 都是純分析函式：只讀 clusters / roles / current palette，不寫回 source colors
- `index.html` 再縮小約 2.6 KB，降低單檔耦合並增加 235 KiB 預算餘裕
- Photo palette strategy、取色、區域分析、75 / 18 / 7 套用行為與 UI 完全不變
- runtime module budget 仍維持 140 KiB，不調高門檻
- PWA 離線與 Service Worker asset path 不變，僅更新 cache version

## V2.32.0 Storage Architecture / Performance Hardening

這一版不改產品功能，專門把 Local-first 的資料層邊界做乾淨：

- `openResilienceDB`、`writeResilienceSnapshot`、`scheduleResilienceBackup`、`restoreResilienceIfNeeded` 全部從 `index.html` 移入既有 `runtime/storage-hardening.js`
- Backup import、localStorage 安全讀寫、rollback transaction 與 IndexedDB shadow recovery 現在集中在同一個 storage runtime
- `index.html` 減少約 5 KB 持久化實作，降低主檔耦合並保留更多後續版本空間
- classic-script runtime 只在實際呼叫時解析 UI / palette / project helpers，因此不新增初始化工作或額外網路依賴
- 保留 V2.30 的 intentional-empty、storage quota rollback、project transaction、Backup V1–V5 相容與 IndexedDB recovery 行為
- 不修改 palette engine、source colors、75 / 18 / 7、收藏資料格式、專案資料格式或 UI
- runtime module size budget 持續固定，不靠放寬門檻換取重構通過

## V2.31.0 UX Cleanup

功能不再繼續堆疊，先把已經很強的 Deep Dive 重新整理成手機上更容易理解的資訊架構：

- 「深入理解」拆成三個清楚的 editorial sections：01 理解配色、02 驗證可用性、03 套用情境
- 01 集中 Why / Relationship Map / Tone Explorer / Role Scale；讓「這組為什麼成立」維持第一個閱讀層
- 02 集中 WCAG 可讀性與 Accessibility Vision，避免驗證工具打斷色彩理解流程
- 03 集中 App / Brand / Room / Outfit / Slides、Gradient Studio 與 Custom SVG Preview
- 三個 section 使用 accordion 行為；一次只展開一區，降低手機上超長捲動與「所有功能同時出現」的壓力
- 記住最後使用的 Deep Dive section；下次再次打開仍回到原本工作位置
- hidden section 不再由一般 palette render 背景重算；只 render 當下可見區段
- 保留 Role Scale、Gradient、Custom SVG 各自的第二層 disclosure，不把專業功能推回首屏
- 不修改 palette engine、source colors、75 / 18 / 7、收藏、備份、專案或 export semantics
- 視覺維持低框線、紙張感與 editorial hierarchy，不新增 Bottom Tabs、glass cards 或大面積 pills

## V2.30.0 Stability / Storage Hardening

這一版不增加新的配色玩法，優先處理 Local-first App 真正可能造成資料不可靠或更新不一致的問題：

- 新增獨立 `storage-hardening.js`，所有關鍵 localStorage 操作都有安全讀寫與失敗回報，不讓 Safari / PWA 儲存限制直接中斷 UI
- 收藏、重新命名、標籤、分類、置頂、專案指派等關鍵變更只有在本機寫入成功後才顯示成功狀態
- 刪除 Local Project 改成 rollback-safe transaction：project metadata 與 palette assignment 要嘛一起成功，要嘛一起回復
- Backup 匯入改成 rollback-safe transaction；任何 localStorage 寫入失敗都取消整次匯入，避免 projects / palettes / preference 只寫入一半
- Resilience restore 現在區分「key 不存在 / 損壞」與「使用者刻意保存空陣列」；合法的空收藏不會再被舊 IndexedDB shadow 復活
- Local Projects 的損壞 JSON 會被視為可恢復狀態；合法空專案仍被尊重
- App 啟動時的 preview theme、library sort、candidate mode、last tab 等偏好改成安全讀取，即使 localStorage 被瀏覽器限制也能以預設值啟動
- Service Worker 對 JS / CSS / runtime / data / vendor 改採 network-first + cache fallback：在線時優先拿最新程式，離線時仍使用快取，降低新 HTML 搭到舊 runtime 的更新競態
- IndexedDB resilience、PWA offline、exact source color、75 / 18 / 7 與零後端契約全部保留

## V2.29.0 Cross-platform Handoff

Professional Handoff 再補三個常用開發平台格式，但維持同一個 exact source contract：

- 「更多格式」新增 SCSS、Flutter、Jetpack Compose；不增加首頁或主導航資訊密度
- SCSS 輸出 `$color-base` / `$color-structure` / `$color-accent`，並保留 75 / 18 / 7 語意註解
- Flutter 輸出可直接使用的 Dart `Color(0xFFRRGGBB)` 常數
- Jetpack Compose 輸出 Kotlin `Color(0xFFRRGGBB)` 常數
- 三個格式都直接從 `paletteArtifactBase()` 取得 Base / Structure / Accent，不經 Dark、CVD、Gradient、Tone Explorer 或 Accessibility preview
- 檔名沿用既有 palette name sanitizer；支援 Web Share file，不支援時仍回退本機下載
- 不新增 SDK、套件、後端、網路請求或付費 API

## V2.28.0 Gradient Studio

補上常見配色工具的 Gradient 能力，但維持 Color Lab 的三角色契約，不把產品變成另一個泛用漸層產生器：

- Compose「深入理解」新增第二層 Gradient Studio，不增加主導航或首屏資訊密度
- 所有 gradient 都從 `paletteArtifactBase()` 讀取目前 exact Base / Structure / Accent
- 提供 Base → Structure、Base → Accent、Structure → Accent 與三角色四種受控組合
- 提供 0° / 45° / 90° / 135° 四種常用線性方向，不加入無限 slider 或不必要控制
- 三角色模式使用 Base 0% / Structure 50% / Accent 100% 作為衍生視覺路徑，明確不宣稱等於 75 / 18 / 7 面積比例
- 可直接複製可用的 CSS `background: linear-gradient(...)`
- Gradient 預覽、配對、方向與 CSS 複製都不寫回 Compose、不改收藏、不改 Photo、不影響 Professional Export
- 只記住本機的 gradient pair / angle UI 偏好，不保存新的色彩資料
- runtime / stylesheet 完全本機並加入 PWA offline cache，不新增後端、CDN 或付費 API

## V2.27.0 Reference / Moodboard Export

把 Color Lab 的照片、三色關係與 Tone Family 整理成可以直接交付或放進提案的 Reference Board：

- 「更多格式」新增 Reference Board，不增加主導航或 Compose 首屏資訊密度
- 輸出為 1600 × 1200 PNG，適合品牌、室內、穿搭與簡報 moodboard / reference handoff
- Board 永遠從 `paletteArtifactBase()` 讀取 exact Base / Structure / Accent，不使用 Dark、色覺模擬、Tone Explorer 或 Accessibility preview
- 三色以 75 / 18 / 7 比例與 Base / Structure / Accent 語意呈現，並標示 exact HEX
- 自動判斷目前 Tone Family，輸出前按需載入既有本機 Tone Family 資料，不新增網路 API
- 如果目前 session 已載入照片，Board 會直接從本機 `photoCanvas` 取用照片；沒有照片時改用大型 75 / 18 / 7 composition
- 照片只作為輸出參考，不會被上傳、保存到專案或寫進 palette source
- 支援 Web Share file；不支援時回退下載 PNG
- runtime 完全本機並加入 Service Worker offline cache

## V2.26.0 Local Projects / Collections

Library 從單純收藏清單升級成可對應真實工作的本機專案層，同時保留原本 tags / folder：

- 新增 Project chips：全部、未歸類與各本機專案，直接顯示各自配色數量
- 可建立、重新命名、刪除專案；刪除專案只會解除配色歸屬，不會刪除任何收藏
- 收藏的「更多操作」新增「移動專案」，使用本機 action sheet 選擇專案，不需要帳號或雲端
- projectId 與 palette 分離；Base / Structure / Accent、75 / 18 / 7、排序與原色契約完全不變
- 既有 folder 繼續作為專案內次級分類，tags 繼續作為跨專案標籤，不強迫舊資料遷移
- Library 搜尋同時支援專案名稱，Project / folder / tag 三層可以交叉篩選
- Backup 升級為 V5，會攜帶 local projects；仍相容 V1–V4 匯入
- Backup 匯入遇到 project ID 衝突時會安全 remap，不會把配色錯放到另一個同 ID 專案
- IndexedDB resilience shadow 同步保存 project metadata，localStorage 意外清空時可一起恢復
- 完全 Local-first：專案資料只存在 localStorage / IndexedDB，不新增後端、登入或付費 API

## V2.25.0 Accessibility Vision 2.0

把既有紅色弱 / 綠色弱 / 藍色弱近似模擬從「只看三個轉換後色塊」提升成可用的設計判斷工具：

- 保留既有 Protan / Deutan / Tritan 近似矩陣，明確標示為設計模擬，不宣稱醫療或臨床診斷
- 每個模式會分析 Base ↔ Structure、Base ↔ Accent、Structure ↔ Accent 三組角色的 OKLCH 感知分離
- 以 Color Lab 內部門檻分成「可辨識 / 差異偏低 / 容易混淆」，並直接顯示每組 Δ 值與門檻說明
- 色覺模式同步套用到 App / Brand / Room / Outfit / Slides 五種 Context Preview；只改預覽，不改來源 HEX
- Light / Dark Context Preview 仍先依原邏輯衍生，再套色覺模擬；Dark 變體與色覺模擬都不會寫回 Compose
- 對「差異偏低 / 容易混淆」關係提供最小修正方向，優先修改較小比例角色並只搜尋 OKLCH Lightness
- 若只調 Lightness 仍無法建立足夠分離，才使用受控的小幅 Hue / Chroma 搜尋
- 修正先顯示 preview-only 75 / 18 / 7 模擬結果；只有明確按「套用建議」才更新 Compose，且鎖定角色仍受保護
- runtime / stylesheet 完全本機並加入 PWA offline cache，不新增外部服務

## V2.24.0 Custom Design Preview

把固定情境預覽再往使用者自己的作品推進，同時維持 Local-first 與來源色不被偷偷修改：

- Compose「深入理解」新增「你的 SVG 設計」，接受本機 flat-color SVG，不新增主導航
- SVG 完全在瀏覽器本機解析；檔案大小上限 1 MB、元件上限 2,500，避免大型檔案拖垮手機
- 載入時會移除 script、事件 handler、外部資源、style 中的不安全宣告與非白名單 SVG 元素
- 只辨識可安全處理的 flat fill / stroke；gradient、外部 image、filter 等複雜內容不會被當作可換色來源
- 依出現次數列出來源色，預設把前三個 flat colors 對應 Base / Structure / Accent，其餘維持原色
- 每個來源色都可手動切換為「保留原色 / Base 75% / Structure 18% / Accent 7%」
- 套色預覽永遠讀取目前 Compose exact source colors，不使用 Dark Preview、Role Scale derived colors 或 Accessibility 建議色
- 上傳、切換 mapping、預覽與輸出都不會回寫 Compose、收藏、Photo 或偏好模型
- 可輸出安全清洗後、已套用目前三色的 SVG；不支援 Web Share 時回退本機下載
- runtime / stylesheet 都是本機檔案並加入 Service Worker offline cache，沒有後端或第三方 SVG 服務

## V2.23.0 Shareable Snapshot

補上跨裝置與對外分享，但不引入帳號、後端或追蹤：

- 分享連結使用 URL fragment（`#clv=1&cl=...`），依序保存 exact Base / Structure / Accent，瀏覽器不會把 fragment 傳給伺服器
- Snapshot 額外保存目前 Context（App / Brand / Room / Outfit / Slides）與 Light / Dark 預覽狀態
- 開啟分享連結時會在 initial render 前還原三個來源色，順序固定為 Color 1 → Base、Color 2 → Structure、Color 3 → Accent
- 分享不攜帶收藏、照片、偏好模型、最近用色、備份資料或帳號資訊
- 原本「分享」按鈕改為打開 Share Snapshot 面板，可複製可還原 URL 或使用系統分享
- QR Code 完全在瀏覽器本機產生；使用 MIT 授權 qrcodejs，vendored 到 `vendor/qrcode.min.js`，不呼叫第三方 QR API
- QR runtime 只有實際打開分享面板時才 lazy load，並加入 PWA offline cache
- qrcodejs 約 19.9 KB 已正式納入 lazy interaction Size Budget，沒有調高既有 110 KiB 或 440 KiB 門檻
- 為維持 235 KiB `index.html` hard budget，既有 Learning Concepts 搬到 `runtime/color-relationship.js`；產品行為不變

## V2.22.0 Role Scale / Tonal System

把三個原色延伸成真正可用於產品介面與品牌系統的色階，同時維持 Color Lab 最重要的 source-color 契約：

- Base / Structure / Accent 各自產生 50–900 共 10 階的 derived tonal ladder
- 使用者目前 exact HEX 依其 OKLCH Lightness 找到最合理的 anchor stop，該 stop 直接保留原色，不重新計算
- anchor 上下的色階只調整 OKLCH Lightness 與逐步 chroma restraint，再經既有 sRGB gamut mapping
- 每個角色永遠只有一個 exact-source anchor；Derived scale 不會回寫 Compose、收藏、Photo 或 Professional Export
- 額外提供 Surface subtle / Surface / Border / Text / CTA / CTA hover 的建議 token mapping，讓三色更容易進入真實 UI
- Role Scale 收在「深入理解」裡的第二層 disclosure，不增加首頁資訊密度
- 可複製完整 Role Scale CSS，並另外輸出 `--color-base-source` / `structure-source` / `accent-source`，明確區分原色與衍生色
- runtime / stylesheet 完全本機並加入 Service Worker offline cache

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

Backup V5 會攜帶本機 Projects、偏好模型與個人化開關，同時保留 V1 / V2 / V3 / V4 匯入相容性。

## PWA / Offline

Service Worker 採用：

- navigation：network-first + offline fallback
- same-origin static assets：cache-first
- 所有 runtime 資源均為本地檔案
- 無 CDN runtime dependency

目前 cache generation：`color-lab-v2260-local-projects`

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
