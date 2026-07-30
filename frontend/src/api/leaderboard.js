import api from './client'

export const fetchLeaderboard = async (gameId) => {
  const response = await api.get(`/leaderboard/${gameId}`)
  return response.data.leaderboard
}
