const express = require('express')
const Booking = require('../models/Booking')
const User = require('../models/User')
const Vehicle = require('../models/Vehicle')
const ServiceType = require('../models/ServiceType')
const Branch = require('../models/Branch')
const { requireAuth, requireRole } = require('../middleware/auth')
const { canAccessBranch } = require('../utils/branchAccess')
const WorkOrder = require('../models/WorkOrder')

const router = express.Router()

function overlaps(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd
}

router.post('/', requireAuth, requireRole('Customer'), async (req, res) => {
    try {
        const { branch, vehicle, service, start } = req.body
        if (!branch || !vehicle || !service || !start) {
            return res.status(400).json({
                message: 'branch, vehicle, service, and start are required',
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

        const vehicleDoc = await Vehicle.findById(vehicle)
        if (!vehicleDoc) {
            return res.status(404).json({ message: 'Vehicle not found' })
        }
        if ( String(vehicleDoc.customer) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Forbidden' })
        }

        
        const scheduledStart = new Date(start)
        if (Number.isNaN(scheduledStart.getTime())) {
        return res.status(400).json({ message: 'Invalid start' })
        }
        const scheduledEnd = new Date(
            scheduledStart.getTime() + serviceDoc.estimatedDurationMinutes * 60000
        )
        const existing = await Booking.find({
            branch,
            status: { $ne: 'Cancelled' },
        })
        const taken = existing.some((b) => 
        overlaps(scheduledStart, scheduledEnd, b.scheduledStart, b.scheduledEnd))
        if (taken) {
            return res.status(409).json({ message: 'Slot unavailable' })
        }

        const booking = await Booking.create({
            customer: req.user._id,
            vehicle: vehicleDoc._id,
            branch : branchDoc._id,
            serviceTypes: [serviceDoc._id],
            scheduledStart,
            scheduledEnd,
            status: 'Pending',
        })

        return res.status(201).json({ booking })
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid id' })
        }
        console.error(err)
        return res.status(500).json({ message: 'Server errror' })
    }
})

router.get('/', requireAuth, requireRole('SuperAdmin', 'BranchManager', 'Staff', 'Customer'), async (req, res) => {
    try {
        const filter = {}
        if (req.user.role === 'Customer') {
            filter.customer = req.user._id
          } else if (req.user.role === 'Staff') {
            filter.assignedStaff = req.user._id
          } else if (req.user.role === 'BranchManager') {
            if (!req.user.branch) {
                return res.status(200).json({ bookings: [] })
            }
            filter.branch = req.user.branch
        } else if (req.query.branch) {
            filter.branch = req.query.branch
        }
        const bookings = await Booking.find(filter).sort({ scheduledStart: 1 })
        return res.status(200).json({ bookings })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
})

//tracking the booking(pending)
function canTrackBooking(user, booking) {
    if (user.role === 'SuperAdmin') return true
    if (user.role === 'Customer') {
        return String(booking.customer) === String(user._id)
    }
    if (user.role === 'Staff') {
        return String(booking.assignedStaff) === String(user._id)
    }
    if (user.role === 'BranchManager') {
        return canAccessBranch(user, booking.branch)
    }
    return false
}

router.get(
    '/:id/tracking',
    requireAuth,
    async (req, res) => {
        try {
            const booking = await Booking.findById(req.params.id)
            if (!booking ){
                return res.status(404).json({ message: 'Booking not found' })
            }
            if (!canTrackBooking(req.user, booking)) {
                return res.status(403).json({ message: 'Forbidden' })
            }
            
            const workOrder = await WorkOrder.findOne({ booking: booking._id })

            const timeline = [
                { status: 'Pending', at: booking.createdAt },
            ]
            if (workOrder) {
                for (const h of workOrder.statusHistory) {
                    timeline.push({
                        status: h.status,
                        at: h.changedAt,
                    })
                }
            }else if (booking.status !== 'Pending') {
                timeline.push({ status: booking.status, at: booking.updatedAt })
            }

            return res.status(200).json({
                tracking: {
                    id: booking._id,
                    status: booking.status,
                    scheduledStart: booking.scheduledStart,
                    scheduledEnd: booking.scheduledEnd,
                    timeline,
                    paymentEligible: workOrder
                        ? Boolean(workOrder.paymentEligible)
                        :false,
                },
            })
        } catch (err) {
            if (err.name === 'CastError') {
                return res.status(404).json({ message: 'Booking not found' })
            }
            console.error(err)
            return res.status(500).json({ message: 'Server error' })
        }
    }
)

router.patch(
    '/:id/status',
    requireAuth,
    requireRole('SuperAdmin', 'BranchManager'),
    async (req, res) => {
        try {
            const { status } = req.body
            if (!status) {
                return res.status(400).json({ message: 'status is required' })
            }

            const booking = await Booking.findById(req.params.id)
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' })
            }
            if (!canAccessBranch(req.user, booking.branch)) {
                return res.status(403).json({ message: 'Forbidden' })
            }

            booking.status = status
            await booking.save()
            return res.status(200).json({ booking })
        } catch (err) {
            if (err.name === 'ValidationError') {
                return res.status(400).json({ message: 'Invalid status' })
            }
            if (err.name === 'CastError') {
                return res.status(404).json({ message: 'Booking not found' })
              }
              console.error(err)
              return res.status(500).json({ message: 'Server error' })                 
        }
    }
)

router.get('/:id', requireAuth, requireRole('SuperAdmin', 'BranchManager'), async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' })
        }
        if (!canAccessBranch(req.user, booking.branch)) {
            return res.status(403).json({ message: 'Forbidden' })
        }
        return res.status(200).json({ booking })
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).json({ message: 'Booking not found' })
        }
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
})

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

