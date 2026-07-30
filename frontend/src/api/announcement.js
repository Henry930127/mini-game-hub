import api from "./client"

export const fetchPublicAnnouncements = async () => {
  const res = await api.get("/public/announcements")
  return res.data
}

export const fetchAdminAnnouncements = async () => {
  const res = await api.get("/admin/announcements")
  return res.data
}

export const createAnnouncement = async (data) => {
  const res = await api.post("/admin/announcements", data)
  return res.data
}

export const updateAnnouncement = async (id, data) => {
  const res = await api.put(`/admin/announcements/${id}`, data)
  return res.data
}

export const deleteAnnouncement = async (id) => {
  const res = await api.delete(`/admin/announcements/${id}`)
  return res.data
}
