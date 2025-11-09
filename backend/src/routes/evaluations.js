const express = require('express')
const router = express.Router()
const controller = require('../controllers/evaluationsController')
const { verifyToken } = require('../middleware/auth')
const { requireRole } = require('../middleware/role')

router.get('/my-assignments', verifyToken, requireRole('evaluator'), controller.myAssignments)
router.post('/review/:reviewId', verifyToken, requireRole('evaluator'), controller.submitReview)

module.exports = router
