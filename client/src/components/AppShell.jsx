import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const NAV_BY_ROLE = {
    Customer: [
        { to: '/customer', label: 'Home' },
        { to: '/customer', label: 'My Bookings' },
    ],
    Staff: [
        { to: '/staff', label: 'Home' },
        { to: '/staff', label: 'My Jobs' },
    ],
    BranchManager: [
        { to: '/manager', label: 'Home' },
        { to: '/manager/branch', label: 'My Branch' },
        { to: '/manager', label: 'Inventory' },
        { to: '/manager/staff', label: 'Branch Staff' },
        { to: '/manager/jobs', label: 'Jobs' },
        { to: '/manager/attendance', label: 'Attendance' },
    ],
    SuperAdmin: [
        { to: '/admin', label: 'Home' },
        { to: '/admin', label: 'Regions' },
        { to: '/admin', label: 'Payroll' },
        { to: '/admin/branches', label: 'Branches' },
        { to: '/admin/staff', label: 'Staff' },
        { to: '/admin/attendance', label: 'Attendance' },
    ],
}

function AppShell({ children }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const links = NAV_BY_ROLE[user.role] || []

    function handleLogout() {
        logout()
        navigate('/login', { replace: true })
    }

    return (
        <div>
            <header>
                <p>{user.name} - {user.role}</p>
                <nav>
                    {links.map((link) => (
                        <Link key={link.label} to={link.to} style={{ marginRight: '1rem' }} >
                        {link.label}
                        </Link>
                    ))}
                    <button type="button" onClick={handleLogout}>
                        Logout
                    </button>
                </nav>
            </header>
            {children}
        </div>
    )
}

export default AppShell