const CANCEL_CUTOFF_MS = 24 * 60 * 60 * 1000

function isManagerOverride(user, booking) {
    if (user.role === 'SuperAdmin')  return true
    if (user.role === 'BranchManager' && canAccessBranch(user, booking.branch)) {
        return true
    }
    return false
}

router.patch('/:id/cancel', requireAuth, requireRole('Customer', 'BranchManager', 'SuperAdmin'), async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' })
        }
        if (booking.status === 'Cancelled') {
            return res.status(400).json({ message: 'Alreadu cancelled' })
        }
        
        if (req.user.role === 'Customer') {
            if (String(booking.customer) !== String(req.user._id)) {
                return res.status(403).json({ message: 'Forbidden' })
            }
            if (booking.scheduledStart - Date.now() < CANCEL_CUTOFF_MS) {
                return res.status(400).json({ message: 'Too late to cancel' })
            }
        } else if (!isManagerOverride(req.user, booking)) {
            return res.status(403).json({ message: 'Forbidden' })
        }

        booking.status = 'Cancelled'
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

router.patch('/:id/reschedule', requireAuth, requireRole('Customer', 'BranchManager', 'SuperAdmin'),
async (req, res) => {
    try {
        const { start } = req.body
        if (!start) {
            return res.status(400).json({ message: 'start is required' })
        }

        const booking = await Booking.findById(req.params.id)
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' })
        }
        if (booking.status === 'Cancelled') {
            return res.status(400).json({ message: 'Booking is cancelled' })
        }

        if (req.user.role === 'Customer') {
            if (String(booking.customer) !== String(req.user._id)) {
                return res.status(403).json({ message: 'Forbidden' })
            }
            if (booking.scheduledStart - Date.now() < CANCEL_CUTOFF_MS) {
                return res.status(400).json({ message: 'Too late to reschedule' })
            }
        } else if (!isManagerOverride(req.user, booking)) {
            return res.status(403).json({ message: 'Forbidden' })
        }


        const scheduledStart = new Date(start)
        if (Number.isNaN(scheduledStart.getTime())) {
            return res.status(400).json({ message: 'Invalid start' })
        }
        const durationMS = booking.scheduledEnd - booking.scheduledStart
        const scheduledEnd = new Date(scheduledStart.getTime() + durationMS)

        const existing = await Booking.find({
            _id: { $ne: booking._id},
            branch: booking.branch,
            status: { $ne: 'Cancelled' },
        })
        const taken = existing.some((b) => 
        overlaps(scheduledStart, scheduledEnd, b.scheduledStart, b.scheduledEnd)
        )
        if (taken) {
            return res.status(409).json({ message: 'Slot unavailable' })
        }

        booking.scheduledStart = scheduledStart
        booking.scheduledEnd = scheduledEnd
        await booking.save()
        return res.status(200).json({ booking }) 
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).json({ message: 'Booking not found' })
        }
        console.error(err)
        return res.status(500).json({ message: 'Server errror' })
    }
})

