const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const { callProc } = require('../utils/sql')
const { verifyToken } = require('../middleware/auth')
const { requireRole } = require('../middleware/role')

router.get('/open', async (req, res) => {
  try{
    // read from view active_tenders_view
    const [rows] = await pool.query('SELECT * FROM active_tenders_view')
    res.json({ tenders: rows })
  }catch(err){
    console.error('tenders.open', err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  const id = req.params.id
  try{
    const [rows] = await pool.query('SELECT * FROM TENDER WHERE Tender_ID = ?', [id])
    if (!rows.length) return res.status(404).json({ error: 'Tender not found' })
    // documents could come from TENDER_DOCUMENT table; try to select them if exists
    let docs = []
    try{ const [d] = await pool.query('SELECT * FROM TENDER_DOCUMENT WHERE Tender_ID = ?', [id]); docs = d }catch(e){}
    res.json({ tender: rows[0], documents: docs })
  }catch(err){
    console.error('tenders.show', err)
    res.status(500).json({ error: err.message })
  }
})

// Award tender - expects body { bidId }
router.post('/:id/award', verifyToken, requireRole('tender_manager'), async (req, res) => {
  const tenderId = Number(req.params.id)
  const bidId = Number(req.body.bidId)
  const awardedBy = req.user?.id
  if (!bidId) return res.status(400).json({ error: 'Missing bidId' })
  try{
    const out = await callProc('sp_award_tender', [tenderId, bidId, awardedBy])
    if (!out) return res.status(500).json({ error: 'No response from DB' })
    if (out.error_code && out.error_code != 0) return res.status(400).json({ error: out.error_message })
    return res.json({ ok: true, message: out.error_message, contractId: out.Contract_ID })
  }catch(err){
    console.error('tenders.award', err)
    return res.status(500).json({ error: err.message })
  }
})

module.exports = router
