const path = require('path')
const fs = require('fs')

const uploadDir = path.join(__dirname, '..', '..', 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

let upload
try{
  // try to require multer; if not installed, provide a graceful stub so server can run
  const multer = require('multer')
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
      const unique = Date.now() + '-' + Math.round(Math.random()*1E9)
      cb(null, unique + '-' + file.originalname)
    }
  })
  upload = multer({ storage })
}catch(e){
  console.warn('multer not available; upload endpoints will return a 503 error')
  // provide a fallback middleware generator that returns a handler responding with 503
  upload = {
    single: (fieldName) => (req, res, next) => {
      return res.status(503).json({ error: 'File uploads are disabled on this server (multer not installed).' })
    }
  }
}

module.exports = { upload, uploadDir }
