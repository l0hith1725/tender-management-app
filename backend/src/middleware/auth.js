const jwt = require('jsonwebtoken')

exports.verifyToken = (req, res, next) => {
  const token = req.cookies?.token
  if (!token) return res.status(200).json({ user: null })
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret')
    // Attach user data from JWT to request object
    req.user = { 
      id: payload.id, 
      role: payload.role,
      username: payload.username 
    }
    return next()
  }catch(err){
    console.warn('invalid token', err.message)
    return res.status(200).json({ user: null })
  }
}
