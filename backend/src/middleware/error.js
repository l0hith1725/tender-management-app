// Global error handler
module.exports = (err, req, res, next) => {
  console.error('GlobalError:', err && err.message ? err.message : err)
  if (err && err.status) {
    return res.status(err.status).json({ error: err.message })
  }
  // SQLProcedureError should carry status, otherwise default 500
  return res.status(500).json({ error: 'Internal Server Error' })
}
