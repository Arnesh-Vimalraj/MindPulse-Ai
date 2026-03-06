import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, ActivitySquare, Settings2, Volume2, Loader2, MessageCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Speak = () => {
    const { user } = useAuth();
    const [isRecording, setIsRecording] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, listening, processing, speaking
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');

    const recognitionRef = useRef(null);
    const synthesisRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let currentInterim = '';
                let finalPart = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcriptStr = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalPart += transcriptStr;
                    } else {
                        currentInterim += transcriptStr;
                    }
                }
                if (finalPart) setTranscript(prev => prev + finalPart);
                setInterimTranscript(currentInterim);
            };

            recognitionRef.current.onend = () => {
                if (status === 'listening' && isRecording) {
                    // Recognition ended unexpectedly while we were supposed to be listening
                    // This can happen if user stops talking, so we treat it as finished
                    setIsRecording(false);
                    handleFinishRecording();
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error !== 'no-speech') {
                    setIsRecording(false);
                    setStatus('idle');
                }
            };
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (synthesisRef.current) synthesisRef.current.cancel();
        };
    }, [status, isRecording]);

    const handleToggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
            handleFinishRecording();
        } else {
            setTranscript('');
            setAiResponse('');
            setInterimTranscript('');
            setStatus('listening');
            setIsRecording(true);
            try {
                recognitionRef.current?.start();
            } catch (e) {
                console.error("Recognition start error:", e);
            }
        }
    };

    const handleFinishRecording = async () => {
        setStatus('processing');
        const finalText = transcript || interimTranscript;

        if (!finalText.trim()) {
            setStatus('idle');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8001/api/voice-chat', {
                user_id: user?.id || 'demo_user',
                speech_text: finalText
            });

            const reply = response.data.ai_response;
            setAiResponse(reply);
            speakResponse(reply);
        } catch (error) {
            console.error('Error processing voice chat:', error);
            setStatus('idle');
        }
    };

    const speakResponse = (text) => {
        if (!synthesisRef.current) return;

        setStatus('speaking');
        synthesisRef.current.cancel(); // Abort previous speech

        const utterance = new SpeechSynthesisUtterance(text);

        // Find a nice female voice if available
        const voices = synthesisRef.current.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Female') || v.lang === 'en-US');
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
            setStatus('idle');
        };

        utterance.onerror = (e) => {
            console.error("Speech synthesis error:", e);
            setStatus('idle');
        };

        synthesisRef.current.speak(utterance);
    };

    return (
        <div className="flex h-screen soft-gradient overflow-hidden">
            <Sidebar />
            <div className="flex-1 overflow-y-auto ml-64 p-4 sm:p-8 flex flex-col items-center justify-center">
                <div className="max-w-4xl mx-auto w-full flex flex-col items-center">

                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">AI Voice Assistant</h1>
                        <p className="text-slate-500 max-w-xl mx-auto font-medium">
                            Speak naturally about how you're feeling. Our AI will analyze your tone and provide empathetic, real-time feedback.
                        </p>
                    </div>

                    <div className="glass-card w-full rounded-[3rem] p-8 sm:p-12 relative overflow-hidden border border-white/60 shadow-2xl flex flex-col items-center text-center">

                        {/* Background Animation Effects */}
                        {(isRecording || status === 'speaking') && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                                <div className={`w-64 h-64 ${status === 'speaking' ? 'bg-indigo-500' : 'bg-blue-500'} rounded-full blur-3xl animate-ping`} style={{ animationDuration: '3s' }}></div>
                                <div className={`absolute w-48 h-48 ${status === 'speaking' ? 'bg-blue-500' : 'bg-indigo-500'} rounded-full blur-2xl animate-pulse`} style={{ animationDuration: '2s' }}></div>
                            </div>
                        )}

                        {/* Status indicator */}
                        <div className="mb-12 relative z-10 flex space-x-4">
                            <div className="flex items-center bg-white/80 border border-slate-100 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                                <Volume2 className="h-3.5 w-3.5 mr-2 text-blue-500" />
                                Voice Output: {status === 'speaking' ? 'Active' : 'Ready'}
                            </div>
                            <div className="flex items-center bg-white/80 border border-slate-100 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                                <ActivitySquare className="h-3.5 w-3.5 mr-2 text-indigo-500" />
                                {status === 'processing' ? 'Processing API' : 'Real-time Sync'}
                            </div>
                        </div>

                        {/* Microphone Button */}
                        <div className="relative z-10 mb-8">
                            <button
                                onClick={handleToggleRecording}
                                disabled={status === 'processing' || status === 'speaking'}
                                className={`
                                    w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl group
                                    ${isRecording
                                        ? 'bg-rose-500 hover:bg-rose-600 scale-110 shadow-rose-500/30'
                                        : status === 'processing' || status === 'speaking'
                                            ? 'bg-blue-400 cursor-wait'
                                            : 'bg-slate-900 hover:bg-slate-800 hover:scale-105 shadow-slate-900/20'
                                    }
                                `}
                            >
                                {status === 'processing' ? (
                                    <Loader2 className="h-10 w-10 text-white animate-spin" />
                                ) : isRecording ? (
                                    <Square className="h-10 w-10 text-white fill-white transition-transform duration-300 group-hover:scale-90" />
                                ) : (
                                    <Mic className={`h-12 w-12 text-white transition-transform duration-300 ${status === 'speaking' ? 'animate-pulse' : 'group-hover:scale-110'}`} />
                                )}
                            </button>

                            {/* Ripple rings when recording */}
                            {isRecording && (
                                <>
                                    <div className="absolute inset-0 rounded-full border-2 border-rose-400 animate-ping opacity-50" style={{ animationDuration: '1.5s' }}></div>
                                    <div className="absolute inset-0 rounded-full border border-rose-300 animate-ping opacity-30" style={{ animationDuration: '2s', animationDelay: '0.2s' }}></div>
                                </>
                            )}

                            {/* Listening waves when AI is speaking */}
                            {status === 'speaking' && (
                                <>
                                    <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-pulse opacity-50" style={{ scale: '1.3' }}></div>
                                    <div className="absolute inset-0 rounded-full border border-blue-300 animate-pulse opacity-30" style={{ scale: '1.5', animationDelay: '0.5s' }}></div>
                                </>
                            )}
                        </div>

                        {/* Text Status */}
                        <div className="relative z-10 space-y-2 mb-12">
                            <h3 className={`text-3xl font-black tracking-tight ${isRecording ? 'text-rose-600 animate-pulse' :
                                status === 'processing' ? 'text-blue-600' :
                                    status === 'speaking' ? 'text-indigo-600' : 'text-slate-900'
                                }`}>
                                {isRecording ? 'Listening...' :
                                    status === 'processing' ? 'Analyzing Stress...' :
                                        status === 'speaking' ? 'AI is Speaking' : 'Tap to Start Speaking'}
                            </h3>
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">
                                {isRecording ? 'Express your thoughts clearly' :
                                    status === 'processing' ? 'Wait while Gemini generates a response' :
                                        status === 'speaking' ? 'Listen to the supportive feedback' : 'Microphone is currently off'}
                            </p>
                        </div>

                        {/* Transcript & Response Area */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl relative z-10">
                            {/* Transcript */}
                            <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-[2rem] p-6 text-left shadow-sm">
                                <div className="flex items-center mb-4">
                                    <ActivitySquare className="h-4 w-4 text-blue-600 mr-2.5" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User Speech</span>
                                </div>
                                <div className="min-h-[100px] flex flex-col justify-start">
                                    {(transcript || interimTranscript) ? (
                                        <p className="text-slate-800 text-sm font-medium leading-relaxed">
                                            {transcript}{interimTranscript}
                                            {isRecording && <span className="inline-block w-1.5 h-4 bg-blue-500 animate-pulse ml-1 align-middle"></span>}
                                        </p>
                                    ) : (
                                        <p className="text-slate-400 font-medium italic text-xs">Your words will appear here...</p>
                                    )}
                                </div>
                            </div>

                            {/* AI Response */}
                            <div className="bg-white/60 backdrop-blur-md border border-blue-100/50 rounded-[2rem] p-6 text-left shadow-md">
                                <div className="flex items-center mb-4">
                                    <MessageCircle className="h-4 w-4 text-indigo-600 mr-2.5" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Response</span>
                                </div>
                                <div className="min-h-[100px] flex flex-col justify-start">
                                    {aiResponse ? (
                                        <p className="text-slate-800 text-sm font-bold leading-relaxed">
                                            {aiResponse}
                                        </p>
                                    ) : status === 'processing' ? (
                                        <div className="flex space-x-2 py-4">
                                            <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                            <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 font-medium italic text-xs">AI feedback will appear here...</p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Speak;
