const express = require('express')
const cors = require('cors')
const db = require('./config/db')
require('dotenv').config()

const authRoutes = require('./routes/authRoutes')
const scoreRoutes = require('./routes/scoreRoutes')
const leaderboardRoutes = require('./routes/leaderboardRoutes')
const profileRoutes = require('./routes/profileRoutes')
const publicRoutes = require('./routes/publicRoutes')

const adminRoutes = require('./routes/adminRoutes')

const app = express()

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : true

app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

app.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS test')
    res.json({
      message: 'Mini Game Hub API is running',
      database: 'connected',
      result: rows
    })
  } catch (error) {
    res.status(500).json({
      message: 'Database connection failed',
    })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/scores', scoreRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/admin', adminRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
