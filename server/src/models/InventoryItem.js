const mongoose = require('mongoose')
const InventoryitemSchema = new mongoose.Schema(
    {
        sku: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        reorderThreshold: {
            type: Number,
            required: true,
            min: 0,
            default: 5,
        },
        unitCost: {
            type: Number,
            required: true,
            min: 0,
        },
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Branch',
            required: true,
        },
    },
    {timestamps: true}
)
InventoryitemSchema.index({sku: 1, branch: 1}, {unique: true})

module.exports = mongoose.model('Inventoryitem', InventoryitemSchema)