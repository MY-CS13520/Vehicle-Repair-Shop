const express = require('express')
const { requireAuth} = require('../middleware/auth')
const { toPublicUser} = require('../utils/user')

const router = express.Router()

router.get('/me', requireAuth, (req, res) => {
    return res.status(200).json({ user: toPublicUser(req.user)})
})

module.exports = router