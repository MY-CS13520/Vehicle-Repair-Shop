const mongoose = require('mongoose')
const PAYSLIP_STATUS = ['Draft', 'Approved', 'Rejected']

const payslipSchema = new mongoose.Schema(
    {
        staff: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        branch: {
            type: mongoose.Types.ObjectId,
            ref: 'Branch',
            required: true,
        },
        periodStart: {
            type: Date,
            required: true,
        },
        periodEnd: {
            type: Date,
            required: true,
        },
        hoursWorked: {
            type: Number,
            min: 0,
            default: 0,
        },
        commissionAmount: {
            type: Number,
            min: 0,
            default: 0,
        },
        calculatedAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: PAYSLIP_STATUS,
            DEFAULT: 'draft',
        },
    },
    {timestamps: true}
)

module.exports = mongoose.model('PaySlip', payslipSchema)
module.exports.PAYSLIP_STATUS = PAYSLIP_STATUS