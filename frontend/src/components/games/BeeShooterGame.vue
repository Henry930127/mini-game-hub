<template>
  <div class="bee-game-wrapper">
    <div class="bee-status-panel">
      <div class="status-item">
        <span class="label">分數</span>
        <span class="value">{{ beeScore }}</span>
      </div>

      <div class="status-item">
        <span class="label">等級</span>
        <span class="value">{{ beeLevel }}</span>
      </div>

      <div class="status-item">
        <span class="label">生命</span>
        <span class="value">{{ beeLives }}</span>
      </div>

      <div class="status-item">
        <span class="label">本頁最佳</span>
        <span class="value">{{ bestBeeScore }}</span>
      </div>
    </div>

    <div
      ref="beeGameRef"
      class="bee-game"
      tabindex="0"
      @keydown="handleBeeKeydown"
    >
      <div class="bee-topbar">
        <div>狀態：{{ beeStatusText }}</div>
        <div>擊落數：{{ beeKillCount }}</div>
        <div>敵人速度：{{ beeEnemySpeed }}</div>
      </div>

      <div class="bee-game-area" :class="{ paused: beePaused, ended: beeGameEnded }">
        <div
          class="bee-player"
          :style="{
            left: beePlayerX + 'px',
            width: beePlayerWidth + 'px',
            height: beePlayerHeight + 'px'
          }"
        ></div>

        <div
          v-for="enemy in beeEnemies"
          :key="enemy.id"
          class="bee-enemy"
          :style="{
            left: enemy.x + 'px',
            top: enemy.y + 'px',
            width: enemy.width + 'px',
            height: enemy.height + 'px'
          }"
        ></div>

        <div
          v-for="bullet in beeBullets"
          :key="bullet.id"
          class="bee-bullet"
          :style="{
            left: bullet.x + 'px',
            top: bullet.y + 'px',
            width: bullet.width + 'px',
            height: bullet.height + 'px'
          }"
        ></div>

        <div v-if="!beeGameRunning && !beeGameEnded" class="bee-overlay">
          <p class="overlay-title">Bee Shooter</p>
          <p class="overlay-text">左右方向鍵移動</p>
          <p class="overlay-text">空白鍵射擊</p>
          <p class="overlay-text">P 鍵可暫停 / 繼續</p>
        </div>

        <div v-if="beePaused && beeGameRunning" class="bee-overlay">
          <p class="overlay-title">已暫停</p>
          <p class="overlay-text">按 P 繼續遊戲</p>
        </div>

        <div v-if="beeGameEnded" class="bee-overlay">
          <p class="overlay-title">遊戲結束</p>
          <p class="overlay-text">生命已歸零</p>
        </div>
      </div>
    </div>

    <div class="bee-actions">
      <button class="play-btn" @click="startBeeGame">
        {{ beeGameRunning || beeGameEnded ? "重新開始" : "開始遊戲" }}
      </button>

      <button
        class="secondary-btn"
        :disabled="!beeGameRunning || beeGameEnded"
        @click="toggleBeePause"
      >
        {{ beePaused ? "繼續遊戲" : "暫停遊戲" }}
      </button>
    </div>

    <div
      class="bee-result-card"
      v-if="!beeGameRunning && beeGameEnded"
    >
      <h3>本次成績</h3>
      <p>{{ beeScore }} 分</p>
      <small class="result-note">等級：{{ beeLevel }}</small>
      <small class="result-note">擊落數：{{ beeKillCount }}</small>
      <small class="result-note">剩餘敵人壓力已解除</small>
    </div>
  </div>
</template>

<script>
import { nextTick } from "vue"

