// Create this once in a file like 'HasAccess.jsx'
import { jwtDecode } from 'jwt-decode';

export const ProtectedButton = ({ roles, children }) => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const { role } = jwtDecode(token);
        // Only render the children (the button/link) if the role matches
        if (roles.includes(role)) {
            return <>{children}</>;
        }
    } catch (e) {
        return null;
    }

    return null;
};