<template>
  <div class="catch-game-wrapper">
    <div class="catch-status-panel">
      <div class="status-item">
        <span class="label">分數</span>
        <span class="value">{{ catchScore }}</span>
      </div>

      <div class="status-item">
        <span class="label">等級</span>
        <span class="value">{{ catchLevel }}</span>
      </div>

      <div class="status-item">
        <span class="label">生命</span>
        <span class="value">{{ catchLives }}</span>
      </div>

      <div class="status-item">
        <span class="label">本頁最佳</span>
        <span class="value">{{ bestCatchScore }}</span>
      </div>
    </div>

    <div
      ref="catchGameRef"
      class="catch-game"
      tabindex="0"
      @keydown="handleCatchKeydown"
    >
      <div class="catch-game-topbar">
        <div>狀態：{{ catchStatusText }}</div>
        <div>速度：{{ catchDropSpeed.toFixed(1) }}</div>
        <div>下一次加速分數：{{ nextSpeedMilestone }}</div>
      </div>

      <div class="catch-game-area" :class="{ paused: catchPaused, ended: catchGameEnded }">
        <div
          v-for="item in fallingItems"
          :key="item.id"
          class="falling-item"
          :class="item.type"
          :style="{
            left: item.x + 'px',
            top: item.y + 'px'
          }"
        >
          {{ item.label }}
        </div>

        <div
          class="catcher"
          :style="{ left: catcherX + 'px', width: catcherWidth + 'px' }"
        ></div>

        <div v-if="!catchGameRunning && !catchGameEnded" class="catch-overlay">
          <p class="overlay-title">Catch Items</p>
          <p class="overlay-text">左右方向鍵移動接取板</p>
          <p class="overlay-text">好物件會加分,壞物件會扣除生命</p>
          <p class="overlay-text">每 10 分速度會提升一次</p>
          <p class="overlay-text">按 P 可暫停 / 繼續</p>
        </div>

        <div v-if="catchPaused && catchGameRunning" class="catch-overlay">
          <p class="overlay-title">已暫停</p>
          <p class="overlay-text">按 P 繼續遊戲</p>
        </div>

        <div v-if="catchGameEnded" class="catch-overlay">
          <p class="overlay-title">遊戲結束</p>
          <p class="overlay-text">生命已歸零</p>
        </div>
      </div>
    </div>

    <div class="catch-actions">
      <button class="play-btn" @click="startCatchGame">
        {{ catchGameRunning || catchGameEnded ? "重新開始" : "開始遊戲" }}
      </button>

      <button
        class="secondary-btn"
        :disabled="!catchGameRunning || catchGameEnded"
        @click="toggleCatchPause"
      >
        {{ catchPaused ? "繼續遊戲" : "暫停遊戲" }}
      </button>
    </div>

    <div
      class="catch-result-card"
      v-if="!catchGameRunning && catchGameEnded"
    >
      <h3>本次成績</h3>
      <p>{{ catchScore }} 分</p>
      <small class="result-note">等級：{{ catchLevel }}</small>
      <small class="result-note">生命：{{ catchLives }}</small>
      <small class="result-note">最終速度：{{ catchDropSpeed.toFixed(1) }}</small>
      <small class="result-note">生命已歸零，遊戲結束</small>
    </div>
  </div>
</template>

<script>
import { nextTick } from "vue"

