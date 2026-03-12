<template>
  <div class="wordle-game-wrapper">
    <div class="wordle-status-panel">
      <div class="status-item">
        <span class="label">已猜次數</span>
        <span class="value">{{ wordleGuesses.length }}</span>
      </div>

      <div class="status-item">
        <span class="label">剩餘次數</span>
        <span class="value">{{ wordleMaxAttempts - wordleGuesses.length }}</span>
      </div>

      <div class="status-item">
        <span class="label">狀態</span>
        <span class="value">{{ wordleStatusText }}</span>
      </div>

      <div class="status-item">
        <span class="label">本頁最佳</span>
        <span class="value">{{ bestWordleScore }}</span>
      </div>
    </div>

    <div class="wordle-game">
      <div class="wordle-topbar">
        <div>答案長度：5</div>
        <div>難度：6 次內猜中</div>
      </div>

      <div class="wordle-board">
        <div
          v-for="rowIndex in wordleMaxAttempts"
          :key="`row-${rowIndex}`"
          class="wordle-row"
        >
          <div
            v-for="colIndex in 5"
            :key="`cell-${rowIndex}-${colIndex}`"
            class="wordle-cell"
            :class="getCellClass(rowIndex - 1, colIndex - 1)"
          >
            {{ getCellLetter(rowIndex - 1, colIndex - 1) }}
          </div>
        </div>
      </div>

      <div class="wordle-input-area" v-if="!wordleGameEnded">
        <input
          v-model="wordleCurrentGuess"
          class="wordle-input"
          type="text"
          maxlength="5"
          placeholder="輸入 5 個英文字母"
          @input="handleWordleInput"
          @keyup.enter="submitWordleGuess"
        />
        <button class="play-btn" @click="submitWordleGuess">
          送出猜測
        </button>
      </div>

      <div class="wordle-keyboard">
        <button
          v-for="key in keyboardRows[0]"
          :key="`k1-${key}`"
          class="key-btn"
          :class="keyboardStatusMap[key]"
          @click="handleKeyInput(key)"
          :disabled="wordleGameEnded"
        >
          {{ key }}
        </button>
      </div>

      <div class="wordle-keyboard">
        <button
          v-for="key in keyboardRows[1]"
          :key="`k2-${key}`"
          class="key-btn"
          :class="keyboardStatusMap[key]"
          @click="handleKeyInput(key)"
          :disabled="wordleGameEnded"
        >
          {{ key }}
        </button>
      </div>

      <div class="wordle-keyboard">
        <button
          class="key-btn action"
          @click="removeLastLetter"
          :disabled="wordleGameEnded"
        >
          刪除
        </button>

        <button
          v-for="key in keyboardRows[2]"
          :key="`k3-${key}`"
          class="key-btn"
          :class="keyboardStatusMap[key]"
          @click="handleKeyInput(key)"
          :disabled="wordleGameEnded"
        >
          {{ key }}
        </button>

        <button
          class="key-btn action"
          @click="submitWordleGuess"
          :disabled="wordleGameEnded"
        >
          送出
        </button>
      </div>

      <div class="wordle-result-card" v-if="wordleGameEnded">
        <h3>{{ wordleGameWon ? '挑戰成功' : '遊戲結束' }}</h3>
        <p v-if="wordleGameWon">{{ getWordleScore() }} 分</p>
        <p v-else>答案：{{ wordleAnswer }}</p>
        <small class="result-note">
          {{
            wordleGameWon
              ? `你用了 ${wordleGuesses.length} 次猜中答案`
              : '你已用完所有機會'
          }}
        </small>
      </div>
    </div>

    <div class="wordle-actions">
      <button class="secondary-btn" @click="resetWordleGame">
        重新開始
      </button>
    </div>

    <p
      v-if="localMessage"
      class="wordle-message"
      :class="{ error: localMessageType === 'error' }"
    >
      {{ localMessage }}
    </p>
  </div>
</template>

<script>
import { wordleAnswers } from "../../data/wordleAnswers"
import { wordleAllowedWords } from "../../data/wordleAllowedWords"

