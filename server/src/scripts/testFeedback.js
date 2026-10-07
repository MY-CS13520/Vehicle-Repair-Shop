require('dotenv').config()

const connectDB = require('../config/db')
const User = require('../models/User')
const Booking = require('../models/Booking')
const Branch = require('../models/Branch')
const Feedback = require('../models/Feedback')
async function run() {
    try{
        await connectDB()

        const customer = await User.findOne({ email: 'test.customer@example.com' })
        const staff = await User.findOne({ email: 'test.staff@example.com' })
        const booking = await Booking.findOne({ notes: 'TASK_1_6_TEST' })
        const branch = await Branch.findOne({ name: 'Colombo Test Branch' })

        if(!customer || !staff || !booking || !branch) {
            throw new Error('Missing customer/booking/branch. Run earlier test scripts first.')
        }

        await Feedback.deleteMany({ booking: booking._id})

        const feedback = await Feedback.create({
            customer: customer._id,
            booking: booking._id,
            branch: branch._id,
            staff: staff ? staff._id : null,
            score: 5,
            comment: 'Great service — TASK_1_12_TEST',
        })
        console.log('Feedback created:',{
            id: feedback._id.toString(),
            score: feedback.score,
            branch: feedback.branch.toString(),
        })

        const byBranch = await Feedback.find({ branch: branch._id})
        console.log('Feedback by branch count:', byBranch.length)
        process.exit(0)
    }catch (err){
        console.error('TEST FAILED', err.message)
        process.exit(1)
    }
}
run()