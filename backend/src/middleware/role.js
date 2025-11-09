exports.requireRole = (role) => (req, res, next) => {
  const userRole = req.user?.role || req.user?.Role || null
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  if (!role) return next()
  if (userRole !== role) return res.status(403).json({ error: 'Forbidden: insufficient role' })
  return next()
}
