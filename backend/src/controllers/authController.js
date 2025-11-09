const { callProc } = require('../utils/sql')
const pool = require('../config/db')
const jwt = require('jsonwebtoken')

exports.login = async (req, res, next) => {
  const { username, password } = req.body
  try{
    const user = await callProc('sp_login_user', [username, password])
    if (!user || user.error) {
      // surface DB message as 400
      const msg = user?.error || 'Invalid credentials'
      return res.status(400).json({ error: msg })
    }

    const token = jwt.sign({ 
      id: user.UserID || user.userId, 
      role: user.Role || user.role,
      username: user.username 
    }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '8h' })
    
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' })
    return res.json({ user })
  }catch(err){
    // delegate to global error handler
    return next(err)
  }
}

exports.register = async (req, res, next) => {
  const { username, password, role } = req.body
  try{
    const out = await callProc('sp_register_user', [username, password, role])
    if (!out || out.error) return res.status(400).json({ error: out?.error || 'Registration failed' })
    return res.json({ ok: true, message: out?.message || 'Registered' })
  }catch(err){
    return next(err)
  }
}

exports.me = async (req, res) => {
  // token read & verified by middleware; if present attach user info to req.user
  if (!req.user) return res.json({ user: null })
  
  try {
    // Fetch fresh user data from database to ensure accuracy
    const [rows] = await pool.query(
      'SELECT User_ID as id, Username as username, Role as role FROM USERS WHERE User_ID = ?',
      [req.user.id]
    )
    
    if (rows.length === 0) {
      // User no longer exists in database
      return res.json({ user: null })
    }
    
    return res.json({ user: rows[0] })
  } catch(err) {
    console.error('Error fetching user data:', err)
    // Fallback to JWT data if database query fails
    return res.json({ user: req.user })
  }
}
