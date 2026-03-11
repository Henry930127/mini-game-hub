import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

export const fetchLeaderboard = async (gameId) => {
  const response = await axios.get(`${API_BASE_URL}/leaderboard/${gameId}`)
  return response.data.leaderboard
}