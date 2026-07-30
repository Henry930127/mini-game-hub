const express = require('express')
const router = express.Router()
const { getProfileSummary } = require('../controllers/profileController')
const { authenticateToken } = require('../middleware/authMiddleware')

router.get('/:userId', authenticateToken, getProfileSummary)

module.exports = router
