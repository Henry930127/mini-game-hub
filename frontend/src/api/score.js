import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

export const submitScore = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/scores`, payload)
  return response.data
}