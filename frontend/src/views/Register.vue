<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>會員註冊</h1>
      <p class="auth-desc">建立你的帳號，開始紀錄遊戲分數與個人成績。</p>

      <form class="auth-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="registerUsername">使用者名稱</label>
          <input
            id="registerUsername"
            v-model="form.username"
            type="text"
            placeholder="請輸入使用者名稱"
          />
        </div>

        <div class="form-group">
          <label for="registerEmail">Email</label>
          <input
            id="registerEmail"
            v-model="form.email"
            type="email"
            placeholder="請輸入 Email"
          />
        </div>

        <div class="form-group">
          <label for="registerPassword">密碼</label>
          <input
            id="registerPassword"
            v-model="form.password"
            type="password"
            placeholder="請輸入密碼"
          />
        </div>

        <div class="form-group">
          <label for="registerConfirmPassword">確認密碼</label>
          <input
            id="registerConfirmPassword"
            v-model="form.confirmPassword"
            type="password"
            placeholder="請再次輸入密碼"
          />
        </div>

        <button type="submit" class="auth-btn" :disabled="loading">
          {{ loading ? "註冊中..." : "註冊" }}
        </button>
      </form>

      <p v-if="message" class="auth-message" :class="{ error: messageType === 'error' }">
        {{ message }}
      </p>

      <p class="auth-footer">
        已經有帳號？
        <router-link to="/login">前往登入</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { registerUser } from "../api/auth"

export default {
  name: "Register",
  data() {
    return {
      loading: false,
      message: "",
      messageType: "success",
      form: {
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
      }
    }
  },
  methods: {
    async handleRegister() {
      if (
        !this.form.username ||
        !this.form.email ||
        !this.form.password ||
        !this.form.confirmPassword
      ) {
        this.message = "請完整填寫所有欄位"
        this.messageType = "error"
        return
      }

      if (this.form.password !== this.form.confirmPassword) {
        this.message = "兩次輸入的密碼不一致"
        this.messageType = "error"
        return
      }

      try {
        this.loading = true
        this.message = ""

        const data = await registerUser({
          username: this.form.username,
          email: this.form.email,
          password: this.form.password
        })

        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        this.message = "註冊成功，正在跳轉..."
        this.messageType = "success"

        setTimeout(() => {
          const redirectPath = this.$route.query.redirect || "/profile"
          this.$router.push(redirectPath)
        }, 800)
      } catch (error) {
        console.error("Register failed:", error)

        this.message =
          error.response?.data?.message || "註冊失敗，請稍後再試"
        this.messageType = "error"
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 160px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.auth-card {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 18px;
  padding: 32px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

.auth-card h1 {
  margin: 0 0 12px;
  color: #111827;
  text-align: center;
}

.auth-desc {
  margin: 0 0 28px;
  text-align: center;
  color: #6b7280;
  line-height: 1.6;
}

.auth-form {
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
  font-weight: bold;
  color: #374151;
}

.form-group input {
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 15px;
}

.form-group input:focus {
  outline: none;
  border-color: #2563eb;
}

.auth-btn {
  margin-top: 6px;
  border: none;
  background-color: #2563eb;
  color: white;
  padding: 13px 18px;
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
}

.auth-btn:hover {
  background-color: #1d4ed8;
}

.auth-btn:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.auth-message {
  margin: 18px 0 0;
  text-align: center;
  color: #16a34a;
  font-weight: 500;
}

.auth-message.error {
  color: #dc2626;
}

.auth-footer {
  margin: 22px 0 0;
  text-align: center;
  color: #6b7280;
}

.auth-footer a {
  color: #2563eb;
  text-decoration: none;
  font-weight: bold;
}
</style>