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

export const fetchAdminDashboard = async () => {
  const response = await axios.get(`${API_BASE}/admin/dashboard`, getAuthConfig())
  return response.data
}

export const fetchAdminUsers = async () => {
  const response = await axios.get(`${API_BASE}/admin/users`, getAuthConfig())
  return response.data
}

export const fetchAdminScores = async () => {
  const response = await axios.get(`${API_BASE}/admin/scores`, getAuthConfig())
  return response.data
}

export const deleteAdminScore = async (scoreId) => {
  const response = await axios.delete(`${API_BASE}/admin/scores/${scoreId}`, getAuthConfig())
  return response.data
}

export const fetchAdminGames = async () => {
  const response = await axios.get(`${API_BASE}/admin/games`, getAuthConfig())
  return response.data
}

export const updateAdminGame = async (gameId, payload) => {
  const response = await axios.put(`${API_BASE}/admin/games/${gameId}`, payload, getAuthConfig())
  return response.data
}