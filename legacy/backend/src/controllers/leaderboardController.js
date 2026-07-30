const db = require('../config/db')

const getLeaderboard = async (req, res) => {
  try {
    const { gameId } = req.params
    const numericGameId = Number(gameId)

    if (!Number.isInteger(numericGameId) || numericGameId <= 0) {
      return res.status(400).json({
        message: 'Invalid game ID'
      })
    }

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
      [numericGameId]
    )

    res.json({
      gameId: numericGameId,
      leaderboard: rows
    })

  } catch (error) {
    console.error('Leaderboard error:', error)

    res.status(500).json({
      message: 'Server error'
    })
  }
}

module.exports = {
  getLeaderboard
}
