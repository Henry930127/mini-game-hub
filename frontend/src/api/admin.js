import axios from "axios"

const API_BASE = "http://localhost:5000/api"

export const fetchAdminDashboard = async () => {
  const response = await axios.get(`${API_BASE}/admin/dashboard`)
  return response.data
}

export const fetchAdminUsers = async () => {
  const response = await axios.get(`${API_BASE}/admin/users`)
  return response.data
}

export const fetchAdminScores = async () => {
  const response = await axios.get(`${API_BASE}/admin/scores`)
  return response.data
}

export const deleteAdminScore = async (scoreId) => {
  const response = await axios.delete(`${API_BASE}/admin/scores/${scoreId}`)
  return response.data
}

export const fetchAdminGames = async () => {
  const response = await axios.get(`${API_BASE}/admin/games`)
  return response.data
}

export const updateAdminGame = async (gameId, payload) => {
  const response = await axios.put(`${API_BASE}/admin/games/${gameId}`, payload)
  return response.data
}