export default {
  name: "CatchItemsGame",
  emits: ["finish"],
  data() {
    return {
      catchGameRunning: false,
      catchGameEnded: false,
      catchPaused: false,

      catchScore: 0,
      catchLives: 3,
      catchLevel: 1,
      bestCatchScore: 0,

      catcherX: 170,
      catcherWidth: 60,

      fallingItems: [],
      itemIdSeed: 1,

      catchDropTimer: null,
      catchSpawnTimer: null,
      catchScoreSubmitted: false,

      catchDropSpeed: 4,
      catchSpawnInterval: 950,
      gameAreaWidth: 420,
      gameAreaHeight: 360
    }
  },
  computed: {
    catchStatusText() {
      if (this.catchGameEnded) return "已結束"
      if (this.catchPaused) return "已暫停"
      if (this.catchGameRunning) return "進行中"
      return "未開始"
    },
    nextSpeedMilestone() {
      return Math.floor(this.catchScore / 10) * 10 + 10
    }
  },
  methods: {
    clearCatchTimers() {
      if (this.catchDropTimer) {
        clearInterval(this.catchDropTimer)
        this.catchDropTimer = null
      }

      if (this.catchSpawnTimer) {
        clearInterval(this.catchSpawnTimer)
        this.catchSpawnTimer = null
      }
    },

    resetCatchGame() {
      this.clearCatchTimers()

      this.catchGameRunning = false
      this.catchGameEnded = false
      this.catchPaused = false
      this.catchScore = 0
      this.catchLives = 3
      this.catchLevel = 1
      this.catcherX = 170
      this.fallingItems = []
      this.itemIdSeed = 1
      this.catchScoreSubmitted = false
      this.catchDropSpeed = 4
      this.catchSpawnInterval = 950
    },

    focusCatchGame() {
      nextTick(() => {
        if (this.$refs.catchGameRef) {
          this.$refs.catchGameRef.focus()
        }
      })
    },

    startCatchTimers() {
      this.clearCatchTimers()

      this.catchDropTimer = setInterval(() => {
        this.updateFallingItems()
      }, 50)

      this.catchSpawnTimer = setInterval(() => {
        if (this.catchGameRunning && !this.catchPaused) {
          this.spawnFallingItem()
        }
      }, this.catchSpawnInterval)
    },

    startCatchGame() {
      this.resetCatchGame()
      this.catchGameRunning = true
      this.catchGameEnded = false
      this.catchPaused = false

      this.focusCatchGame()
      this.spawnFallingItem()
      this.startCatchTimers()
    },

    toggleCatchPause() {
      if (!this.catchGameRunning || this.catchGameEnded) return

      this.catchPaused = !this.catchPaused

      if (this.catchPaused) {
        this.clearCatchTimers()
      } else {
        this.focusCatchGame()
        this.startCatchTimers()
      }
    },

    spawnFallingItem() {
      const itemTemplates = [
        { type: "good", label: "+1", score: 1, life: 0, weight: 42 },
        { type: "gold", label: "+3", score: 3, life: 0, weight: 14 },
        { type: "bad", label: "-1", score: 0, life: -1, weight: 18 },
        { type: "danger", label: "X", score: 0, life: -1, weight: 18 },
        { type: "heart", label: "♥", score: 0, life: 1, weight: 8 }
      ]

      const random = Math.random() * 100
      let cumulative = 0
      let selected = itemTemplates[0]

      for (const item of itemTemplates) {
        cumulative += item.weight
        if (random <= cumulative) {
          selected = item
          break
        }
      }

      this.fallingItems.push({
        id: this.itemIdSeed++,
        x: Math.floor(Math.random() * (this.gameAreaWidth - 30)),
        y: 0,
        ...selected
      })
    },

    updateFallingItems() {
      if (!this.catchGameRunning || this.catchPaused) return

      const nextItems = []

      for (const item of this.fallingItems) {
        const movedItem = {
          ...item,
          y: item.y + this.catchDropSpeed
        }

        if (movedItem.y >= this.gameAreaHeight - 50) {
          const catcherLeft = this.catcherX
          const catcherRight = this.catcherX + this.catcherWidth
          const itemCenter = movedItem.x + 15
          const isCaught = itemCenter >= catcherLeft && itemCenter <= catcherRight

          if (isCaught) {
            this.applyItemEffect(movedItem)
          }

          if (this.catchLives <= 0) {
            this.endCatchGame()
            return
          }
        } else {
          nextItems.push(movedItem)
        }
      }

      this.fallingItems = nextItems
      this.updateCatchDifficulty()
    },

    applyItemEffect(item) {
      if (item.score > 0) {
        this.catchScore += item.score
      }

      if (item.life < 0) {
        this.catchLives += item.life
      }

      if (item.life > 0) {
        this.catchLives = Math.min(5, this.catchLives + item.life)
      }

      this.catchScore = Math.max(0, this.catchScore)
    },

    updateCatchDifficulty() {
      const newLevel = Math.floor(this.catchScore / 10) + 1
      const newDropSpeed = Math.min(12, 4 + (newLevel - 1) * 0.6)

      this.catchLevel = newLevel
      this.catchDropSpeed = newDropSpeed
    },

    async endCatchGame() {
      this.clearCatchTimers()

      this.catchGameRunning = false
      this.catchPaused = false
      this.catchGameEnded = true

      if (this.catchScore > this.bestCatchScore) {
        this.bestCatchScore = this.catchScore
      }

      if (!this.catchScoreSubmitted) {
        this.catchScoreSubmitted = true
        this.$emit("finish", this.catchScore)
      }
    },

    handleCatchKeydown(event) {
      const controlKeys = ["ArrowLeft", "ArrowRight", "p", "P"]

      if (controlKeys.includes(event.key)) {
        event.preventDefault()
      }

      if (!this.catchGameRunning || this.catchGameEnded) return

      if (event.key === "p" || event.key === "P") {
        this.toggleCatchPause()
        return
      }

      if (this.catchPaused) return

      if (event.key === "ArrowLeft") {
        this.catcherX = Math.max(0, this.catcherX - 20)
      }

      if (event.key === "ArrowRight") {
        this.catcherX = Math.min(this.gameAreaWidth - this.catcherWidth, this.catcherX + 20)
      }
    }
  },
  beforeUnmount() {
    this.clearCatchTimers()
  }
}
</script>

