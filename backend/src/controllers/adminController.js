const { callProc } = require('../utils/sql')

exports.listUsers = async (req, res, next) => {
  try{
    const users = await callProc('sp_list_users', [])
    // Ensure we always return an array, even if single row returned as object
    const userList = Array.isArray(users) ? users : (users ? [users] : [])
    return res.json({ users: userList })
  }catch(err){
    return next(err)
  }
}

exports.createUser = async (req, res, next) => {
  const { username, password, role } = req.body
  try{
    const out = await callProc('sp_create_user', [username, password, role])
    if (!out) return res.status(500).json({ error: 'No response from DB' })
    if (out.error_code && out.error_code != 0) return res.status(400).json({ error: out.error_message })
    return res.json({ ok: true, message: out.error_message, userId: out.User_ID })
  }catch(err){
    return next(err)
  }
}

exports.updateUser = async (req, res, next) => {
  const userId = Number(req.params.id)
  const { role } = req.body
  try{
    const out = await callProc('sp_update_user', [userId, role])
    if (!out) return res.status(500).json({ error: 'No response from DB' })
    return res.json({ ok: true, message: out.error_message })
  }catch(err){
    return next(err)
  }
}

exports.deleteUser = async (req, res, next) => {
  const userId = Number(req.params.id)
  try{
    const out = await callProc('sp_delete_user', [userId])
    if (!out) return res.status(500).json({ error: 'No response from DB' })
    return res.json({ ok: true, message: out.error_message })
  }catch(err){
    return next(err)
  }
}

// Organizations
exports.listOrgs = async (req, res, next) => {
  try{
    const organizations = await callProc('sp_list_organizations', [])
    // Ensure we always return an array
    const orgList = Array.isArray(organizations) ? organizations : (organizations ? [organizations] : [])
    return res.json({ organizations: orgList })
  }catch(err){
    return next(err)
  }
}

exports.createOrg = async (req, res, next) => {
  const { name, address, phone, email, registrationNumber, type } = req.body
  try{
    const out = await callProc('sp_create_organization', [name, address, phone, email, registrationNumber, type])
    if (!out) return res.status(500).json({ error: 'No response from DB' })
    if (out.error_code && out.error_code != 0) return res.status(400).json({ error: out.error_message })
    return res.json({ ok: true, message: out.error_message, orgId: out.Organization_ID })
  }catch(err){
    return next(err)
  }
}

exports.updateOrg = async (req, res, next) => {
  const orgId = Number(req.params.id)
  const { name, address, phone, email } = req.body
  try{
    const out = await callProc('sp_update_organization', [orgId, name, address, phone, email])
    if (!out) return res.status(500).json({ error: 'No response from DB' })
    return res.json({ ok: true, message: out.error_message })
  }catch(err){
    return next(err)
  }
}

exports.deleteOrg = async (req, res, next) => {
  const orgId = Number(req.params.id)
  try{
    const out = await callProc('sp_delete_organization', [orgId])
    if (!out) return res.status(500).json({ error: 'No response from DB' })
    return res.json({ ok: true, message: out.error_message })
  }catch(err){
    return next(err)
  }
}
