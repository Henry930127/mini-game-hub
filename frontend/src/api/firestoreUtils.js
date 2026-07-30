export const toIsoString = (value) => {
  if (!value) return null
  if (typeof value.toDate === "function") return value.toDate().toISOString()

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export const mapDocument = (snapshot) => {
  const data = snapshot.data()
  return {
    ...data,
    id: data.id ?? snapshot.id,
    created_at: toIsoString(data.created_at),
    updated_at: toIsoString(data.updated_at)
  }
}