<style scoped>
.catch-game-wrapper {
  margin-top: 8px;
}

.catch-status-panel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 20px 0 16px;
}

.status-item {
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 14px 16px;
  text-align: center;
}

.status-item .label {
  display: block;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

.status-item .value {
  font-size: 16px;
  font-weight: bold;
  color: #111827;
}

.catch-game {
  outline: none;
}

.catch-game-topbar {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0 0 12px;
  font-weight: bold;
  color: #111827;
}

.catch-game-area {
  position: relative;
  width: 100%;
  max-width: 420px;
  height: 360px;
  background-color: #f8fafc;
  border: 2px solid #cbd5e1;
  border-radius: 14px;
  overflow: hidden;
  margin: 0 auto;
}

.catch-game-area.paused,
.catch-game-area.ended {
  filter: brightness(0.96);
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
  font-size: 13px;
}

.falling-item.good {
  background-color: #22c55e;
}

.falling-item.gold {
  background-color: #f59e0b;
}

.falling-item.bad {
  background-color: #ef4444;
}

.falling-item.danger {
  background-color: #7c3aed;
}

.falling-item.heart {
  background-color: #ec4899;
}

.catcher {
  position: absolute;
  bottom: 10px;
  height: 14px;
  background-color: #2563eb;
  border-radius: 999px;
  z-index: 2;
}

.catch-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.68);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  color: white;
  z-index: 5;
}

.overlay-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 12px;
}

.overlay-text {
  margin: 4px 0;
  font-size: 15px;
  line-height: 1.6;
}

.catch-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.catch-result-card {
  margin-top: 20px;
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 18px;
}

.catch-result-card h3 {
  margin: 0 0 10px;
  color: #111827;
}

.catch-result-card p {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #2563eb;
}

.result-note {
  display: block;
  margin-top: 10px;
  color: #6b7280;
}

.play-btn,
.secondary-btn {
  display: inline-block;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
}

.play-btn {
  background-color: #2563eb;
  color: white;
}

.play-btn:hover {
  background-color: #1d4ed8;
}

.secondary-btn {
  background-color: #e5e7eb;
  color: #111827;
}

.secondary-btn:hover {
  background-color: #d1d5db;
}

.secondary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .catch-status-panel {
    grid-template-columns: 1fr 1fr;
  }

  .catch-game-area {
    max-width: 100%;
    height: 320px;
  }
}
</style>