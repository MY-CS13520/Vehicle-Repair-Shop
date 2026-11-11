const express = require('express')
const Booking = require('../models/Booking')
const User = require('../models/User')
const { requireAuth, requireRole } = require('../middleware/auth')
const { canAccessBranch } = require('../utils/branchAccess')

const router = express.Router()

router.patch('/:id/assign', requireAuth, requireRole('SuperAdmin', 'BranchManager'), async (req,res ) => {
    try {
        const { staffId } = req.body
        if (!staffId ) {
            return res.status(400).json({ message: 'staffId is required' })
        }

        const booking = await Booking.findById(req.params.id)
        if (!booking){
            return res.status(404).json({ message: 'Booking not found' })
        }

        if(!canAccessBranch(req.user, booking.branch)) {
            return res.status(403).json({ message: 'Forbidden' })
        }

        const staff = await User.findById(staffId)
        if (!staff || staff.role !== 'Staff' || !staff.isActive) {
            return res.status(400).json({ message: 'Invalid staff' })
        }
        
        if (String(staff.branch) !== String(booking.branch)) {
            return res.status(400).json({ message: 'Staff must belong to booking branch' })
        }

        booking.assignedStaff = staff._id
        await booking.save()

        return res.status(200).json({ booking })

    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).json({ message: 'Booking not found' })
        }
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
})

module.exports = router