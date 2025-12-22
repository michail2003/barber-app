import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ProtectedButton } from "./ProtectedButton";
import { useState, useEffect } from "react";

export function UserNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // State to handle local storage data
  const [userId, setUserId] = useState(localStorage.getItem('token'));
  const [userName, setUserName] = useState(localStorage.getItem('name') || 'User');
  const [isScrolled, setIsScrolled] = useState(false);

  // Sync state with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setUserId(localStorage.getItem('id'));
      setUserName(localStorage.getItem('userName') || 'User');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUserId(null); // Clear state immediately
    navigate('/login/user');
  };

  const navItemStyles = (path) => `
    text-[11px] font-black uppercase tracking-widest transition-all duration-200
    ${location.pathname === path ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}
  `;
  const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 px-6 py-4 
      ${isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>

      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Brand */}
        <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer group">
          <div className="h-10 w-10 bg-gray-900 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-all shadow-lg shadow-gray-200">
            <span className="text-white font-black text-xl italic">B</span>
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tighter uppercase hidden lg:block">
            Barber<span className="text-indigo-600">Pro</span>
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={navItemStyles('/')}>Home</Link>

          {userId && (
            <>
              <ProtectedButton roles={['barber', 'barber_admin']}>
                <Link to={`/${userId}/reservations`} className={navItemStyles(`/${userId}/reservations`)}>
                  Reservations
                </Link>
              </ProtectedButton>

              <ProtectedButton roles={['barber_admin']}>
                <Link to="/staff/details" className={navItemStyles('/staff/details')}>
                  Staff
                </Link>
              </ProtectedButton>
            </>
            
          )}
        </div>

        {/* Right Side Logic */}
        <div className="flex items-center gap-4">

          {/* Admin "Add Shop" Action */}
          <ProtectedButton roles={['admin']}>
            <Link
              to="/admin/dashboard"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              Add Shop
            </Link>
          </ProtectedButton>

          {!userId ? (
            <div className="flex items-center gap-2">
              <Link to="/login/user" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 px-3">
                Login
              </Link>
              <Link to="/register/user" className="bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-indigo-600 transition-all">
                Join
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              {/* Profile Greeting (SaaS Style) */}
              <div className="hidden sm:flex items-center gap-2 border-l border-gray-200 pl-6">
                <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                  {userName.charAt(0)}
                </div>
                <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">
                  Hi, {userName}
                </span>
              </div>
              <ProtectedButton roles={['barber_admin','user','barber','admin']}>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 hover:text-red-700 transition-all active:scale-95"
                >
                  <LogoutIcon />
                  Log out
                </button>
              </ProtectedButton>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}