const mongoose = require('mongoose')
const INVOICE_STATUS = ['Draft', 'Unpaid', 'Paid', 'Cancelled']

const lineItemSchema = new mongoose.Schema(
    {
        description: {type: String, required: true, trim: true,},
        quantity: {type: Number, required: true, min: 1, default: 1},
        unitPrice: {type: Number, required: true, min: 0},
    },
    {_id : false}
)

const invoiceSchema = new mongoose.Schema(
    {
        customer: {
            type:mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
        },
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Branch',
            required: true,
        },
        lineItemSchema: {
            type: [lineItemSchema],
            default: [],
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        tax: {
            type: Number,
            min: 0,
            default: 0,
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: INVOICE_STATUS,
            default: 'Unpaid',
        },
        pdfUrl: {
            type: String,
            default: null,
        },
    },
    {timestamps: true}
)

module.exports = mongoose.model('Invoice' , invoiceSchema)
module.exports.INVOICE_STATUS = INVOICE_STATUS