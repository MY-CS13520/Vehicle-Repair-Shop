const express = require('express')
const User = require('../models/User')
const Branch = require('../models/Branch')
const { hashPassword } = require('../utils/password')
const {toPublicUser} = require('../utils/user')
const { requireAuth, requireRole} = require('../middleware/auth')

const router = express.Router()

const STAFF_ROLES = ['Staff', 'BranchManager']

router.post('/', requireAuth, requireRole('SuperAdmin'), async(req, res) => {
    try{
        const { email, password, name, phone, role, branch } = req.body
        if(!email || !password || !name || !role || !branch) {
            return res.status(400).json({
                message: 'email, password, name, role, and branch are required',
            })
        }

        if(!STAFF_ROLES.includes(role)) {
            return res.status(400).json({
                message: 'role must be Staff or Manager',
            })
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: 'password must be at least 8 characters',
            })
        } 

        const branchDoc = await Branch.findById(branch)
        if (!branchDoc || !branchDoc.isActive) {
            return res.status(400).json({ message: 'Invalid branch'})
        }

        const existing = await User.findOne({ email: email.toLowerCase().trim()})
        if (existing) {
            return res.status(409).json({ message: 'Email already in registered'})
        }
        const passwordHash = await hashPassword(password)

        const user = await User.create({
            email,passwordHash,name,phone,role,branch,
        })

        return res.status(201).json({ user: toPublicUser(user)})
    } catch (err) {
        if( err.code === 11000) {
            return res.status(409).json({ message: 'Email already in use'})
        }
        console.error(err)
        return res.status(500).json({ message: 'Server error'})
    }
})

module.exports = router