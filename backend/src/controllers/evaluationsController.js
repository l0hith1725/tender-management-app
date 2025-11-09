const { callProc } = require('../utils/sql')
const pool = require('../config/db')

// GET /api/evaluations/my-assignments
exports.myAssignments = async (req, res) => {
  const evaluatorId = req.user?.id
  if (!evaluatorId) return res.status(400).json({ error: 'Missing evaluator id' })
  try{
    const [rows] = await pool.query('SELECT ebr.Review_ID, t.Tender_ID, t.Tender_Title, b.Bid_ID, bd.Company_Name, ebr.Review_Status FROM EVALUATOR_BID_REVIEW ebr JOIN BID b ON ebr.Bid_ID = b.Bid_ID JOIN TENDER t ON b.Tender_ID = t.Tender_ID JOIN BIDDER bd ON b.Bidder_ID = bd.Bidder_ID WHERE ebr.Evaluator_ID = ?', [evaluatorId])
    return res.json({ assignments: rows })
  }catch(err){
    console.error('myAssignments', err)
    return res.status(500).json({ error: err.message })
  }
}

// POST /api/evaluations/review/:reviewId
exports.submitReview = async (req, res, next) => {
  const reviewId = Number(req.params.reviewId)
  const evaluatorId = req.user?.id
  const { technicalMarks, financialMarks, comments } = req.body
  if (!reviewId) return res.status(400).json({ error: 'Missing review id' })
  try{
    const out = await callProc('sp_submit_review', [reviewId, technicalMarks, financialMarks, comments || '', evaluatorId])
    if (!out) return res.status(500).json({ error: 'No response from DB' })
    if (out.error_code && out.error_code != 0) return res.status(400).json({ error: out.error_message })
    return res.json({ ok: true, message: out.error_message })
  }catch(err){
    return next(err)
  }
}
