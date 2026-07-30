# 🎮 Mini Game Hub

Mini Game Hub 是一個小型遊戲平台，玩家可以在線體驗多款簡單遊戲、提交分數並與其他玩家競爭排行榜。本系統同時提供後台管理系統，用於管理玩家、遊戲內容、分數紀錄以及平台公告。

---

# 📌 專案簡介

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

# 🧩 系統功能

## 👤 會員系統

- 使用者註冊
- 使用者登入
- 個人資料頁
- 個人成績紀錄

---

## 🎮 遊戲系統

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

## 🏆 排行榜系統

- 各遊戲排行榜
- 玩家成績紀錄
- 排名預覽
- 即時更新排行榜

---

## 📢 公告系統

首頁會顯示最新公告，管理員可以在後台：

- 新增公告
- 編輯公告
- 啟用 / 停用公告
- 刪除公告

---

## 🛠 後台管理系統

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

# 🏗 技術架構

## Frontend

- Vue 3
- Vue Router
- Axios
- CSS

---

## Backend

- Node.js
- Express.js
- RESTful API

---

## Database

- MySQL

主要資料表：
- users ---> 存取玩家註冊資訊
- games ---->存取遊戲資訊
- scores -----> 存取玩家遊玩紀錄與分數
- announcements ------> 存取公告資料與發佈紀錄


---

## 🗄 資料庫設計

系統主要包含以下四個核心資料表：

### users
儲存所有登入使用者資料，並透過 `role` 欄位區分一般玩家與管理員。

| 欄位 | 說明 |
|------|------|
| id | 使用者 ID |
| username | 使用者名稱 |
| email | Email |
| password | 加密後密碼 |
| role | 使用者角色（player / admin） |
| created_at | 建立時間 |

---

### games
儲存遊戲基本資料與前端顯示內容。

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
| id | 分數紀錄 ID |
| user_id | 玩家 ID（FK -> users.id） |
| game_id | 遊戲 ID（FK -> games.id） |
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
| created_by | 建立者（FK -> users.id） |
| updated_by | 最後更新者（FK -> users.id） |
| created_at | 建立時間 |
| updated_at | 更新時間 |
---

## 🔗 資料表關係

本系統的主要資料表關係如下：

- `users` 1 對多 `scores`
- `games` 1 對多 `scores`
- `users` 與 `games` 透過 `scores` 建立多對多關係
- `users` 1 對多 `announcements`（created_by）
- `users` 1 對多 `announcements`（updated_by）

可簡化表示為：

users (1) ---- (N) scores (N) ---- (1) games

users (1) ---- (N) announcements  [created_by]
users (1) ---- (N) announcements  [updated_by]

---

# ⚙️ 安裝與執行

## 1️⃣ Clone 專案
git clone https://github.com/Henry930127/minigamehub.git
---

## 2️⃣ 安裝後端
- cd backend
- npm install
- 建立 `.env`
  `PORT=5000`
  `DB_HOST=localhost`
  `DB_USER=root`
  `DB_PASSWORD=yourpassword`
  `DB_NAME=minigamehub`
  `JWT_SECRET=your_secret_key`
  `CORS_ORIGIN=http://localhost:5173`
---
啟動後端
- cd backend
- npm run dev
---
## 3️⃣ 安裝前端
- cd frontend
- npm install
- npm run dev

---

# 🌐 系統畫面

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
