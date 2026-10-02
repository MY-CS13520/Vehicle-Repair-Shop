require('dotenv').config()

const connectDB = require('../config/db')
const User = require('../models/User')
const Vehicle = require('../models/Vehicle')
const Branch = require('../models/Branch')
const ServiceType = require('../models/ServiceType')
const Booking = require('../models/Booking')

async function run() {
  try {
    await connectDB()

    const customer = await User.findOne({ email: 'test.customer@example.com' })
    const vehicle = await Vehicle.findOne({ plate: 'TEST-1234' })
    const branch = await Branch.findOne({ name: 'Colombo Test Branch' })
    const service = await ServiceType.findOne({ name: 'Oil Change Test' })

    if (!customer || !vehicle || !branch || !service) {
      throw new Error('Missing seed data. Run testUser, testBranch, testVehicle, testServiceType first.')
    }

    await Booking.deleteMany({ notes: 'TASK_1_6_TEST' })

    const booking = await Booking.create({
      customer: customer._id,
      vehicle: vehicle._id,
      branch: branch._id,
      serviceTypes: [service._id],
      scheduledStart: new Date('2026-10-10T09:00:00.000Z'),
      scheduledEnd: new Date('2026-10-10T09:45:00.000Z'),
      notes: 'TASK_1_6_TEST',
    })

    console.log('Booking created:', {
      id: booking._id.toString(),
      status: booking.status,
      customer: booking.customer.toString(),
      branch: booking.branch.toString(),
    })

    try {
      await Booking.create({
        customer: customer._id,
        vehicle: vehicle._id,
        branch: branch._id,
        serviceTypes: [service._id],
        scheduledStart: new Date('2026-10-11T09:00:00.000Z'),
        scheduledEnd: new Date('2026-10-11T09:45:00.000Z'),
        status: 'Flying',
        notes: 'TASK_1_6_TEST_BAD',
      })
      console.log('ERROR: invalid status was accepted')
    } catch (err) {
      console.log('Invalid status correctly rejected:', err.message)
    }

    process.exit(0)
  } catch (err) {
    console.error('Test failed:', err.message)
    process.exit(1)
  }
}

run()