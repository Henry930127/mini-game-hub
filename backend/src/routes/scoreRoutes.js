const express = require('express')
const router = express.Router()

const { submitScore } = require('../controllers/scoreController')
const { authenticateToken } = require('../middleware/authMiddleware')

router.post('/', authenticateToken, submitScore)

module.exports = router
