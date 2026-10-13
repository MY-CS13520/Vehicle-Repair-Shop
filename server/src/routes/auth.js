const express = require('express')
const User = require('../models/User')
const { hashPassword} = require('../utils/password')

const router = express.Router()

router.post('/register', async (req, res) => {
    try{
        const { email, password, name, phone } = req.body

        if(!email || !password || !name) {
            return res.status(400).json({
                message: 'email, password, and name are required',
            })
        }
        if (password.length < 6) {
            return res.status(400).json({
                message: 'password must be at least 6 characters length',
            })
        }

        const existing = await User.findOne({ email: email.toLowerCase().trim() })
        if(existing) {
            return res.status(409).json({ message: 'Email already taken'})
        }

        const passwordHash = await hashPassword(password)

        const user = await User.create({
            email,
            passwordHash,
            name,
            phone,
            role: 'Customer',
        })

        return res.status(201).json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role,
            }
        })

        
    }catch(err){
        if( err.code === 11000) {
            return res.status(409).json({ message: 'Email already registered'})
        }
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
})

module.exports = router