const mongoose = require('mongoose')
const ROLES = ['Customer', 'Staff', 'BranchManager', 'SuperAdmin']
const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        passwordHash:{
            type: String,
            required: true,

        },

        name:{
            type:String,
            required: true,
            trim: true,
        },
        phone:{
            type:String,
            trim:true,
        },
        role:{
            type:String,
            enum:ROLES,
            rquired: true,
            default: 'Customer',
        },
        branch:{
            type:mongoose.Schema.Types.ObjectId,
            ref: 'Branch',
            default : null,
        },
        isActive:{
            type: Boolean,
            default: true,
        },
    },
    {timestamps: true}
)

module.exports = mongoose.model('User', userSchema)
module.exports.ROLES = ROLES