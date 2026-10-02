require('dotenv').config()

const connectDB = require('../config/db')
const Branch = require('../models/Branch') 

async function run() {
  try {
    await connectDB()

    await Branch.deleteMany({ name: 'Colombo Test Branch' })

    const branch = await Branch.create({
      name: 'Colombo Test Branch',
      region: 'Western',
      address: {
        street: '123 Galle Road',
        city: 'Colombo',
        state: 'Western',
        postalCode: '00300',
      },
      contact: {
        phone: '0112345678',
        email: 'colombo@example.com',
      },
      isActive: true,
    })

    console.log('Branch created:', {
      id: branch._id.toString(),
      name: branch.name,
      region: branch.region,
      isActive: branch.isActive,
    })

    const western = await Branch.find({ region: 'Western' })
    console.log('Query by region Western count:', western.length)

    branch.isActive = false
    await branch.save()
    const updated = await Branch.findById(branch._id)
    console.log('After deactivate isActive:', updated.isActive)

    process.exit(0)
  } catch (err) {
    console.error('Test failed:', err.message)
    process.exit(1)
  }
}

run()