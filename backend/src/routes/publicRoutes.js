const express = require('express')
const db = require('../config/db')

const router = express.Router()

router.get('/games', async (req, res) => {
  try {
    const [games] = await db.query(`
      SELECT
        id,
        name,
        slug,
        description,
        display_name,
        short_description,
        instructions,
        rules_text
      FROM games
      ORDER BY id ASC
    `)

    res.json({ games })
  } catch (error) {
    console.error('Get public games error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/announcements', async (req, res) => {
  try {
    const [announcements] = await db.query(`
      SELECT id, title, content, is_active, created_at, updated_at
      FROM announcements
      WHERE is_active = 1
      ORDER BY created_at DESC
    `)

    res.json({ announcements })
  } catch (error) {
    console.error('Get public announcements error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
