const db = require('../config/db')

const getProfileSummary = async (req, res) => {
  try {
    const { userId } = req.params
    const requestedUserId = Number(userId)

    if (!Number.isInteger(requestedUserId) || requestedUserId <= 0) {
      return res.status(400).json({
        message: 'Invalid user ID'
      })
    }

    if (req.user.role !== 'admin' && req.user.id !== requestedUserId) {
      return res.status(403).json({
        message: 'You can only view your own profile'
      })
    }

    const [users] = await db.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [requestedUserId]
    )

    if (users.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    const user = users[0]

    const [statsRows] = await db.query(
      `
      SELECT
        COUNT(*) AS totalPlays,
        COUNT(DISTINCT game_id) AS playedGames,
        COALESCE(MAX(score), 0) AS highestScore
      FROM scores
      WHERE user_id = ?
      `,
      [requestedUserId]
    )

    const stats = statsRows[0] || {
      totalPlays: 0,
      playedGames: 0,
      highestScore: 0
    }

    const [bestRecordsRows] = await db.query(
      `
      SELECT
        g.id AS game_id,
        g.name AS game_name,
        g.slug,
        user_best.best_score,
        CASE
          WHEN user_best.best_score IS NULL THEN NULL
          ELSE (
            SELECT COUNT(*) + 1
            FROM (
              SELECT user_id, game_id, MAX(score) AS best_score
              FROM scores
              GROUP BY user_id, game_id
            ) AS ranking_scores
            WHERE ranking_scores.game_id = g.id
              AND ranking_scores.best_score > user_best.best_score
          )
        END AS best_rank
      FROM games g
      LEFT JOIN (
        SELECT game_id, MAX(score) AS best_score
        FROM scores
        WHERE user_id = ?
        GROUP BY game_id
      ) AS user_best
        ON g.id = user_best.game_id
      ORDER BY g.id ASC
      `,
      [requestedUserId]
    )

    const [recentHistoryRows] = await db.query(
      `
      SELECT
        s.id,
        s.score,
        s.created_at,
        g.name AS game_name,
        g.slug
      FROM scores s
      JOIN games g ON s.game_id = g.id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
      LIMIT 10
      `,
      [requestedUserId]
    )

    const bestRecords = bestRecordsRows.map(record => ({
      ...record,
      best_score: record.best_score === null ? 0 : Number(record.best_score),
      best_rank: record.best_rank === null ? null : Number(record.best_rank)
    }))

    const validRanks = bestRecords
      .filter(record => record.best_rank !== null)
      .map(record => record.best_rank)

    const bestRank = validRanks.length > 0 ? Math.min(...validRanks) : '-'

    const recentHistory = recentHistoryRows.map(record => ({
      ...record,
      score: Number(record.score || 0)
    }))

    res.json({
      user,
      stats: {
        totalPlays: Number(stats.totalPlays || 0),
        playedGames: Number(stats.playedGames || 0),
        highestScore: Number(stats.highestScore || 0),
        bestRank
      },
      bestRecords,
      recentHistory
    })
  } catch (error) {
    console.error('Get profile summary error:', error)
    res.status(500).json({
      message: 'Server error'
    })
  }
}

module.exports = {
  getProfileSummary
}
