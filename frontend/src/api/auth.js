import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth"
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { auth, db } from "../firebase"
import { toIsoString } from "./firestoreUtils"

const buildUser = (firebaseUser, profile = {}) => ({
  id: firebaseUser.uid,
  username: profile.username || firebaseUser.displayName || firebaseUser.email,
  email: firebaseUser.email,
  role: profile.role || "player",
  created_at: toIsoString(profile.created_at) || firebaseUser.metadata.creationTime
})

export const loginUser = async (payload) => {
  const credential = await signInWithEmailAndPassword(
    auth,
    payload.email.trim(),
    payload.password
  )
  const profileSnapshot = await getDoc(doc(db, "users", credential.user.uid))
  const profile = profileSnapshot.exists() ? profileSnapshot.data() : {}
  const user = buildUser(credential.user, profile)

  if (!profileSnapshot.exists()) {
    await setDoc(doc(db, "users", credential.user.uid), {
      id: credential.user.uid,
      username: user.username,
      email: user.email,
      role: "player",
      created_at: serverTimestamp()
    })
  }

  return { token: await credential.user.getIdToken(), user }
}

export const registerUser = async (payload) => {
  const credential = await createUserWithEmailAndPassword(
    auth,
    payload.email.trim(),
    payload.password
  )
  const user = buildUser(credential.user, {
    username: payload.username.trim(),
    role: "player"
  })

  await setDoc(doc(db, "users", credential.user.uid), {
    id: credential.user.uid,
    username: user.username,
    email: user.email,
    role: "player",
    created_at: serverTimestamp()
  })

  return { token: await credential.user.getIdToken(), user }
}

export const logoutUser = () => signOut(auth)
