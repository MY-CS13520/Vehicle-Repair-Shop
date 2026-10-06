require('dotenv').config()

const connectDB = require('../config/db')
const User = require('../models/User')
const Branch = require('../models/Branch')
const Payslip = require('../models/Payslip')

async function run() {
  try {
    await connectDB()

    const staff = await User.findOne({ email: 'test.staff@example.com' })
    const branch = await Branch.findOne({ name: 'Colombo Test Branch' })

    if (!staff || !branch) {
      throw new Error('Missing staff or branch. Run testAttendance.js first.')
    }

    await Payslip.deleteMany({ staff: staff._id, status: 'Draft' })

    const payslip = await Payslip.create({
      staff: staff._id,
      branch: branch._id,
      periodStart: new Date('2026-10-01T00:00:00.000Z'),
      periodEnd: new Date('2026-10-31T23:59:59.999Z'),
      hoursWorked: 160,
      commissionAmount: 5000,
      calculatedAmount: 85000,
      status: 'Draft',
    })

    console.log('Draft payslip created:', {
      id: payslip._id.toString(),
      amount: payslip.calculatedAmount,
      status: payslip.status,
    })

    try {
      await Payslip.create({
        staff: staff._id,
        branch: branch._id,
        periodStart: new Date('2026-11-01T00:00:00.000Z'),
        periodEnd: new Date('2026-11-30T23:59:59.999Z'),
        calculatedAmount: 1000,
        status: 'Pending',
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