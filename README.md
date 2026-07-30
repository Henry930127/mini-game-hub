# Mini Game Hub

Mini Game Hub 是一個小型遊戲平台，玩家可以在線體驗多款簡單遊戲、提交分數並與其他玩家競爭排行榜。本系統同時提供後台管理系統，用於管理玩家、遊戲內容、分數紀錄以及平台公告。

---

# 專案簡介

Mini Game Hub 是一個包含 **前台遊戲平台** 與 **後台管理系統** 的 Web 應用。

玩家可以：
- 註冊與登入帳號
- 遊玩多款小遊戲
- 提交遊戲成績
- 查看排行榜
- 查看最新公告
- 查看個人成績紀錄

管理員可以透過後台：
- 管理玩家帳號
- 管理遊戲資料
- 管理分數紀錄
- 發布平台公告

---

# 系統功能

## 會員系統

- 使用者註冊
- 使用者登入
- 個人資料頁
- 個人成績紀錄

---

## 遊戲系統

目前包含以下遊戲：

| 遊戲名稱 | 說明 |
|------|------|
| Reaction Test | 測試玩家反應速度 |
| Catch Items | 接住掉落的物品獲得分數 |
| Snake | 經典貪食蛇遊戲 |
| Bee Shooter | 小蜜蜂射擊遊戲 |
| Wordle | 猜單字遊戲 |

功能包含：

- 遊戲詳情頁
- 遊戲操作說明
- 遊戲排行榜
- 成績提交

---

## 排行榜系統

- 各遊戲排行榜
- 玩家成績紀錄
- 排名預覽
- 即時更新排行榜

---

## 公告系統

首頁會顯示最新公告，管理員可以在後台：

- 新增公告
- 編輯公告
- 啟用 / 停用公告
- 刪除公告

---

## 後台管理系統

管理員登入後可以使用後台管理功能：

### Admin Dashboard
提供平台基本統計資訊，例如：

- 玩家數量
- 總遊戲數
- 分數紀錄數
- 最新玩家

---

### 玩家管理

功能：

- 查看所有玩家
- 查看註冊時間
- 管理玩家資料

---

### 分數管理

功能：

- 查看所有遊戲分數
- 查看玩家紀錄
- 刪除分數

---

### 遊戲管理

管理遊戲顯示內容，例如：

- 遊戲名稱
- 遊戲簡短介紹
- 操作說明
- 遊戲規則

修改後會即時反映在前台。

---

### 公告管理

管理首頁公告：

- 新增公告
- 編輯公告
- 啟用 / 停用公告
- 刪除公告

---

# 技術架構

## Frontend

- Vue 3
- Vue Router
- Firebase Web SDK
- CSS

---

## Firebase Services

- Firebase Authentication：Email / Password 註冊與登入
- Cloud Firestore：使用者、遊戲、分數與公告資料
- Firestore Security Rules：使用者與管理員權限控制
- Firebase Hosting：Vue SPA 靜態網站與路由 rewrite

---

## Production Backend

正式環境沒有另外部署 Express Server。瀏覽器透過 Firebase Web SDK 直接使用：

- Firebase Authentication 處理帳號密碼與登入狀態
- Cloud Firestore 處理資料讀寫
- Firestore Security Rules 在伺服器端驗證資料存取權限

Repository 中的 `backend/` 是遷移前的 Express + MySQL 舊版實作，僅供參考，
Firebase production 網站不會執行或部署該目錄。

---

## Firestore 資料設計

系統主要包含以下四個 Collections：

### users
Document ID 使用 Firebase Authentication UID，並透過 `role` 區分玩家與管理員。

| 欄位 | 說明 |
|------|------|
| id | Firebase Authentication UID |
| username | 使用者名稱 |
| email | Email |
| role | 使用者角色（player / admin） |
| created_at | 建立時間 |

---

### games
儲存管理員覆寫的遊戲顯示內容；沒有 Firestore 資料時會使用前端內建遊戲資料。

| 欄位 | 說明 |
|------|------|
| id | 遊戲 ID |
| name | 系統內部名稱 |
| slug | 路由識別碼 |
| description | 基本描述 |
| display_name | 前端顯示名稱 |
| short_description | 簡短介紹 |
| instructions | 操作提示 |
| rules_text | 規則說明 |

---

### scores
記錄玩家在各遊戲中的分數資料。

| 欄位 | 說明 |
|------|------|
| id | Firestore Document ID |
| user_id | Firebase Authentication UID |
| username | 提交分數時的玩家名稱 |
| game_id | 遊戲 ID |
| game_name | 遊戲名稱 |
| slug | 遊戲路由識別碼 |
| score | 分數 |
| created_at | 建立時間 |

---

### announcements
儲存首頁公告與後台公告管理資料。

| 欄位 | 說明 |
|------|------|
| id | 公告 ID |
| title | 公告標題 |
| content | 公告內容 |
| is_active | 是否啟用 |
| created_by | 建立者 UID |
| updated_by | 最後更新者 UID |
| created_at | 建立時間 |
| updated_at | 更新時間 |

---

# 安裝與執行

## 線上版本

- Production URL：https://mini-game-hub-0127.web.app
- Firebase Project ID：`mini-game-hub-0127`
- Hosting：Firebase Hosting
- Authentication：Email / Password
- Database：Cloud Firestore Standard 免費層
- Firestore Location：`nam5`

正式環境不需要啟動 `backend` 或 MySQL。

## 本機環境設定

將 `frontend/.env.example` 複製為 `frontend/.env`，填入 Firebase Web App 設定：

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

安裝並啟動前端：

```bash
cd frontend
npm install
npm run dev
```

## 部署

```bash
cd frontend
npm run build
cd ..
firebase login
firebase deploy
```

`firebase.json` 會部署 Authentication provider、Firestore Rules、Firestore Indexes
與 `frontend/dist` Hosting 內容。

## 管理員設定

1. 先在網站註冊帳號。
2. 到 Firebase Console → Firestore Database → `users`。
3. 找到該帳號 UID 的文件。
4. 將 `role` 從 `player` 改成 `admin`。
5. 登出後前往 `/admin/login` 重新登入。

管理員登入網址：https://mini-game-hub-0127.web.app/admin/login

一般使用者無法透過網站或 Firestore Client SDK 自行升級權限。

## Clone 專案

```bash
git clone https://github.com/Henry930127/mini-game-hub.git
```

---

# 系統畫面

### 首頁
- 公告
- 熱門遊戲
- 排行榜預覽
- 會員頁面

### 遊戲頁
- 遊戲畫面
- 操作說明
- 排行榜

### 後台管理
- Dashboard
- 玩家管理
- 分數管理
- 遊戲管理
- 公告管理

---
