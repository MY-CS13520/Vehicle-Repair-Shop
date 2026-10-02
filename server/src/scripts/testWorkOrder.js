require('dotenv').config()

const connectDB = require('../config/db')
const Booking = require('../models/Booking')
const WorkOrder = require('../models/WorkOrder')

async function run() {
    try {
    await connectDB()
    const booking = await Booking.findOne({notes: 'TASK_1_6_TEST'})
    if(!booking){
        throw new Error('No test booking found. Run testBooking.js first.')
    }
    await WorkOrder.deleteMany({booking: booking._id})

    const workOrder = await WorkOrder.create({
        booking: booking._id,
      status: 'Open',
      statusHistory: [
        {
          status: 'Open',
          note: 'Work order opened from booking',
        },
      ],
      partsUsed: [],
      laborNotes: 'Inspection started',
    })

    console.log('Work order created:', {
        id: workOrder._id.toString(),
        booking: workOrder.booking.toString(),
        status: workOrder.status,
        historyCount: workOrder.statusHistory.length,
      })
      workOrder.status = 'InProgress'
      workOrder.statusHistory.push({
        status: 'InProgress',
        note: 'Mechanic started work',
      })
      await workOrder.save()
      const updated = await WorkOrder.findById(workOrder._id)
      console.log('After status update:', {
        status: updated.status,
        historyCount: updated.statusHistory.length,
      })
      process.exit(0)

    } catch (err){
        console.error('Test failed:', err.message)
        process.exit(1)
    }
}

run()