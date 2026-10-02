const mongoose = require('mongoose')
const branchSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
            trim: true,
        },
        region: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            street: {type: String,trim: true},
            city: {type: String,trim: true},
            state: {type: String,trim: true},
            postalCode: {type: String,trim: true},
            country: {type: String,trim: true, default: 'Sri Lanka'},
        },
        contact: {
            phone: {type: String, trim: true},
            email: {type: String, trim: true, lowercase: true},
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {timestamps: true}
)
module.exports = mongoose.model('Branch', branchSchema)