require('dotenv').config()

const connectDB = require('../config/db')
const User = require('../models/User')
const Branch = require('../models/Branch')
const Attendance = require('../models/Attendance')

async function run() {
  try {
    await connectDB()

    let staff = await User.findOne({ email: 'test.staff@example.com' })
    if (!staff) {
      staff = await User.create({
        email: 'test.staff@example.com',
        passwordHash: 'temporary_hash_not_real_password',
        name: 'Test Staff',
        role: 'Staff',
      })
    }

    const branch = await Branch.findOne({ name: 'Colombo Test Branch' })
    if (!branch) {
      throw new Error('Colombo Test Branch missing. Run testBranch.js first.')
    }

    const day = new Date('2026-10-05T00:00:00.000Z')

    await Attendance.deleteMany({ staff: staff._id, date: day })

    const row = await Attendance.create({
      staff: staff._id,
      branch: branch._id,
      date: day,
      clockIn: new Date('2026-10-05T08:30:00.000Z'),
      clockOut: new Date('2026-10-05T17:00:00.000Z'),
    })

    console.log('Attendance created:', {
      id: row._id.toString(),
      staff: row.staff.toString(),
      date: row.date.toISOString(),
    })

    const found = await Attendance.find({ staff: staff._id, date: day })
    console.log('Query by staff and date count:', found.length)

    process.exit(0)
  } catch (err) {
    console.error('Test failed:', err.message)
    process.exit(1)
  }
}

run()