import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../firebase"
import { mapDocument } from "./firestoreUtils"

export const fetchLeaderboard = async (gameId) => {
  const snapshot = await getDocs(query(
    collection(db, "scores"),
    where("game_id", "==", Number(gameId))
  ))

  return snapshot.docs
    .map(mapDocument)
    .sort((a, b) => Number(b.score) - Number(a.score))
    .slice(0, 10)
}
