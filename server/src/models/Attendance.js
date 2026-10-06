const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema(
    {
        staff: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Branch',
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        clockIn: {
            type: Date,
            required: true,
        },
        clockOut: {
            type: Date,
            required: true
        },
    },
    {timestamps: true}

)

attendanceSchema.index({ staff:1 , date:1})
module.exports = mongoose.model('Attendance', attendanceSchema)