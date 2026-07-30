import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc
} from "firebase/firestore"
import { authReady, db } from "../firebase"
import { fetchAllGames } from "./game"
import { mapDocument } from "./firestoreUtils"

const newestFirst = (a, b) => new Date(b.created_at) - new Date(a.created_at)

export const fetchAdminDashboard = async () => {
  await authReady
  const [usersData, scoresData, gamesData] = await Promise.all([
    fetchAdminUsers(),
    fetchAdminScores(),
    fetchAllGames()
  ])

  return {
    stats: {
      totalUsers: usersData.users.length,
      totalGames: gamesData.games.length,
      totalScores: scoresData.scores.length
    },
    latestUsers: usersData.users.slice(0, 5),
    latestScores: scoresData.scores.slice(0, 5)
  }
}

export const fetchAdminUsers = async () => {
  await authReady
  const snapshot = await getDocs(collection(db, "users"))
  return {
    users: snapshot.docs.map(mapDocument).sort(newestFirst)
  }
}

export const fetchAdminScores = async () => {
  await authReady
  const snapshot = await getDocs(collection(db, "scores"))
  return {
    scores: snapshot.docs.map(mapDocument).sort(newestFirst)
  }
}

export const deleteAdminScore = async (scoreId) => {
  await authReady
  await deleteDoc(doc(db, "scores", String(scoreId)))
  return { message: "Score deleted successfully" }
}

export const fetchAdminGames = async () => {
  await authReady
  return fetchAllGames()
}

export const updateAdminGame = async (gameId, payload) => {
  await authReady
  await setDoc(doc(db, "games", String(gameId)), {
    id: Number(gameId),
    ...payload,
    updated_at: serverTimestamp()
  }, { merge: true })

  return { message: "Game updated successfully" }
}
