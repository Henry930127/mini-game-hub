const express = require('express')
const router = express.Router()
const db = require('../config/db')
const { getDashboardSummary } = require('../controllers/adminController')
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware')

const parsePositiveId = value => {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

const isValidText = (value, maxLength, allowEmpty = false) => (
  typeof value === 'string' &&
  value.length <= maxLength &&
  (allowEmpty || value.trim().length > 0)
)

router.use(authenticateToken)
router.use(requireAdmin)

router.get('/dashboard', getDashboardSummary)

router.get('/users', async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, username, email, created_at
      FROM users
      ORDER BY created_at DESC
    `)

    res.json({ users })
  } catch (error) {
    console.error('Get admin users error:', error)
    res.status(500).json({ error: 'failed to fetch users' })
  }
})

router.get('/scores', async (req, res) => {
  try {
    const [scores] = await db.query(`
      SELECT
        s.id,
        s.score,
        s.created_at,
        u.id AS user_id,
        u.username,
        g.id AS game_id,
        g.name AS game_name,
        g.slug
      FROM scores s
      JOIN users u ON s.user_id = u.id
      JOIN games g ON s.game_id = g.id
      ORDER BY s.created_at DESC
    `)

    res.json({ scores })
  } catch (error) {
    console.error('Get admin scores error:', error)
    res.status(500).json({ error: 'failed to fetch scores' })
  }
})

router.delete('/scores/:id', async (req, res) => {
  try {
    const id = parsePositiveId(req.params.id)

    if (!id) {
      return res.status(400).json({ message: 'Invalid score ID' })
    }

    const [result] = await db.query(
      'DELETE FROM scores WHERE id = ?',
      [id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Score not found' })
    }

    res.json({ message: 'Score deleted successfully' })
  } catch (error) {
    console.error('Delete admin score error:', error)
    res.status(500).json({ error: 'failed to delete score' })
  }
})

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
    console.error('Get admin games error:', error)
    res.status(500).json({ error: 'failed to fetch games' })
  }
})

router.put('/games/:id', async (req, res) => {
  try {
    const id = parsePositiveId(req.params.id)
    const {
      display_name,
      short_description,
      instructions,
      rules_text
    } = req.body

    if (
      !id ||
      !isValidText(display_name, 100) ||
      !isValidText(short_description, 500, true) ||
      !isValidText(instructions, 5000, true) ||
      !isValidText(rules_text, 5000, true)
    ) {
      return res.status(400).json({ message: 'Invalid game data' })
    }

    const [result] = await db.query(
      `
      UPDATE games
      SET
        display_name = ?,
        short_description = ?,
        instructions = ?,
        rules_text = ?
      WHERE id = ?
      `,
      [
        display_name,
        short_description,
        instructions,
        rules_text,
        id
      ]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Game not found' })
    }

    res.json({ message: 'Game updated successfully' })
  } catch (error) {
    console.error('Update admin game error:', error)
    res.status(500).json({ error: 'failed to update game' })
  }
})

router.get('/announcements', async (req, res) => {
  try {
    const [announcements] = await db.query(`
      SELECT
        a.*,
        creator.username AS created_by_name,
        updater.username AS updated_by_name
      FROM announcements a
      LEFT JOIN users creator ON a.created_by = creator.id
      LEFT JOIN users updater ON a.updated_by = updater.id
      ORDER BY a.created_at DESC
    `)

    res.json({
      announcements
    })
  } catch (error) {
    console.error('Fetch announcements error:', error)
    res.status(500).json({
      error: 'failed to fetch announcements'
    })
  }
})

router.post('/announcements', async (req, res) => {
  try {
    const { title, content, is_active } = req.body
    const adminId = req.user.id

    if (
      !isValidText(title, 200) ||
      !isValidText(content, 10000) ||
      typeof is_active !== 'boolean'
    ) {
      return res.status(400).json({ message: 'Invalid announcement data' })
    }

    const [result] = await db.query(
      `
      INSERT INTO announcements (title, content, is_active, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?)
      `,
      [title, content, is_active ? 1 : 0, adminId, adminId]
    )

    res.json({
      id: result.insertId,
      message: 'announcement created'
    })
  } catch (error) {
    console.error('Create announcement error:', error)
    res.status(500).json({
      error: 'failed to create announcement'
    })
  }
})

router.put('/announcements/:id', async (req, res) => {
  try {
    const id = parsePositiveId(req.params.id)
    const { title, content, is_active } = req.body
    const adminId = req.user.id

    if (
      !id ||
      !isValidText(title, 200) ||
      !isValidText(content, 10000) ||
      typeof is_active !== 'boolean'
    ) {
      return res.status(400).json({ message: 'Invalid announcement data' })
    }

    const [result] = await db.query(
      `
      UPDATE announcements
      SET
        title = ?,
        content = ?,
        is_active = ?,
        updated_by = ?
      WHERE id = ?
      `,
      [title, content, is_active ? 1 : 0, adminId, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Announcement not found'
      })
    }

    res.json({
      message: 'announcement updated'
    })
  } catch (error) {
    console.error('Update announcement error:', error)
    res.status(500).json({
      error: 'failed to update announcement'
    })
  }
})

router.delete('/announcements/:id', async (req, res) => {
  try {
    const id = parsePositiveId(req.params.id)

    if (!id) {
      return res.status(400).json({ message: 'Invalid announcement ID' })
    }

    const [result] = await db.query(
      `DELETE FROM announcements WHERE id = ?`,
      [id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Announcement not found' })
    }

    res.json({ message: 'announcement deleted' })
  } catch (error) {
    console.error('Delete announcement error:', error)
    res.status(500).json({ error: 'failed to delete announcement' })
  }
})

module.exports = router