export default {
  name: "WordleGame",
  emits: ["finish"],
  data() {
    return {
      wordleAnswer: "APPLE",
      wordleCurrentGuess: "",
      wordleGuesses: [],
      wordleGameEnded: false,
      wordleGameWon: false,
      wordleMaxAttempts: 6,
      wordleScoreSubmitted: false,
      localMessage: "",
      localMessageType: "success",
      bestWordleScore: 0,
      keyboardRows: [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["Z", "X", "C", "V", "B", "N", "M"]
      ],
      keyboardStatusMap: {},
      answerWords: wordleAnswers,
      validWords: wordleAllowedWords
    }
  },
  computed: {
    wordleStatusText() {
      if (this.wordleGameWon) return "已成功"
      if (this.wordleGameEnded) return "失敗"
      return "進行中"
    }
  },
  methods: {
    pickRandomAnswer() {
      const index = Math.floor(Math.random() * this.answerWords.length)
      return this.answerWords[index]
    },

    resetWordleGame() {
      this.wordleAnswer = this.pickRandomAnswer()
      this.wordleCurrentGuess = ""
      this.wordleGuesses = []
      this.wordleGameEnded = false
      this.wordleGameWon = false
      this.wordleMaxAttempts = 6
      this.wordleScoreSubmitted = false
      this.localMessage = ""
      this.localMessageType = "success"
      this.keyboardStatusMap = {}
    },

    handleWordleInput() {
      this.wordleCurrentGuess = this.wordleCurrentGuess
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 5)
    },

    handleKeyInput(letter) {
      if (this.wordleGameEnded) return
      if (this.wordleCurrentGuess.length >= 5) return
      this.wordleCurrentGuess += letter
    },

    removeLastLetter() {
      if (this.wordleGameEnded) return
      this.wordleCurrentGuess = this.wordleCurrentGuess.slice(0, -1)
    },

    isValidWord(word) {
      return this.validWords.includes(word)
    },

    evaluateWordleGuess(guess) {
      const answer = this.wordleAnswer.split("")
      const letters = guess.split("")
      const result = Array(5).fill("absent")

      const answerUsed = Array(5).fill(false)
      const guessUsed = Array(5).fill(false)

      for (let i = 0; i < 5; i++) {
        if (letters[i] === answer[i]) {
          result[i] = "correct"
          answerUsed[i] = true
          guessUsed[i] = true
        }
      }

      for (let i = 0; i < 5; i++) {
        if (guessUsed[i]) continue

        for (let j = 0; j < 5; j++) {
          if (!answerUsed[j] && letters[i] === answer[j]) {
            result[i] = "present"
            answerUsed[j] = true
            break
          }
        }
      }

      return {
        letters,
        result
      }
    },

    updateKeyboardStatus(evaluatedGuess) {
      const priority = {
        absent: 1,
        present: 2,
        correct: 3
      }

      evaluatedGuess.letters.forEach((letter, index) => {
        const newStatus = evaluatedGuess.result[index]
        const currentStatus = this.keyboardStatusMap[letter]

        if (!currentStatus || priority[newStatus] > priority[currentStatus]) {
          this.keyboardStatusMap[letter] = newStatus
        }
      })
    },

    getWordleScore() {
      return Math.max(0, 700 - (this.wordleGuesses.length - 1) * 100)
    },

    getCellLetter(rowIndex, colIndex) {
      const guess = this.wordleGuesses[rowIndex]
      if (!guess) return ""
      return guess.letters[colIndex] || ""
    },

    getCellClass(rowIndex, colIndex) {
      const guess = this.wordleGuesses[rowIndex]
      if (!guess) return "empty"
      return guess.result[colIndex] || "empty"
    },

    async submitWordleGuess() {
      if (this.wordleGameEnded) return

      const guess = this.wordleCurrentGuess.trim().toUpperCase()

      if (guess.length !== 5) {
        this.localMessage = "請輸入 5 個英文字母"
        this.localMessageType = "error"
        return
      }

      if (!this.isValidWord(guess)) {
        this.localMessage = "這不是有效單字"
        this.localMessageType = "error"
        return
      }

      this.localMessage = ""
      this.localMessageType = "success"

      const evaluatedGuess = this.evaluateWordleGuess(guess)
      this.wordleGuesses.push(evaluatedGuess)
      this.updateKeyboardStatus(evaluatedGuess)

      const isCorrect = guess === this.wordleAnswer
      this.wordleCurrentGuess = ""

      if (isCorrect) {
        this.wordleGameWon = true
        this.wordleGameEnded = true

        const score = this.getWordleScore()
        if (score > this.bestWordleScore) {
          this.bestWordleScore = score
        }

        if (!this.wordleScoreSubmitted) {
          this.wordleScoreSubmitted = true
          this.$emit("finish", score)
        }
        return
      }

      if (this.wordleGuesses.length >= this.wordleMaxAttempts) {
        this.wordleGameWon = false
        this.wordleGameEnded = true
      }
    }
  },
  mounted() {
    this.resetWordleGame()
  }
}
</script>

<style scoped>
.wordle-game-wrapper {
  margin-top: 8px;
}

.wordle-status-panel {
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

.wordle-game {
  margin-top: 8px;
}

.wordle-topbar {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0 0 12px;
  font-weight: bold;
  color: #111827;
}

.wordle-board {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0 auto 20px;
  max-width: 320px;
}

.wordle-row {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.wordle-cell {
  width: 52px;
  height: 52px;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
  border-radius: 8px;
  background-color: white;
  color: #111827;
  text-transform: uppercase;
}

.wordle-cell.empty {
  background-color: #f8fafc;
}

.wordle-cell.correct {
  background-color: #22c55e;
  color: white;
  border-color: #22c55e;
}

.wordle-cell.present {
  background-color: #eab308;
  color: white;
  border-color: #eab308;
}

.wordle-cell.absent {
  background-color: #94a3b8;
  color: white;
  border-color: #94a3b8;
}

.wordle-input-area {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.wordle-input {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 16px;
  min-width: 220px;
  text-transform: uppercase;
}

.wordle-keyboard {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.key-btn {
  min-width: 34px;
  height: 42px;
  border: none;
  border-radius: 8px;
  background: #e5e7eb;
  color: #111827;
  font-weight: bold;
  cursor: pointer;
  padding: 0 8px;
}

.key-btn.correct {
  background-color: #22c55e;
  color: white;
}

.key-btn.present {
  background-color: #eab308;
  color: white;
}

.key-btn.absent {
  background-color: #94a3b8;
  color: white;
}

.key-btn.action {
  background-color: #cbd5e1;
}

.wordle-result-card {
  margin-top: 20px;
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 18px;
}

.wordle-result-card h3 {
  margin: 0 0 10px;
  color: #111827;
}

.wordle-result-card p {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #2563eb;
}

.wordle-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

.wordle-message {
  margin-top: 16px;
  color: #16a34a;
  font-weight: 500;
  text-align: center;
}

.wordle-message.error {
  color: #dc2626;
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

@media (max-width: 768px) {
  .wordle-status-panel {
    grid-template-columns: 1fr 1fr;
  }

  .wordle-cell {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }

  .key-btn {
    min-width: 30px;
    height: 38px;
    font-size: 12px;
  }
}
</style>