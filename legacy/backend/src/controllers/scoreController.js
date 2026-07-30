const db = require('../config/db')

const submitScore = async (req, res) => {
  try {
    const { game_id, score } = req.body
    const userId = req.user.id
    const gameId = Number(game_id)
    const numericScore = Number(score)

    if (
      !Number.isInteger(gameId) ||
      gameId <= 0 ||
      !Number.isInteger(numericScore) ||
      numericScore < 0
    ) {
      return res.status(400).json({
        message: 'game_id and score must be valid non-negative integers'
      })
    }

    const [result] = await db.query(
      'INSERT INTO scores (user_id, game_id, score) VALUES (?, ?, ?)',
      [userId, gameId, numericScore]
    )

    res.status(201).json({
      message: 'Score submitted successfully',
      scoreId: result.insertId
    })

  } catch (error) {
    console.error('Submit score error:', error)
    res.status(500).json({
      message: 'Server error'
    })
  }
}

module.exports = {
  submitScore
}
