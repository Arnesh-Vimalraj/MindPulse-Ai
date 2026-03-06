import React, { useState } from 'react';
import { KeyRound, Save, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const ApiKeys = () => {
    const [showKeys, setShowKeys] = useState({
        openai: false,
        gemini: false,
        elevenlabs: false,
    });

    const toggleShow = (key) => {
        setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="flex h-screen soft-gradient overflow-hidden">
            <Sidebar />
            <div className="flex-1 overflow-y-auto ml-64 p-4 sm:p-8 flex flex-col items-center justify-center">
                <div className="max-w-3xl mx-auto w-full flex flex-col items-center">

                    <div className="text-center mb-10">
                        <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-100">
                            <KeyRound className="h-8 w-8 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">API Configuration</h1>
                        <p className="text-slate-500 font-medium">Configure your external service keys to power MindPulse AI features.</p>
                    </div>

                    <div className="glass-card w-full rounded-[2.5rem] p-8 sm:p-10 border border-white/60 shadow-2xl relative overflow-hidden">

                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>

                        <div className="bg-blue-50/50 border border-blue-100 rounded-[1.5rem] p-5 mb-8 flex items-start relative z-10">
                            <div className="bg-white p-2 rounded-xl shadow-sm mr-4 border border-blue-50">
                                <ShieldCheck className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="text-sm text-blue-900/80">
                                <p className="font-bold mb-1">Your keys are stored securely.</p>
                                <p className="text-xs font-medium opacity-80 leading-relaxed">Keys are saved locally in your browser and never sent to our servers. Communication happens directly with API providers.</p>
                            </div>
                        </div>

                        <form className="space-y-8 relative z-10" onSubmit={(e) => e.preventDefault()}>

                            {/* OpenAI Key */}
                            <div>
                                <label htmlFor="openai" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                                    OpenAI API Key
                                </label>
                                <div className="relative group">
                                    <input
                                        type={showKeys.openai ? "text" : "password"}
                                        id="openai"
                                        placeholder="sk-..."
                                        className="w-full bg-white/80 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all pr-14 shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShow('openai')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                                    >
                                        {showKeys.openai ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2.5 font-bold uppercase tracking-tight ml-1">Required for the 24/7 AI Chatbot.</p>
                            </div>

                            {/* Gemini Key */}
                            <div>
                                <label htmlFor="gemini" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                                    Google Gemini API Key
                                </label>
                                <div className="relative group">
                                    <input
                                        type={showKeys.gemini ? "text" : "password"}
                                        id="gemini"
                                        placeholder="AIzaSy..."
                                        className="w-full bg-white/80 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all pr-14 shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShow('gemini')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                                    >
                                        {showKeys.gemini ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2.5 font-bold uppercase tracking-tight ml-1">Used for Face Scan and advanced visual analysis.</p>
                            </div>

                            {/* ElevenLabs Key */}
                            <div>
                                <label htmlFor="elevenlabs" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                                    ElevenLabs API Key
                                </label>
                                <div className="relative group">
                                    <input
                                        type={showKeys.elevenlabs ? "text" : "password"}
                                        id="elevenlabs"
                                        placeholder="Enter ElevenLabs key..."
                                        className="w-full bg-white/80 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all pr-14 shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShow('elevenlabs')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                                    >
                                        {showKeys.elevenlabs ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2.5 font-bold uppercase tracking-tight ml-1">Powers the AI Voice Assistant output.</p>
                            </div>

                            <div className="pt-8 border-t border-slate-100 flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center group active:scale-95"
                                >
                                    <Save className="h-4 w-4 mr-2.5 group-hover:scale-125 transition-transform" />
                                    Save Configuration
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiKeys;
