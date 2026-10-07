require('dotenv').config()

const connectDB = require('../config/db')
const User = require('../models/User')
const Branch = require('../models/Branch')
const Booking = require('../models/Booking')
const InventoryItem = require('../models/InventoryItem')

async function run() {
  try {
    await connectDB()

    // Ensure indexes exist in MongoDB
    await User.syncIndexes()
    await Branch.syncIndexes()
    await Booking.syncIndexes()
    await InventoryItem.syncIndexes()

    console.log('User indexes:', Object.keys(await User.collection.indexes()).length >= 0 ? await User.collection.indexes() : [])
    console.log('Branch indexes:', await Branch.collection.indexes())
    console.log('Booking indexes:', await Booking.collection.indexes())
    console.log('Inventory indexes:', await InventoryItem.collection.indexes())

    // Unique email should reject duplicates
    await User.deleteMany({ email: 'duplicate.test@example.com' })

    await User.create({
      email: 'duplicate.test@example.com',
      passwordHash: 'hash1',
      name: 'Dup One',
      role: 'Customer',
    })

    try {
      await User.create({
        email: 'duplicate.test@example.com',
        passwordHash: 'hash2',
        name: 'Dup Two',
        role: 'Customer',
      })
      console.log('ERROR: duplicate email was accepted')
    } catch (err) {
      console.log('Duplicate email correctly rejected:', err.code || err.message)
    }

    process.exit(0)
  } catch (err) {
    console.error('Test failed:', err.message)
    process.exit(1)
  }
}

run()