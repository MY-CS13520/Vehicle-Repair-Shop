const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema(
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
            unique: true,
        },
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Branch',
            required: true,
        },
        staff: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        score: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            trim: true,
            default: null,
        },
    },
    {timestamps: true}
)

module.exports = mongoose.model('Feedback', feedbackSchema)