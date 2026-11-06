export function homePathForRole(role) {
    switch (role) {
        case 'Customer':
            return '/customer'
        case 'Staff':
            return '/staff'
        case 'BranchManager':
            return '/manager'
        case 'SuperAdmin':
            return '/admin'
        default:
            return '/login'
    }
}