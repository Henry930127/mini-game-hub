<template>
  <div class="home">
    <section class="hero">
      <div class="hero-content">
        <h1>歡迎來到 Mini Game Hub</h1>
        <p>
          挑戰多款小遊戲、查看各遊戲排行榜，留下你的最佳紀錄。
        </p>
        <div class="hero-buttons">
          <router-link to="/game" class="btn primary">立即開始</router-link>
          <router-link to="/leaderboard" class="btn secondary">查看排行榜</router-link>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>熱門遊戲</h2>
        <router-link to="/game" class="more-link">查看更多</router-link>
      </div>

      <div class="card-grid game-grid">
        <div
          v-for="game in featuredGames"
          :key="game.id"
          class="game-card"
        >
          <h3>{{ game.name }}</h3>
          <p>{{ game.description }}</p>
          <div class="card-actions">
            <router-link :to="`/games/${game.slug}`" class="card-btn">
              前往遊玩
            </router-link>
            <router-link to="/leaderboard" class="card-btn secondary-btn">
              查看排行
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>最新公告</h2>
      </div>

      <div class="notice-list">
        <div class="notice-item">
          <h3>平台正式上線</h3>
          <p>歡迎來到 Mini Game Hub，現在可以開始體驗多款小遊戲。</p>
        </div>

        <div class="notice-item">
          <h3>排行榜功能啟用</h3>
          <p>每款遊戲都有各自的排行榜，快來挑戰更高名次。</p>
        </div>

        <div class="notice-item">
          <h3>會員系統已啟用</h3>
          <p>現在可以註冊、登入，並記錄自己的遊戲分數與排行。</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>遊戲排行榜預覽</h2>
        <router-link to="/leaderboard" class="more-link">查看完整排行</router-link>
      </div>

      <div class="leaderboard-card">
        <div class="leaderboard-top">
          <div>
            <span class="game-badge">{{ currentLeaderboardGame.name }}</span>
            <p class="leaderboard-desc">
              {{ currentLeaderboardGame.description }}
            </p>
          </div>

          <div class="leaderboard-switch">
            <button class="switch-btn" @click="prevGame">上一個</button>
            <button class="switch-btn" @click="nextGame">下一個</button>
          </div>
        </div>

        <div v-if="loadingLeaderboard" class="leaderboard-status">
          載入排行榜中...
        </div>

        <div v-else-if="leaderboardError" class="leaderboard-status error-text">
          {{ leaderboardError }}
        </div>

        <table v-else-if="currentRanking.length > 0" class="leaderboard-table">
          <thead>
            <tr>
              <th>排名</th>
              <th>玩家</th>
              <th>分數</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(player, index) in currentRanking.slice(0, 3)"
              :key="`${player.username}-${player.score}-${index}`"
            >
              <td>{{ index + 1 }}</td>
              <td>{{ player.username }}</td>
              <td>{{ player.score }}</td>
            </tr>
          </tbody>
        </table>

        <div v-else class="leaderboard-status">
          目前還沒有分數紀錄
        </div>

        <div class="indicator-group">
          <button
            v-for="(game, index) in leaderboardGames"
            :key="game.id"
            class="indicator"
            :class="{ active: currentGameIndex === index }"
            @click="goToGame(index)"
          ></button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { fetchLeaderboard } from "../api/leaderboard"

