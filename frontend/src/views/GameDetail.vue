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
          <div
            ref="catchGameRef"
            class="catch-game"
            tabindex="0"
            @keydown="handleCatchKeydown"
          >
            <div class="catch-game-topbar">
              <div>分數：{{ catchScore }}</div>
              <div>生命：{{ catchLives }}</div>
              <div>剩餘時間：{{ catchTimeLeft }} 秒</div>
            </div>

            <div class="catch-game-area">
              <div
                class="falling-item"
                :class="fallingItemType"
                :style="{
                  left: fallingItemX + 'px',
                  top: fallingItemY + 'px'
                }"
              >
                {{ fallingItemType === 'good' ? '+' : '-' }}
              </div>

              <div
                class="catcher"
                :style="{ left: catcherX + 'px' }"
              ></div>
            </div>
          </div>

          <div class="reaction-actions">
            <button class="play-btn" @click="startCatchGame">
              {{ catchGameRunning ? '重新開始' : '開始遊戲' }}
            </button>
          </div>

          <div
            class="reaction-result-card"
            v-if="!catchGameRunning && catchGameEnded"
          >
            <h3>本次成績</h3>
            <p>{{ catchScore }} 分</p>
            <small class="result-note">
              {{
                catchLives <= 0
                  ? '生命已歸零，遊戲提前結束'
                  : '時間結束'
              }}
            </small>
          </div>
        </template>

        <template v-else-if="game.slug === 'reaction-test'">
          <div
            class="reaction-game"
            :class="reactionStatus"
            @click="handleReactionAreaClick"
          >
            <p class="reaction-main-text">{{ reactionMessage }}</p>

            <p class="reaction-sub-text" v-if="reactionStatus === 'idle'">
              按下下方按鈕開始測試
            </p>

            <p
              class="reaction-sub-text"
              v-else-if="reactionStatus === 'waiting'"
            >
              請等到畫面變綠後再點擊
            </p>

            <p class="reaction-sub-text" v-else-if="reactionStatus === 'ready'">
              快點擊畫面！
            </p>

            <p
              class="reaction-sub-text"
              v-else-if="reactionStatus === 'result'"
            >
              你的反應時間已完成測量
            </p>

            <p
              class="reaction-sub-text error-text"
              v-else-if="reactionStatus === 'too-soon'"
            >
              你太早點了，請重新開始
            </p>
          </div>

          <div class="reaction-actions">
            <button class="play-btn" @click="startReactionGame">
              {{ reactionStatus === 'idle' ? '開始遊戲' : '重新開始' }}
            </button>
          </div>

          <div class="reaction-result-card" v-if="reactionTime !== null">
            <h3>本次成績</h3>
            <p>{{ reactionTime }} ms</p>
            <small class="result-note" v-if="reactionScore !== null">
              排行榜換算分數：{{ reactionScore }}
            </small>
          </div>
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
                {{ player.score }}
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
import { nextTick } from "vue"
import { fetchLeaderboard } from "../api/leaderboard"
import { submitScore } from "../api/score"

