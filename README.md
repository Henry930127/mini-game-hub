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

# 🗄 資料庫設計

## users

儲存會員資料

| 欄位 | 說明 |
|-----|------|
| id | 使用者ID |
| username | 使用者名稱 |
| email | 使用者Email |
| password | 密碼 |
| created_at | 註冊時間 |

---

## games

儲存遊戲資料

| 欄位 | 說明 |
|-----|------|
| id | 遊戲ID |
| name | 遊戲名稱 |
| slug | 遊戲識別碼 |
| description | 遊戲介紹 |
| display_name | 前端顯示名稱 |
| short_description | 簡短描述 |
| instructions | 操作說明 |
| rules_text | 遊戲規則 |

---

## scores

儲存玩家遊戲分數

| 欄位 | 說明 |
|-----|------|
| id | 分數ID |
| user_id | 玩家ID |
| game_id | 遊戲ID |
| score | 分數 |
| created_at | 紀錄時間 |

---

## announcements

儲存平台公告

| 欄位 | 說明 |
|-----|------|
| id | 公告ID |
| title | 公告標題 |
| content | 公告內容 |
| is_active | 是否啟用 |
| created_at | 建立時間 |
| updated_at | 更新時間 |

---

# 🔗 資料表關係

資料表關係如下：
- users (1) ---- (N) scores (N) ---- (1) games
- announcements (獨立表)

說明：

- 一位使用者可以有多筆遊戲成績
- 一款遊戲可以有多筆玩家成績
- `scores` 表為 `users` 與 `games` 的關聯表
- `announcements` 為獨立公告表

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
