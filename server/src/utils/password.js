const bcrypt = require('bcryptjs')

const SALT_ROUNDS = 10

async function hashPassword(plainPassword) {
    if(!plainPassword) {
        throw new Error('Password is required')
    }
    return bcrypt.hash(plainPassword, SALT_ROUNDS)
}

async function verifyPassword(plainPassword, passwordHash) {
    if(!plainPassword || !passwordHash) {
        return false
    }
    return bcrypt.compare(plainPassword, passwordHash)
}

module.exports = {
    hashPassword,
    verifyPassword,
}