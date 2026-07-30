import api from "./client"

export const fetchAdminDashboard = async () => {
  const response = await api.get("/admin/dashboard")
  return response.data
}

export const fetchAdminUsers = async () => {
  const response = await api.get("/admin/users")
  return response.data
}

export const fetchAdminScores = async () => {
  const response = await api.get("/admin/scores")
  return response.data
}

export const deleteAdminScore = async (scoreId) => {
  const response = await api.delete(`/admin/scores/${scoreId}`)
  return response.data
}

export const fetchAdminGames = async () => {
  const response = await api.get("/admin/games")
  return response.data
}

export const updateAdminGame = async (gameId, payload) => {
  const response = await api.put(`/admin/games/${gameId}`, payload)
  return response.data
}
