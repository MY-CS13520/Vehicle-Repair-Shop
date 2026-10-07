const mongoose = require('mongoose')
const PAYMENT_STATUS = ['Pending', 'Succeeded', 'Failed', 'Refunded']

const paymentSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
        },
        invoice: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Invoice',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        cuurency: {
            type: String,
            default: 'LKR',
            uppercase: true,
        },
        status: {
            type: String,
            enum: PAYMENT_STATUS,
            default: 'Pending',
        },
        stripePaymentIntentId: {
            type: String,
            default: null,
        },
        stripePaymentSessionId: {
            type: String,
            default: null,
        },
    },
    {timestamps: true}
)
module.exports = mongoose.model('Payment', paymentSchema)
module.exports.PAYMENT_STATUS = PAYMENT_STATUS