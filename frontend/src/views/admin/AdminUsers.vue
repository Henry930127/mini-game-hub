<template>
  <div class="admin-page">

    <h1>玩家管理</h1>

    <div class="search-bar">
      <input
        v-model="keyword"
        placeholder="搜尋玩家 username..."
      />
    </div>

    <table class="admin-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Email</th>
          <th>註冊時間</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="user in filteredUsers" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>{{ formatDate(user.created_at) }}</td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script>
import { fetchAdminUsers } from "../../api/admin"

export default {
  name: "AdminUsers",

  data() {
    return {
      users: [],
      keyword: ""
    }
  },

  computed: {
    filteredUsers() {
      if (!this.keyword) return this.users

      return this.users.filter((u) =>
        u.username.toLowerCase().includes(this.keyword.toLowerCase())
      )
    }
  },

  async mounted() {
    try {
      const data = await fetchAdminUsers()
      this.users = data.users
    } catch (err) {
      console.error("load users failed", err)
    }
  },

  methods: {
    formatDate(date) {
      return new Date(date).toLocaleString()
    }
  }
}
</script>

<style scoped>

.admin-page{
  max-width:1100px;
  margin:auto;
}

.search-bar{
  margin:20px 0;
}

.search-bar input{
  padding:10px;
  width:250px;
  border-radius:8px;
  border:1px solid #ccc;
}

.admin-table{
  width:100%;
  border-collapse: collapse;
}

.admin-table th,
.admin-table td{
  padding:12px;
  border-bottom:1px solid #eee;
  text-align:left;
}

.admin-table th{
  background:#f8f8f8;
}

</style>