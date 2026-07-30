import api from './client'

export const fetchProfileSummary = async (userId) => {
  const response = await api.get(`/profile/${userId}`)
  return response.data
}
