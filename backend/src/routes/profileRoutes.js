const express = require('express')
const router = express.Router()
const { getProfileSummary } = require('../controllers/profileController')

router.get('/:userId', getProfileSummary)

module.exports = router