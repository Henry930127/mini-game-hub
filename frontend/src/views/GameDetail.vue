<template>
  <div class="game-detail-page" v-if="game">
    <section class="game-detail-header">
      <div class="header-left">
        <span class="game-tag">{{ game.category }}</span>
        <h1>{{ game.name }}</h1>
        <p>{{ game.description }}</p>
      </div>

      <div class="header-right">
        <router-link to="/leaderboard" class="secondary-btn">
          查看排行榜
        </router-link>
      </div>
    </section>

    <section class="game-content-section">
      <div class="game-play-card">
        <h2>遊戲區域</h2>

        <template v-if="game.slug === 'catch-items'">
          <CatchItemsGame @finish="handleGameFinish" />
        </template>

        <template v-else-if="game.slug === 'reaction-test'">
          <ReactionGame @finish="handleGameFinish" />
        </template>

        <template v-else-if="game.slug === 'snake'">
          <SnakeGame @finish="handleGameFinish" />
        </template>

        <template v-else-if="game.slug === 'bee-shooter'">
          <BeeShooterGame @finish="handleGameFinish" />
        </template>

        <template v-else-if="game.slug === 'wordle'">
          <WordleGame @finish="handleGameFinish" />
        </template>

        <template v-else>
          <div class="game-placeholder">
            <p>這裡之後會放入「{{ game.name }}」的實際遊戲畫面。</p>
          </div>
          <button class="play-btn">開始遊戲</button>
        </template>

        <p
          v-if="submitScoreMessage"
          class="submit-score-message"
          :class="{ error: submitScoreMessageType === 'error' }"
        >
          {{ submitScoreMessage }}
        </p>
      </div>

      <div class="right-side-column">
        <div class="game-info-card">
          <h2>遊戲資訊</h2>

          <div class="info-list">
            <div class="info-item">
              <span class="label">遊戲類型</span>
              <span class="value">{{ game.type }}</span>
            </div>

            <div class="info-item">
              <span class="label">難度</span>
              <span class="value">{{ game.difficulty }}</span>
            </div>

            <div class="info-item">
              <span class="label">排行榜模式</span>
              <span class="value">{{ game.rankingMode }}</span>
            </div>
          </div>
        </div>

        <div class="leaderboard-card">
          <h2>排行榜</h2>

          <p v-if="loadingLeaderboard" class="leaderboard-message">
            載入排行榜中...
          </p>

          <p v-else-if="leaderboardError" class="leaderboard-message error-message">
            {{ leaderboardError }}
          </p>

          <p v-else-if="leaderboard.length === 0" class="leaderboard-message">
            目前還沒有分數紀錄
          </p>

          <div v-else class="leaderboard-list">
            <div
              v-for="(player, index) in leaderboard"
              :key="`${player.username}-${player.score}-${index}`"
              class="leaderboard-item"
            >
              <div class="leaderboard-rank">
                <span v-if="index === 0">🥇</span>
                <span v-else-if="index === 1">🥈</span>
                <span v-else-if="index === 2">🥉</span>
                <span v-else>#{{ index + 1 }}</span>
              </div>

              <div class="leaderboard-player">
                <div class="player-name">{{ player.username }}</div>
                <div class="player-time">
                  {{ formatDate(player.created_at) }}
                </div>
              </div>

              <div class="leaderboard-score">
                {{ displayScore(player.score) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="instruction-section">
      <div class="instruction-card">
        <h2>操作說明</h2>
        <ul>
          <li v-for="(instruction, index) in game.instructions" :key="index">
            {{ instruction }}
          </li>
        </ul>
      </div>
    </section>
  </div>

  <div v-else class="not-found">
    <h1>找不到遊戲</h1>
    <p>此遊戲不存在或連結有誤。</p>
    <router-link to="/game" class="back-link">返回遊戲列表</router-link>
  </div>
</template>

<script>
import { fetchLeaderboard } from "../api/leaderboard"
import { submitScore } from "../api/score"
import { games } from "../data/games"

import ReactionGame from "../components/games/ReactionGame.vue"
import CatchItemsGame from "../components/games/CatchItemsGame.vue"
import SnakeGame from "../components/games/SnakeGame.vue"
import BeeShooterGame from "../components/games/BeeShooterGame.vue"
import WordleGame from "../components/games/WordleGame.vue"

export default {
  name: "GameDetail",
  components: {
    ReactionGame,
    CatchItemsGame,
    SnakeGame,
    BeeShooterGame,
    WordleGame
  },
  data() {
    return {
      leaderboard: [],
      loadingLeaderboard: false,
      leaderboardError: "",

      submitScoreMessage: "",
      submitScoreMessageType: "success",

      games
    }
  },
  computed: {
    game() {
      const slug = this.$route.params.slug
      return this.games.find((item) => item.slug === slug)
    }
  },
  methods: {
    async loadLeaderboard() {
      if (!this.game?.id) {
        this.leaderboard = []
        return
      }

      try {
        this.loadingLeaderboard = true
        this.leaderboardError = ""
        this.leaderboard = await fetchLeaderboard(this.game.id)
      } catch (error) {
        console.error("Failed to load leaderboard:", error)
        this.leaderboard = []
        this.leaderboardError = "無法載入排行榜"
      } finally {
        this.loadingLeaderboard = false
      }
    },

    formatDate(dateString) {
      if (!dateString) return ""

      const date = new Date(dateString)

      if (Number.isNaN(date.getTime())) return ""

      return date.toLocaleString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      })
    },

    displayScore(score) {
      if (this.game?.slug === "reaction-test") {
        return `${1000 - score} ms`
      }
      return score
    },

    getCurrentUserId() {
      try {
        const savedUser = localStorage.getItem("user")
        if (!savedUser) return null

        const user = JSON.parse(savedUser)
        return user?.id || null
      } catch (error) {
        console.error("Read local user failed:", error)
        return null
      }
    },

    async submitGameScore(finalScore) {
      if (!this.game?.id) return

      const userId = this.getCurrentUserId()

      if (!userId) {
        this.submitScoreMessage = "尚未登入，無法提交成績"
        this.submitScoreMessageType = "error"
        return
      }

      try {
        this.submitScoreMessage = "成績提交中..."
        this.submitScoreMessageType = "success"

        await submitScore({
          user_id: userId,
          game_id: this.game.id,
          score: finalScore
        })

        this.submitScoreMessage = "成績提交成功，排行榜已更新"
        this.submitScoreMessageType = "success"

        await this.loadLeaderboard()
      } catch (error) {
        console.error("Submit score failed:", error)
        this.submitScoreMessage = "成績提交失敗"
        this.submitScoreMessageType = "error"
      }
    },

    async handleGameFinish(score) {
      await this.submitGameScore(score)
    }
  },
  watch: {
    "$route.params.slug"() {
      this.submitScoreMessage = ""
      this.submitScoreMessageType = "success"
      this.loadLeaderboard()
    }
  },
  mounted() {
    this.loadLeaderboard()
  }
}
</script>

