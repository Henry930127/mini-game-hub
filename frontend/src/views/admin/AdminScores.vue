<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h1>分數管理</h1>
        <p>查看所有遊戲分數紀錄，並可刪除異常資料。</p>
      </div>
    </div>

    <div class="toolbar">
      <input
        v-model="keyword"
        class="search-input"
        type="text"
        placeholder="搜尋玩家名稱或遊戲名稱"
      />
    </div>

    <div v-if="loading" class="admin-card">
      載入分數資料中...
    </div>

    <div v-else class="admin-card">
      <div v-if="filteredScores.length === 0" class="empty-text">
        找不到符合條件的分數紀錄
      </div>

      <table v-else class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>玩家</th>
            <th>遊戲</th>
            <th>分數</th>
            <th>時間</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="score in filteredScores" :key="score.id">
            <td>{{ score.id }}</td>
            <td>{{ score.username }}</td>
            <td>{{ score.game_name }}</td>
            <td>{{ formatScore(score) }}</td>
            <td>{{ formatDate(score.created_at) }}</td>
            <td>
              <button
                class="delete-btn"
                @click="handleDelete(score)"
              >
                刪除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="message" class="message-text">
      {{ message }}
    </p>
  </div>
</template>

<script>
import { fetchAdminScores, deleteAdminScore } from "../../api/admin"

export default {
  name: "AdminScores",

  data() {
    return {
      loading: true,
      keyword: "",
      scores: [],
      message: ""
    }
  },

  computed: {
    filteredScores() {
      const keyword = this.keyword.trim().toLowerCase()

      if (!keyword) return this.scores

      return this.scores.filter((score) => {
        return (
          score.username.toLowerCase().includes(keyword) ||
          score.game_name.toLowerCase().includes(keyword)
        )
      })
    }
  },

  methods: {
    async loadScores() {
      try {
        this.loading = true
        const data = await fetchAdminScores()
        this.scores = data.scores
      } catch (error) {
        console.error("Load admin scores failed:", error)
        this.message = "分數資料載入失敗"
      } finally {
        this.loading = false
      }
    },

    formatDate(dateString) {
      if (!dateString) return "-"

      const date = new Date(dateString)
      if (Number.isNaN(date.getTime())) return "-"

      return date.toLocaleString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      })
    },

    formatScore(score) {
      if (score.slug === "reaction-test") {
        const reactionTime = Math.max(0, 1000 - Number(score.score))
        return `${reactionTime} ms`
      }

      return `${score.score} 分`
    },

    async handleDelete(score) {
      const confirmed = window.confirm(
        `確定要刪除 ${score.username} 的 ${score.game_name} 分數紀錄嗎？`
      )

      if (!confirmed) return

      try {
        await deleteAdminScore(score.id)
        this.message = "分數已刪除"
        await this.loadScores()
      } catch (error) {
        console.error("Delete score failed:", error)
        this.message = "刪除失敗"
      }
    }
  },

  mounted() {
    this.loadScores()
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

.toolbar {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  max-width: 320px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 15px;
}

.admin-card {
  background: white;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th,
.admin-table td {
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.admin-table th {
  background: #f9fafb;
  color: #111827;
}

.admin-table td {
  color: #4b5563;
}

.delete-btn {
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  background: #ef4444;
  color: white;
  cursor: pointer;
}

.empty-text {
  color: #6b7280;
}

.message-text {
  margin-top: 16px;
  color: #2563eb;
}

@media (max-width: 900px) {
  .admin-card {
    overflow-x: auto;
  }

  .admin-table {
    min-width: 760px;
  }
}
</style>