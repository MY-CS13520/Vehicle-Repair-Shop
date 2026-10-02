require('dotenv').config()

const connectDB = require('../config/db')
const User = require('../models/User')
const Vehicle = require('../models/Vehicle')

async function run() {
  try {
    await connectDB()

    let customer = await User.findOne({ email: 'test.customer@example.com' })
    if (!customer) {
      customer = await User.create({
        email: 'test.customer@example.com',
        passwordHash: 'temporary_hash_not_real_password',
        name: 'Test Customer',
        role: 'Customer',
      })
    }

    await Vehicle.deleteMany({ plate: 'TEST-1234' })

    const vehicle = await Vehicle.create({
      customer: customer._id,
      make: 'Toyota',
      model: 'Corolla',
      year: 2018,
      plate: 'TEST-1234',
      vin: 'JTDBR32E720000001',
    })

    console.log('Vehicle created:', {
      id: vehicle._id.toString(),
      plate: vehicle.plate,
      customer: vehicle.customer.toString(),
    })

    const byCustomer = await Vehicle.find({ customer: customer._id })
    console.log('Vehicles for customer:', byCustomer.length)

    process.exit(0)
  } catch (err) {
    console.error('Test failed:', err.message)
    process.exit(1)
  }
}

run()