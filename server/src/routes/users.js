const express = require('express')
const User = require('../models/User')
const Branch = require('../models/Branch')
const { hashPassword } = require('../utils/password')
const {toPublicUser} = require('../utils/user')
const { requireAuth, requireRole} = require('../middleware/auth')
const { canAccessBranch } = require('../utils/branchAccess')

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

router.get('/', requireAuth, requireRole('SuperAdmin', 'BranchManager'), async (req, res) => {
    try {
        const filter = {
            role: { $in: ['Staff', 'BranchManager' ]},
        }

        if (req.user.role === 'BranchManager') {
            if (!req.user.branch) {
                return res.status(200).json({ users: [] })
            }
            filter.branch = req.user.branch
        } else {
            if (req.query.branch) {
                filter.branch = req.query.branch
            } else if (req.query.region) {
                const branches = await Branch.find({
                    region: String(req.query.region).trim(),
                }).select('_id')
                filter.branch = { $in: branches.map((b) => b._id) }
            }
        }

        const users = await User.find(filter).select('-passwordHash').sort({ name: 1})
        return res.status(200).json({
            users: users.map((u) => toPublicUser(u)),
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server errror'})
    }
})

router.patch('/:id/branch', requireAuth, requireRole('SuperAdmin'), async (req, res) => {
    try {
        const { branch } = req.body
        if (!branch) {
            return res.json(400).json({ message: 'branch is required' })
        }

        const staff = await User.findById(req.params.id)
        if (!staff) {
            return res.status(404).json({ message: 'User not found' })
        }
        if (!['Staff', 'BranchManager'].includes(staff.role)) {
            return res.status(400).json({ message: 'only Staff or BranchManager can be assigned' })
        }

        const branchDoc = await Branch.findById(branch)
        if (!branchDoc || !branchDoc.isActive) {
            return res.status(400).json({ message: 'Invalid Branch' })
        }

        staff.branch = branch
        await staff.save()

        return res.status(200).json({ user: toPublicUser(staff)})
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).json({ message: 'User not found' })
        }
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
})

router.get('/:id', requireAuth, requireRole('SuperAdmin', 'BranchManager'), async (req, res) => {
    try {
        const staff = await User.findById(req.params.id).select('-passwordHash')
        if (!staff) {
            return res.status(404).json({ message: 'User not found' })
        }
        if (!['Staff', 'BranchManager'].includes(staff.role)) {
            return res.status(404).json({ message: 'User not found' })
        }
        if (!canAccessBranch(req.user, staff.branch)) {
            return res.status(403).json({ message: 'Forbidden' })
        }
        return res.status(200).json({ user: toPublicUser(staff) })
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).json({ message: 'User not found' })
        }
        console.error(err)
        return res.status(500).json({ message: 'Server error'})
    }
})

router.patch('/:id', requireAuth, requireRole('SuperAdmin', 'BranchManager'), async (req, res) => {
    try {
        const staff = await User.findById(req.params.id)
        if (!staff) {
            return res.status(404).json({ message: 'User not found' })
        }
        if(!['Staff', 'BranchManager'].includes(staff.role)) {
            return res.status(404).json({ message: 'User not found' })
        }
        if (!canAccessBranch(req.user, staff.branch)) {
            return res.status(403).json({ message: 'Forbidden' })
        }

        const { phone, skills, isActive, name } = req.body
        if (phone !== undefined) staff.phone = phone
        if (skills !== undefined) staff.skills = skills
        if (isActive !== undefined) staff.isActive = isActive
        if (name !== undefined) staff.name = name

        await staff.save()
        return res.status(200).json({ user: toPublicUser(staff) })
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).json({ message: 'User not found' })
        }
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
})
module.exports = router