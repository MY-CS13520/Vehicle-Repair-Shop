require('dotenv').config()

const connectDB = require('../config/db')
const User = require('../models/User')
const Booking = require('../models/Booking')
const Branch = require('../models/Branch')
const Invoice = require('../models/Invoice')
const Payment = require('../models/Payment'	)

async function run() {
    try{
    await connectDB()

    const customer = await User.findOne({ email: 'test.customer@example.com' })
    const booking = await Booking.findOne({ notes: 'TASK_1_6_TEST' })
    const branch = await Branch.findOne({ name: 'Colombo Test Branch' })

    if(!customer || !booking || !branch) {
        throw new Error('Missing customer/booking/branch. Run earlier test scripts first.')
    }

    await Payment.deleteMany({ booking: booking._id})
    await Invoice.deleteMany({ booking: booking._id})

    const invoice = await Invoice.create({
        customer: customer._id,
        booking: booking._id,
        branch: branch._id,
        lineItems: [
            {
                description: 'Oil Change Test',
                quantity: 1,
                unitPrice: 5000,
                total: 5000,
            },
        ],
        subtotal: 5000,
        tax: 0,
        total: 5000,
        status: 'Unpaid',
    })

    const payment = await Payment.create({
        customer: customer._id,
        booking : booking._id,
        invoice : invoice._id,
        amount: 5000,
        currency: 'LKR',
        status: 'Pending',
        stripePaymentIntentId: 'pi_test_placeholder',
    })

    console.log('Invoice Created:', {
        id: invoice._id.toString(),
        total: invoice.total,
        status: invoice.status,
    })

    console.log('Payment Created:', {
        id: payment._id.toString(),
        amount: payment.amount,
        status: payment.status,
    })

    const invoiceByBooking = await Invoice.find({ booking: booking._id})
    const findPaymentByBooking = await Payment.find({ booking: booking._id})

    console.log('Invoice by Booking:', invoiceByBooking.length)
    console.log('Payment by Booking:', findPaymentByBooking.length)

    process.exit(0)
    }catch(err){
        console.error('Test failed:', err.message)
        process.exit(1)
    }
}
run()