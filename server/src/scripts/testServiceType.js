require('dotenv').config()

const connectDB = require('../config/db')
const ServiceType = require('../models/ServiceType')

async function run() {
  try {
    await connectDB()

    await ServiceType.deleteMany({
      name: { $in: ['Oil Change Test', 'Brake Inspection Test'] },
    })

    const oil = await ServiceType.create({
      name: 'Oil Change Test',
      description: 'Standard oil and filter change',
      basePrice: 5000,
      estimatedDurationMinutes: 45,
      isActive: true,
    })

    const brakes = await ServiceType.create({
      name: 'Brake Inspection Test',
      description: 'Full brake system check',
      basePrice: 3500,
      estimatedDurationMinutes: 30,
      isActive: false,
    })

    console.log('Created services:', oil.name, 'and', brakes.name)

    const all = await ServiceType.find({
      name: { $in: ['Oil Change Test', 'Brake Inspection Test'] },
    })
    console.log('All matching services:', all.length)

    const activeOnly = await ServiceType.find({
      name: { $in: ['Oil Change Test', 'Brake Inspection Test'] },
      isActive: true,
    })
    console.log('Active only:', activeOnly.length, activeOnly.map((s) => s.name))

    process.exit(0)
  } catch (err) {
    console.error('Test failed:', err.message)
    process.exit(1)
  }
}

run()