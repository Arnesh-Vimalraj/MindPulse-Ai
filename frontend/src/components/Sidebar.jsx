import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();

    // Get user metadata
    const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'John Doe';
    const initials = fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
        { icon: <MessageSquare size={20} />, label: 'Chat', path: '/chat' },
        { icon: <Mic2 size={20} />, label: 'Speak', path: '/speak' },
        { icon: <Key size={20} />, label: 'API Key', path: '/api-keys' },
        { icon: <CalendarDays size={20} />, label: 'Counselling Appointment', path: '/counselling' },
    ];

    return (
        <div className="w-64 bg-white/80 backdrop-blur-xl h-screen fixed left-0 top-0 text-slate-600 flex flex-col border-r border-slate-200/60 z-50 shadow-sm">
            <div className="p-6 flex items-center space-x-3 border-b border-slate-100 mb-4">
                <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                    <BrainCircuit className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-900 tracking-tight">MindPulse</span>
            </div>

            <nav className="flex-1 px-4 space-y-1 py-4">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                                ? 'bg-blue-50 text-blue-600 font-semibold'
                                : 'hover:bg-slate-50 hover:text-slate-900'
                            }`
                        }
                    >
                        <span className="transition-colors duration-300 group-hover:text-blue-500">
                            {item.icon}
                        </span>
                        <span className="text-sm tracking-tight">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50/50">
                <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">User Profile</p>
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                            <span className="text-white text-xs font-bold">{initials}</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{fullName}</p>
                            <p className="text-[10px] text-emerald-600 font-bold flex items-center mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                                ONLINE
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
