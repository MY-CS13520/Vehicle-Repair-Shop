const express = require('express')
const Attendance = require('../models/Attendance')
const { requireAuth, requireRole} = require('../middleware/auth')

const router = express.Router()

function dayStart(d = new Date()) {
    const x = new Date(d)
    x.setUTCHours(0, 0, 0, 0)
    return x
}

router.get('/', requireAuth, requireRole('SuperAdmin', 'BranchManager'), async (req, res) => {
    try {
        const filter = {}

        if (req.user.role === 'BranchManager') {
            if (!req.user.branch) {
                return res.status(200).json({ attendance: [] })
            }
            filter.branch = req.user.branch
        } else if (req.query.branch) {
            filter.branch = req.query.branch
        }

        if (req.query.staff) {
            filter.staff = req.query.staff
        }

        if (req.query.from || req.query.to) {
            filter.date = {}
            if (req.query.from) filter.date.$gte = dayStart(new Date(req.query.from))
            if (req.query.to) filter.date.$lte = dayStart(new Date(req.query.to))
        }

        const rows = await Attendance.find(filter).sort({ date: 1, clockIn: 1 })
        return res.status(200).json({ attendance: rows })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error'})
    }
})

router.get('/current', requireAuth, requireRole('Staff'), async (req, res) => {
    try {
        const open = await Attendance.findOne({
            staff: req.user._id,
            clockOut: null,
        })
        return res.status(200).json({ attendance: open })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error'})
    }
})

router.post('/clock-in', requireAuth, requireRole('Staff'), async (req, res) => {
    try {
        if (!req.user.branch) {
            return res.status(400).json({ message: 'Staff has no branch' })
        }

        const open = await Attendance.findOne({
            staff: req.user._id,
            clockOut: null,
        })
        if (open) {
            return res.status(409).json({ message: 'already clocked in'})
        }

        const now = new Date()
        const row = await Attendance.create({
            staff: req.user._id,
            branch: req.user.branch,
            date: dayStart(now),
            clockIn: now,
            clockOut: null,
        })

        return res.status(201).json({ attendance: row })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
})

router.post('/clock-out', requireAuth, requireRole('Staff'), async (req, res) => {
    try {
        const open = await Attendance.findOne({
            staff: req.user._id,
            clockOut: null,
        })
        if (!open) {
            return res.status(400).json({ message: 'Not clocked in' })
        }

        open.clockOut = new Date()
        await open.save()

        const durationMs = open.clockOut - open.clockIn
        const durationMinutes = Math.round(durationMs / 60000)

        return res.status(200).json({
            attendance: open,
            durationMinutes,
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
})

module.exports = router