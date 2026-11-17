const express = require('express')
const Vehicle = require('../models/Vehicle') 
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

router.post('/', requireAuth, requireRole('Customer'), async (req, res) => {
    try {
        const { make, model, year, plate, vin } = req.body
        if (!make || !model || !year || !plate) {
            return res.status(400).json({
                message: 'make, model, year and plate are required'
            })
        }

        const vehicle = await Vehicle.create({
            customer: req.user._id,
            make,
            model,
            year,
            plate,
            vin,
        })
        return res.status(201).json({ vehicle })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
})

router.get('/', requireAuth, requireRole('Customer'), async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ customer: req.user._id }).sort({ plate: 1 ,})
        return res.status(200).json({ vehicles })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'server error' })
    }
})

router.get('/:id', requireAuth, requireRole('Customer'), async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id)
        if (!vehicle) {
            return res.status(404).json({ message: 'vehicle not found' })
        }
        if (String(vehicle.customer) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Forbidden' })
        }
        return res.status(200).json({ vehicle })
    } catch (err) {
        if(err.name === 'CastError') {
            return res.status(404).json({ message: 'vehicle not found' })
        }
        console.error(err)
        return res.status(500).json({ message: 'Server error'})
    }
})

router.patch('/:id', requireAuth, requireRole('Customer'), async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id)
        if (!vehicle) {
            return res.status(404).json({ message: 'vehicle not found' })
        }
        if (String(vehicle.customer) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Forbidden' })
        }

        const { make, model, year, plate , vin } = req.body
        if (make !== undefined) vehicle.make = make
        if (model !== undefined) vehicle.model = model
        if (year !== undefined) vehicle.year = year
        if (plate !== undefined) vehicle.plate = plate
        if (vin !== undefined) vehicle.vin = vin

        await vehicle.save()
        return res.status(200).json({ vehicle })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error'})
    }
})

module.exports = router