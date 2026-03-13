<template>
  <div class="profile-page">
    <section v-if="loading" class="profile-card">
      載入會員資料中...
    </section>

    <section v-else-if="errorMessage" class="profile-card error-text">
      {{ errorMessage }}
    </section>

    <template v-else>
      <section class="profile-header">
        <div class="profile-card profile-user-card">
          <div class="avatar">{{ avatarText }}</div>
          <div class="user-info">
            <h1>{{ profile.user.username }}</h1>
            <p>{{ profile.user.email }}</p>
            <span
              class="member-badge"
              :class="{ admin: profile.user.role === 'admin' }"
            >
              {{ memberRoleText }}
            </span>
          </div>
        </div>
      </section>

      <section class="profile-content">
        <div class="profile-grid">
          <div class="profile-card">
            <h2>遊玩統計</h2>
            <div class="stats-grid">
              <div class="stat-box">
                <span class="stat-label">總遊玩次數</span>
                <span class="stat-value">{{ profile.stats.totalPlays }}</span>
              </div>
              <div class="stat-box">
                <span class="stat-label">已玩遊戲數</span>
                <span class="stat-value">{{ profile.stats.playedGames }}</span>
              </div>
              <div class="stat-box">
                <span class="stat-label">最高總成績</span>
                <span class="stat-value">{{ profile.stats.highestScore }}</span>
              </div>
              <div class="stat-box">
                <span class="stat-label">最佳排名</span>
                <span class="stat-value">
                  {{
                    profile.stats.bestRank === "-" || profile.stats.bestRank === null
                      ? "-"
                      : `#${profile.stats.bestRank}`
                  }}
                </span>
              </div>
            </div>
          </div>

          <div class="profile-card">
            <h2>最佳成績</h2>

            <div v-if="formattedBestRecords.length === 0" class="empty-text">
              目前還沒有最佳成績資料
            </div>

            <div v-else class="record-list">
              <div
                class="record-item"
                v-for="record in formattedBestRecords"
                :key="record.game_id"
              >
                <div class="record-left">
                  <span class="record-game-name">{{ record.game_name }}</span>
                </div>

                <div class="record-right">
                  <strong
                    class="record-score"
                    :class="{ muted: record.isNotPlayed }"
                  >
                    {{ record.displayScore }}
                  </strong>

                  <span
                    v-if="record.best_rank !== null"
                    class="record-rank"
                  >
                    #{{ record.best_rank }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="profile-card full-width">
            <h2>最近遊玩紀錄</h2>

            <div v-if="profile.recentHistory.length === 0" class="empty-text">
              目前還沒有遊玩紀錄
            </div>

            <table v-else class="history-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>遊戲</th>
                  <th>成績</th>
                  <th>結果</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="history in formattedRecentHistory"
                  :key="history.id"
                >
                  <td>{{ history.date }}</td>
                  <td>{{ history.game_name }}</td>
                  <td>{{ history.displayScore }}</td>
                  <td>{{ history.resultText }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import { fetchProfileSummary } from "../api/profile"

export default {
  name: "Profile",
  data() {
    return {
      loading: true,
      errorMessage: "",
      profile: {
        user: {
          id: null,
          username: "",
          email: "",
          role: "player"
        },
        stats: {
          totalPlays: 0,
          playedGames: 0,
          highestScore: 0,
          bestRank: "-"
        },
        bestRecords: [],
        recentHistory: []
      }
    }
  },
  computed: {
    avatarText() {
      return this.profile.user.username
        ? this.profile.user.username.charAt(0).toUpperCase()
        : "U"
    },

    memberRoleText() {
      return this.profile.user.role === "admin" ? "管理員" : "一般會員"
    },

    formattedBestRecords() {
      return this.profile.bestRecords.map((record) => {
        const hasPlayed = record.best_score !== null && Number(record.best_score) > 0

        if (!hasPlayed) {
          return {
            ...record,
            isNotPlayed: true,
            displayScore: "尚未遊玩"
          }
        }

        if (record.slug === "reaction-test") {
          const reactionTime = Math.max(0, 1000 - Number(record.best_score))
          return {
            ...record,
            isNotPlayed: false,
            displayScore: `${reactionTime} ms`
          }
        }

        return {
          ...record,
          isNotPlayed: false,
          displayScore: `${record.best_score} 分`
        }
      })
    },

    formattedRecentHistory() {
      return this.profile.recentHistory.map((history) => {
        let displayScore = `${history.score} 分`
        let resultText = "已完成"

        if (history.slug === "reaction-test") {
          const reactionTime = Math.max(0, 1000 - Number(history.score))
          displayScore = `${reactionTime} ms`
        }

        if (history.slug === "wordle") {
          resultText = Number(history.score) > 0 ? "猜中成功" : "挑戰失敗"
        }

        return {
          ...history,
          date: this.formatDate(history.created_at),
          displayScore,
          resultText
        }
      })
    }
  },
  methods: {
    getCurrentUser() {
      try {
        const savedUser = localStorage.getItem("user")
        return savedUser ? JSON.parse(savedUser) : null
      } catch (error) {
        console.error("Read local user failed:", error)
        return null
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

    async loadProfile() {
      const currentUser = this.getCurrentUser()

      if (!currentUser?.id) {
        this.errorMessage = "尚未登入，請先登入會員"
        this.loading = false
        return
      }

      try {
        this.loading = true
        this.errorMessage = ""

        const data = await fetchProfileSummary(currentUser.id)
        this.profile = data
      } catch (error) {
        console.error("Load profile failed:", error)
        this.errorMessage =
          error.response?.data?.message || "會員資料載入失敗"
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    this.loadProfile()
  }
}
</script>

<style scoped>
.profile-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px 60px;
}

.profile-header {
  margin-bottom: 28px;
}

.profile-content {
  margin-top: 10px;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.profile-card {
  background: white;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

.profile-user-card {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  width: 78px;
  height: 78px;
  border-radius: 50%;
  background-color: #2563eb;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  font-weight: bold;
  flex-shrink: 0;
}

.user-info h1 {
  margin: 0 0 8px;
  color: #111827;
}

.user-info p {
  margin: 0 0 10px;
  color: #6b7280;
}

.member-badge {
  display: inline-block;
  background-color: #dbeafe;
  color: #1d4ed8;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: bold;
}

.member-badge.admin {
  background-color: #fee2e2;
  color: #b91c1c;
}

.profile-card h2 {
  margin-top: 0;
  margin-bottom: 18px;
  color: #111827;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.stat-box {
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 16px;
}

.stat-label {
  display: block;
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2563eb;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  background-color: #f9fafb;
  border-radius: 10px;
  color: #374151;
}

.record-left {
  min-width: 0;
}

.record-game-name {
  color: #1f2937;
  font-weight: 500;
}

.record-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.record-score {
  color: #111827;
}

.record-score.muted {
  color: #9ca3af;
  font-weight: 500;
}

.record-rank {
  display: inline-block;
  font-size: 12px;
  background-color: #eef2ff;
  color: #4338ca;
  padding: 4px 8px;
  border-radius: 999px;
  font-weight: 700;
}

.full-width {
  grid-column: 1 / -1;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th,
.history-table td {
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.history-table th {
  background-color: #f9fafb;
  color: #111827;
}

.history-table td {
  color: #4b5563;
}

.empty-text {
  color: #6b7280;
}

.error-text {
  color: #dc2626;
}

@media (max-width: 900px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: auto;
  }

  .profile-user-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .record-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .record-right {
    width: 100%;
    justify-content: space-between;
  }

  .history-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>