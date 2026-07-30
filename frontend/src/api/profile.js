import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore"
import { auth, authReady, db } from "../firebase"
import { fetchAllGames } from "./game"
import { mapDocument } from "./firestoreUtils"

export const fetchProfileSummary = async (userId) => {
  await authReady
  if (!auth.currentUser || auth.currentUser.uid !== String(userId)) {
    throw new Error("You can only view your own profile")
  }

  const [userSnapshot, userScoresSnapshot, allScoresSnapshot, gamesData] = await Promise.all([
    getDoc(doc(db, "users", String(userId))),
    getDocs(query(collection(db, "scores"), where("user_id", "==", String(userId)))),
    getDocs(collection(db, "scores")),
    fetchAllGames()
  ])

  if (!userSnapshot.exists()) throw new Error("User not found")

  const user = mapDocument(userSnapshot)
  const userScores = userScoresSnapshot.docs.map(mapDocument)
  const allScores = allScoresSnapshot.docs.map(mapDocument)

  const bestRecords = gamesData.games.map((game) => {
    const scoresForGame = userScores.filter((item) => Number(item.game_id) === game.id)
    const bestScore = scoresForGame.length
      ? Math.max(...scoresForGame.map((item) => Number(item.score)))
      : null

    const betterUsers = new Set(
      allScores
        .filter((item) => Number(item.game_id) === game.id && Number(item.score) > bestScore)
        .map((item) => item.user_id)
    )

    return {
      game_id: game.id,
      game_name: game.name,
      slug: game.slug,
      best_score: bestScore,
      best_rank: bestScore === null ? null : betterUsers.size + 1
    }
  })

  const ranks = bestRecords
    .filter((record) => record.best_rank !== null)
    .map((record) => record.best_rank)

  return {
    user,
    stats: {
      totalPlays: userScores.length,
      playedGames: new Set(userScores.map((item) => item.game_id)).size,
      highestScore: userScores.length
        ? Math.max(...userScores.map((item) => Number(item.score)))
        : 0,
      bestRank: ranks.length ? Math.min(...ranks) : "-"
    },
    bestRecords,
    recentHistory: userScores
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10)
  }
}
