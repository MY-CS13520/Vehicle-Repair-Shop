import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { homePathForRole } from '../auth/homePath'


function RoleRoute({ roles, children }) {
    const { user } = useAuth()

    if (!roles.includes(user.role)) {
        return <Navigate to={homePathForRole(user.role)} replace />
    }

    return children
}

export default RoleRoute