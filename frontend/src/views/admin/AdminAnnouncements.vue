<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h1>公告管理</h1>
        <p>新增、編輯與刪除首頁公告內容。</p>
      </div>
    </div>

    <div class="admin-card create-box">
      <h2>{{ editingId ? "編輯公告" : "新增公告" }}</h2>

      <div class="form-group">
        <label>公告標題</label>
        <input
          v-model="form.title"
          type="text"
          placeholder="請輸入公告標題"
        />
      </div>

      <div class="form-group">
        <label>公告內容</label>
        <textarea
          v-model="form.content"
          rows="5"
          placeholder="請輸入公告內容"
        ></textarea>
      </div>

      <div class="form-group inline-group">
        <label class="checkbox-label">
          <input v-model="form.is_active" type="checkbox" />
          啟用公告
        </label>
      </div>

      <div class="actions">
        <button class="save-btn" @click="handleSubmit">
          {{ editingId ? "儲存修改" : "新增公告" }}
        </button>

        <button
          v-if="editingId"
          class="cancel-btn"
          @click="resetForm"
        >
          取消編輯
        </button>
      </div>
    </div>

    <p v-if="message" class="message-text">
      {{ message }}
    </p>

    <div class="announcement-list">
      <div
        v-for="item in announcements"
        :key="item.id"
        class="admin-card announcement-card"
      >
        <div class="announcement-top">
          <div>
            <h3>{{ item.title }}</h3>
            <span
              class="status-badge"
              :class="{ inactive: !item.is_active }"
            >
              {{ item.is_active ? "啟用中" : "未啟用" }}
            </span>
          </div>

          <span class="date-text">
            {{ formatDate(item.created_at) }}
          </span>
        </div>

        <p class="announcement-content">
          {{ item.content }}
        </p>

        <div class="actions">
          <button class="edit-btn" @click="startEdit(item)">
            編輯
          </button>

          <button class="delete-btn" @click="remove(item.id)">
            刪除
          </button>
        </div>
      </div>
    </div>

    <div v-if="announcements.length === 0" class="admin-card empty-card">
      目前沒有公告資料
    </div>
  </div>
</template>

<script>
import {
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from "../../api/announcement"

export default {
  name: "AdminAnnouncements",

  data() {
    return {
      announcements: [],
      editingId: null,
      message: "",
      form: {
        title: "",
        content: "",
        is_active: true
      }
    }
  },

  methods: {
    async load() {
      try {
        const data = await fetchAnnouncements()
        this.announcements = data.announcements || []
      } catch (error) {
        console.error("Load announcements failed:", error)
        this.message = "公告載入失敗"
      }
    },

    async handleSubmit() {
      if (!this.form.title.trim() || !this.form.content.trim()) {
        this.message = "請輸入公告標題與內容"
        return
      }

      try {
        if (this.editingId) {
          await updateAnnouncement(this.editingId, {
            title: this.form.title,
            content: this.form.content,
            is_active: this.form.is_active
          })

          this.message = "公告更新成功"
        } else {
          await createAnnouncement({
            title: this.form.title,
            content: this.form.content,
            is_active: this.form.is_active
          })

          this.message = "公告新增成功"
        }

        this.resetForm()
        await this.load()
      } catch (error) {
        console.error("Submit announcement failed:", error)
        this.message = "操作失敗"
      }
    },

    startEdit(item) {
    this.editingId = item.id
    this.form = {
        title: item.title || "",
        content: item.content || "",
        is_active: Number(item.is_active) === 1
    }
    this.message = ""

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    })
    },

    resetForm() {
      this.editingId = null
      this.form = {
        title: "",
        content: "",
        is_active: true
      }
    },

    async remove(id) {
      const confirmed = window.confirm("確定要刪除這則公告嗎？")
      if (!confirmed) return

      try {
        await deleteAnnouncement(id)
        this.message = "公告已刪除"

        if (this.editingId === id) {
          this.resetForm()
        }

        await this.load()
      } catch (error) {
        console.error("Delete announcement failed:", error)
        this.message = "刪除失敗"
      }
    },

    formatDate(dateString) {
      if (!dateString) return "-"

      const date = new Date(dateString)
      if (Number.isNaN(date.getTime())) return "-"

      return date.toLocaleString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      })
    }
  },

  mounted() {
    this.load()
  }
}
</script>

<style scoped>
.admin-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px 60px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 6px;
  color: #111827;
}

.page-header p {
  margin: 0;
  color: #6b7280;
}

.admin-card {
  background: white;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

.create-box {
  margin-bottom: 20px;
}

.create-box h2 {
  margin-top: 0;
  margin-bottom: 18px;
  color: #111827;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-group label {
  font-weight: 600;
  color: #374151;
}

.form-group input,
.form-group textarea {
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 15px;
}

.form-group textarea {
  resize: vertical;
}

.inline-group {
  margin-bottom: 20px;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.save-btn,
.cancel-btn,
.edit-btn,
.delete-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 600;
}

.save-btn {
  background: #2563eb;
  color: white;
}

.cancel-btn {
  background: #e5e7eb;
  color: #111827;
}

.edit-btn {
  background: #2563eb;
  color: white;
}

.delete-btn {
  background: #ef4444;
  color: white;
}

.message-text {
  margin: 12px 0 20px;
  color: #2563eb;
  font-weight: 500;
}

.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.announcement-card h3 {
  margin: 0 0 8px;
  color: #111827;
}

.announcement-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 14px;
}

.announcement-content {
  color: #4b5563;
  line-height: 1.8;
  margin-bottom: 18px;
  white-space: pre-line;
}

.status-badge {
  display: inline-block;
  background: #dcfce7;
  color: #15803d;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #b91c1c;
}

.date-text {
  color: #9ca3af;
  font-size: 13px;
  white-space: nowrap;
}

.empty-card {
  text-align: center;
  color: #6b7280;
}

@media (max-width: 768px) {
  .announcement-top {
    flex-direction: column;
  }

  .date-text {
    white-space: normal;
  }
}
</style>