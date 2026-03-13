import axios from "axios"

const API_BASE = "http://localhost:5000/api"

const getAuthConfig = () => {
  const token = localStorage.getItem("token")

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
}

export const fetchAnnouncements = async () => {
  const res = await axios.get(`${API_BASE}/admin/announcements`, getAuthConfig())
  return res.data
}

export const createAnnouncement = async (data) => {
  const res = await axios.post(`${API_BASE}/admin/announcements`, data, getAuthConfig())
  return res.data
}

export const updateAnnouncement = async (id, data) => {
  const res = await axios.put(`${API_BASE}/admin/announcements/${id}`, data, getAuthConfig())
  return res.data
}

export const deleteAnnouncement = async (id) => {
  const res = await axios.delete(`${API_BASE}/admin/announcements/${id}`, getAuthConfig())
  return res.data
}