<style scoped>
.game-detail-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px 60px;
}

.game-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 30px;
}

.header-left h1 {
  margin: 12px 0;
  font-size: 40px;
  color: #111827;
}

.header-left p {
  margin: 0;
  color: #6b7280;
  line-height: 1.7;
  max-width: 700px;
}

.game-tag {
  display: inline-block;
  background-color: #dbeafe;
  color: #1d4ed8;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: bold;
}

.secondary-btn {
  display: inline-block;
  background-color: #e5e7eb;
  color: #111827;
  padding: 12px 18px;
  border-radius: 10px;
  text-decoration: none;
}

.secondary-btn:hover {
  background-color: #d1d5db;
}

.game-content-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.right-side-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.game-play-card,
.game-info-card,
.instruction-card,
.leaderboard-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.game-play-card h2,
.game-info-card h2,
.instruction-card h2,
.leaderboard-card h2 {
  margin-top: 0;
  color: #111827;
}

.game-placeholder {
  height: 320px;
  border: 2px dashed #cbd5e1;
  border-radius: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8fafc;
  margin: 20px 0;
  text-align: center;
  padding: 20px;
}

.game-placeholder p {
  color: #64748b;
  line-height: 1.6;
}

.submit-score-message {
  margin-top: 16px;
  color: #16a34a;
  font-weight: 500;
}

.submit-score-message.error {
  color: #dc2626;
}

.play-btn {
  display: inline-block;
  border: none;
  background-color: #2563eb;
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
}

.play-btn:hover {
  background-color: #1d4ed8;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-item {
  background-color: #f9fafb;
  border-radius: 10px;
  padding: 12px 14px;
}

.label {
  display: block;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

.value {
  color: #111827;
  font-weight: bold;
}

.leaderboard-message {
  margin: 0;
  color: #6b7280;
}

.error-message {
  color: #dc2626;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.leaderboard-item {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 12px;
  background-color: #f9fafb;
}

.leaderboard-rank {
  font-weight: bold;
  color: #111827;
  text-align: center;
}

.leaderboard-player {
  min-width: 0;
}

.player-name {
  color: #111827;
  font-weight: bold;
  word-break: break-word;
}

.player-time {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.leaderboard-score {
  font-size: 18px;
  font-weight: bold;
  color: #2563eb;
}

.instruction-card ul {
  margin: 0;
  padding-left: 20px;
  color: #4b5563;
  line-height: 1.8;
}

.not-found {
  max-width: 800px;
  margin: 60px auto;
  background: white;
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.not-found h1 {
  margin-top: 0;
  color: #111827;
}

.not-found p {
  color: #6b7280;
  margin-bottom: 20px;
}

.back-link {
  display: inline-block;
  text-decoration: none;
  background-color: #2563eb;
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
}

@media (max-width: 900px) {
  .game-detail-header {
    flex-direction: column;
  }

  .game-content-section {
    grid-template-columns: 1fr;
  }

  .header-left h1 {
    font-size: 32px;
  }

  .game-placeholder {
    height: 240px;
  }
}
</style>