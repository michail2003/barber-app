import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ProtectedButton } from "./ProtectedButton";
import { useState, useEffect } from "react";
import FringoLogo from "../media/fringo-logo-transparent.png";
import { Home, CalendarDays, Users, BarChart3, UserPlus, Settings, LogOut, Menu, X, Plus, Sparkles, Command } from 'lucide-react';

export function UserNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState(localStorage.getItem('token'));
  const [userName, setUserName] = useState(localStorage.getItem('name') || 'User');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    setUserId(null);
    setMobileOpen(false);
    navigate('/login/user');
  };

  const isActive = (path) => location.pathname === path;
  const navStyle = (path) => `relative text-xs font-medium tracking-wide transition-all duration-300 ${isActive(path) ? 'text-indigo-400 font-semibold drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]' : 'text-zinc-400 hover:text-zinc-100'}`;

  useEffect(() => {
    setUserId(localStorage.getItem('token'));
    setUserName(localStorage.getItem('name') || 'User');
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderMobileNav = () => (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="relative rounded-2xl bg-zinc-950/80 backdrop-blur-2xl border border-white/10 p-2 flex items-center justify-around shadow-[0_8px_32px_rgba(0,0,0,0.5)] shadow-indigo-500/10">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />
        
        <Link to="/" className={`relative p-3 rounded-xl transition-all duration-300 ${isActive('/') ? 'bg-white/10 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'text-zinc-400 hover:text-white'}`}>
          <Home className="w-5 h-5" />
        </Link>

        {userId && (
          <ProtectedButton roles={['barber', 'barber_admin']}>
            <Link to={`/${userId}/reservations`} className={`relative p-3 rounded-xl transition-all duration-300 ${isActive(`/${userId}/reservations`) ? 'bg-white/10 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'text-zinc-400 hover:text-white'}`}>
              <CalendarDays className="w-5 h-5" />
            </Link>
          </ProtectedButton>
        )}

        <button onClick={() => navigate('/')} className="relative group p-3 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] active:scale-95 transition-all">
          <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Command className="w-5 h-5 animate-pulse" />
        </button>

        {userId && (
          <>
            <ProtectedButton roles={['barber_admin']}>
              <Link to="/staff/details" className={`relative p-3 rounded-xl transition-all duration-300 ${isActive('/staff/details') ? 'bg-white/10 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'text-zinc-400 hover:text-white'}`}>
                <Users className="w-5 h-5" />
              </Link>
            </ProtectedButton>

            <ProtectedButton roles={['barber', 'barber_admin']}>
              <Link to="/shop/statistics" className={`relative p-3 rounded-xl transition-all duration-300 ${isActive('/shop/statistics') ? 'bg-white/10 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'text-zinc-400 hover:text-white'}`}>
                <BarChart3 className="w-5 h-5" />
              </Link>
            </ProtectedButton>
          </>
        )}

        {!userId && (
          <Link to="/login/user" className="relative p-3 rounded-xl text-zinc-400 hover:text-white transition-all">
            <LogOut className="w-5 h-5 rotate-180" />
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      <nav className={`sticky top-0 w-full z-50 transition-all duration-500 bg-zinc-950/70 backdrop-blur-xl border-b ${scrolled ? 'border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <img src={FringoLogo} alt="Fringo" className="h-7 w-auto filter invert brightness-200" />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 bg-white/[0.03] border border-white/10 px-6 py-2 rounded-2xl backdrop-blur-md shadow-inner">
            <Link to="/" className={navStyle('/')}>Home</Link>
            {userId && (
              <>
                <ProtectedButton roles={['barber', 'barber_admin']}>
                  <Link to={`/${userId}/reservations`} className={navStyle(`/${userId}/reservations`)}>Reservations</Link>
                </ProtectedButton>
                <ProtectedButton roles={['barber_admin']}>
                  <Link to="/staff/details" className={navStyle('/staff/details')}>Staff</Link>
                </ProtectedButton>
                <ProtectedButton roles={['barber', 'barber_admin']}>
                  <Link to="/shop/statistics" className={navStyle('/shop/statistics')}>Statistics</Link>
                </ProtectedButton>
                <ProtectedButton roles={['barber_admin']}>
                  <Link to="/add-barber" className={navStyle('/add-barber')}>Add Barber</Link>
                </ProtectedButton>
                <ProtectedButton roles={['barber_admin']}>
                  <Link to="/edit-shop" className={navStyle('/edit-shop')}>Edit Shop</Link>
                </ProtectedButton>
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ProtectedButton roles={['admin']}>
              <Link to="/admin/dashboard" className="relative group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.7)] transition-all">
                <Plus className="w-3.5 h-3.5" /> Add Shop
              </Link>
            </ProtectedButton>

            {!userId ? (
              <div className="flex items-center gap-2">
                <Link to="/login/user" className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors">Login</Link>
                <Link to="/register/user" className="px-4 py-2 bg-white text-zinc-950 text-xs font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-lg">Join</Link>
              </div>
            ) : (
              <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-xs shadow-[0_0_12px_rgba(99,102,241,0.5)]">
                    {userName.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-zinc-200">Hi, {userName}</span>
                </div>
                <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all" title="Log out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-zinc-950/95 backdrop-blur-2xl border-b border-white/10 p-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-2">
              <ProtectedButton roles={['barber_admin']}>
                <Link to="/add-barber" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white">
                  <UserPlus className="w-4 h-4 text-indigo-400" /> Add Barber
                </Link>
              </ProtectedButton>
              <ProtectedButton roles={['barber_admin']}>
                <Link to="/edit-shop" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white">
                  <Settings className="w-4 h-4 text-indigo-400" /> Edit Shop
                </Link>
              </ProtectedButton>
              {userId && (
                <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-400 hover:bg-red-500/20">
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {renderMobileNav()}
    </>
  );
}