const jwt = require('jsonwebtoken')
const User = require('../models/User')

async function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization
        if(!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized'})
        }

        const token = header.slice(7)
        const payload = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(payload.id)
        if(!user || !user.isActive) {
            return res.status(401).json({ message: 'Unauthorized'})
        }
        req.user = user
        next()
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized'})
    }
}

module.exports = { requireAuth}