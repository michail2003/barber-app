import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ProtectedButton } from "./ProtectedButton";
import { useState, useEffect } from "react";
import FringoLogo from "../media/fringo-logo-transparent.png"; // Adjust the path as necessary
export function UserNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // State to handle local storage data
  const [userId, setUserId] = useState(localStorage.getItem('token'));
  const [userName, setUserName] = useState(localStorage.getItem('name') || 'User');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    setUserId(null); // Clear state immediately
    setMobileOpen(false);
    navigate('/login/user');
  };

  const navItemStyles = (path) => `
    text-[11px] font-black uppercase tracking-widest transition-all duration-200
    ${location.pathname === path ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}
  `;

  const mobileNavItemStyles = (path) => `
    block w-full text-[11px] font-black uppercase tracking-widest transition-all duration-200 py-3 px-4 rounded-lg
    ${location.pathname === path ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
  `;

  const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );

  const MenuIcon = ({ open }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedName = localStorage.getItem('name');
    setUserId(storedToken);
    setUserName(storedName || 'User');
  }, [location]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Subtle shadow/border once the page is scrolled — reads more like a real product nav
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = userId && (
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

      <ProtectedButton roles={['barber', 'barber_admin']}>
        <Link to={`/shop/statistics`} className={navItemStyles(`/shop/statistics`)}>
          Statistics
        </Link>
      </ProtectedButton>

      <ProtectedButton roles={['barber_admin']}>
        <Link to={`/add-barber`} className={navItemStyles(`/add-barber`)}>
          Add Barber
        </Link>
      </ProtectedButton>

      <ProtectedButton roles={['barber_admin']}>
        <Link to={`/edit-shop`} className={navItemStyles(`/edit-shop`)}>
          Edit BarberShop
        </Link>
      </ProtectedButton>
    </>
  );

  const mobileNavLinks = userId && (
    <>
      <ProtectedButton roles={['barber', 'barber_admin']}>
        <Link to={`/${userId}/reservations`} className={mobileNavItemStyles(`/${userId}/reservations`)}>
          Reservations
        </Link>
      </ProtectedButton>

      <ProtectedButton roles={['barber_admin']}>
        <Link to="/staff/details" className={mobileNavItemStyles('/staff/details')}>
          Staff
        </Link>
      </ProtectedButton>

      <ProtectedButton roles={['barber', 'barber_admin']}>
        <Link to={`/shop/statistics`} className={mobileNavItemStyles(`/shop/statistics`)}>
          Statistics
        </Link>
      </ProtectedButton>

      <ProtectedButton roles={['barber_admin']}>
        <Link to={`/add-barber`} className={mobileNavItemStyles(`/add-barber`)}>
          Add Barber
        </Link>
      </ProtectedButton>

      <ProtectedButton roles={['admin']}>
        <Link to="/admin/dashboard" className={mobileNavItemStyles('/admin/dashboard')}>
          Add Shop
        </Link>
      </ProtectedButton>

      <ProtectedButton roles={['barber_admin']}>
        <Link to={`/edit-shop`} className={navItemStyles(`/edit-shop`)}>
          Edit BarberShop
        </Link>
      </ProtectedButton>
    </>
  );

  return (
    <nav
      className={`sticky top-0 w-full z-[100] transition-all duration-300 border-b-2 py-2 border-indigo-600 bg-white/90 backdrop-blur-md
        ${scrolled ? 'shadow-lg shadow-gray-200/50 border-b border-gray-100' : ''}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Brand */}
        <img src={FringoLogo} alt="Fringo" className=" h-15
                w-auto
                max-w-[170px]
                object-contain
                transition-transform duration-200
                hover:scale-[1.05]
                cursor-pointer"
          onClick={() => navigate('/')} />

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={navItemStyles('/')}>Home</Link>
          {navLinks}
        </div>

        {/* Right Side Logic */}
        <div className="flex items-center gap-3 sm:gap-4">

          {/* Admin "Add Shop" Action - desktop only */}
          <ProtectedButton roles={['admin']}>
            <Link
              to="/admin/dashboard"
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              Add Shop
            </Link>
          </ProtectedButton>

          {!userId ? (
            <div className="flex items-center gap-2">
              <Link to="/login/user" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 px-2 sm:px-3">
                Login
              </Link>
              <Link to="/register/user" className="bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-4 sm:px-5 py-2.5 rounded-xl hover:bg-indigo-600 transition-all">
                Join
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Profile Greeting (SaaS Style) */}
              <div className="hidden sm:flex items-center gap-2 border-l border-gray-200 pl-6">
                <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                  {userName.charAt(0)}
                </div>
                <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">
                  Hi, {userName}
                </span>
              </div>
              <ProtectedButton roles={['barber_admin', 'user', 'barber', 'admin']}>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 hover:text-red-700 transition-all active:scale-95"
                >
                  <LogoutIcon />
                  Log out
                </button>
              </ProtectedButton>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-gray-700 hover:bg-gray-100 active:scale-95 transition-all"
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${mobileOpen ? 'max-h-[32rem] opacity-100 mt-4 mb-10' : 'max-h-0 opacity-0'}`}
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-1 pb-2 pt-2 border-t border-gray-100">
          <Link to="/" className={mobileNavItemStyles('/')}>Home</Link>
          {mobileNavLinks}

          {userId && (
            <div className="mt-2 pt-3 border-t border-gray-100 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                  {userName.charAt(0)}
                </div>
                <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">
                  Hi, {userName}
                </span>
              </div>
              <ProtectedButton roles={['barber_admin', 'user', 'barber', 'admin']}>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 hover:text-red-700 transition-all active:scale-95"
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