router.post(
    '/:id/work-order',
    requireAuth,
    requireRole('SuperAdmin', 'BranchManager', 'Staff'),
    async (req, res) => {
        try {
            const booking = await Booking.findById(req.params.id)
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' })
            }
            if (!canAccessBranch(req.user, booking.branch)) {
                return res.status(403).json({ message: 'Forbidden' })
            }
            if (booking.status !== 'Confirmed') {
                return res.status(400).json({ message: 'Booking must be confirmed' })
            }

            const existing = await WorkOrder.findOne({ booking: booking._id })
            if (existing) {
                return res.status(409).json({ message: 'workorder already exists' })
            }

            const workOrder = await WorkOrder.create({
                booking: booking._id,
                assignedStaff: booking.assignedStaff,
                status: 'InProgress',
                statusHistory: [
                    { status: 'Open', note: 'Work order opened from booking' },
                    { status: 'InProgress', note: 'Repair started' },
                ],
            })

            booking.status = 'In Progress'
            await booking.save()

            return res.status(201).json({ workOrder, booking })
        } catch (err) {
            if (err.code === 11000) {
                return res.status(409).json({ message: 'Work order already exists' })
            }
            if (err.name === 'CastError') {
                return res.status(404).json({ message: 'Booking not found' })
            }
            console.error(err)
            return res.status(500).json({ message: 'Server error' })
        }
    }
)

const WORK_ORDER_NEXT = {
    Open: ['InProgress', 'Cancelled'],
    InProgress: ['WaitingParts', 'Completed', 'Cancelled'],
    WaitingParts: ['InProgress', 'Completed', 'Cancelled'],
    Completed: [],
    Cancelled: [],
}

function canUpdateWorkOrder(user, booking) {
    if (user.role === 'SuperAdmin') return true
    if (user.role === 'BranchManager') {
        return canAccessBranch(user, booking.branch)
    }
    if (user.role === 'Staff') {
        return (
            booking.assignedStaff &&
            String(booking.assignedStaff) === String(user._id)
        )
    }
    return false
}

router.get(
    '/:id/work-order',
    requireAuth,
    requireRole('SuperAdmin', 'BranchManager', 'Staff'),
    async (req, res) => {
        try {
            const booking = await Booking.findById(req.params.id)
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' })
            }
            if (!canAccessBranch(req.user, booking.branch)) {
                return res.status(403).json({ message: 'Forbidden' })
            }
            const workOrder = await WorkOrder.findOne({ booking: booking._id })
            if (!workOrder) {
                return res.status(404).json({ message: 'work order not found' })
            }
            return res.status(200).json({ workOrder })
        } catch (err) {
            if (err.name === 'CastError') {
                return res.status(404).json({ message: 'Booking not found' })
            }
            console.error(err)
            return res.status(500).json({ message: 'Server error' })
        }
    }
)

router.patch(
    '/:id/work-order/status',
    requireAuth,
    requireRole('SuperAdmin', 'BranchManager', 'Staff'),
    async (req, res) => {
        try {
            const { status, note } = req.body
            if (!status) {
                return res.status(400).json({ message: 'Status is required' })
            }

            const booking = await Booking.findById(req.params.id)
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' })
            }
            if (!canUpdateWorkOrder(req.user, booking)) {
                return res.status(403).json({ message: 'Forbidden' })
            }

            const workOrder = await WorkOrder.findOne({ booking: booking._id })
            if (!workOrder) {
                return res.status(404).json({ message: 'Work order not found'  })
            }

            const allowed = WORK_ORDER_NEXT[workOrder.status] || []
            if (!allowed.includes(status)) {
                return res.status(400).json({ message: 'Illegal transition' })
            }

            workOrder.status = status
            workOrder.statusHistory.push({ status, note })
            await workOrder.save()

            if (status === 'Completed') {
                booking.status = 'Completed'
                await booking.save()
              } else if (status === 'Cancelled') {
                booking.status = 'Cancelled'
                await booking.save()
              }
              
              return res.status(200).json({ workOrder, booking })
        } catch (err) {
            if (err.name === 'ValidationError') {
                return res.status(400).json({ message: 'Invalid status' })
              }
              if (err.name === 'CastError') {
                return res.status(404).json({ message: 'Booking not found' })
              }
              console.error(err)
              return res.status(500).json({ message: 'Server error' })            
        }
    }
)

