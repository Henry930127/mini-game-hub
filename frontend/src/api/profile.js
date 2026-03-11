import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

export const fetchProfileSummary = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/profile/${userId}`)
  return response.data
}