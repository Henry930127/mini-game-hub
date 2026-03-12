<template>
  <div class="snake-game-wrapper">
    <div class="snake-status-panel">
      <div class="status-item">
        <span class="label">分數</span>
        <span class="value">{{ snakeScore }}</span>
      </div>

      <div class="status-item">
        <span class="label">等級</span>
        <span class="value">{{ snakeLevel }}</span>
      </div>

      <div class="status-item">
        <span class="label">本頁最佳</span>
        <span class="value">{{ bestSnakeScore }}</span>
      </div>
    </div>

    <div class="snake-game">
      <div class="snake-topbar">
        <div>狀態：{{ snakeStatusText }}</div>
        <div>速度：{{ snakeSpeed }} ms</div>
      </div>

      <div
        ref="snakeBoardRef"
        class="snake-board"
        :class="{
          paused: snakePaused,
          ended: snakeGameOver
        }"
        tabindex="0"
        :style="{
          width: snakeBoardSize * snakeCellSize + 'px',
          height: snakeBoardSize * snakeCellSize + 'px'
        }"
        @keydown="handleSnakeKeydown"
      >
        <div
          v-for="(segment, index) in snake"
          :key="`segment-${index}`"
          class="snake-segment"
          :class="{ head: index === 0 }"
          :style="{
            width: snakeCellSize + 'px',
            height: snakeCellSize + 'px',
            left: segment.x * snakeCellSize + 'px',
            top: segment.y * snakeCellSize + 'px'
          }"
        ></div>

        <div
          class="snake-food"
          :style="{
            width: snakeCellSize + 'px',
            height: snakeCellSize + 'px',
            left: snakeFood.x * snakeCellSize + 'px',
            top: snakeFood.y * snakeCellSize + 'px'
          }"
        ></div>

        <div v-if="!snakeStarted && !snakeGameOver" class="snake-overlay">
          <p class="overlay-title">Snake</p>
          <p class="overlay-text">按「開始遊戲」後使用方向鍵移動</p>
          <p class="overlay-text">按空白鍵可暫停 / 繼續</p>
        </div>

        <div v-if="snakePaused && !snakeGameOver" class="snake-overlay">
          <p class="overlay-title">已暫停</p>
          <p class="overlay-text">按空白鍵繼續遊戲</p>
        </div>

        <div v-if="snakeGameOver" class="snake-overlay">
          <p class="overlay-title">遊戲結束</p>
          <p class="overlay-text">撞到牆壁或自己了</p>
        </div>
      </div>
    </div>

    <div class="snake-actions">
      <button class="play-btn" @click="startSnakeGame">
        {{ snakeStarted || snakeGameOver ? "重新開始" : "開始遊戲" }}
      </button>

      <button
        class="secondary-btn"
        :disabled="!snakeStarted || snakeGameOver"
        @click="toggleSnakePause"
      >
        {{ snakePaused ? "繼續遊戲" : "暫停遊戲" }}
      </button>
    </div>

    <div class="snake-result-card" v-if="snakeGameOver">
      <h3>本次成績</h3>
      <p>{{ snakeScore }} 分</p>
      <small class="result-note">等級：{{ snakeLevel }}</small>
      <small class="result-note">速度：{{ snakeSpeed }} ms</small>
      <small class="result-note">{{ snakeSummaryText }}</small>
    </div>
  </div>
</template>

<script>
import { nextTick } from "vue"

