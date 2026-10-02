require('dotenv').config()

const connectDB = require('../config/db')
const User = require('../models/User')

async function run() {
  try {
    await connectDB()

    // Clean any old test user
    await User.deleteMany({ email: 'test.customer@example.com' })

    // 1) Valid user should succeed
    const user = await User.create({
      email: 'test.customer@example.com',
      passwordHash: 'temporary_hash_not_real_password',
      name: 'Test Customer',
      phone: '0712345678',
      role: 'Customer',
    })
    console.log('Valid user created:', {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    // 2) Invalid role should fail
    try {
      await User.create({
        email: 'bad.role@example.com',
        passwordHash: 'temporary_hash_not_real_password',
        name: 'Bad Role User',
        role: 'Owner', // not allowed
      })
      console.log('ERROR: invalid role was accepted (should not happen)')
    } catch (err) {
      console.log('Invalid role correctly rejected:', err.message)
    }

    process.exit(0)
  } catch (err) {
    console.error('Test failed:', err.message)
    process.exit(1)
  }
}

run()