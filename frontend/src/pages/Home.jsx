import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Brain, Activity, Shield, ActivitySquare, HeartPulse, UserCircle2, UserCog, Globe2 } from 'lucide-react';

const Home = () => {
    return (
        <div className="flex flex-col min-h-screen">

            {/* Hero Section */}
            <section className="pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-12">

                {/* LEFT SIDE */}
                <div className="flex-1 space-y-8 text-center lg:text-left">
                    <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        AI-Powered <br className="hidden lg:block" />
                        <span className="text-gradient">Mental Health Monitoring</span>
                    </h1>

                    <p className="text-xl text-slate-700 font-medium">
                        Early detection. Real-time support. 24/7 AI care.
                    </p>

                    <p className="text-lg text-slate-500 max-w-2xl mx-auto lg:mx-0">
                        Designed for students and institutions. Secure, private, and multilingual.
                    </p>

                    <div className="pt-4 flex justify-center lg:justify-start">
                        <NavLink to="/scan" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center group">
                            Start Face Scan
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </NavLink>
                    </div>
                </div>

                {/* RIGHT SIDE: Chat UI Preview Card */}
                <div className="flex-1 w-full max-w-md">
                    <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/40">
                        <div className="bg-white/50 border-b border-slate-100 p-4 flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <Brain className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900">DeepPhys Assistant</h3>
                        </div>

                        <div className="p-6 space-y-6 bg-slate-50/50">
                            {/* User Bubble */}
                            <div className="flex justify-end">
                                <div className="bg-white text-slate-800 p-4 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%] border border-slate-100">
                                    <p className="text-sm">I've been feeling stressed and overwhelmed with exams.</p>
                                </div>
                            </div>

                            {/* AI Bubble */}
                            <div className="flex justify-start">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl rounded-tl-sm shadow-md max-w-[85%]">
                                    <p className="text-sm">I'm here to help. Let's start with a quick stress check.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white/50 border-t border-slate-100">
                            <div className="bg-white rounded-full flex items-center px-4 py-2 border border-slate-200">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    className="w-full bg-transparent outline-none text-sm text-slate-700"
                                    disabled
                                />
                                <button className="text-slate-400 p-1">
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Built For Every User Section */}
            <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">Built for Every User</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Student Mode */}
                        <div className="group bg-slate-50 hover:bg-white p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-xl border border-slate-100 text-center">
                            <div className="mx-auto bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                                <UserCircle2 className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Student Mode</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Daily reports, stress tracking, and guided exercises.
                            </p>
                        </div>

                        {/* Admin Mode */}
                        <div className="group bg-slate-50 hover:bg-white p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-xl border border-slate-100 text-center">
                            <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                                <UserCog className="h-8 w-8 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Admin Mode</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Department-level stress analytics and trend monitoring.
                            </p>
                        </div>

                        {/* Public Mode */}
                        <div className="group bg-slate-50 hover:bg-white p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-xl border border-slate-100 text-center">
                            <div className="mx-auto bg-sky-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sky-600 transition-colors duration-300">
                                <Globe2 className="h-8 w-8 text-sky-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Public Mode</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Anonymous stress check without registration.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900">Core Features</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Face Scan */}
                    <div className="glass-card p-6 rounded-2xl hover:bg-white/90 transition-all duration-300 border border-white/60">
                        <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                            <Activity className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Face Scan</h3>
                        <p className="text-slate-600 text-sm">
                            AI-powered facial analysis to detect stress and emotional state in real-time.
                        </p>
                    </div>

                    {/* AI Voice Assistant */}
                    <div className="glass-card p-6 rounded-2xl hover:bg-white/90 transition-all duration-300 border border-white/60">
                        <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                            <ActivitySquare className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">AI Voice Assistant</h3>
                        <p className="text-slate-600 text-sm">
                            Speak naturally and receive intelligent emotional support and guidance.
                        </p>
                    </div>

                    {/* 24/7 AI Chatbot */}
                    <div className="glass-card p-6 rounded-2xl hover:bg-white/90 transition-all duration-300 border border-white/60">
                        <div className="bg-sky-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                            <Shield className="h-6 w-6 text-sky-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">24/7 AI Chatbot</h3>
                        <p className="text-slate-600 text-sm">
                            Always-available conversational support for mental wellness and stress check.
                        </p>
                    </div>

                    {/* Menstrual Cycle Support */}
                    <div className="glass-card p-6 rounded-2xl hover:bg-white/90 transition-all duration-300 border border-white/60">
                        <div className="bg-rose-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                            <HeartPulse className="h-6 w-6 text-rose-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Menstrual Cycle Support</h3>
                        <p className="text-slate-600 text-sm">
                            Personalized mood and stress insights based on hormonal cycle tracking.
                        </p>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
