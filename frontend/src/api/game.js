import api from "./client"

export const fetchAllGames = async () => {
  const response = await api.get("/public/games")
  return response.data
}
