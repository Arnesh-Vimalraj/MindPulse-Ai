import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FaceScanEngine, FaceScanState } from '../lib/FaceScanEngine';
import { Camera, CameraOff, BrainCircuit, Activity, CheckCircle2, AlertCircle, Heart } from 'lucide-react';

const FaceScanner = () => {
    const { user } = useAuth() as any;
    const videoRef = useRef<HTMLVideoElement>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<FaceScanEngine | null>(null);
    const navigate = useNavigate();

    const [scanState, setScanState] = useState<FaceScanState>({
        status: 'idle',
        stabilityScore: 0,
        bufferCount: 0,
        facesDetected: 0
    });

    const [hasSaved, setHasSaved] = useState(false);

    useEffect(() => {
        // Initialize the engine once
        engineRef.current = new FaceScanEngine();

        engineRef.current.onStateChange((newState) => {
            setScanState(newState);

            // Once buffer is full, we are processing
            const isBufferFull = newState.bufferCount >= 150;

            // Auto-navigate to result page when vitals are received
            if (isBufferFull && newState.heartRate && !newState.scanError && !hasSaved) {
                // Background save to Supabase
                const saveResults = async () => {
                    setHasSaved(true);
                    try {
                        const { error } = await supabase
                            .from('scan_results')
                            .insert([{
                                user_id: user?.id || 'demo_user',
                                heart_rate: newState.heartRate,
                                spo2: newState.spo2,
                                bp_systolic: newState.bloodPressure?.systolic,
                                bp_diastolic: newState.bloodPressure?.diastolic,
                                hrv_sdnn: newState.hrv?.sdnn,
                                hrv_rmssd: newState.hrv?.rmssd,
                                stress_level: newState.stressLevel,
                                signal_confidence: newState.confidence
                            }]);

                        if (error) throw error;
                        console.log("Scan results stored successfully to Supabase");
                    } catch (err) {
                        console.error("Supabase insert error:", err);
                    }
                };

                // Execute save in background
                saveResults();

                // Short delay for "wow" factor/loading transition
                setTimeout(() => {
                    if (engineRef.current) engineRef.current.stop();
                    navigate('/scan-results', { state: { vitals: newState } });
                }, 800);
            }
        });

        // Cleanup on unmount
        return () => {
            if (engineRef.current) {
                engineRef.current.stop();
            }
        };
    }, []);

    const startScan = async () => {
        if (engineRef.current && videoRef.current && canvasRef.current) {
            setHasSaved(false);
            await engineRef.current.start(videoRef.current, canvasRef.current);
        }
    };

    const stopScan = () => {
        if (engineRef.current) {
            engineRef.current.stop();
        }
    };

    // UI Helpers
    const getStatusColor = () => {
        switch (scanState.status) {
            case 'idle': return 'bg-slate-500';
            case 'initializing': return 'bg-blue-500 animate-pulse';
            case 'detecting': return 'bg-amber-500 animate-pulse';
            case 'stabilizing': return 'bg-orange-500';
            case 'streaming': return 'bg-emerald-500 animate-pulse';
            case 'error': return 'bg-rose-500';
            default: return 'bg-slate-500';
        }
    };

    const getStatusText = () => {
        if (scanState.bufferCount >= 150 && !scanState.heartRate && !scanState.scanError) {
            return 'Processing Bio-Signals...';
        }
        switch (scanState.status) {
            case 'idle': return 'System Idle';
            case 'initializing': return 'Starting Camera...';
            case 'detecting': return 'Looking for Face...';
            case 'stabilizing': return 'Please hold still to stabilize';
            case 'streaming': return 'Collecting Signal Data...';
            case 'error': return scanState.errorMessage || 'Camera Error';
            default: return 'Unknown Status';
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)] flex flex-col">

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Real-time Face Scan</h1>
                <p className="text-slate-500">Phase 1: Pipeline Data Acquisition</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">

                {/* Left: Camera Feed */}
                <div className="flex-1 relative glass-card rounded-2xl overflow-hidden shadow-xl border border-white/60 bg-black min-h-[400px]">

                    {scanState.status === 'idle' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-20">
                            <CameraOff className="h-16 w-16 text-slate-400 mb-4" />
                            <button
                                onClick={startScan}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-md"
                            >
                                Activate Camera
                            </button>
                        </div>
                    )}

                    {scanState.status === 'error' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-20">
                            <AlertCircle className="h-16 w-16 text-rose-500 mb-4" />
                            <p className="text-white text-lg font-medium">{scanState.errorMessage}</p>
                            <button
                                onClick={startScan}
                                className="mt-6 bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-full font-medium transition-all"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover mirror-x"
                        playsInline
                        muted
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10 mirror-x"
                    />

                    {/* Status Overlay UI */}
                    {scanState.status !== 'idle' && scanState.status !== 'error' && (
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-30">
                            <div className="bg-slate-900/80 backdrop-blur text-white px-4 py-2 rounded-xl flex items-center space-x-3 border border-white/10">
                                <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
                                <span className="text-sm font-semibold">{getStatusText()}</span>
                            </div>

                            <button
                                onClick={stopScan}
                                className="bg-rose-500/90 hover:bg-rose-600 backdrop-blur text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors border border-white/10"
                            >
                                Stop Scan
                            </button>
                        </div>
                    )}

                </div>

                {/* Right: Metrics Panel */}
                <div className="w-full lg:w-80 space-y-4">

                    <div className="glass-card p-5 rounded-2xl border border-white/60">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                            <Activity className="h-4 w-4 mr-2 text-blue-600" />
                            Pipeline Metrics
                        </h3>

                        <div className="space-y-6">

                            {/* Stability Score */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-semibold text-slate-600">Motion Stability</span>
                                    <span className="text-sm font-bold text-slate-900">{scanState.stabilityScore}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${scanState.stabilityScore > 90 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                                        style={{ width: `${scanState.stabilityScore}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Buffer Progress */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-semibold text-slate-600">Frame Buffer</span>
                                    <span className="text-sm font-bold text-slate-900">{scanState.bufferCount} / 150</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min(100, (scanState.bufferCount / 150) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Face Detect */}
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center text-sm font-semibold text-slate-700">
                                    <BrainCircuit className="h-4 w-4 mr-2 text-indigo-500" />
                                    Faces Detected
                                </div>
                                <div className="text-sm font-bold text-slate-900">
                                    {scanState.facesDetected}
                                </div>
                            </div>

                            {/* Signal Confidence */}
                            {(scanState.confidence !== undefined && scanState.confidence > 0) && (
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-semibold text-slate-600">Signal Confidence</span>
                                        <span className="text-sm font-bold text-slate-900">{Math.round(scanState.confidence * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${scanState.confidence > 0.6 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                                            style={{ width: `${Math.min(100, scanState.confidence * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Heart Rate Display */}
                            {(scanState.heartRate !== undefined && scanState.heartRate > 0) && (
                                <div className="mt-4 border-2 border-rose-100 rounded-xl p-4 bg-rose-50/50 flex flex-col items-center justify-center">
                                    <span className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1 flex items-center">
                                        <Heart className="w-4 h-4 mr-1 text-rose-500 animate-pulse" />
                                        Estimated Heart Rate
                                    </span>
                                    <div className="flex items-baseline space-x-1">
                                        <span className="text-4xl font-extrabold text-slate-800">{scanState.heartRate}</span>
                                        <span className="text-base font-semibold text-slate-500">BPM</span>
                                    </div>
                                </div>
                            )}

                            {/* Scan Error Message */}
                            {scanState.scanError && (
                                <div className="mt-4 p-5 bg-rose-50 border-2 border-rose-100 rounded-[1.5rem] flex items-start space-x-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                                    <AlertCircle className="h-6 w-6 text-rose-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-black text-rose-900 uppercase tracking-tight">Signal Interrupted</p>
                                        <p className="text-xs text-rose-600 mt-1 font-medium leading-relaxed">
                                            {scanState.scanError.includes("motion")
                                                ? "Excessive motion detected. Please keep your head completely still during the 10-second window."
                                                : "Lighting or positioning is insufficient. Ensure your face is well-lit and centered."}
                                        </p>
                                        <button
                                            onClick={startScan}
                                            className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all active:scale-95 shadow-lg shadow-rose-100"
                                        >
                                            Restart Diagnostic
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    <div className="glass-card p-5 rounded-2xl border border-white/60 bg-blue-50/50">
                        <h4 className="text-sm font-bold text-slate-900 mb-2">Instructions</h4>
                        <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                            <li>Ensure good lighting on your face.</li>
                            <li>Look directly at the camera.</li>
                            <li>Keep your head still within the guide.</li>
                            <li>Wait for the buffer to start filling.</li>
                        </ul>
                    </div>

                </div>

            </div>

            {/* Global styles for mirroring the video so it feels natural */}
            <style>{`
        .mirror-x {
          transform: scaleX(-1);
        }
      `}</style>
        </div>
    );
};

export default FaceScanner;
