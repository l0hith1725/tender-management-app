const express = require('express')
const router = express.Router()
const docs = require('../controllers/documentsController')
const { verifyToken } = require('../middleware/auth')
const { requireRole } = require('../middleware/role')
const { upload } = require('../config/uploads')

// Manager uploads tender document
router.post('/:id/documents', verifyToken, requireRole('tender_manager'), upload.single('file'), docs.uploadTenderDocument)
router.get('/:id/documents', docs.listTenderDocuments)
router.get('/download/:filename', docs.downloadDocument)

module.exports = router