export default {
  name: "Home",
  data() {
    return {
      currentGameIndex: 0,
      autoPlayTimer: null,
      loadingLeaderboard: false,
      leaderboardError: "",
      leaderboardMap: {},
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
      ],
      leaderboardGames: [
        {
          id: 2,
          slug: "catch-items",
          name: "接物品",
          description: "目前顯示的是接物品遊戲的前 3 名玩家紀錄。"
        },
        {
          id: 1,
          slug: "reaction-test",
          name: "反應速度測試",
          description: "目前顯示的是反應速度測試的前 3 名玩家紀錄。"
        },
        {
          id: 4,
          slug: "bee-shooter",
          name: "小蜜蜂",
          description: "目前顯示的是小蜜蜂的前 3 名玩家紀錄。"
        },
        {
          id: 3,
          slug: "snake",
          name: "貪食蛇",
          description: "目前顯示的是貪食蛇的前 3 名玩家紀錄。"
        },
        {
          id: 5,
          slug: "wordle",
          name: "Wordle",
          description: "目前顯示的是 Wordle 的前 3 名玩家紀錄。"
        }
      ]
    }
  },
  computed: {
    featuredGames() {
      return [this.games[0], this.games[1], this.games[4]]
    },
    currentLeaderboardGame() {
      return this.leaderboardGames[this.currentGameIndex]
    },
    currentRanking() {
      return this.leaderboardMap[this.currentLeaderboardGame.id] || []
    }
  },
  methods: {
    async loadLeaderboardByGameId(gameId) {
      try {
        const ranking = await fetchLeaderboard(gameId)
        this.leaderboardMap = {
          ...this.leaderboardMap,
          [gameId]: ranking
        }
      } catch (error) {
        console.error(`Load leaderboard failed for game ${gameId}:`, error)
        throw error
      }
    },

    async loadAllLeaderboards() {
      try {
        this.loadingLeaderboard = true
        this.leaderboardError = ""

        for (const game of this.leaderboardGames) {
          const ranking = await fetchLeaderboard(game.id)
          this.leaderboardMap[game.id] = ranking
        }
      } catch (error) {
        console.error("Load all leaderboards failed:", error)
        this.leaderboardError = "排行榜載入失敗"
      } finally {
        this.loadingLeaderboard = false
      }
    },

    nextGame() {
      this.currentGameIndex =
        (this.currentGameIndex + 1) % this.leaderboardGames.length
    },

    prevGame() {
      this.currentGameIndex =
        (this.currentGameIndex - 1 + this.leaderboardGames.length) %
        this.leaderboardGames.length
    },

    goToGame(index) {
      this.currentGameIndex = index
    },

    startAutoPlay() {
      this.autoPlayTimer = setInterval(() => {
        this.nextGame()
      }, 8000)
    },

    stopAutoPlay() {
      if (this.autoPlayTimer) {
        clearInterval(this.autoPlayTimer)
        this.autoPlayTimer = null
      }
    }
  },
  async mounted() {
    await this.loadAllLeaderboards()
    this.startAutoPlay()
  },
  beforeUnmount() {
    this.stopAutoPlay()
  }
}
</script>

<style scoped>
.home {
  padding-bottom: 40px;
}

.hero {
  background: linear-gradient(135deg, #2563eb, #1e3a8a);
  color: white;
  padding: 80px 20px;
}

.hero-content {
  max-width: 1100px;
  margin: 0 auto;
  text-align: center;
}

.hero h1 {
  font-size: 48px;
  margin-bottom: 20px;
}

.hero p {
  font-size: 18px;
  margin-bottom: 30px;
  color: #e5e7eb;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 14px 28px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 16px;
  font-weight: bold;
  transition: 0.2s ease;
}

.btn.primary {
  background-color: #fbbf24;
  color: #111827;
}

.btn.primary:hover {
  background-color: #f59e0b;
}

.btn.secondary {
  background-color: white;
  color: #1d4ed8;
}

.btn.secondary:hover {
  background-color: #e5e7eb;
}

.section {
  max-width: 1100px;
  margin: 40px auto 0;
  padding: 0 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  color: #111827;
}

.more-link {
  text-decoration: none;
  color: #2563eb;
  font-weight: bold;
}

.more-link:hover {
  text-decoration: underline;
}

.card-grid {
  display: grid;
  gap: 20px;
}

.game-grid {
  grid-template-columns: repeat(3, 1fr);
}

.game-card,
.notice-item,
.leaderboard-card {
  background: white;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.game-card h3,
.notice-item h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #111827;
}

.game-card p,
.notice-item p {
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 0;
}

.card-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.card-btn {
  display: inline-block;
  padding: 10px 16px;
  border-radius: 8px;
  background-color: #2563eb;
  color: white;
  text-decoration: none;
  transition: 0.2s ease;
}

.card-btn:hover {
  background-color: #1d4ed8;
}

.secondary-btn {
  background-color: #e5e7eb;
  color: #111827;
}

.secondary-btn:hover {
  background-color: #d1d5db;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.leaderboard-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
}

.game-badge {
  display: inline-block;
  background-color: #dbeafe;
  color: #1d4ed8;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: bold;
}

.leaderboard-desc {
  margin: 12px 0 0;
  color: #6b7280;
  line-height: 1.6;
}

.leaderboard-switch {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.switch-btn {
  border: none;
  background-color: #e5e7eb;
  color: #111827;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s ease;
}

.switch-btn:hover {
  background-color: #d1d5db;
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
  padding: 14px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.leaderboard-table th {
  color: #111827;
  background-color: #f9fafb;
}

.leaderboard-table td {
  color: #4b5563;
}

.indicator-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.indicator {
  width: 12px;
  height: 12px;
  border: none;
  border-radius: 50%;
  background-color: #d1d5db;
  cursor: pointer;
}

.indicator.active {
  background-color: #2563eb;
}

@media (max-width: 900px) {
  .game-grid {
    grid-template-columns: 1fr;
  }

  .hero h1 {
    font-size: 36px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .leaderboard-top {
    flex-direction: column;
  }
}
</style>