export default {
  name: "BeeShooterGame",
  emits: ["finish"],
  data() {
    return {
      beeGameRunning: false,
      beeGameEnded: false,
      beePaused: false,

      beeScore: 0,
      beeLives: 3,
      beeLevel: 1,
      beeKillCount: 0,
      bestBeeScore: 0,

      beePlayerX: 135,
      beePlayerWidth: 50,
      beePlayerHeight: 20,

      beeEnemies: [],
      beeBullets: [],

      beeSpawnTimer: null,
      beeGameLoop: null,
      beeScoreSubmitted: false,

      beeEnemySpeed: 4,
      beeSpawnInterval: 1200,

      enemyIdSeed: 1,
      bulletIdSeed: 1,

      gameAreaWidth: 320,
      gameAreaHeight: 360
    }
  },
  computed: {
    beeStatusText() {
      if (this.beeGameEnded) return "已結束"
      if (this.beePaused) return "已暫停"
      if (this.beeGameRunning) return "進行中"
      return "未開始"
    }
  },
  methods: {
    clearBeeTimers() {
      if (this.beeSpawnTimer) {
        clearInterval(this.beeSpawnTimer)
        this.beeSpawnTimer = null
      }

      if (this.beeGameLoop) {
        clearInterval(this.beeGameLoop)
        this.beeGameLoop = null
      }
    },

    resetBeeGame() {
      this.clearBeeTimers()

      this.beeGameRunning = false
      this.beeGameEnded = false
      this.beePaused = false

      this.beeScore = 0
      this.beeLives = 3
      this.beeLevel = 1
      this.beeKillCount = 0

      this.beePlayerX = 135
      this.beeEnemies = []
      this.beeBullets = []

      this.beeScoreSubmitted = false
      this.beeEnemySpeed = 4
      this.beeSpawnInterval = 1200

      this.enemyIdSeed = 1
      this.bulletIdSeed = 1
    },

    focusBeeGame() {
      nextTick(() => {
        if (this.$refs.beeGameRef) {
          this.$refs.beeGameRef.focus()
        }
      })
    },

    startBeeLoop() {
      this.clearBeeTimers()

      this.beeSpawnTimer = setInterval(() => {
        if (this.beeGameRunning && !this.beePaused) {
          this.spawnBeeEnemy()
        }
      }, this.beeSpawnInterval)

      this.beeGameLoop = setInterval(() => {
        this.updateBeeGame()
      }, 30)
    },

    startBeeGame() {
      this.resetBeeGame()
      this.beeGameRunning = true
      this.focusBeeGame()
      this.spawnBeeEnemy()
      this.startBeeLoop()
    },

    toggleBeePause() {
      if (!this.beeGameRunning || this.beeGameEnded) return

      this.beePaused = !this.beePaused

      if (this.beePaused) {
        this.clearBeeTimers()
      } else {
        this.focusBeeGame()
        this.startBeeLoop()
      }
    },

    spawnBeeEnemy() {
      const width = 32
      const height = 32
      const maxX = this.gameAreaWidth - width

      this.beeEnemies.push({
        id: this.enemyIdSeed++,
        x: Math.floor(Math.random() * (maxX + 1)),
        y: 0,
        width,
        height
      })
    },

    createBullet() {
      this.beeBullets.push({
        id: this.bulletIdSeed++,
        x: this.beePlayerX + this.beePlayerWidth / 2 - 3,
        y: 320,
        width: 6,
        height: 16
      })
    },

    handleBeeKeydown(event) {
      const controlKeys = [
        "ArrowLeft",
        "ArrowRight",
        " ",
        "Spacebar",
        "p",
        "P"
      ]

      if (controlKeys.includes(event.key) || event.code === "Space") {
        event.preventDefault()
      }

      if (!this.beeGameRunning || this.beeGameEnded) return

      if (event.key === "p" || event.key === "P") {
        this.toggleBeePause()
        return
      }

      if (this.beePaused) return

      if (event.key === "ArrowLeft") {
        this.beePlayerX = Math.max(0, this.beePlayerX - 20)
      }

      if (event.key === "ArrowRight") {
        this.beePlayerX = Math.min(
          this.gameAreaWidth - this.beePlayerWidth,
          this.beePlayerX + 20
        )
      }

      if (event.key === " " || event.code === "Space" || event.key === "Spacebar") {
        this.createBullet()
      }
    },

    updateBeeGame() {
      if (!this.beeGameRunning || this.beePaused) return

      this.updateBullets()
      this.updateEnemies()
      this.checkBulletEnemyCollisions()
      this.checkEnemyPlayerCollisions()
      this.updateBeeDifficulty()
    },

    updateBullets() {
      this.beeBullets = this.beeBullets
        .map((bullet) => ({
          ...bullet,
          y: bullet.y - 10
        }))
        .filter((bullet) => bullet.y > -20)
    },

    updateEnemies() {
      const remainingEnemies = []

      for (const enemy of this.beeEnemies) {
        const movedEnemy = {
          ...enemy,
          y: enemy.y + this.beeEnemySpeed
        }

        if (movedEnemy.y >= 330) {
          this.beeLives -= 1

          if (this.beeLives <= 0) {
            this.endBeeGame()
            return
          }
        } else {
          remainingEnemies.push(movedEnemy)
        }
      }

      this.beeEnemies = remainingEnemies
    },

    checkBulletEnemyCollisions() {
      const removedEnemyIds = new Set()
      const removedBulletIds = new Set()

      for (const bullet of this.beeBullets) {
        for (const enemy of this.beeEnemies) {
          if (removedEnemyIds.has(enemy.id) || removedBulletIds.has(bullet.id)) {
            continue
          }

          if (this.isRectHit(bullet, enemy)) {
            removedEnemyIds.add(enemy.id)
            removedBulletIds.add(bullet.id)
            this.beeScore += 10
            this.beeKillCount += 1
          }
        }
      }

      if (removedEnemyIds.size > 0) {
        this.beeEnemies = this.beeEnemies.filter(
          (enemy) => !removedEnemyIds.has(enemy.id)
        )
      }

      if (removedBulletIds.size > 0) {
        this.beeBullets = this.beeBullets.filter(
          (bullet) => !removedBulletIds.has(bullet.id)
        )
      }
    },

    checkEnemyPlayerCollisions() {
      const playerRect = {
        x: this.beePlayerX,
        y: this.gameAreaHeight - 14 - this.beePlayerHeight,
        width: this.beePlayerWidth,
        height: this.beePlayerHeight
      }

      const remainingEnemies = []

      for (const enemy of this.beeEnemies) {
        if (this.isRectHit(enemy, playerRect)) {
          this.beeLives -= 1

          if (this.beeLives <= 0) {
            this.endBeeGame()
            return
          }
        } else {
          remainingEnemies.push(enemy)
        }
      }

      this.beeEnemies = remainingEnemies
    },

    isRectHit(a, b) {
      return !(
        a.x + a.width < b.x ||
        a.x > b.x + b.width ||
        a.y + a.height < b.y ||
        a.y > b.y + b.height
      )
    },

    updateBeeDifficulty() {
      const newLevel = Math.floor(this.beeScore / 50) + 1
      this.beeLevel = newLevel
      this.beeEnemySpeed = Math.min(10, 4 + (newLevel - 1))
      this.beeSpawnInterval = Math.max(450, 1200 - (newLevel - 1) * 90)
    },

    async endBeeGame() {
      this.clearBeeTimers()
      this.beeGameRunning = false
      this.beePaused = false
      this.beeGameEnded = true

      if (this.beeScore > this.bestBeeScore) {
        this.bestBeeScore = this.beeScore
      }

      if (!this.beeScoreSubmitted) {
        this.beeScoreSubmitted = true
        this.$emit("finish", this.beeScore)
      }
    }
  },
  beforeUnmount() {
    this.clearBeeTimers()
  }
}
</script>

