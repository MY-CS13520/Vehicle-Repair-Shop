const mongoose = require('mongoose')
const BOOKING_STATUS = [
    'Pending',
    'Confirmed',
    'In Progress',
    'Completed',
    'Cancelled',
]

const bookingSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        } ,
        vehicle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: true, 
        },
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Branch',
            required: true,
        },
        serviceTypes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'ServiceType',
                required: true,
            },
        ],
        scheduledStart: {
            type: Date,
            required: true,
        },
        scheduledEnd: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: BOOKING_STATUS,
            default: 'Pending',
        },
        assignedStaff: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    {timestamps: true}
)
module.exports = mongoose.model('Booking', bookingSchema)
module.exports.BOOKING_STATUS = BOOKING_STATUS