require('dotenv').config()

const { hashPassword, verifyPassword } = require('../utils/password')

async function run() {
  try {
    const plain = 'MyTestPass123!'
    const hash = await hashPassword(plain)

    console.log('Hash created:', hash.slice(0, 20) + '...')
    console.log('Hash !== plaintext:', hash !== plain)

    const ok = await verifyPassword(plain, hash)
    const bad = await verifyPassword('WrongPassword', hash)

    console.log('Correct password verifies:', ok)
    console.log('Wrong password verifies:', bad)

    if (ok === true && bad === false && hash !== plain) {
      console.log('Task 2.1 PASSED')
      process.exit(0)
    }

    console.log('Task 2.1 FAILED')
    process.exit(1)
  } catch (err) {
    console.error('Test failed:', err.message)
    process.exit(1)
  }
}

run()