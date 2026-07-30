import api from './client'

export const submitScore = async (payload) => {
  const response = await api.post('/scores', payload)
  return response.data
}
