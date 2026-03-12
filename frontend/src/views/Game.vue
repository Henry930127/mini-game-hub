<template>
  <div class="game-page">
    <section class="game-header">
      <h1>遊戲專區</h1>
      <p>選擇你想挑戰的小遊戲，開始遊玩並挑戰排行榜高分。</p>
    </section>

    <section class="game-list-section">
      <div class="game-grid">
        <div
          v-for="game in games"
          :key="game.id"
          class="game-card"
        >
          <div class="game-card-top">
            <span class="game-tag">{{ game.category }}</span>
            <h2>{{ game.name }}</h2>
            <p class="game-description">{{ game.description }}</p>
          </div>

          <div class="game-info">
            <div class="info-item">
              <span class="label">類型</span>
              <span class="value">{{ game.type }}</span>
            </div>
            <div class="info-item">
              <span class="label">難度</span>
              <span class="value">{{ game.difficulty }}</span>
            </div>
          </div>

          <div class="game-actions">
            <router-link :to="`/games/${game.slug}`" class="play-btn">
              開始遊戲
            </router-link>
            <router-link to="/leaderboard" class="rank-btn">
              查看排行榜
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { games } from "../data/games"

export default {
  name: "Game",
  data() {
    return {
      games
    }
  }
}
</script>

<style scoped>
.game-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px 60px;
}

.game-header {
  margin-bottom: 32px;
}

.game-header h1 {
  margin: 0 0 12px;
  font-size: 36px;
  color: #111827;
}

.game-header p {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
  line-height: 1.6;
}

.game-list-section {
  margin-top: 20px;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.game-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.game-card-top {
  margin-bottom: 20px;
}

.game-tag {
  display: inline-block;
  background-color: #dbeafe;
  color: #1d4ed8;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 14px;
}

.game-card h2 {
  margin: 0 0 12px;
  color: #111827;
  font-size: 24px;
}

.game-description {
  margin: 0;
  color: #4b5563;
  line-height: 1.7;
}

.game-info {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}

.info-item {
  background-color: #f9fafb;
  border-radius: 10px;
  padding: 10px 14px;
  min-width: 120px;
}

.label {
  display: block;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
}

.value {
  color: #111827;
  font-weight: bold;
  font-size: 15px;
}

.game-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.play-btn,
.rank-btn {
  display: inline-block;
  border: none;
  border-radius: 10px;
  padding: 12px 18px;
  font-size: 15px;
  text-decoration: none;
  cursor: pointer;
  transition: 0.2s ease;
}

.play-btn {
  background-color: #2563eb;
  color: white;
}

.play-btn:hover {
  background-color: #1d4ed8;
}

.rank-btn {
  background-color: #e5e7eb;
  color: #111827;
}

.rank-btn:hover {
  background-color: #d1d5db;
}

@media (max-width: 900px) {
  .game-grid {
    grid-template-columns: 1fr;
  }

  .game-header h1 {
    font-size: 30px;
  }
}
</style>