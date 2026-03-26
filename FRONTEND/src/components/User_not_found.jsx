import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

const User_not_found = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isGuestMode, setIsGuestMode] = useState(false);
    const [phoneValue, setPhoneValue] = useState();
    const location = useLocation();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
    }, [location]);

    // Condition to show the gate
    const showGate = !token && location.pathname !== '/login/user' && location.pathname !== '/register/user';
    if (!showGate) return null;

    return (
        <div className="fixed inset-0 z-[200] flex flex-col justify-center items-center px-6 bg-white/80 backdrop-blur-md dark:bg-slate-900/90 transition-all duration-500">

            <div className="w-full max-w-sm bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in duration-300">

                {!isGuestMode ? (
                    /* STAGE 1: Selection */
                    <div>

                        {/* Minimalist Icon or Logo could go here */}
                        <div className="mb-8 space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Welcome Back
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xs">
                                Log in to sync your progress or explore the app as a guest.
                            </p>
                        </div>

                        <div className="flex flex-col w-full max-w-sm gap-4">
                            {/* Primary Action */}
                            <Link to={'/login/user'} className="w-full">
                                <button className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl 
                           transition-all duration-200 shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95">
                                    Log In to Account
                                </button>
                            </Link>

                            {/* Secondary Action */}
                            <button className="w-full py-3.5 px-6 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold 
                         rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 
                         transition-all duration-200 active:scale-95"
                                onClick={() => setIsGuestMode(true)}>
                                Continue as Guest
                            </button>
                        </div>

                        {/* Small Footer Hint */}
                        <p className="mt-8 text-sm text-slate-400 w-full text-center">
                            New here? <Link to="/register/user" className="text-indigo-600 font-medium hover:underline">Create an account</Link>
                        </p>
                    </div>
                ) : (
                    /* STAGE 2: Phone Input */
                    <div className="flex flex-col animate-in slide-in-from-right-4 duration-300">
                        <button
                            onClick={() => setIsGuestMode(false)}
                            className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 text-sm mb-4 transition-colors">
                            ← Back
                        </button>

                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">One last step</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">A phone number is required to continue as guest.</p>

                        <div className="phone-input-container">
                            <PhoneInput
                                className="flex gap-3 p-3 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-indigo-500 transition-all text-white"
                                defaultCountry="AL"
                                international
                                countryCallingCodeEditable={false}
                                placeholder="Enter phone number"
                                value={phoneValue}
                                onChange={setPhoneValue}
                                limitMaxLength={true}
                            />
                        </div>

                        <button
                            disabled={!phoneValue}
                            className="w-full mt-6 py-3.5 bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-xl transition-all active:scale-95">
                            Confirm & Enter
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default User_not_found;