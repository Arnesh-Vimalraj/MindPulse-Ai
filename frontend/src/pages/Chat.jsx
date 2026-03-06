import React, { useState, useEffect, useRef } from 'react';
import { Send, Brain, Bot, User, Sparkles } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            text: "Hello! I'm your AI mental wellness assistant. I'm here to listen and help you track your emotional well-being. How are you feeling today?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8001/chat', {
                user_id: user?.id || 'demo_user_123',
                message: input
            });


            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                text: response.data.reply,
                emotion: response.data.emotion,
                stress_level: response.data.stress_level,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Chat Error:", error);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'ai',
                text: "I'm having some trouble connecting. Please check if the backend is running.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen soft-gradient overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col ml-64 p-4 lg:p-8">
                <div className="max-w-4xl mx-auto w-full flex flex-col h-full bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-2xl overflow-hidden relative">

                    {/* Chat Header */}
                    <div className="p-6 border-b border-slate-100/60 flex justify-between items-center bg-white/40 backdrop-blur-md">
                        <div className="flex items-center space-x-4">
                            <div className="bg-blue-50 p-2.5 rounded-2xl border border-blue-100">
                                <Brain className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900 text-lg tracking-tight">AI Wellness Guide</h2>
                                <p className="text-[10px] text-emerald-600 font-bold flex items-center uppercase tracking-widest mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                                    Encrypted & Private
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex items-start space-x-4 ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse text-right' : ''}`}>
                                <div className={`p-2.5 rounded-2xl shadow-sm flex-shrink-0 ${msg.type === 'ai'
                                    ? 'bg-blue-600 shadow-blue-200'
                                    : 'bg-white border border-slate-200 shadow-sm'
                                    }`}>
                                    {msg.type === 'ai' ? <Bot className="h-5 w-5 text-white" /> : <User className="h-5 w-5 text-slate-400" />}
                                </div>
                                <div className={`flex flex-col max-w-[80%] ${msg.type === 'user' ? 'items-end' : ''}`}>
                                    <div className={`p-4 rounded-3xl text-sm leading-relaxed ${msg.type === 'ai'
                                        ? 'bg-white text-slate-700 rounded-tl-sm border border-slate-100 shadow-sm'
                                        : 'bg-blue-600 text-white rounded-tr-sm shadow-lg shadow-blue-600/20'
                                        }`}>
                                        {msg.text}
                                        {msg.stress_level === 'high' && msg.type === 'ai' && (
                                            <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-2xl">
                                                <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-1.5 flex items-center">
                                                    <Sparkles className="h-3 w-3 mr-1.5" /> Relaxation Recommended
                                                </p>
                                                <p className="text-[12px] text-rose-900/70 font-medium">Take a moment for a 4-7-8 breathing exercise. Deep breath in for 4...</p>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold mt-2 px-1 uppercase tracking-tighter">
                                        {msg.timestamp}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start space-x-4 animate-pulse">
                                <div className="bg-slate-100 p-2.5 rounded-2xl flex-shrink-0">
                                    <Bot className="h-5 w-5 text-slate-300" />
                                </div>
                                <div className="bg-white/60 border border-slate-100 w-16 h-10 rounded-2xl shadow-sm"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-white/40 backdrop-blur-md border-t border-slate-100/60">
                        <div className="relative group">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Share your thoughts..."
                                className="w-full bg-white border border-slate-200 rounded-2xl pl-6 pr-14 py-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-slate-400 shadow-sm"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading}
                                className="absolute right-2.5 top-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
