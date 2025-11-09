const { callProc } = require('../utils/sql')
const pool = require('../config/db')

exports.registerForTender = async (req, res, next) => {
  const tenderId = Number(req.params.id)
  const bidderId = req.body.bidderId || req.user?.id
  if (!bidderId) return res.status(400).json({ error: 'Missing bidder id' })
  try{
    const out = await callProc('sp_register_for_tender', [bidderId, tenderId])
    if (!out) return res.status(500).json({ error: 'No response from DB' })
    if (out.error_code && out.error_code != 0) return res.status(400).json({ error: out.error_message })
    return res.json({ ok: true, message: out.error_message })
  }catch(err){
    return next(err)
  }
}

exports.submitBid = async (req, res, next) => {
  const tenderId = Number(req.params.id)
  const bidderId = req.body.bidderId || req.user?.id
  const { bidAmount, emdSubmitted = false, documentsAttached = false } = req.body
  if (!bidderId) return res.status(400).json({ error: 'Missing bidder id' })
  if (!bidAmount) return res.status(400).json({ error: 'Missing bid amount' })
  try{
    const out = await callProc('sp_submit_bid', [bidderId, tenderId, bidAmount, emdSubmitted ? 1 : 0, documentsAttached ? 1 : 0])
    if (!out) return res.status(500).json({ error: 'No response from DB' })
    if (out.error_code && out.error_code != 0) return res.status(400).json({ error: out.error_message })
    return res.json({ ok: true, message: out.error_message, bidId: out.Bid_ID })
  }catch(err){
    return next(err)
  }
}

exports.myBids = async (req, res) => {
  const bidderId = req.user?.id || req.query.bidderId
  if (!bidderId) return res.status(400).json({ error: 'Missing bidder id' })
  try{
    const [rows] = await pool.query('SELECT b.Bid_ID, t.Tender_Title, b.Bid_Amount, b.Technical_Score, b.Financial_Score, b.Total_Score, b.Bid_Status, b.Submission_Date FROM BID b JOIN TENDER t ON b.Tender_ID = t.Tender_ID WHERE b.Bidder_ID = ?', [bidderId])
    return res.json({ bids: rows })
  }catch(err){
    console.error('myBids', err)
    return res.status(500).json({ error: err.message })
  }
}
