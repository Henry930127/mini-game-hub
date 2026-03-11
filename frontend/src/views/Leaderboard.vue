<template>
  <div class="leaderboard-page">
    <section class="leaderboard-header">
      <h1>遊戲排行榜</h1>
      <p>選擇不同遊戲，查看各自的最佳玩家成績。</p>
    </section>

    <section class="leaderboard-content">
      <div class="game-tabs">
        <button
          v-for="game in games"
          :key="game.id"
          class="tab-btn"
          :class="{ active: selectedGameId === game.id }"
          @click="handleSelectGame(game.id)"
        >
          {{ game.name }}
        </button>
      </div>

      <div class="leaderboard-card">
        <div class="game-info">
          <h2>{{ currentGame.name }}</h2>
          <p>{{ currentGame.description }}</p>
        </div>

        <div v-if="loading" class="leaderboard-status">
          載入排行榜中...
        </div>

        <div v-else-if="errorMessage" class="leaderboard-status error-text">
          {{ errorMessage }}
        </div>

        <div v-else-if="currentRanking.length === 0" class="leaderboard-status">
          目前還沒有分數紀錄
        </div>

        <table v-else class="leaderboard-table">
          <thead>
            <tr>
              <th>排名</th>
              <th>玩家</th>
              <th>分數</th>
              <th>日期</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(player, index) in currentRanking"
              :key="`${selectedGameId}-${player.username}-${player.score}-${index}`"
            >
              <td>{{ index + 1 }}</td>
              <td>{{ player.username }}</td>
              <td>{{ player.score }}</td>
              <td>{{ formatDate(player.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script>
import { fetchLeaderboard } from "../api/leaderboard"

export default {
  name: "Leaderboard",
  data() {
    return {
      selectedGameId: 2,
      loading: false,
      errorMessage: "",
      rankingMap: {},
      games: [
        {
          id: 2,
          slug: "catch-items",
          name: "接物品",
          description: "控制角色接住掉落物品，考驗反應與判斷能力。"
        },
        {
          id: 1,
          slug: "reaction-test",
          name: "反應速度測試",
          description: "在最短時間內做出反應，挑戰你的手速極限。"
        },
        {
          id: 4,
          slug: "bee-shooter",
          name: "小蜜蜂",
          description: "操作飛船閃避敵人並擊敗對手，取得更高分數。"
        },
        {
          id: 3,
          slug: "snake",
          name: "貪食蛇",
          description: "控制蛇持續成長，同時避免撞牆與撞到自己。"
        },
        {
          id: 5,
          slug: "wordle",
          name: "Wordle",
          description: "在有限次數內猜出正確單字，挑戰你的字彙能力。"
        }
      ]
    }
  },
  computed: {
    currentGame() {
      return this.games.find((game) => game.id === this.selectedGameId) || this.games[0]
    },
    currentRanking() {
      return this.rankingMap[this.selectedGameId] || []
    }
  },
  methods: {
    async loadLeaderboard(gameId) {
      try {
        this.loading = true
        this.errorMessage = ""

        const ranking = await fetchLeaderboard(gameId)

        this.rankingMap = {
          ...this.rankingMap,
          [gameId]: ranking
        }
      } catch (error) {
        console.error("Load leaderboard failed:", error)
        this.errorMessage = "排行榜載入失敗"
      } finally {
        this.loading = false
      }
    },

    async handleSelectGame(gameId) {
      this.selectedGameId = gameId

      if (!this.rankingMap[gameId]) {
        await this.loadLeaderboard(gameId)
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
    }
  },
  async mounted() {
    await this.loadLeaderboard(this.selectedGameId)
  }
}
</script>

<style scoped>
.leaderboard-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px;
}

.leaderboard-header {
  margin-bottom: 30px;
}

.leaderboard-header h1 {
  margin: 0 0 12px;
  font-size: 36px;
  color: #111827;
}

.leaderboard-header p {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
}

.leaderboard-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.game-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tab-btn {
  padding: 10px 18px;
  border: none;
  border-radius: 999px;
  background-color: #e5e7eb;
  color: #374151;
  cursor: pointer;
  font-size: 15px;
  font-weight: bold;
  transition: 0.2s ease;
}

.tab-btn:hover {
  background-color: #d1d5db;
}

.tab-btn.active {
  background-color: #2563eb;
  color: white;
}

.leaderboard-card {
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.game-info {
  margin-bottom: 20px;
}

.game-info h2 {
  margin: 0 0 10px;
  color: #111827;
}

.game-info p {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
}

.leaderboard-status {
  padding: 24px 0;
  color: #6b7280;
}

.error-text {
  color: #dc2626;
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
}

.leaderboard-table th,
.leaderboard-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.leaderboard-table th {
  background-color: #f9fafb;
  color: #111827;
}

.leaderboard-table td {
  color: #4b5563;
}

@media (max-width: 768px) {
  .leaderboard-header h1 {
    font-size: 28px;
  }

  .leaderboard-card {
    padding: 20px;
  }

  .leaderboard-table th,
  .leaderboard-table td {
    padding: 12px 10px;
    font-size: 14px;
  }
}
</style>