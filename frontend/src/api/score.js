import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, authReady, db } from "../firebase"
import { games as localGames } from "../data/games"

export const submitScore = async (payload) => {
  await authReady
  const currentUser = auth.currentUser
  if (!currentUser) throw new Error("Authentication required")

  const gameId = Number(payload.game_id)
  const score = Number(payload.score)
  if (!Number.isInteger(gameId) || gameId <= 0 || !Number.isInteger(score) || score < 0) {
    throw new Error("Invalid score")
  }

  const userSnapshot = await getDoc(doc(db, "users", currentUser.uid))
  const user = userSnapshot.data()
  const game = localGames.find((item) => item.id === gameId)
  if (!user || !game) throw new Error("User or game not found")

  const result = await addDoc(collection(db, "scores"), {
    user_id: currentUser.uid,
    username: user.username,
    game_id: gameId,
    game_name: game.name,
    slug: game.slug,
    score,
    created_at: serverTimestamp()
  })

  return { message: "Score submitted successfully", scoreId: result.id }
}
