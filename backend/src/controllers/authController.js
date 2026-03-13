const db = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body

    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    )

    if (existingUsers.length > 0) {
      return res.status(400).json({
        message: 'Username or email already exists'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const [result] = await db.query(
      `
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
      `,
      [username, email, hashedPassword, 'player']
    )

    const [users] = await db.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    )

    const user = users[0]

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'Register successful',
      token,
      user
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const [users] = await db.query(
      `
      SELECT id, username, email, password, role, created_at
      FROM users
      WHERE email = ?
      `,
      [email]
    )

    if (users.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    const user = users[0]

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
}

module.exports = {
  register,
  login
}