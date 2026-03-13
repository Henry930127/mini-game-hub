<template>
  <div class="admin-login-page">
    <div class="admin-login-card">
      <h1>後台登入</h1>
      <p class="subtitle">Mini Game Hub Admin Panel</p>

      <form class="admin-login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="請輸入管理員 Email"
          />
        </div>

        <div class="form-group">
          <label for="password">密碼</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="請輸入密碼"
          />
        </div>

        <p v-if="errorMessage" class="error-text">
          {{ errorMessage }}
        </p>

        <button class="login-btn" type="submit" :disabled="loading">
          {{ loading ? "登入中..." : "登入後台" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios"

const API_BASE = "http://localhost:5000/api"

export default {
  name: "AdminLogin",
  data() {
    return {
      loading: false,
      errorMessage: "",
      form: {
        email: "",
        password: ""
      }
    }
  },
  methods: {
    async handleLogin() {
      if (!this.form.email || !this.form.password) {
        this.errorMessage = "請輸入 Email 與密碼"
        return
      }

      this.loading = true
      this.errorMessage = ""

      try {
        const response = await axios.post(`${API_BASE}/auth/login`, {
          email: this.form.email,
          password: this.form.password
        })

        const { token, user } = response.data

        if (!user || user.role !== "admin") {
          this.errorMessage = "此帳號不是管理員，無法登入後台"
          return
        }

        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(user))
        localStorage.setItem("adminUser", JSON.stringify(user))

        this.$router.push("/admin")
      } catch (error) {
        console.error("Admin login failed:", error)
        this.errorMessage =
          error.response?.data?.message || "登入失敗，請稍後再試"
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.admin-login-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #f3f4f6;
}

.admin-login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 18px;
  padding: 32px 28px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.admin-login-card h1 {
  margin: 0 0 8px;
  color: #111827;
  text-align: center;
}

.subtitle {
  margin: 0 0 24px;
  color: #6b7280;
  text-align: center;
}

.admin-login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  color: #374151;
  font-weight: 600;
}

.form-group input {
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 15px;
}

.form-group input:focus {
  outline: none;
  border-color: #2563eb;
}

.login-btn {
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  background: #2563eb;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-text {
  margin: 0;
  color: #dc2626;
  font-size: 14px;
}
</style>