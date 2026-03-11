const db = require('../config/db')

const getLeaderboard = async (req, res) => {
  try {
    const { gameId } = req.params

    const [rows] = await db.query(
      `
      SELECT 
        users.username,
        scores.score,
        scores.created_at
      FROM scores
      JOIN users ON scores.user_id = users.id
      WHERE scores.game_id = ?
      ORDER BY scores.score DESC
      LIMIT 10
      `,
      [gameId]
    )

    res.json({
      gameId,
      leaderboard: rows
    })

  } catch (error) {
    console.error('Leaderboard error:', error)

    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
}

module.exports = {
  getLeaderboard
}