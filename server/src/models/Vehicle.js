const mongoose = require('mongoose')

const vehicleSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    make: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    plate: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    vin: {
      type: String,
      trim: true,
      uppercase: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Vehicle', vehicleSchema)