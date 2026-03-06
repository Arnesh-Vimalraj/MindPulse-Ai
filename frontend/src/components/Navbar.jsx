import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BrainCircuit, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    // Extract first 3 letters of name or email
    const getShortName = () => {
        if (!user) return '';
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        return name.split(' ')[0].slice(0, 3);
    };

    return (
        <nav className="fixed top-0 w-full z-50 glass-card">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo Section */}
                    <div className="flex items-center">
                        <NavLink to="/" className="flex items-center space-x-2">
                            <BrainCircuit className="h-8 w-8 text-blue-600" />
                            <span className="font-bold text-xl text-slate-900 tracking-tight">
                                MindPulse
                            </span>
                        </NavLink>
                    </div>

                    {/* Center Navigation Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                `text-sm font-medium transition-colors hover:text-blue-600 ${isActive ? 'text-blue-600' : 'text-slate-600'}`
                            }
                        >
                            Dashboard
                        </NavLink>
                        <NavLink
                            to="/chat"
                            className={({ isActive }) =>
                                `text-sm font-medium transition-colors hover:text-blue-600 ${isActive ? 'text-blue-600' : 'text-slate-600'}`
                            }
                        >
                            Chat
                        </NavLink>
                        <NavLink
                            to="/speak"
                            className={({ isActive }) =>
                                `text-sm font-medium transition-colors hover:text-blue-600 ${isActive ? 'text-blue-600' : 'text-slate-600'}`
                            }
                        >
                            Speak
                        </NavLink>
                        <NavLink
                            to="/api-keys"
                            className={({ isActive }) =>
                                `text-sm font-medium transition-colors hover:text-blue-600 ${isActive ? 'text-blue-600' : 'text-slate-600'}`
                            }
                        >
                            API Keys
                        </NavLink>
                        <NavLink
                            to="/counselling"
                            className={({ isActive }) =>
                                `text-sm font-medium transition-colors hover:text-blue-600 ${isActive ? 'text-blue-600' : 'text-slate-600'}`
                            }
                        >
                            Counselling Appointment
                        </NavLink>
                    </div>

                    {/* Right Section (Login/User) */}
                    <div className="flex items-center">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-lg text-xs uppercase tracking-wider">
                                    {getShortName()}
                                </span>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center space-x-1 text-slate-600 hover:text-red-600 text-sm font-medium transition-colors"
                                >
                                    <span>Sign Out</span>
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <NavLink
                                to="/login"
                                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg"
                            >
                                Login
                            </NavLink>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
