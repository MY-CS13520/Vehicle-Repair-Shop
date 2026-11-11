require('dotenv').config()
const connectDB = require('../config/db')
const User = require('../models/User')
const Attendance = require('../models/Attendance')

async function run() {
  await connectDB()
  const staff = await User.findOne({ email: 'staff@seed.local' })

  const day1 = new Date('2026-11-01T00:00:00.000Z')
  const day2 = new Date('2026-11-02T00:00:00.000Z')

  await Attendance.deleteMany({
    staff: staff._id,
    date: { $in: [day1, day2] },
  })

  await Attendance.create([
    {
      staff: staff._id,
      branch: staff.branch,
      date: day1,
      clockIn: new Date('2026-11-01T08:00:00.000Z'),
      clockOut: new Date('2026-11-01T17:00:00.000Z'),
    },
    {
      staff: staff._id,
      branch: staff.branch,
      date: day2,
      clockIn: new Date('2026-11-02T08:00:00.000Z'),
      clockOut: new Date('2026-11-02T16:30:00.000Z'),
    },
  ])

  console.log({ staffId: staff._id.toString(), days: ['2026-11-01', '2026-11-02'] })
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})