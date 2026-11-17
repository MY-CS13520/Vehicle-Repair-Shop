const express = require('express')
const ServiceType = require('../models/ServiceType')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

router.get('/', requireAuth, async (req, res) => {
    try {
        const filter = {}

        if (req.user.role !== 'SuperAdmin') {
            filter.isActive = true
        }else if ( req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === 'true'
        }

        const services = await ServiceType.find(filter).sort({ name: 1 })
        return res.status(200).json({ services })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'server error' })
    }
})

router.post('/', requireAuth, requireRole('SuperAdmin'), async (req, res) => {
    try {
        const { name, description, basePrice, estimatedDurationMinutes, isActive } = req.body
        if (!name || basePrice === undefined || !estimatedDurationMinutes) {
            return res.status(400).json({
                message: 'name, basePrice, and estimatedDurationMinutes are required'
            })
        }
        const service = await ServiceType.create({
            name,
            description,
            basePrice,
            estimatedDurationMinutes,
            isActive: isActive !== undefined ? isActive : true,
        })
        return res.status(201).json({ service })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
})

router.patch('/:id', requireAuth, requireRole('SuperAdmin'), async (req, res) => {
    try {
        const service = await ServiceType.findById(req.params.id)
        if (!service) {
            return res.status(404).json({ message: 'Service not found' })
        }

        const { name, description, basePrice, estimatedDurationMinutes, isActive } = req.body
        if (name !== undefined) service.name = name
        if (description !== undefined) service.description = description
        if (basePrice !== undefined) service.basePrice = basePrice
        if (estimatedDurationMinutes !== undefined) {
            service.estimatedDurationMinutes = estimatedDurationMinutes
        }
        if (isActive !== undefined) service.isActive = isActive

        await service.save()
        return res.status(200).json({ service})
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error'})
    }
})

module.exports = router