const express = require('express')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

const { hashPassword, verifyPassword} = require('../utils/password')

const router = express.Router()

function signToken(user){
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        {expiresIn: '7d'}
    )
}

function toPublicUser(user){
    return{
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        branch: user.branch || null,
    }
}

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
            user: toPublicUser(user),
        })

        
    }catch(err){
        if( err.code === 11000) {
            return res.status(409).json({ message: 'Email already registered'})
        }
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
})

router.post('/login', async (req, res) =>{
    try{
        const { email, password } = req.body

        if(!email || !password) {
            return res.status(400).json({
                message: 'email and password are required'
            })
        }

        const user = await User.findOne({ email: email.toLowerCase().trim()})
        if(!user || !user.isActive) {
            return res.status(401).json({
                message: 'Invalid Credentials'
            })
        }

        const ok = await verifyPassword(password, user.passwordHash)
        if(!ok) {
            return res.status(401).json({ message:'Invalid Credentials' })
        }

        const token = signToken(user)
        return res.status(200).json({
            token,
            user: toPublicUser(user),
        })
    }catch(err){
        console.error(err)
        return res.status(500).json({
            message: 'Server Error'
        })
    }
})

module.exports = router