const db = require('../config/db')

const getDashboardSummary = async (req, res) => {
  try {
    const [[usersCountRow]] = await db.query(
      'SELECT COUNT(*) AS totalUsers FROM users'
    )

    const [[gamesCountRow]] = await db.query(
      'SELECT COUNT(*) AS totalGames FROM games'
    )

    const [[scoresCountRow]] = await db.query(
      'SELECT COUNT(*) AS totalScores FROM scores'
    )

    const [latestUsers] = await db.query(
      `
      SELECT id, username, email, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
      `
    )

    const [latestScores] = await db.query(
      `
      SELECT
        s.id,
        s.score,
        s.created_at,
        u.username,
        g.name AS game_name,
        g.slug
      FROM scores s
      JOIN users u ON s.user_id = u.id
      JOIN games g ON s.game_id = g.id
      ORDER BY s.created_at DESC
      LIMIT 5
      `
    )

    res.json({
      stats: {
        totalUsers: Number(usersCountRow.totalUsers || 0),
        totalGames: Number(gamesCountRow.totalGames || 0),
        totalScores: Number(scoresCountRow.totalScores || 0)
      },
      latestUsers,
      latestScores: latestScores.map(item => ({
        ...item,
        score: Number(item.score || 0)
      }))
    })
  } catch (error) {
    console.error('Get admin dashboard summary error:', error)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
}

module.exports = {
  getDashboardSummary
}