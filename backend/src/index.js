require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const authRoutes = require('./routes/auth')
const tendersRoutes = require('./routes/tenders')
const bidsRoutes = require('./routes/bids')
const evaluationsRoutes = require('./routes/evaluations')
const adminRoutes = require('./routes/admin')
const documentsRoutes = require('./routes/documents')
const errorMiddleware = require('./middleware/error')

const app = express()
app.use(express.json())
app.use(cookieParser())

const FRONTEND = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
app.use(cors({ origin: FRONTEND, credentials: true }))

app.use('/api/auth', authRoutes)
app.use('/api/tenders', tendersRoutes)
app.use('/api/bids', bidsRoutes)
app.use('/api/evaluations', evaluationsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/documents', documentsRoutes)

app.get('/', (req, res) => res.json({ ok: true }))

// global error handler (should be last middleware)
app.use(errorMiddleware)

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`))
