import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ProtectedButton } from "./ProtectedButton";
import { useState, useEffect } from "react";
import FringoLogo from "../media/fringo-logo-transparent.png";
import {
    Home,
    CalendarDays,
    Users,
    BarChart3,
    UserPlus,
    Settings,
    LogOut,
    Menu,
    X,
    Plus
} from 'lucide-react';

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

    const navStyle = (path) => `
        relative flex items-center gap-2
        px-3 py-2
        rounded-lg
        text-sm font-medium
        transition-all duration-200
        ${isActive(path)
            ? 'text-indigo-600 bg-indigo-50'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }
    `;

    useEffect(() => {
        setUserId(localStorage.getItem('token'));
        setUserName(localStorage.getItem('name') || 'User');
        setMobileOpen(false);
    }, [location]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 8);
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const renderMobileNav = () => (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
            <div className="
                flex items-center justify-around
                h-16 px-2
                bg-white
                border border-gray-200
                rounded-2xl
                shadow-[0_8px_30px_rgba(0,0,0,0.10)]
            ">
                <Link
                    to="/"
                    className={`
                        p-3 rounded-xl transition-all
                        ${isActive('/')
                            ? 'text-indigo-600 bg-indigo-50'
                            : 'text-gray-500 hover:text-gray-900'
                        }
                    `}
                >
                    <Home className="w-5 h-5" />
                </Link>

                {userId && (
                    <ProtectedButton roles={['barber', 'barber_admin']}>
                        <Link
                            to={`/${userId}/reservations`}
                            className={`
                                p-3 rounded-xl transition-all
                                ${isActive(`/${userId}/reservations`)
                                    ? 'text-indigo-600 bg-indigo-50'
                                    : 'text-gray-500 hover:text-gray-900'
                                }
                            `}
                        >
                            <CalendarDays className="w-5 h-5" />
                        </Link>
                    </ProtectedButton>
                )}

                {userId && (
                    <ProtectedButton roles={['barber_admin']}>
                        <Link
                            to="/staff/details"
                            className={`
                                p-3 rounded-xl transition-all
                                ${isActive('/staff/details')
                                    ? 'text-indigo-600 bg-indigo-50'
                                    : 'text-gray-500 hover:text-gray-900'
                                }
                            `}
                        >
                            <Users className="w-5 h-5" />
                        </Link>
                    </ProtectedButton>
                )}

                {userId && (
                    <ProtectedButton roles={['barber', 'barber_admin']}>
                        <Link
                            to="/shop/statistics"
                            className={`
                                p-3 rounded-xl transition-all
                                ${isActive('/shop/statistics')
                                    ? 'text-indigo-600 bg-indigo-50'
                                    : 'text-gray-500 hover:text-gray-900'
                                }
                            `}
                        >
                            <BarChart3 className="w-5 h-5" />
                        </Link>
                    </ProtectedButton>
                )}

                {!userId && (
                    <Link
                        to="/login/user"
                        className="p-3 rounded-xl text-gray-500 hover:text-gray-900"
                    >
                        <LogOut className="w-5 h-5 rotate-180" />
                    </Link>
                )}

                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="
                        p-3 rounded-xl
                        text-gray-500
                        hover:text-gray-900
                        hover:bg-gray-50
                        transition-all
                    "
                >
                    {mobileOpen
                        ? <X className="w-5 h-5" />
                        : <Menu className="w-5 h-5" />
                    }
                </button>
            </div>
        </div>
    );

    return (
        <>
            <nav
                className={`
                    sticky top-0 z-50
                    w-full
                    bg-white/95
                    backdrop-blur-md
                    border-b
                    transition-all duration-200
                    ${scrolled
                        ? 'border-gray-200 shadow-sm'
                        : 'border-gray-100'
                    }
                `}
            >
                <div className="
                    w-full
                    px-5 sm:px-8 lg:px-10
                    h-[68px]
                    flex items-center
                    justify-between
                ">

                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center shrink-0"
                    >
                        <img
                            src={FringoLogo}
                            alt="Fringo"
                            className="h-8 w-auto"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="
                        hidden md:flex
                        items-center
                        gap-1
                        ml-10
                        mr-auto
                    ">
                        <Link
                            to="/"
                            className={navStyle('/')}
                        >
                            <Home className="w-4 h-4" />
                            Home
                        </Link>

                        {userId && (
                            <>
                                <ProtectedButton roles={['barber', 'barber_admin']}>
                                    <Link
                                        to={`/${userId}/reservations`}
                                        className={navStyle(`/${userId}/reservations`)}
                                    >
                                        <CalendarDays className="w-4 h-4" />
                                        Reservations
                                    </Link>
                                </ProtectedButton>

                                <ProtectedButton roles={['barber_admin']}>
                                    <Link
                                        to="/staff/details"
                                        className={navStyle('/staff/details')}
                                    >
                                        <Users className="w-4 h-4" />
                                        Staff
                                    </Link>
                                </ProtectedButton>

                                <ProtectedButton roles={['barber', 'barber_admin']}>
                                    <Link
                                        to="/shop/statistics"
                                        className={navStyle('/shop/statistics')}
                                    >
                                        <BarChart3 className="w-4 h-4" />
                                        Statistics
                                    </Link>
                                </ProtectedButton>

                                <ProtectedButton roles={['barber_admin']}>
                                    <Link
                                        to="/add-barber"
                                        className={navStyle('/add-barber')}
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Add Barber
                                    </Link>
                                </ProtectedButton>

                                <ProtectedButton roles={['barber_admin']}>
                                    <Link
                                        to="/edit-shop"
                                        className={navStyle('/edit-shop')}
                                    >
                                        <Settings className="w-4 h-4" />
                                        Edit Shop
                                    </Link>
                                </ProtectedButton>
                            </>
                        )}
                    </div>

                    {/* Right Side */}
                    <div className="hidden md:flex items-center gap-4">

                        <ProtectedButton roles={['admin']}>
                            <Link
                                to="/admin/dashboard"
                                className="
                                    flex items-center gap-2
                                    px-4 py-2
                                    bg-indigo-600
                                    text-white
                                    text-sm font-semibold
                                    rounded-lg
                                    hover:bg-indigo-700
                                    transition-colors
                                "
                            >
                                <Plus className="w-4 h-4" />
                                Add Shop
                            </Link>
                        </ProtectedButton>

                        {!userId ? (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login/user"
                                    className="
                                        px-3 py-2
                                        text-sm font-medium
                                        text-gray-600
                                        hover:text-gray-900
                                        transition-colors
                                    "
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register/user"
                                    className="
                                        px-4 py-2
                                        bg-gray-900
                                        text-white
                                        text-sm font-semibold
                                        rounded-lg
                                        hover:bg-gray-800
                                        transition-colors
                                    "
                                >
                                    Join
                                </Link>
                            </div>
                        ) : (
                            <div className="
                                flex items-center
                                gap-3
                                pl-4
                                border-l border-gray-200
                            ">
                                <div className="
                                    w-9 h-9
                                    rounded-full
                                    bg-indigo-100
                                    text-indigo-700
                                    flex items-center justify-center
                                    text-sm font-semibold
                                ">
                                    {userName.charAt(0).toUpperCase()}
                                </div>

                                <div className="flex flex-col leading-tight">
                                    <span className="text-xs text-gray-400">
                                        Welcome back
                                    </span>
                                    <span className="text-sm font-semibold text-gray-800">
                                        {userName}
                                    </span>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="
                                        ml-2
                                        p-2
                                        rounded-lg
                                        text-gray-400
                                        hover:text-red-500
                                        hover:bg-red-50
                                        transition-all
                                    "
                                    title="Log out"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Header */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="
                            md:hidden
                            p-2
                            rounded-lg
                            text-gray-600
                            hover:bg-gray-100
                            transition-colors
                        "
                    >
                        {mobileOpen
                            ? <X className="w-5 h-5" />
                            : <Menu className="w-5 h-5" />
                        }
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="
                        md:hidden
                        border-t border-gray-100
                        bg-white
                        px-5 py-4
                        shadow-sm
                    ">
                        <div className="flex flex-col gap-1">

                            <Link
                                to="/"
                                className={navStyle('/')}
                            >
                                <Home className="w-4 h-4" />
                                Home
                            </Link>

                            {userId && (
                                <>
                                    <ProtectedButton roles={['barber', 'barber_admin']}>
                                        <Link
                                            to={`/${userId}/reservations`}
                                            className={navStyle(`/${userId}/reservations`)}
                                        >
                                            <CalendarDays className="w-4 h-4" />
                                            Reservations
                                        </Link>
                                    </ProtectedButton>

                                    <ProtectedButton roles={['barber_admin']}>
                                        <Link
                                            to="/staff/details"
                                            className={navStyle('/staff/details')}
                                        >
                                            <Users className="w-4 h-4" />
                                            Staff
                                        </Link>
                                    </ProtectedButton>

                                    <ProtectedButton roles={['barber', 'barber_admin']}>
                                        <Link
                                            to="/shop/statistics"
                                            className={navStyle('/shop/statistics')}
                                        >
                                            <BarChart3 className="w-4 h-4" />
                                            Statistics
                                        </Link>
                                    </ProtectedButton>

                                    <ProtectedButton roles={['barber_admin']}>
                                        <Link
                                            to="/add-barber"
                                            className={navStyle('/add-barber')}
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            Add Barber
                                        </Link>
                                    </ProtectedButton>

                                    <ProtectedButton roles={['barber_admin']}>
                                        <Link
                                            to="/edit-shop"
                                            className={navStyle('/edit-shop')}
                                        >
                                            <Settings className="w-4 h-4" />
                                            Edit Shop
                                        </Link>
                                    </ProtectedButton>

                                    <button
                                        onClick={handleLogout}
                                        className="
                                            mt-2
                                            w-full
                                            flex items-center gap-2
                                            px-3 py-2
                                            rounded-lg
                                            text-sm font-medium
                                            text-red-500
                                            hover:bg-red-50
                                            transition-colors
                                        "
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Log out
                                    </button>
                                </>
                            )}

                            {!userId && (
                                <div className="flex gap-2 pt-3">
                                    <Link
                                        to="/login/user"
                                        className="
                                            flex-1
                                            text-center
                                            px-4 py-2
                                            border border-gray-200
                                            rounded-lg
                                            text-sm font-medium
                                            text-gray-700
                                        "
                                    >
                                        Login
                                    </Link>

                                    <Link
                                        to="/register/user"
                                        className="
                                            flex-1
                                            text-center
                                            px-4 py-2
                                            bg-indigo-600
                                            rounded-lg
                                            text-sm font-semibold
                                            text-white
                                        "
                                    >
                                        Join
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {renderMobileNav()}
        </>
    );
}