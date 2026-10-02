const mongoose = require('mongoose')
const WORK_ORDER_STATUS = [
    'Open',
    'InProgress',
    'WaitingParts',
    'Completed',
    'Cancelled',
]

const statusHistorySchema = new mongoose.Schema(
    {
       status: {
        type: String,
        enum: WORK_ORDER_STATUS,
        required: true,
       },
       note: {
        type: String,
        trim: true,
       },
       changedAt: {
        type: Date,
        default: Date.now,
       },
    },
    {_id: false}
)

const partsUsedSchema = new mongoose.Schema(
    {
        name: {
            type: String, trim: true,
        },
        sku: {type: String , trim: true},
        quantity: {type: Number, min: 1, default: 1},
        
        inventoryItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InventoryItem',
            default: null,
        },
    },
    {_id: false}
)

const workOrderSchema = new mongoose.Schema(
    {
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
            unique: true,
        },
        status: {
            type: String,
            enum: WORK_ORDER_STATUS,
            deault: 'Open',
        },
        statusHistory: {
            type: [statusHistorySchema],
            default: [],
        },
        partsUsed:{
            type: [partsUsedSchema],
            default: [],
        },
        labourNotes: {
            type: String,
            trim: true,
            default: '',
        },
        assignedStaff: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    {tomestamps: true}
)
module.exports = mongoose.model('Workorder' , workOrderSchema)
module.exports.WORK_ORDER_STATUS = WORK_ORDER_STATUS