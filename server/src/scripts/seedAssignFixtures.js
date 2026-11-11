require('dotenv').config()
const connectDB = require('../config/db')
const User = require('../models/User')
const Branch = require('../models/Branch')
const ServiceType = require('../models/ServiceType')
const Vehicle = require('../models/Vehicle')
const Booking = require('../models/Booking')

async function run() {
  await connectDB()

  const customer = await User.findOne({ email: 'customer@seed.local' })
  const colombo = await Branch.findOne({ name: 'Seed Colombo Branch' })
  const kandy = await Branch.findOne({ name: 'Seed Kandy Branch' })
  const service = await ServiceType.findOne({ name: 'Seed Oil Change' })

  let vehicle = await Vehicle.findOne({ plate: 'SEED-001' })
  if (!vehicle) {
    vehicle = await Vehicle.create({
      customer: customer._id,
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      plate: 'SEED-001',
    })
  }

  await Booking.deleteMany({ notes: { $in: ['TASK_6_4_A', 'TASK_6_4_B'] } })

  const bookingA = await Booking.create({
    customer: customer._id,
    vehicle: vehicle._id,
    branch: colombo._id,
    serviceTypes: [service._id],
    scheduledStart: new Date('2026-11-20T09:00:00.000Z'),
    scheduledEnd: new Date('2026-11-20T10:00:00.000Z'),
    status: 'Confirmed',
    notes: 'TASK_6_4_A',
  })

  const bookingB = await Booking.create({
    customer: customer._id,
    vehicle: vehicle._id,
    branch: kandy._id,
    serviceTypes: [service._id],
    scheduledStart: new Date('2026-11-21T09:00:00.000Z'),
    scheduledEnd: new Date('2026-11-21T10:00:00.000Z'),
    status: 'Confirmed',
    notes: 'TASK_6_4_B',
  })

  console.log({
    bookingA: bookingA._id.toString(),
    bookingB: bookingB._id.toString(),
    colombo: colombo._id.toString(),
    kandy: kandy._id.toString(),
  })
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})