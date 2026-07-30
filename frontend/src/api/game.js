import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase"
import { games as localGames } from "../data/games"
import { mapDocument } from "./firestoreUtils"

export const fetchAllGames = async () => {
  const snapshot = await getDocs(collection(db, "games"))
  const overrides = snapshot.docs.map(mapDocument)

  return {
    games: localGames.map((game) => ({
      ...game,
      ...(overrides.find((item) => Number(item.id) === game.id) || {})
    }))
  }
}
