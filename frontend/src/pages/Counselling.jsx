import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, ChevronRight, CheckCircle2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Counselling = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedCounsellor, setSelectedCounsellor] = useState('');

    const counsellors = [
        { id: '1', name: 'Dr. Sarah Jenkins', spec: 'Anxiety & Academic Stress', avail: 'Available Today' },
        { id: '2', name: 'Michael Chen', spec: 'Depression & Goal Setting', avail: 'Next avail: Tomorrow' },
        { id: '3', name: 'Dr. Emily Carter', spec: 'Relationship & Peer Issues', avail: 'Next avail: Wed' },
    ];

    const times = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '04:15 PM'];
    const dates = [24, 25, 26, 27, 28]; // Fake dates for Oct

    return (
        <div className="flex h-screen soft-gradient overflow-hidden">
            <Sidebar />
            <div className="flex-1 overflow-y-auto ml-64 p-4 sm:p-8">
                <div className="max-w-5xl mx-auto w-full">

                    <div className="mb-10 text-center sm:text-left">
                        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Book a Session</h1>
                        <p className="text-slate-500 font-medium">Schedule a 1-on-1 confidential appointment with our mental health professionals.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                        {/* Registration Form (Left) */}
                        <div className="lg:col-span-3 space-y-8">

                            {/* Step 1: Select Counsellor */}
                            <div className="glass-card rounded-[2.5rem] p-8 border border-white/60 shadow-xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
                                <h3 className="font-black text-slate-900 mb-6 flex items-center tracking-tight relative z-10">
                                    <span className="bg-blue-600 text-white w-7 h-7 rounded-2xl flex items-center justify-center text-[10px] font-black mr-3 shadow-lg shadow-blue-200">1</span>
                                    Choose Counsellor
                                </h3>

                                <div className="space-y-4 relative z-10">
                                    {counsellors.map(c => (
                                        <div
                                            key={c.id}
                                            onClick={() => setSelectedCounsellor(c.id)}
                                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${selectedCounsellor === c.id ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-100' : 'border-slate-50 hover:border-slate-200 bg-white shadow-sm'}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-5">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${selectedCounsellor === c.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                                                        <User className="h-7 w-7" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-lg tracking-tight">{c.name}</h4>
                                                        <p className="text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-tight">{c.spec}</p>
                                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">{c.avail}</span>
                                                    </div>
                                                </div>
                                                {selectedCounsellor === c.id && (
                                                    <div className="bg-blue-500 p-1.5 rounded-full shadow-lg">
                                                        <CheckCircle2 className="h-5 w-5 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Step 2: Date & Time */}
                            <div className="glass-card rounded-[2.5rem] p-8 border border-white/60 shadow-xl overflow-hidden relative">
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-16 -mb-16"></div>
                                <h3 className="font-black text-slate-900 mb-6 flex items-center tracking-tight relative z-10">
                                    <span className="bg-indigo-600 text-white w-7 h-7 rounded-2xl flex items-center justify-center text-[10px] font-black mr-3 shadow-lg shadow-indigo-200">2</span>
                                    Select Date & Time
                                </h3>

                                <div className="mb-8 relative z-10">
                                    <div className="flex items-center justify-between mb-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span>October 2026</span>
                                        <div className="flex space-x-3">
                                            <span className="cursor-pointer hover:text-slate-900 transition-colors">Prev</span>
                                            <span className="cursor-pointer hover:text-slate-900 transition-colors">Next</span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
                                        {dates.map((d, i) => (
                                            <button
                                                key={d}
                                                onClick={() => setSelectedDate(d)}
                                                className={`flex flex-col items-center justify-center min-w-[75px] h-[90px] rounded-[1.5rem] border-2 transition-all duration-300 ${selectedDate === d ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-105' : 'bg-white border-slate-50 text-slate-600 hover:border-slate-200 shadow-sm'}`}
                                            >
                                                <span className={`text-[10px] font-black uppercase tracking-tighter mb-1.5 ${selectedDate === d ? 'text-slate-400' : 'text-slate-400'}`}>
                                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i]}
                                                </span>
                                                <span className="text-2xl font-black tracking-tighter">{d}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Available Times</p>
                                    <div className="flex flex-wrap gap-3">
                                        {times.map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setSelectedTime(t)}
                                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all duration-300 ${selectedTime === t ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-50 text-slate-500 hover:border-slate-200 shadow-sm'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Summary Card (Right) */}
                        <div className="lg:col-span-2">
                            <div className="glass-card rounded-[2.5rem] p-8 border border-white/60 shadow-2xl sticky top-8 overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-40 -mr-12 -mt-12"></div>
                                <h3 className="font-black text-slate-900 text-xl tracking-tight mb-8 border-b border-slate-100 pb-5">Appointment Info</h3>

                                <div className="space-y-6 mb-10">
                                    <div className="flex items-start">
                                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm mr-4">
                                            <CalendarIcon className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Date</p>
                                            <p className="text-sm font-black text-slate-900 mt-0.5">
                                                {selectedDate ? `October ${selectedDate}, 2026` : 'Choose a date'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm mr-4">
                                            <Clock className="h-5 w-5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Time Slot</p>
                                            <p className="text-sm font-black text-slate-900 mt-0.5">
                                                {selectedTime || 'Select a time'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm mr-4">
                                            <User className="h-5 w-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Professional</p>
                                            <p className="text-sm font-black text-slate-900 mt-0.5">
                                                {selectedCounsellor ? counsellors.find(c => c.id === selectedCounsellor)?.name : 'Choose a counsellor'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    disabled={!selectedDate || !selectedTime || !selectedCounsellor}
                                    className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center transition-all duration-300 group active:scale-95 ${(!selectedDate || !selectedTime || !selectedCounsellor) ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-50 shadow-none' : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-2xl'}`}
                                >
                                    Confirm Session
                                    <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <p className="text-center text-[9px] text-slate-400 font-bold mt-4 uppercase tracking-tighter opacity-60">Confidential & SECURE • 50 Minute Session</p>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default Counselling;
