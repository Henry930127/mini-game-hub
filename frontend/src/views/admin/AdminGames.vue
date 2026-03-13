<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h1>遊戲內容管理</h1>
        <p>編輯前端顯示名稱、介紹、操作提示與規則說明。</p>
      </div>
    </div>

    <div v-if="loading" class="admin-card">
      載入遊戲資料中...
    </div>

    <div v-else class="games-list">
      <div
        v-for="game in games"
        :key="game.id"
        class="admin-card game-card"
      >
        <h2>{{ game.name }}</h2>

        <div class="form-group">
          <label>前端顯示名稱</label>
          <input v-model="game.display_name" type="text" />
        </div>

        <div class="form-group">
          <label>簡短介紹</label>
          <textarea v-model="game.short_description" rows="2"></textarea>
        </div>

        <div class="form-group">
          <label>操作提示</label>
          <textarea v-model="game.instructions" rows="5"></textarea>
        </div>

        <div class="form-group">
          <label>規則說明</label>
          <textarea v-model="game.rules_text" rows="4"></textarea>
        </div>

        <div class="actions">
          <button class="save-btn" @click="handleSave(game)">
            儲存修改
          </button>
        </div>
      </div>
    </div>

    <p v-if="message" class="message-text">
      {{ message }}
    </p>
  </div>
</template>

<script>
import { fetchAdminGames, updateAdminGame } from "../../api/admin"

export default {
  name: "AdminGames",

  data() {
    return {
      loading: true,
      games: [],
      message: ""
    }
  },

  methods: {
    async loadGames() {
      try {
        this.loading = true
        const data = await fetchAdminGames()
        this.games = data.games
      } catch (error) {
        console.error("Load admin games failed:", error)
        this.message = "遊戲資料載入失敗"
      } finally {
        this.loading = false
      }
    },

    async handleSave(game) {
      try {
        await updateAdminGame(game.id, {
          display_name: game.display_name || "",
          short_description: game.short_description || "",
          instructions: game.instructions || "",
          rules_text: game.rules_text || ""
        })

        this.message = `「${game.display_name || game.name}」已更新成功`
      } catch (error) {
        console.error("Update game failed:", error)
        this.message = "更新失敗"
      }
    }
  },

  mounted() {
    this.loadGames()
  }
}
</script>

<style scoped>
.admin-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px 60px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 6px;
  color: #111827;
}

.page-header p {
  margin: 0;
  color: #6b7280;
}

.games-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.admin-card {
  background: white;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

.game-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.game-card h2 {
  margin: 0;
  color: #111827;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #374151;
}

.form-group input,
.form-group textarea {
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 15px;
}

.form-group textarea {
  resize: vertical;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.save-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  background: #2563eb;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

.message-text {
  margin-top: 16px;
  color: #2563eb;
}

@media (max-width: 900px) {
  .games-list {
    grid-template-columns: 1fr;
  }
}
</style>