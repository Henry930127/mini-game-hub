<template>
  <div class="admin-login-page">
    <div class="admin-login-card">
      <h1>後台登入</h1>
      <p class="subtitle">Mini Game Hub Admin Panel</p>

      <form class="admin-login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">帳號</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="請輸入管理員帳號"
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
export default {
  name: "AdminLogin",
  data() {
    return {
      loading: false,
      errorMessage: "",
      form: {
        username: "",
        password: ""
      }
    }
  },
  methods: {
    async handleLogin() {
      if (!this.form.username || !this.form.password) {
        this.errorMessage = "請輸入帳號與密碼"
        return
      }

      this.loading = true
      this.errorMessage = ""

      try {
        // 暫時先做前端假登入，之後再串真正 admin API
        if (this.form.username === "admin" && this.form.password === "123456") {
          localStorage.setItem(
            "adminUser",
            JSON.stringify({
              username: "admin",
              role: "admin"
            })
          )

          this.$router.push("/admin")
        } else {
          this.errorMessage = "帳號或密碼錯誤"
        }
      } catch (error) {
        console.error("Admin login failed:", error)
        this.errorMessage = "登入失敗，請稍後再試"
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