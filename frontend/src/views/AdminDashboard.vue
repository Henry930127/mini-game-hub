<template>
  <div class="admin-page">
    <div class="admin-header">
      <div>
        <h1>後台管理中心</h1>
        <p>Mini Game Hub Dashboard</p>
      </div>

      <button class="logout-btn" @click="logout">
        登出
      </button>
    </div>

    <div v-if="loading" class="admin-card">
      載入後台資料中...
    </div>

    <template v-else>
      <div class="stats-grid">
        <div class="admin-card stat-card">
          <h2>會員數</h2>
          <p class="big-number">{{ stats.totalUsers }}</p>
        </div>

        <div class="admin-card stat-card">
          <h2>遊戲數</h2>
          <p class="big-number">{{ stats.totalGames }}</p>
        </div>

        <div class="admin-card stat-card">
          <h2>分數紀錄</h2>
          <p class="big-number">{{ stats.totalScores }}</p>
        </div>
      </div>

      <div class="admin-grid">
        <div class="admin-card full-width">
          <h2>最新註冊會員</h2>

          <div v-if="latestUsers.length === 0" class="empty-text">
            目前沒有會員資料
          </div>

          <ul v-else class="admin-list">
            <li
              v-for="user in latestUsers"
              :key="user.id"
              class="admin-list-item"
            >
              <div>
                <strong>{{ user.username }}</strong>
                <p>{{ user.email }}</p>
              </div>
              <span class="list-date">{{ formatDate(user.created_at) }}</span>
            </li>
          </ul>
        </div>

        <div class="admin-card full-width">
          <h2>最新遊玩紀錄</h2>

          <div v-if="latestScores.length === 0" class="empty-text">
            目前沒有分數紀錄
          </div>

          <ul v-else class="admin-list">
            <li
              v-for="score in formattedLatestScores"
              :key="score.id"
              class="admin-list-item"
            >
              <div>
                <strong>{{ score.username }}</strong>
                <p>{{ score.game_name }} ・ {{ score.displayScore }}</p>
              </div>
              <span class="list-date">{{ formatDate(score.created_at) }}</span>
            </li>
          </ul>
        </div>

        <div class="admin-card" @click="$router.push('/admin/users')" style="cursor: pointer;">
          <h2>玩家管理</h2>
          <p>查看會員列表、玩家資料與遊玩紀錄。</p>
        </div>

        <div class="admin-card" @click="$router.push('/admin/scores')" style="cursor: pointer;">
          <h2>排行榜管理</h2>
          <p>查看各遊戲排行榜與分數紀錄。</p>
        </div>

        <div class="admin-card" @click="$router.push('/admin/games')"  style="cursor: pointer;">
          <h2>遊戲管理</h2>
          <p>管理遊戲顯示狀態與內容設定。</p>
        </div>

        <div class="admin-card" @click="$router.push('/admin/announcements')"  style="cursor: pointer;">
          <h2>公告管理</h2>
          <p>新增、編輯與刪除首頁公告。</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { fetchAdminDashboard } from "../api/admin"
import { logoutUser } from "../api/auth"

export default {
  name: "AdminDashboard",

  data() {
    return {
      loading: true,
      stats: {
        totalUsers: 0,
        totalGames: 0,
        totalScores: 0
      },
      latestUsers: [],
      latestScores: []
    }
  },

  computed: {
    formattedLatestScores() {
      return this.latestScores.map((score) => {
        if (score.slug === "reaction-test") {
          const reactionTime = Math.max(0, 1000 - Number(score.score))
          return {
            ...score,
            displayScore: `${reactionTime} ms`
          }
        }

        return {
          ...score,
          displayScore: `${score.score} 分`
        }
      })
    }
  },

  async mounted() {
    try {
      const data = await fetchAdminDashboard()
      this.stats = data.stats
      this.latestUsers = data.latestUsers
      this.latestScores = data.latestScores
    } catch (error) {
      console.error("Load admin dashboard failed:", error)
    } finally {
      this.loading = false
    }
  },

  methods: {
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

    async logout() {
      await logoutUser()
      localStorage.removeItem("adminUser")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      this.$router.push("/admin/login")
    }
  }
}
</script>

<style scoped>
.admin-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px 60px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.admin-header h1 {
  margin: 0 0 6px;
  color: #111827;
}

.admin-header p {
  margin: 0;
  color: #6b7280;
}

.logout-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  background: #ef4444;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.admin-grid {
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

.admin-card h2 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #111827;
}

.admin-card p {
  margin: 0;
  color: #4b5563;
  line-height: 1.6;
}

.stat-card {
  min-height: 140px;
}

.big-number {
  margin-top: 18px;
  font-size: 32px;
  font-weight: bold;
  color: #2563eb;
}

.full-width {
  grid-column: 1 / -1;
}

.admin-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.admin-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #e5e7eb;
}

.admin-list-item:last-child {
  border-bottom: none;
}

.admin-list-item strong {
  display: block;
  color: #111827;
  margin-bottom: 4px;
}

.admin-list-item p {
  margin: 0;
  color: #6b7280;
}

.list-date {
  color: #9ca3af;
  font-size: 13px;
  white-space: nowrap;
}

.empty-text {
  color: #6b7280;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .admin-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: auto;
  }
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-list-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .list-date {
    white-space: normal;
  }
}
</style>
