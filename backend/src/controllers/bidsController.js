const { callProc } = require('../utils/sql')
const pool = require('../config/db')

exports.registerForTender = async (req, res, next) => {
  const tenderId = Number(req.params.id)
  // Prefer explicit bidderId from body; otherwise resolve from authenticated user
  let bidderId = req.body.bidderId || null
  try{
    if (!bidderId) {
      const username = req.user?.username
      if (username) {
        // Try to find a matching bidder by email (username is email in this app)
        const [rows] = await pool.query('SELECT Bidder_ID FROM BIDDER WHERE Email = ? LIMIT 1', [username])
        if (rows && rows.length) bidderId = rows[0].Bidder_ID
      }
    }

    if (!bidderId) return res.status(400).json({ error: 'Missing or unknown bidder profile - please create a bidder profile first' })

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
  let bidderId = req.body.bidderId || null
  const { bidAmount, emdSubmitted = false, documentsAttached = false } = req.body
  try{
    if (!bidderId) {
      const username = req.user?.username
      if (username) {
        const [rows] = await pool.query('SELECT Bidder_ID FROM BIDDER WHERE Email = ? LIMIT 1', [username])
        if (rows && rows.length) bidderId = rows[0].Bidder_ID
      }
    }

    if (!bidderId) return res.status(400).json({ error: 'Missing or unknown bidder profile - please create a bidder profile first' })
    if (!bidAmount) return res.status(400).json({ error: 'Missing bid amount' })

    const out = await callProc('sp_submit_bid', [bidderId, tenderId, bidAmount, emdSubmitted ? 1 : 0, documentsAttached ? 1 : 0])
    if (!out) return res.status(500).json({ error: 'No response from DB' })
    if (out.error_code && out.error_code != 0) return res.status(400).json({ error: out.error_message })
    return res.json({ ok: true, message: out.error_message, bidId: out.Bid_ID })
  }catch(err){
    return next(err)
  }
}

exports.myBids = async (req, res) => {
  let bidderId = req.query.bidderId || null
  try{
    if (!bidderId) {
      const username = req.user?.username
      if (username) {
        const [rows] = await pool.query('SELECT Bidder_ID FROM BIDDER WHERE Email = ? LIMIT 1', [username])
        if (rows && rows.length) bidderId = rows[0].Bidder_ID
      }
    }

    if (!bidderId) return res.status(400).json({ error: 'Missing or unknown bidder profile - please create a bidder profile first' })

    const [rows] = await pool.query('SELECT b.Bid_ID, t.Tender_Title, b.Bid_Amount, b.Technical_Score, b.Financial_Score, b.Total_Score, b.Bid_Status, b.Submission_Date FROM BID b JOIN TENDER t ON b.Tender_ID = t.Tender_ID WHERE b.Bidder_ID = ?', [bidderId])
    return res.json({ bids: rows })
  }catch(err){
    console.error('myBids', err)
    return res.status(500).json({ error: err.message })
  }
}
