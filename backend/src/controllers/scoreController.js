const db = require('../config/db')

const submitScore = async (req, res) => {
  try {
    const { user_id, game_id, score } = req.body

    if (!user_id || !game_id || score === undefined) {
      return res.status(400).json({
        message: 'user_id, game_id and score are required'
      })
    }

    const [result] = await db.query(
      'INSERT INTO scores (user_id, game_id, score) VALUES (?, ?, ?)',
      [user_id, game_id, score]
    )

    res.status(201).json({
      message: 'Score submitted successfully',
      scoreId: result.insertId
    })

  } catch (error) {
    console.error('Submit score error:', error)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
}

module.exports = {
  submitScore
}