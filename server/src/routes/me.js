const express = require('express')
const User = require('../models/User')
const { requireAuth} = require('../middleware/auth')
const { toPublicUser} = require('../utils/user')
const { hashPassword, verifyPassword} = require('../utils/password')

const router = express.Router()

router.get('/me', requireAuth, (req, res) => {
    return res.status(200).json({ user: toPublicUser(req.user)})
})

router.patch('/me', requireAuth, async(req, res) => {
    try{
        const { name, phone, email, currentPassword, newPassword} = req.body
        const user = req.user

        if(name !== undefined) {
            if(!String(name).trim()) {
                return res.status(400).json({ message: 'name cannot be empty'})
            }
            user.name = String(name).trim()
        }

        if(phone !== undefined) {
            user.phone = phone
        }

        if(email !== undefined) {
            const nextEmail = String(email).toLowerCase().trim()
            if(!nextEmail) {
                return res.status(400).json({ message: 'email cannot be Empty '})
            }
            const taken = await User.findOne({
                email: nextEmail,
                 _id: {$ne: user._id},
            })

            if(taken) {
                return res.status(409).json({ message: 'Email already registered '})
            }
            user.email = nextEmail
        }

        if (newPassword !== undefined) {
            if (!currentPassword) {
                return res.status(400).json({
                    message: 'current password is required to change password',
                })
            }
            if(String(newPassword).length <8) {
                return res.status(400).json({
                    message: 'password must be at least 8 characters',
                })
            }

            const ok = await verifyPassword(currentPassword, user.passwordHash)
            if (!ok) {
                return res.status(401).json({ message: 'Invalid current password'})
            }
            user.passwordHash = await hashPassword(newPassword)
        }
        await user.save()
        return res.status(200).json({ user: toPublicUser(user) })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Email already registered'})
        }

        console.error(err)
        return res.status(500).json({ message: 'Server Error'})
    }
})

module.exports = router