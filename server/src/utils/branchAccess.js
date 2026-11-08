function canAccessBranch(user, branchId) {
    if(!user || !branchId) return false

    if (user.role === 'SuperAdmin') return true

    if (user.role === 'BranchManager' || user.role === 'Staff') {
        if (!user.branch) return false
        return String(user.branch) === String(branchId)
    }

    return false
}

module.exports = { canAccessBranch }