export default {
  name: "SnakeGame",
  emits: ["finish"],
  data() {
    return {
      snakeBoardSize: 20,
      snakeCellSize: 16,
      snake: [],
      snakeDirection: "right",
      nextSnakeDirection: "right",
      snakeFood: { x: 10, y: 10 },
      snakeScore: 0,
      snakeStarted: false,
      snakeGameOver: false,
      snakePaused: false,
      snakeLoop: null,
      snakeScoreSubmitted: false,
      snakeSpeed: 150,
      snakeLevel: 1,
      bestSnakeScore: 0
    }
  },
  computed: {
    snakeStatusText() {
      if (this.snakeGameOver) return "已結束"
      if (this.snakePaused) return "已暫停"
      if (this.snakeStarted) return "進行中"
      return "未開始"
    },
    snakeSummaryText() {
      if (this.snakeScore >= 100) return "表現很強，已經很熟練了"
      if (this.snakeScore >= 60) return "表現不錯，再試一次有機會更高"
      if (this.snakeScore >= 30) return "已經掌握基本節奏"
      return "再多練幾次會更穩"
    }
  },
  methods: {
    resetSnakeLoop() {
      if (this.snakeLoop) {
        clearInterval(this.snakeLoop)
        this.snakeLoop = null
      }
    },

    startSnakeLoop() {
      this.resetSnakeLoop()

      this.snakeLoop = setInterval(() => {
        this.moveSnake()
      }, this.snakeSpeed)
    },

    resetSnakeGame() {
      this.resetSnakeLoop()

      this.snake = [
        { x: 8, y: 10 },
        { x: 7, y: 10 },
        { x: 6, y: 10 }
      ]
      this.snakeDirection = "right"
      this.nextSnakeDirection = "right"
      this.snakeFood = { x: 12, y: 10 }
      this.snakeScore = 0
      this.snakeStarted = false
      this.snakeGameOver = false
      this.snakePaused = false
      this.snakeScoreSubmitted = false
      this.snakeSpeed = 150
      this.snakeLevel = 1
      this.generateSnakeFood()
    },

    focusSnakeBoard() {
      nextTick(() => {
        if (this.$refs.snakeBoardRef) {
          this.$refs.snakeBoardRef.focus()
        }
      })
    },

    startSnakeGame() {
      this.resetSnakeGame()
      this.snakeStarted = true
      this.snakeGameOver = false
      this.snakePaused = false
      this.focusSnakeBoard()
      this.startSnakeLoop()
    },

    toggleSnakePause() {
      if (!this.snakeStarted || this.snakeGameOver) return

      this.snakePaused = !this.snakePaused

      if (this.snakePaused) {
        this.resetSnakeLoop()
      } else {
        this.focusSnakeBoard()
        this.startSnakeLoop()
      }
    },

    handleSnakeKeydown(event) {
      const controlKeys = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        " ",
        "Spacebar"
      ]

      if (controlKeys.includes(event.key) || event.code === "Space") {
        event.preventDefault()
      }

      if (!this.snakeStarted || this.snakeGameOver) return

      if (event.code === "Space" || event.key === " " || event.key === "Spacebar") {
        this.toggleSnakePause()
        return
      }

      if (this.snakePaused) return

      if (event.key === "ArrowUp" && this.snakeDirection !== "down") {
        this.nextSnakeDirection = "up"
      } else if (event.key === "ArrowDown" && this.snakeDirection !== "up") {
        this.nextSnakeDirection = "down"
      } else if (event.key === "ArrowLeft" && this.snakeDirection !== "right") {
        this.nextSnakeDirection = "left"
      } else if (event.key === "ArrowRight" && this.snakeDirection !== "left") {
        this.nextSnakeDirection = "right"
      }
    },

    moveSnake() {
      if (!this.snakeStarted || this.snakeGameOver || this.snakePaused) return

      this.snakeDirection = this.nextSnakeDirection

      const head = { ...this.snake[0] }

      if (this.snakeDirection === "up") head.y -= 1
      if (this.snakeDirection === "down") head.y += 1
      if (this.snakeDirection === "left") head.x -= 1
      if (this.snakeDirection === "right") head.x += 1

      const hitWall =
        head.x < 0 ||
        head.x >= this.snakeBoardSize ||
        head.y < 0 ||
        head.y >= this.snakeBoardSize

      const hitSelf = this.snake.some(
        (segment) => segment.x === head.x && segment.y === head.y
      )

      if (hitWall || hitSelf) {
        this.endSnakeGame()
        return
      }

      this.snake.unshift(head)

      if (head.x === this.snakeFood.x && head.y === this.snakeFood.y) {
        this.snakeScore += 10
        this.updateSnakeLevelAndSpeed()
        this.generateSnakeFood()
      } else {
        this.snake.pop()
      }
    },

    updateSnakeLevelAndSpeed() {
      const newLevel = Math.floor(this.snakeScore / 30) + 1
      const newSpeed = Math.max(70, 150 - (newLevel - 1) * 10)

      const levelChanged = newLevel !== this.snakeLevel
      const speedChanged = newSpeed !== this.snakeSpeed

      this.snakeLevel = newLevel
      this.snakeSpeed = newSpeed

      if (levelChanged || speedChanged) {
        this.startSnakeLoop()
      }
    },

    generateSnakeFood() {
      let newFood
      let onSnake = true

      while (onSnake) {
        newFood = {
          x: Math.floor(Math.random() * this.snakeBoardSize),
          y: Math.floor(Math.random() * this.snakeBoardSize)
        }

        onSnake = this.snake.some(
          (segment) => segment.x === newFood.x && segment.y === newFood.y
        )
      }

      this.snakeFood = newFood
    },

    endSnakeGame() {
      this.resetSnakeLoop()

      this.snakeStarted = false
      this.snakePaused = false
      this.snakeGameOver = true

      if (this.snakeScore > this.bestSnakeScore) {
        this.bestSnakeScore = this.snakeScore
      }

      if (!this.snakeScoreSubmitted) {
        this.snakeScoreSubmitted = true
        this.$emit("finish", this.snakeScore)
      }
    }
  },
  mounted() {
    this.resetSnakeGame()
  },
  beforeUnmount() {
    this.resetSnakeLoop()
  }
}
</script>

<style scoped>
.snake-game-wrapper {
  margin-top: 8px;
}

.snake-status-panel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

.snake-game {
  margin-top: 8px;
}

.snake-topbar {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0 0 12px;
  font-weight: bold;
  color: #111827;
}

.snake-board {
  position: relative;
  margin: 0 auto;
  background-color: #111827;
  border: 2px solid #374151;
  border-radius: 12px;
  outline: none;
  overflow: hidden;
}

.snake-board.paused,
.snake-board.ended {
  filter: brightness(0.95);
}

.snake-segment {
  position: absolute;
  background-color: #22c55e;
  border-radius: 3px;
}

.snake-segment.head {
  background-color: #16a34a;
}

.snake-food {
  position: absolute;
  background-color: #ef4444;
  border-radius: 50%;
}

.snake-overlay {
  position: absolute;
  inset: 0;
  background: rgba(17, 24, 39, 0.72);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  color: white;
  z-index: 2;
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

.snake-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.snake-result-card {
  margin-top: 20px;
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 18px;
}

.snake-result-card h3 {
  margin: 0 0 10px;
  color: #111827;
}

.snake-result-card p {
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
  .snake-status-panel {
    grid-template-columns: 1fr;
  }
}
</style>