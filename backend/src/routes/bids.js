const express = require('express')

const router = express.Router()
const controller = require('../controllers/bidsController')
const { verifyToken } = require('../middleware/auth')
const { requireRole } = require('../middleware/role')

// Register for tender (bidder must be authenticated and have bidder role)
router.post('/:id/register', verifyToken, requireRole('bidder'), controller.registerForTender)

// Submit bid (bidder authenticated and role check)
router.post('/:id/bid', verifyToken, requireRole('bidder'), controller.submitBid)

// My bids (bidder)
router.get('/my-bids', verifyToken, requireRole('bidder'), controller.myBids)

module.exports = router
