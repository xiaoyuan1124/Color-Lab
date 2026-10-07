# Color Lab v1.0 — 最後上架交接

更新：2026-10-08（台灣時間）

## 可直接使用的交付內容

| 項目 | 來源／用途 |
| --- | --- |
| 版本與商店文案 | `app-store/submission.v1.0.json` 是唯一正式草稿來源 |
| 繁中說明 | `docs/APP_STORE_METADATA_ZH_HANT.md` |
| 隱私政策 | https://xiaoyuan1124.github.io/Color-Lab/privacy.html |
| 本機原生專案 | `npm run ios:init`；生成 `ios/App/App.xcodeproj` |
| iOS 驗證與專案下載 | Actions → Color Lab iOS Native → `color-lab-ios-native` artifact |
| 商店截圖 | Actions → Color Lab App Store Screenshots → `color-lab-app-store-screenshots-6.9` artifact；6 張 1320×2868 PNG |
| AppIcon | `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`；1024×1024，無 alpha |
| 第三方授權 | `THIRD_PARTY_NOTICES.md` 與 `vendor/*.LICENSE.txt`；native bundle 一併保留 |
| 真正部署的 commit | 正式站 `deploy-info.json` 中的 `sha` 必須等於欲驗收的 main SHA |

Native 與截圖 workflow 現在也在 main push 執行；合併後必須確認新的 main 結果，不能用 PR 結果代替。
Artifact 有保存期限，過期時重新執行對應 workflow。Simulator 截圖只證明 smoke 啟動；商店截圖目前是 Chromium 生成草稿，正式提交前仍需以 signed native build 核對外觀與功能。

## 帳號持有人一次提供／確認

| 必要資料 | 目前值 | 處理方式 |
| --- | --- | --- |
| 公開客服聯絡方式 | 未提供 | 提供可公開的 Email／其他實際聯絡管道後建立 Support 頁；隱私政策同步使用它 |
| App Review 聯絡人 | 未提供 | 姓名、Email、電話；直接填 Connect，私人資料勿 commit 至公開 repo |
| Copyright | 未確認 | 確认 App Store 上使用的權利人名稱 |
| Content Rights | 未確認 | 檢閱本次授權盤點、原創程式／資料／圖示來源後回答 |
| DSA | 未確認 | 依帳號實際法律與商業狀態選擇；不能由程式推測 |
| Apple Team／會員 | 未讀取 | 已有上架帳號應先確認現有有效會員，避免重複繳費 |

JSON 中的五項外部 blocker 保持明確：metadata validator 通過表示草稿結構有效，**不代表具備提交資格**。

## iPhone 真機驗收表

請記錄 signed build 的 source SHA、版本／build、iPhone 型號及 iOS 版本。每列保留「未驗證」直到有實際證據；Simulator 與 Chromium/axe 不代替真機。

| 驗收 | 操作與通過條件 | 結果 |
| --- | --- | --- |
| 離線首次啟動 | 飛航模式開啟，Compose、75/18/7 與 Corner Fan 正常 | 未驗證 |
| 原始三色 | 依序輸入 `#E7DCC8`、`#274C55`、`#C65338`；衍生預覽後仍保持值與順序 | 未驗證 |
| 前後景持久化 | 背景／恢復 App、重啟後草稿、收藏與專案仍存在 | 未驗證 |
| 相機允許／拒絕 | 允許後可取色；拒絕時可返回並從相簿或手動輸入繼續 | 未驗證 |
| 相簿與取消 | 選圖能在裝置取色；取消選圖不覆寫 source | 未驗證 |
| Safe area／鍵盤 | Dynamic Island、底部手勢、鍵盤與旋轉不遮住必要操作 | 未驗證 |
| 剪貼簿 | Copy CSS／P3 CSS 能貼至其他 App 且保持 source 順序 | 未驗證 |
| 檔案與分享 | PNG／SVG／JSON 可匯出至檔案或系統分享；取消不破壞資料 | 未驗證 |
| 匯入／復原 | SVG／JSON 備份讀取正常，直到 Apply 才改 source；無效檔案有提示 | 未驗證 |
| P3 | 能力偵測與 sRGB fallback 文案符合該裝置 | 未驗證 |
| 導航 | Corner Fan 四視圖可切換／關閉，返回後資料保留 | 未驗證 |
| 無障礙 | VoiceOver 實際朗讀與焦點、較大文字、Reduce Motion、深色模式可操作 | 未驗證 |
| 權限與隱私 | 首次啟動不無故請求照片／相機；無分析／追蹤請求 | 未驗證 |

## 簽章與上傳的既定操作順序（尚未執行）

1. 核對最終 main SHA、五套 CI（Quality／CodeQL／iOS Native／Screenshots／Pages）及 `deploy-info.json`。
2. 確認會員／Team 已有效，並再次核對獨立 Bundle ID `com.sy1124.colorlab`。
3. 經正式 Apple 操作授權後建立／核對 App ID 與 Connect record；不得使用其他 App 的 ID。
4. 在 Mac／Xcode 26+ 開啟本專案，選擇正確 Team 與簽章。首次設定不得自動增加無關 capability。
5. 對 iPhone 安裝 signed build，完成上表；記錄所有失敗與修正，不把未測列標示 PASS。
6. 以同一 source SHA Archive，檢查 1.0.0／唯一 build number、Privacy manifest、權限、AppIcon、授權、iPhone target。
7. 驗證 Archive 後，經上傳授權送至 App Store Connect／TestFlight；憑證與 API key 留在安全帳號／Secrets，勿放 repo。
8. 同一 TestFlight build 再驗收；填真實聯絡／權利／DSA、App Privacy、age rating、Free pricing 及文案。
9. 商店截圖對照實際 native build；檢查 Support／Privacy URL 可開且有聯絡方式。確認人工發布設定後才送審。

這份交接不會登入 Apple、購買會員、建立 production record、簽章或上傳。

## 首版 What's New 草稿

「Color Lab 正式登場：從三色 75 / 18 / 7 開始，完成取色、配色理解、對比驗證、情境預覽與匯出交付。收藏與專案保存在你的裝置上，不需登入。」

Apple 首版若不顯示 What's New 欄位，留作發行說明，不填入其他無關欄位。