<style scoped>
.bee-game-wrapper {
  margin-top: 8px;
}

.bee-status-panel {
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

.bee-game {
  outline: none;
}

.bee-topbar {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0 0 12px;
  font-weight: bold;
  color: #111827;
}

.bee-game-area {
  position: relative;
  width: 100%;
  max-width: 320px;
  height: 360px;
  background: linear-gradient(to bottom, #dbeafe, #eff6ff);
  border: 2px solid #cbd5e1;
  border-radius: 14px;
  overflow: hidden;
  margin: 0 auto;
}

.bee-game-area.paused,
.bee-game-area.ended {
  filter: brightness(0.96);
}

.bee-player {
  position: absolute;
  bottom: 14px;
  background-color: #2563eb;
  border-radius: 10px 10px 4px 4px;
  z-index: 2;
}

.bee-enemy {
  position: absolute;
  background-color: #f59e0b;
  border-radius: 50%;
}

.bee-bullet {
  position: absolute;
  background-color: #ef4444;
  border-radius: 999px;
}

.bee-overlay {
  position: absolute;
  inset: 0;
  background: rgba(17, 24, 39, 0.68);
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

.bee-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.bee-result-card {
  margin-top: 20px;
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 18px;
}

.bee-result-card h3 {
  margin: 0 0 10px;
  color: #111827;
}

.bee-result-card p {
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
  .bee-status-panel {
    grid-template-columns: 1fr 1fr;
  }
}
</style>