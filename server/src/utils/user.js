function toPublicUser(user) {
    return {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        branch: user.branch || null,
        isActive: user.isActive,
        skills: user.skills || [],
    }
}

module.exports = { toPublicUser}