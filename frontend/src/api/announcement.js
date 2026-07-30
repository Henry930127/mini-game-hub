import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore"
import { auth, authReady, db } from "../firebase"
import { mapDocument } from "./firestoreUtils"

export const fetchPublicAnnouncements = async () => {
  const snapshot = await getDocs(query(
    collection(db, "announcements"),
    where("is_active", "==", true)
  ))
  const announcements = snapshot.docs
    .map(mapDocument)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return { announcements }
}

export const fetchAdminAnnouncements = async () => {
  await authReady
  const snapshot = await getDocs(collection(db, "announcements"))
  return {
    announcements: snapshot.docs
      .map(mapDocument)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
}

export const createAnnouncement = async (data) => {
  await authReady
  const result = await addDoc(collection(db, "announcements"), {
    title: data.title.trim(),
    content: data.content.trim(),
    is_active: data.is_active === true,
    created_by: auth.currentUser.uid,
    updated_by: auth.currentUser.uid,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  })
  return { id: result.id, message: "announcement created" }
}

export const updateAnnouncement = async (id, data) => {
  await authReady
  await updateDoc(doc(db, "announcements", String(id)), {
    title: data.title.trim(),
    content: data.content.trim(),
    is_active: data.is_active === true,
    updated_by: auth.currentUser.uid,
    updated_at: serverTimestamp()
  })
  return { message: "announcement updated" }
}

export const deleteAnnouncement = async (id) => {
  await authReady
  await deleteDoc(doc(db, "announcements", String(id)))
  return { message: "announcement deleted" }
}
