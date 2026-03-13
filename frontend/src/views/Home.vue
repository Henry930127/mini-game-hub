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
          <h3>{{ game.display_name || game.name }}</h3>
          <p>{{ game.short_description || game.description }}</p>
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

      <div v-if="loadingAnnouncements" class="notice-status">
        載入公告中...
      </div>

      <div v-else-if="activeAnnouncements.length === 0" class="notice-status">
        目前沒有最新公告
      </div>

      <div v-else class="notice-list">
        <div
          v-for="notice in activeAnnouncements"
          :key="notice.id"
          class="notice-item"
        >
          <div class="notice-top">
            <h3>{{ notice.title }}</h3>
            <span class="notice-date">
              {{ formatDate(notice.created_at) }}
            </span>
          </div>
          <p>{{ notice.content }}</p>
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
            <span class="game-badge">{{ currentLeaderboardGame.display_name || currentLeaderboardGame.name }}</span>
            <p class="leaderboard-desc">
              {{ currentLeaderboardGame.leaderboard_description || currentLeaderboardGame.description }}
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
              <td>{{ displayScore(currentLeaderboardGame.slug, player.score) }}</td>
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
import { fetchAnnouncements } from "../api/announcement"
import { fetchAllGames } from "../api/game"
import { games as localGames } from "../data/games"

export default {
  name: "Home",
  data() {
    return {
      currentGameIndex: 0,
      autoPlayTimer: null,
      loadingLeaderboard: false,
      leaderboardError: "",
      leaderboardMap: {},

      loadingAnnouncements: false,
      announcements: [],

      games: localGames,
      remoteGames: []
    }
  },
  computed: {
    mergedGames() {
      return this.games.map((localGame) => {
        const remoteGame = this.remoteGames.find((item) => item.slug === localGame.slug)

        return {
          ...localGame,
          ...(remoteGame || {}),
          leaderboard_description:
            remoteGame?.short_description ||
            localGame.description
        }
      })
    },

    featuredGames() {
      return [
        this.mergedGames.find((game) => game.slug === "catch-items"),
        this.mergedGames.find((game) => game.slug === "reaction-test"),
        this.mergedGames.find((game) => game.slug === "wordle")
      ].filter(Boolean)
    },

    leaderboardGames() {
      return [
        this.mergedGames.find((game) => game.slug === "catch-items"),
        this.mergedGames.find((game) => game.slug === "reaction-test"),
        this.mergedGames.find((game) => game.slug === "bee-shooter"),
        this.mergedGames.find((game) => game.slug === "snake"),
        this.mergedGames.find((game) => game.slug === "wordle")
      ].filter(Boolean)
    },

    currentLeaderboardGame() {
      return this.leaderboardGames[this.currentGameIndex] || {}
    },

    currentRanking() {
      return this.leaderboardMap[this.currentLeaderboardGame.id] || []
    },

    activeAnnouncements() {
      return this.announcements
        .filter((item) => Number(item.is_active) === 1)
        .slice(0, 3)
    }
  },
  methods: {
    async loadAnnouncements() {
      try {
        this.loadingAnnouncements = true
        const data = await fetchAnnouncements()
        this.announcements = data.announcements || []
      } catch (error) {
        console.error("Load announcements failed:", error)
        this.announcements = []
      } finally {
        this.loadingAnnouncements = false
      }
    },

    async loadGames() {
      try {
        const data = await fetchAllGames()
        this.remoteGames = data.games || []
      } catch (error) {
        console.error("Load games failed:", error)
        this.remoteGames = []
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

    displayScore(slug, score) {
      if (slug === "reaction-test") {
        return `${1000 - score} ms`
      }
      return score
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
    await this.loadGames()
    await this.loadAnnouncements()
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

.notice-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.notice-date {
  color: #9ca3af;
  font-size: 13px;
  white-space: nowrap;
}

.notice-status {
  color: #6b7280;
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

  .leaderboard-top,
  .notice-top {
    flex-direction: column;
  }

  .notice-date {
    white-space: normal;
  }
}
</style>