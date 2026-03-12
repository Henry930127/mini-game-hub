<template>
  <div class="reaction-game-wrapper">
    <div class="reaction-status-panel">
      <div class="status-item">
        <span class="label">目前狀態</span>
        <span class="value">{{ statusText }}</span>
      </div>

      <div class="status-item">
        <span class="label">本次成績</span>
        <span class="value">
          {{ reactionTime !== null ? `${reactionTime} ms` : "-" }}
        </span>
      </div>

      <div class="status-item">
        <span class="label">本頁最佳</span>
        <span class="value">
          {{ bestReactionTime !== null ? `${bestReactionTime} ms` : "-" }}
        </span>
      </div>
    </div>

    <div
      class="reaction-game"
      :class="reactionStatus"
      @click="handleReactionAreaClick"
    >
      <p class="reaction-main-text">{{ reactionMessage }}</p>

      <p class="reaction-sub-text" v-if="reactionStatus === 'idle'">
        按下開始後，等畫面變綠再點擊
      </p>

      <p class="reaction-sub-text" v-else-if="reactionStatus === 'countdown'">
        請準備，測試即將開始
      </p>

      <p class="reaction-sub-text" v-else-if="reactionStatus === 'waiting'">
        請等到畫面變綠後再點擊
      </p>

      <p class="reaction-sub-text" v-else-if="reactionStatus === 'ready'">
        就是現在，立刻點擊
      </p>

      <p class="reaction-sub-text" v-else-if="reactionStatus === 'result'">
        {{ reactionComment }}
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
        {{ buttonText }}
      </button>
    </div>

    <div class="reaction-result-card" v-if="reactionTime !== null">
      <h3>本次成績</h3>
      <p>{{ reactionTime }} ms</p>
      <small class="result-note" v-if="reactionScore !== null">
        排行榜換算分數：{{ reactionScore }}
      </small>
      <small class="result-note" v-if="reactionComment">
        評價：{{ reactionComment }}
      </small>
    </div>
  </div>
</template>

<script>
export default {
  name: "ReactionGame",
  emits: ["finish"],
  data() {
    return {
      timerId: null,
      countdownTimerId: null,
      startTime: null,
      reactionTime: null,
      reactionScore: null,
      reactionStatus: "idle",
      reactionMessage: "準備開始反應速度測試",
      reactionScoreSubmitted: false,
      bestReactionTime: null
    }
  },
  computed: {
    buttonText() {
      if (this.reactionStatus === "idle") return "開始遊戲"
      if (this.reactionStatus === "result") return "再玩一次"
      if (this.reactionStatus === "too-soon") return "重新開始"
      return "重新測試"
    },
    statusText() {
      if (this.reactionStatus === "idle") return "尚未開始"
      if (this.reactionStatus === "countdown") return "準備中"
      if (this.reactionStatus === "waiting") return "等待訊號"
      if (this.reactionStatus === "ready") return "可以點擊"
      if (this.reactionStatus === "result") return "已完成"
      if (this.reactionStatus === "too-soon") return "失誤"
      return "-"
    },
    reactionComment() {
      if (this.reactionTime === null) return ""

      if (this.reactionTime < 180) return "超快，你的反應非常優秀"
      if (this.reactionTime < 250) return "很快，表現很好"
      if (this.reactionTime < 320) return "不錯，屬於正常偏快"
      if (this.reactionTime < 400) return "普通，可以再挑戰一次"
      return "稍慢，再試一次看看"
    }
  },
  methods: {
    getReactionConvertedScore(time) {
      return Math.max(0, 1000 - time)
    },

    clearAllTimers() {
      if (this.timerId) {
        clearTimeout(this.timerId)
        this.timerId = null
      }

      if (this.countdownTimerId) {
        clearTimeout(this.countdownTimerId)
        this.countdownTimerId = null
      }
    },

    resetReactionState() {
      this.clearAllTimers()

      this.startTime = null
      this.reactionTime = null
      this.reactionScore = null
      this.reactionStatus = "idle"
      this.reactionMessage = "準備開始反應速度測試"
      this.reactionScoreSubmitted = false
    },

    startReactionGame() {
      this.clearAllTimers()

      this.startTime = null
      this.reactionTime = null
      this.reactionScore = null
      this.reactionScoreSubmitted = false
      this.reactionStatus = "countdown"
      this.reactionMessage = "準備中..."

      this.countdownTimerId = setTimeout(() => {
        this.reactionStatus = "waiting"
        this.reactionMessage = "請等待變色..."

        const delay = Math.floor(Math.random() * 2500) + 1500

        this.timerId = setTimeout(() => {
          this.reactionStatus = "ready"
          this.reactionMessage = "立即點擊！"
          this.startTime = Date.now()
          this.timerId = null
        }, delay)

        this.countdownTimerId = null
      }, 800)
    },

    handleReactionAreaClick() {
      if (this.reactionStatus === "idle" || this.reactionStatus === "countdown") {
        return
      }

      if (this.reactionStatus === "waiting") {
        this.clearAllTimers()
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

        if (
          this.bestReactionTime === null ||
          this.reactionTime < this.bestReactionTime
        ) {
          this.bestReactionTime = this.reactionTime
        }

        if (!this.reactionScoreSubmitted) {
          this.reactionScoreSubmitted = true
          this.$emit("finish", this.reactionScore)
        }
      }
    }
  },
  beforeUnmount() {
    this.clearAllTimers()
  }
}
</script>

<style scoped>
.reaction-game-wrapper {
  margin-top: 8px;
}

.reaction-status-panel {
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

.reaction-game {
  height: 320px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 0 16px;
  text-align: center;
  padding: 20px;
  cursor: pointer;
  transition: 0.2s ease;
  user-select: none;
}

.reaction-game.idle {
  background-color: #e5e7eb;
  color: #111827;
}

.reaction-game.countdown {
  background-color: #cbd5e1;
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
  line-height: 1.6;
}

.error-text {
  font-weight: bold;
}

.reaction-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
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
  display: block;
  margin-top: 10px;
  color: #6b7280;
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

@media (max-width: 768px) {
  .reaction-status-panel {
    grid-template-columns: 1fr;
  }

  .reaction-game {
    height: 260px;
  }

  .reaction-main-text {
    font-size: 24px;
  }
}
</style>