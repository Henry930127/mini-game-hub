# Mini Game Hub

Mini Game Hub 是使用 Vue 3 與 Firebase 製作的小型線上遊戲平台。玩家可以註冊帳號、遊玩遊戲、提交成績及查看排行榜；管理員可以管理玩家、成績、遊戲內容與公告。

## 線上網站

- 網站：https://mini-game-hub-0127.web.app
- 管理員登入：https://mini-game-hub-0127.web.app/admin/login
- Firebase Project ID：`mini-game-hub-0127`

## 功能

### 玩家功能

- Email／Password 註冊與登入
- 遊玩五款小遊戲
- 提交遊戲成績
- 查看各遊戲排行榜
- 查看個人統計與歷史紀錄
- 查看平台公告

### 管理員功能

- Dashboard 統計摘要
- 查看玩家列表
- 查看及刪除成績
- 編輯遊戲顯示內容與規則
- 新增、編輯、啟用、停用及刪除公告

### 遊戲列表

| 遊戲 | 說明 |
|---|---|
| Reaction Test | 測試玩家反應速度 |
| Catch Items | 接住掉落物品以獲得分數 |
| Snake | 經典貪食蛇遊戲 |
| Bee Shooter | 小蜜蜂射擊遊戲 |
| Wordle | 五字母英文單字猜謎 |

## Production 架構

本專案目前採用 Firebase 無自建伺服器架構：

```text
Browser
  └─ Vue 3 application
       ├─ Firebase Authentication
       ├─ Cloud Firestore
       └─ Firestore Security Rules

Firebase Hosting
  └─ frontend/dist
```

| 功能 | 使用服務 |
|---|---|
| 前端框架 | Vue 3、Vue Router、Vite |
| 網站託管 | Firebase Hosting |
| 帳號註冊與登入 | Firebase Authentication |
| 資料儲存 | Cloud Firestore |
| 使用者與管理員授權 | Firestore Security Rules |

Production 不會啟動 Express Server，也不會連接 MySQL。Repository 內的 `backend/` 是遷移前的 Express + MySQL 舊版程式碼，僅保留作為參考，不會被 Firebase 部署或執行。

## Firestore 資料模型

### `users/{uid}`

使用 Firebase Authentication UID 作為 Document ID。

| 欄位 | 說明 |
|---|---|
| `id` | Firebase Authentication UID |
| `username` | 使用者名稱 |
| `email` | Email |
| `role` | `player` 或 `admin` |
| `created_at` | 建立時間 |

### `games/{gameId}`

儲存管理員編輯的遊戲顯示內容。若沒有對應文件，網站會使用前端內建的預設遊戲資料。

| 欄位 | 說明 |
|---|---|
| `id` | 遊戲數字 ID |
| `display_name` | 顯示名稱 |
| `short_description` | 簡短介紹 |
| `instructions` | 操作說明 |
| `rules_text` | 遊戲規則 |
| `updated_at` | 更新時間 |

### `scores/{scoreId}`

| 欄位 | 說明 |
|---|---|
| `user_id` | 玩家 UID |
| `username` | 玩家名稱 |
| `game_id` | 遊戲 ID |
| `game_name` | 遊戲名稱 |
| `slug` | 遊戲路由識別碼 |
| `score` | 分數 |
| `created_at` | 建立時間 |

### `announcements/{announcementId}`

| 欄位 | 說明 |
|---|---|
| `title` | 公告標題 |
| `content` | 公告內容 |
| `is_active` | 是否在前台顯示 |
| `created_by` | 建立者 UID |
| `updated_by` | 最後更新者 UID |
| `created_at` | 建立時間 |
| `updated_at` | 更新時間 |

## 權限設計

`firestore.rules` 主要限制如下：

- 使用者只能建立及讀取自己的帳號資料。
- 一般使用者不能自行將 `role` 改成 `admin`。
- 登入者只能使用自己的 UID 提交成績。
- 所有人可以讀取遊戲、排行榜與已啟用公告。
- 只有管理員可以管理遊戲、公告及刪除成績。

## 專案結構

```text
mini-game-hub/
├─ frontend/                  # Vue 3 application
│  ├─ src/
│  │  ├─ api/                # Firestore / Authentication 資料存取
│  │  ├─ components/         # 共用元件與遊戲元件
│  │  ├─ data/               # 遊戲預設資料
│  │  ├─ router/             # Vue Router
│  │  ├─ views/              # 頁面
│  │  └─ firebase.js         # Firebase SDK 初始化
│  ├─ .env.example           # Firebase 環境變數範例
│  └─ package.json
├─ backend/                   # 遷移前的 Express + MySQL 舊版程式碼
├─ firebase.json             # Hosting、Auth、Firestore 部署設定
├─ firestore.rules           # Firestore Security Rules
├─ firestore.indexes.json    # Firestore Indexes
└─ .firebaserc               # Firebase Project 綁定
```

## 本機開發

### 需求

- Node.js 20 或更新版本
- npm
- Firebase CLI

### 安裝

```bash
git clone https://github.com/Henry930127/mini-game-hub.git
cd mini-game-hub/frontend
npm install
```

### Firebase 環境變數

將 `frontend/.env.example` 複製為 `frontend/.env`，填入 Firebase Web App 設定：

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

`frontend/.env` 已被 Git 忽略，不會提交至 Repository。

### 啟動

```bash
cd frontend
npm run dev
```

Vite 預設開發網址為 `http://localhost:5173`。

## 建置與部署

### 建置

```bash
cd frontend
npm run build
```

建置結果會輸出至 `frontend/dist`。

### 部署 Firebase

```bash
firebase login
firebase deploy
```

`firebase deploy` 會部署：

- Email／Password Authentication provider
- Firestore Security Rules
- Firestore Indexes
- Firebase Hosting 網站

## 設定管理員

基於安全考量，前台不能自行建立管理員。

1. 在網站註冊帳號。
2. 開啟 Firebase Console。
3. 前往 Firestore Database → `users`。
4. 找到該帳號 UID 的文件。
5. 將 `role` 從 `player` 改為 `admin`。
6. 回到網站登出。
7. 前往 `/admin/login`，使用相同 Email 與密碼重新登入。

## 免費方案說明

本專案使用 Firebase Spark 免費方案可使用的 Hosting、Authentication 與 Firestore 額度，不使用 Cloud Run、Cloud Functions 或 Cloud SQL。

目前 Firestore `(default)` database：

- Edition：Standard
- Location：`nam5`
- Free tier：啟用

若未來資料量或流量超過 Spark 免費額度，Firebase 可能暫停對應服務，或需要升級至 Blaze 計費方案。

## 注意事項

- 舊 MySQL 帳號、分數及公告不會自動出現在 Firestore。
- 舊使用者需要在 Firebase 版本重新註冊。
- `backend/` 的修改不會影響正式 Firebase 網站。
- 排行榜與個人統計目前在前端計算，適合小型作品與低資料量情境。
- 純前端遊戲無法完全防止竄改成績；若需要可信任的伺服器驗證，需加入 Cloud Functions 或其他後端服務。
