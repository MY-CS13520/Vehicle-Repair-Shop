const express = require('express')
const Branch = require('../models/Branch')
const { requireAuth, requireRole } = require('../middleware/auth')
const { canAccessBranch } = require('../utils/branchAccess')
const Booking = require('../models/Booking')

const router = express.Router()

router.post('/', requireAuth, requireRole('SuperAdmin'), async (req, res) => {
    try {
        const { name, region, address, contact, isActive } = req.body

        if (!name || !region) {
            return res.status(400).json({
                message: 'name and region are required',
            })
        }

        const branch = await Branch.create({
            name,
            region, 
            address,
            contact,
            isActive: isActive !== undefined ? isActive: true,
        })

        return res.status(201).json({ branch })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ messsage: 'server error'})
    }
})

router.get('/', requireAuth, requireRole('SuperAdmin'), async (req, res) =>{
    try {
        const filter = {}
        if (req.query.region) {
            filter.region = String(req.query.region).trim()
        }

        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === 'true'
          }

        const branches = await Branch.find(filter).sort({ name: 1 })
        return res.status(200).json({ branches })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server Error'})
    }
})

router.get('/:id', requireAuth, async (req, res) => {
    try {
        const branch = await Branch.findById(req.params.id)
        if (!branch) {
            return res.status(404).json({ message: 'Branch not found' })
        }


        if (!canAccessBranch(req.user, branch._id)) {
            return res.status(403).json({ message: 'Forbidden' })
          }        

        return res.status(200).json({ branch })
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).json({ message: 'Branch not found' })
        }

        console.error(err)
        return res.status(500).json({ messsage: 'Server error'})
    }
})

router.patch('/:id', requireAuth, requireRole('SuperAdmin'), async (req, res) =>{
    try {
        const { name, region, address, contact, isActive } = req.body

        const branch = await Branch.findById(req.params.id)
        if (!branch) {
            return res.status(404).json({ message: 'Branch not found' })
        }

        if (name !== undefined) branch.name = name
        if (region !== undefined) branch.region = region
        if (address !== undefined) branch.address = address
        if (contact !== undefined) branch.contact = contact
        if (isActive !== undefined) branch.isActive = isActive

        await branch.save()
        return res.status(200).json({ branch })
    } catch (err) {
        if(err.name == 'CastError') {
            return res.status(404).json({ message: 'Branch not found' })
        }
        console.error(err)
        return res.status(500).json({ message: 'Server error'})
    }
})

router.delete('/:id', requireAuth, requireRole('SuperAdmin'), async (req, res) => {
    try {
      const branch = await Branch.findById(req.params.id)
      if (!branch) {
        return res.status(404).json({ message: 'Branch not found' })
      }
  
      const bookingCount = await Booking.countDocuments({ branch: branch._id })
      if (bookingCount > 0) {
        return res.status(409).json({
          message:
            'Cannot delete branch with existing bookings. Deactivate it instead.',
        })
      }
  
      await branch.deleteOne()
      return res.status(200).json({ message: 'Branch deleted' })
    } catch (err) {
      if (err.name === 'CastError') {
        return res.status(404).json({ message: 'Branch not found' })
      }
      console.error(err)
      return res.status(500).json({ message: 'Server error' })
    }
  })

module.exports = router