<template>
  <header class="navbar">
    <div class="navbar-container">
      <router-link to="/" class="logo">Mini Game Hub</router-link>

      <nav class="nav-links">
        <router-link to="/">首頁</router-link>
        <router-link to="/game">遊戲頁</router-link>
        <router-link to="/leaderboard">排行榜</router-link>

        <template v-if="!currentUser">
          <router-link to="/login">登入</router-link>
          <router-link to="/register">註冊</router-link>
        </template>

        <template v-else>
          <span class="nav-user">Hi, {{ currentUser.username }}</span>
          <router-link to="/profile">會員中心</router-link>
          <button class="logout-btn" @click="handleLogout">登出</button>
        </template>
      </nav>
    </div>
  </header>
</template>

<script>
import { logoutUser } from "../api/auth"

export default {
  name: "Navbar",
  data() {
    return {
      currentUser: null
    }
  },
  methods: {
    readUser() {
      try {
        const savedUser = localStorage.getItem("user")
        this.currentUser = savedUser ? JSON.parse(savedUser) : null
      } catch (error) {
        console.error("Read user failed:", error)
        this.currentUser = null
      }
    },

    async handleLogout() {
      await logoutUser()
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("adminUser")
      this.currentUser = null
      this.$router.push("/login")
    },

    handleStorageChange() {
      this.readUser()
    }
  },
  mounted() {
    this.readUser()
    window.addEventListener("storage", this.handleStorageChange)
  },
  beforeUnmount() {
    window.removeEventListener("storage", this.handleStorageChange)
  },
  watch: {
    $route() {
      this.readUser()
    }
  }
}
</script>

<style scoped>
.navbar {
  background-color: #0f172a;
  color: white;
  padding: 20px;
}

.navbar-container {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.logo {
  color: white;
  text-decoration: none;
  font-size: 22px;
  font-weight: bold;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.nav-links a:hover {
  color: #93c5fd;
}

.nav-user {
  color: #bfdbfe;
  font-weight: bold;
}

.logout-btn {
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  padding: 0;
}

.logout-btn:hover {
  color: #93c5fd;
}

@media (max-width: 768px) {
  .navbar-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .nav-links {
    gap: 14px;
  }
}
</style>
