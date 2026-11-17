const express = require('express')
const Booking = require('../models/Booking')
const ServiceType = require('../models/ServiceType')
const Branch = require('../models/Branch')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

function overlaps(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd
}

router.get('/', requireAuth, async (req, res) => {
    try {
        const { branch, date, service } = req.query
        if (!branch || !date || !service) {
            return res.status(400).json({
                message: 'branch, date, and service are required',
            })
        }

        const branchDoc = await Branch.findById(branch)
        if (!branchDoc || !branchDoc.isActive) {
            return res.status(400).json({ message: 'Invalid branch' })
        } 

        const serviceDoc = await ServiceType.findById(service)
        if (!serviceDoc || !serviceDoc.isActive) {
            return res.status(400).json({ message: 'Invalid service' })
        }

        const durationMS = serviceDoc.estimatedDurationMinutes *60000
        const day = new Date(`${date}T00:00:00.000Z`)
        if (Number.isNaN(day.getTime())) {
            return res.status(400).json({ message: 'Invalid date format'})
        }

        const open = new Date(day)
        open.setUTCHours(9, 0, 0, 0)
        const close = new Date(day)
        close.setUTCHours(17, 0, 0, 0)

        const existing = await Booking.find({
            branch,
            status: { $ne: 'Cancelled' },
            scheduledStart: { $lt: close },
            scheduledEnd: { $gt: open },
        })

        const slots = []
        let cursor = new Date(open)
        while (cursor.getTime() + durationMS <= close.getTime()) {
            const start = new Date(cursor)
            const end = new Date(cursor.getTime() + durationMS)
            const taken = existing.some((b) =>
            overlaps(start, end, b.scheduledStart, b.scheduledEnd))

            if (!taken) {
                slots.push({ start, end })
            }
            cursor = end
        }
        return res.status(200).json({ slots })
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid branch or service'})
        }
        consloe.error(err)
        return res.status(500).json({ message: 'server error' })
    }
})

module.exports = router