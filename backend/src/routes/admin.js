const express = require('express')
const router = express.Router()
const controller = require('../controllers/adminController')
const { verifyToken } = require('../middleware/auth')
const { requireRole } = require('../middleware/role')

// Note: you should protect these routes with role checks in real app; here verifyToken is used for demo
router.get('/users', verifyToken, requireRole('admin'), controller.listUsers)
router.post('/users', verifyToken, requireRole('admin'), controller.createUser)
router.put('/users/:id', verifyToken, requireRole('admin'), controller.updateUser)
router.delete('/users/:id', verifyToken, requireRole('admin'), controller.deleteUser)

router.get('/organizations', verifyToken, requireRole('admin'), controller.listOrgs)
router.post('/organizations', verifyToken, requireRole('admin'), controller.createOrg)
router.put('/organizations/:id', verifyToken, requireRole('admin'), controller.updateOrg)
router.delete('/organizations/:id', verifyToken, requireRole('admin'), controller.deleteOrg)

module.exports = router