router.patch(
    '/:id/work-order/notes',
    requireAuth,
    requireRole('SuperAdmin', 'BranchManager', 'Staff'),
    async (req, res) => {
      try {
        const { labourNotes } = req.body
        if (labourNotes === undefined) {
          return res.status(400).json({ message: 'labourNotes is required' })
        }
  
        const booking = await Booking.findById(req.params.id)
        if (!booking) {
          return res.status(404).json({ message: 'Booking not found' })
        }
        if (!canUpdateWorkOrder(req.user, booking)) {
          return res.status(403).json({ message: 'Forbidden' })
        }
  
        const workOrder = await WorkOrder.findOne({ booking: booking._id })
        if (!workOrder) {
          return res.status(404).json({ message: 'Work order not found' })
        }
  
        workOrder.labourNotes = labourNotes
        await workOrder.save()
        return res.status(200).json({ workOrder })
      } catch (err) {
        if (err.name === 'CastError') {
          return res.status(404).json({ message: 'Booking not found' })
        }
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
      }
    }
  )

router.patch(
    '/:id/work-order/parts',
    requireAuth,
    requireRole('SuperAdmin', 'BranchManager', 'Staff'),
    async (req, res) => {
        try {
            const { name, sku, quantity } = req.body
            if (!name) {
                return res.status(400).json({ message: 'name is required' })
            }

            const booking = await Booking.findById(req.params.id)
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' })
            }
            if (!canUpdateWorkOrder(req.user, booking)) {
                return res.status(403).json({ message: 'Forbidden' })
            }

            const workOrder = await WorkOrder.findOne({ booking: booking._id })
            if (!workOrder) {
                return res.status(404).json({ message: 'work order not found' })
            }

            workOrder.partsUsed.push({
                name,
                sku,
                qunatity: quantity || 1,
            })
            await workOrder.save()
            return res.status(200).json({ workOrder })
        } catch (err) {
            if (err.name === 'ValidationError') {
                return res.status(400).json({ message: 'Invalid parts line' })
            }
            if (err.name === 'CastError') {
                return res.status(404).json({ message: 'Booking not found' })
            }
            console.error(err)
            return res.status(500).json({ message: 'Server error' })
        }
    }
)

router.post(
    '/:id/work-order/complete',
    requireAuth,
    requireRole('SuperAdmin', 'BranchManager', 'Staff'),
    async (req, res) => {
      try {
        const booking = await Booking.findById(req.params.id)
        if (!booking) {
          return res.status(404).json({ message: 'Booking not found' })
        }
        if (!canUpdateWorkOrder(req.user, booking)) {
          return res.status(403).json({ message: 'Forbidden' })
        }
  
        const workOrder = await WorkOrder.findOne({ booking: booking._id })
        if (!workOrder) {
          return res.status(404).json({ message: 'Work order not found' })
        }
  
        const allowed = WORK_ORDER_NEXT[workOrder.status] || []
        if (!allowed.includes('Completed')) {
          return res.status(400).json({ message: 'Illegal transition' })
        }
  
        workOrder.status = 'Completed'
        workOrder.paymentEligible = true
        workOrder.statusHistory.push({
          status: 'Completed',
          note: 'Repair completed',
        })
        await workOrder.save()
  
        booking.status = 'Completed'
        await booking.save()
  
        return res.status(200).json({ workOrder, booking })
      } catch (err) {
        if (err.name === 'CastError') {
          return res.status(404).json({ message: 'Booking not found' })
        }
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
      }
    }
  )
  
  router.patch(
    '/:id/work-order/payable',
    requireAuth,
    requireRole('SuperAdmin', 'BranchManager'),
    async (req, res) => {
      try {
        const booking = await Booking.findById(req.params.id)
        if (!booking) {
          return res.status(404).json({ message: 'Booking not found' })
        }
        if (!canAccessBranch(req.user, booking.branch)) {
          return res.status(403).json({ message: 'Forbidden' })
        }
  
        const workOrder = await WorkOrder.findOne({ booking: booking._id })
        if (!workOrder) {
          return res.status(404).json({ message: 'Work order not found' })
        }
        if (workOrder.status !== 'Completed') {
          return res.status(400).json({ message: 'Not payable until completed' })
        }
  
        workOrder.paymentEligible = true
        await workOrder.save()
        return res.status(200).json({ workOrder })
      } catch (err) {
        if (err.name === 'CastError') {
          return res.status(404).json({ message: 'Booking not found' })
        }
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
      }
    }
  )

module.exports = router