export default {
  name: "GameDetail",
  data() {
    return {
      timerId: null,
      startTime: null,
      reactionTime: null,
      reactionScore: null,
      reactionStatus: "idle",
      reactionMessage: "準備開始反應速度測試",
      reactionScoreSubmitted: false,

      catchGameRunning: false,
      catchGameEnded: false,
      catchScore: 0,
      catchLives: 3,
      catchTimeLeft: 20,
      catcherX: 130,
      fallingItemX: 140,
      fallingItemY: 0,
      fallingItemType: "good",
      catchDropTimer: null,
      catchCountdownTimer: null,
      catchScoreSubmitted: false,

      leaderboard: [],
      loadingLeaderboard: false,
      leaderboardError: "",

      submitScoreMessage: "",
      submitScoreMessageType: "success",

      games: [
        {
          id: 2,
          slug: "catch-items",
          name: "接物品",
          category: "動作反應",
          type: "接取挑戰",
          difficulty: "簡單",
          rankingMode: "最高分排名",
          description: "控制角色接住掉落物品，考驗反應與判斷能力。",
          instructions: [
            "按下開始遊戲後，使用左右方向鍵移動接取板。",
            "接住好物品會加分，接到壞物品會扣分。",
            "漏接好物品會失去生命，生命歸零時遊戲結束。"
          ]
        },
        {
          id: 1,
          slug: "reaction-test",
          name: "反應速度測試",
          category: "速度挑戰",
          type: "反應測驗",
          difficulty: "簡單",
          rankingMode: "反應速度分數排名",
          description: "在最短時間內做出反應，挑戰你的手速極限。",
          instructions: [
            "按下開始遊戲後，先等待畫面變色。",
            "只有在畫面變綠後才能立即點擊。",
            "越快做出反應，成績越好。",
            "分數計算方式為 1000 - 您的測試時間"
          ]
        },
        {
          id: 4,
          slug: "bee-shooter",
          name: "小蜜蜂",
          category: "射擊街機",
          type: "飛行射擊",
          difficulty: "中等",
          rankingMode: "最高分排名",
          description: "操作飛船閃避敵人並擊敗對手，取得更高分數。",
          instructions: [
            "使用方向鍵移動飛船。",
            "按下空白鍵發射子彈。",
            "擊敗越多敵人可獲得越高分數。"
          ]
        },
        {
          id: 3,
          slug: "snake",
          name: "貪食蛇",
          category: "經典街機",
          type: "生存成長",
          difficulty: "中等",
          rankingMode: "最高分排名",
          description: "控制蛇持續成長，同時避免撞牆與撞到自己。",
          instructions: [
            "使用方向鍵控制蛇移動方向。",
            "吃到食物後蛇身會變長並增加分數。",
            "撞到牆壁或自己遊戲就會結束。"
          ]
        },
        {
          id: 5,
          slug: "wordle",
          name: "Wordle",
          category: "益智猜字",
          type: "文字推理",
          difficulty: "中等",
          rankingMode: "最少步數 / 最高分",
          description: "在有限次數內猜出正確單字，挑戰你的字彙能力。",
          instructions: [
            "輸入一個合法單字進行猜測。",
            "系統會提示字母位置是否正確。",
            "在限制次數內猜出答案即可獲勝。"
          ]
        }
      ]
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

    getReactionConvertedScore(time) {
      return Math.max(0, 1000 - time)
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

    resetReactionState() {
      if (this.timerId) {
        clearTimeout(this.timerId)
        this.timerId = null
      }

      this.startTime = null
      this.reactionTime = null
      this.reactionScore = null
      this.reactionStatus = "idle"
      this.reactionMessage = "準備開始反應速度測試"
      this.reactionScoreSubmitted = false
      this.submitScoreMessage = ""
    },

    startReactionGame() {
      if (this.timerId) {
        clearTimeout(this.timerId)
        this.timerId = null
      }

      this.startTime = null
      this.reactionTime = null
      this.reactionScore = null
      this.reactionStatus = "waiting"
      this.reactionMessage = "請等待變色..."
      this.reactionScoreSubmitted = false
      this.submitScoreMessage = ""

      const delay = Math.floor(Math.random() * 3000) + 2000

      this.timerId = setTimeout(() => {
        this.reactionStatus = "ready"
        this.reactionMessage = "立即點擊！"
        this.startTime = Date.now()
        this.timerId = null
      }, delay)
    },

    async handleReactionAreaClick() {
      if (this.game?.slug !== "reaction-test") return

      if (this.reactionStatus === "waiting") {
        if (this.timerId) {
          clearTimeout(this.timerId)
          this.timerId = null
        }

        this.reactionStatus = "too-soon"
        this.reactionMessage = "太早點擊了"
        this.reactionTime = null
        this.reactionScore = null
        return
      }

      if (this.reactionStatus === "ready") {
        const endTime = Date.now()
        this.reactionTime = endTime - this.startTime
        this.reactionScore = this.getReactionConvertedScore(this.reactionTime)
        this.reactionStatus = "result"
        this.reactionMessage = `你的反應時間：${this.reactionTime} ms`

        if (!this.reactionScoreSubmitted) {
          this.reactionScoreSubmitted = true
          await this.submitGameScore(this.reactionScore)
        }
      }
    },

    resetCatchGame() {
      if (this.catchDropTimer) {
        clearInterval(this.catchDropTimer)
        this.catchDropTimer = null
      }

      if (this.catchCountdownTimer) {
        clearInterval(this.catchCountdownTimer)
        this.catchCountdownTimer = null
      }

      this.catchGameRunning = false
      this.catchGameEnded = false
      this.catchScore = 0
      this.catchLives = 3
      this.catchTimeLeft = 20
      this.catcherX = 130
      this.catchScoreSubmitted = false
      this.submitScoreMessage = ""
      this.resetFallingItem()
    },

    startCatchGame() {
      this.resetCatchGame()
      this.catchGameRunning = true
      this.catchGameEnded = false

      this.focusCatchGame()

      this.catchDropTimer = setInterval(() => {
        this.fallingItemY += 8

        if (this.fallingItemY >= 250) {
          const catcherLeft = this.catcherX
          const catcherRight = this.catcherX + 80
          const itemCenter = this.fallingItemX + 15
          const isCaught = itemCenter >= catcherLeft && itemCenter <= catcherRight

          if (isCaught) {
            if (this.fallingItemType === "good") {
              this.catchScore += 1
            } else {
              this.catchScore = Math.max(0, this.catchScore - 1)
            }
          } else {
            if (this.fallingItemType === "good") {
              this.catchLives -= 1
            }
          }

          if (this.catchLives <= 0) {
            this.endCatchGame()
            return
          }

          this.resetFallingItem()
        }
      }, 50)

      this.catchCountdownTimer = setInterval(() => {
        this.catchTimeLeft -= 1

        if (this.catchTimeLeft <= 0) {
          this.endCatchGame()
        }
      }, 1000)
    },

    async endCatchGame() {
      if (this.catchDropTimer) {
        clearInterval(this.catchDropTimer)
        this.catchDropTimer = null
      }

      if (this.catchCountdownTimer) {
        clearInterval(this.catchCountdownTimer)
        this.catchCountdownTimer = null
      }

      this.catchGameRunning = false
      this.catchGameEnded = true

      if (!this.catchScoreSubmitted) {
        this.catchScoreSubmitted = true
        await this.submitGameScore(this.catchScore)
      }
    },

    resetFallingItem() {
      this.fallingItemY = 0
      this.fallingItemX = Math.floor(Math.random() * 260)
      this.fallingItemType = Math.random() < 0.75 ? "good" : "bad"
    },

    focusCatchGame() {
      nextTick(() => {
        if (this.$refs.catchGameRef) {
          this.$refs.catchGameRef.focus()
        }
      })
    },

    handleCatchKeydown(event) {
      if (!this.catchGameRunning) return

      if (event.key === "ArrowLeft") {
        this.catcherX = Math.max(0, this.catcherX - 20)
      }

      if (event.key === "ArrowRight") {
        this.catcherX = Math.min(220, this.catcherX + 20)
      }
    }
  },
  watch: {
    "$route.params.slug"() {
      this.resetReactionState()
      this.resetCatchGame()
      this.loadLeaderboard()
    }
  },
  mounted() {
    this.resetReactionState()
    this.resetCatchGame()
    this.loadLeaderboard()
  },
  beforeUnmount() {
    if (this.timerId) {
      clearTimeout(this.timerId)
    }

    if (this.catchDropTimer) {
      clearInterval(this.catchDropTimer)
    }

    if (this.catchCountdownTimer) {
      clearInterval(this.catchCountdownTimer)
    }
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

.reaction-game {
  height: 320px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
  text-align: center;
  padding: 20px;
  cursor: pointer;
  transition: 0.2s ease;
}

.reaction-game.idle {
  background-color: #e5e7eb;
  color: #111827;
}

.reaction-game.waiting {
  background-color: #ef4444;
  color: white;
}

.reaction-game.ready {
  background-color: #22c55e;
  color: white;
}

.reaction-game.result {
  background-color: #2563eb;
  color: white;
}

.reaction-game.too-soon {
  background-color: #f59e0b;
  color: white;
}

.reaction-main-text {
  font-size: 30px;
  font-weight: bold;
  margin: 0 0 12px;
}

.reaction-sub-text {
  font-size: 16px;
  margin: 0;
}

.error-text {
  font-weight: bold;
}

.catch-game {
  outline: none;
}

.catch-game-topbar {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px 0 12px;
  font-weight: bold;
  color: #111827;
}

.catch-game-area {
  position: relative;
  width: 100%;
  max-width: 320px;
  height: 300px;
  background-color: #f8fafc;
  border: 2px solid #cbd5e1;
  border-radius: 14px;
  overflow: hidden;
  margin: 0 auto;
}

.falling-item {
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: white;
}

.falling-item.good {
  background-color: #22c55e;
}

.falling-item.bad {
  background-color: #ef4444;
}

.catcher {
  position: absolute;
  bottom: 10px;
  width: 80px;
  height: 16px;
  background-color: #2563eb;
  border-radius: 999px;
}

.reaction-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.reaction-result-card {
  margin-top: 20px;
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 18px;
}

.reaction-result-card h3 {
  margin: 0 0 10px;
  color: #111827;
}

.reaction-result-card p {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #2563eb;
}

.result-note {
  display: inline-block;
  margin-top: 10px;
  color: #6b7280;
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

  .game-placeholder,
  .reaction-game {
    height: 240px;
  }

  .reaction-main-text {
    font-size: 24px;
  }
}
</style>