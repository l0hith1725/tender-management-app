const pool = require('../config/db')
const path = require('path')
const { uploadDir } = require('../config/uploads')

exports.uploadTenderDocument = async (req, res) => {
  const tenderId = Number(req.params.id)
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  try{
    // store metadata in table TENDER_DOCUMENT if exists, else return path
    try{
      await pool.query('INSERT INTO TENDER_DOCUMENT (Tender_ID, Document_Name, Document_Type, File_Path, File_Size) VALUES (?, ?, ?, ?, ?)', [tenderId, req.file.originalname, req.file.mimetype || 'application/octet-stream', req.file.filename, req.file.size || 0])
      return res.json({ ok: true, filename: req.file.filename, original: req.file.originalname })
    }catch(e){
      // fallback: table may not exist, just return file info
      console.error('Document insert error:', e.message)
      return res.json({ ok: true, filename: req.file.filename, original: req.file.originalname, info: 'file saved to server, DB table insert failed' })
    }
  }catch(err){
    console.error('uploadTenderDocument', err)
    return res.status(500).json({ error: err.message })
  }
}

exports.listTenderDocuments = async (req, res) => {
  const tenderId = Number(req.params.id)
  try{
    const [rows] = await pool.query('SELECT Document_ID, Document_Name, Document_Type, File_Path, Upload_Date, File_Size FROM TENDER_DOCUMENT WHERE Tender_ID = ?', [tenderId])
    return res.json({ documents: rows })
  }catch(err){
    // if table not present, return empty array
    console.error('listTenderDocuments', err)
    return res.status(500).json({ error: err.message })
  }
}

exports.downloadDocument = async (req, res) => {
  const filename = req.params.filename
  const full = path.join(uploadDir, filename)
  return res.download(full)
}
