import axios from "axios"

const ADMIN_API_BASE = "http://localhost:5000/api/admin"

export const fetchAnnouncements = async () => {
  const res = await axios.get(`${ADMIN_API_BASE}/announcements`)
  return res.data
}

export const createAnnouncement = async (data) => {
  const res = await axios.post(`${ADMIN_API_BASE}/announcements`, data)
  return res.data
}

export const updateAnnouncement = async (id, data) => {
  const res = await axios.put(`${ADMIN_API_BASE}/announcements/${id}`, data)
  return res.data
}

export const deleteAnnouncement = async (id) => {
  const res = await axios.delete(`${ADMIN_API_BASE}/announcements/${id}`)
  return res.data
}