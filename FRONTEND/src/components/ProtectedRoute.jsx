import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        // Decode the token to get the role we packed in the backend
        const decoded = jwtDecode(token);
        const userRole = decoded.role;

        // Check if the user's role is allowed to see this page
        if (!allowedRoles.includes(userRole)) {
            return <Navigate to="/login/user" replace />;
        }

        return children;
    } catch (error) {
        // If token is corrupted or malformed, send to login
        localStorage.removeItem('token');
        return <Navigate to="/login/user" replace />;
    }
};

export default ProtectedRoute;