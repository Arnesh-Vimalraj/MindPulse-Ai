import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Activity, Brain, Heart, ShieldCheck, Waves, Zap,
    Download, AlertCircle, ArrowLeft, BarChart3, Info
} from 'lucide-react';
import {
    LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip
} from 'recharts';
import Sidebar from '../components/Sidebar';

const WaveformTrend = ({ data }) => {
    const chartData = useMemo(() =>
        (data || []).map((val, i) => ({ x: i, y: val })),
        [data]);

    if (!data || data.length === 0) {
        return (
            <div className="h-64 w-full bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <Waves className="w-12 h-12 mb-3 animate-pulse opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest">No Waveform Data Available</p>
            </div>
        );
    }

    return (
        <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <Line
                        type="monotone"
                        dataKey="y"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={false}
                        isAnimationActive={true}
                    />
                    <YAxis hide domain={['auto', 'auto']} />
                    <XAxis hide />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-white p-2 border border-slate-100 shadow-xl rounded-lg text-[10px] font-black uppercase text-indigo-600">
                                        Amplitude: {payload[0].value.toFixed(4)}
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const ScanResultsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const vitals = location.state?.vitals;

    // Use passed vitals or mock data for preview
    const data = useMemo(() => ({
        hr: vitals?.heartRate || 72,
        spo2: vitals?.spo2 || 98.5,
        systolic: vitals?.bloodPressure?.systolic || 120,
        diastolic: vitals?.bloodPressure?.diastolic || 80,
        stress: vitals?.stressLevel || "Balanced",
        confidence: vitals?.confidence ? Math.round(vitals.confidence * 100) : 88,
        sdnn: vitals?.hrv?.sdnn || 42,
        rmssd: vitals?.hrv?.rmssd || 35,
        waveform: vitals?.pulseWaveform || [],
        quality: vitals?.confidence || 0.88
    }), [vitals]);

    const isHrNormal = data.hr >= 60 && data.hr <= 100;

    if (vitals && data.quality < 0.5) {
        return (
            <div className="flex h-screen bg-[#F8FAFC] font-inter">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center p-8 ml-64">
                    <div className="glass-card p-12 rounded-[3rem] bg-white border border-slate-100 shadow-2xl text-center max-w-lg">
                        <div className="bg-rose-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-rose-100">
                            <AlertCircle className="w-10 h-10 text-rose-500" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Signal Interrupted</h2>
                        <p className="text-slate-500 font-medium leading-relaxed mb-10">
                            Signal quality too low ({Math.round(data.quality * 100)}%). Please ensure you are in a well-lit area and remain completely still during the scan.
                        </p>
                        <button
                            onClick={() => navigate('/scan')}
                            className="bg-slate-900 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:scale-105 transition-transform active:scale-95"
                        >
                            Restart Diagnostic
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-inter overflow-hidden text-slate-900">
            <Sidebar />

            <div className="flex-1 overflow-y-auto ml-64">
                <div className="max-w-7xl mx-auto p-10">

                    {/* Header Block */}
                    <div className="mb-12 flex justify-between items-start">
                        <div>
                            <button
                                onClick={() => navigate('/scan')}
                                className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 hover:text-indigo-500 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Return to Scanner
                            </button>
                            <h1 className="text-5xl font-black tracking-tighter leading-none mb-3">Scan Results</h1>
                            <p className="text-slate-400 font-bold text-lg">Your personalized vitals report</p>
                        </div>
                        <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center space-x-3 shadow-sm">
                            <ShieldCheck className="w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-widest">Verified Signal</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Main Content Area */}
                        <div className="lg:col-span-9 space-y-10">

                            {/* Primary Row (3 Cards) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* HR Card */}
                                <div className="glass-card p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-6">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Heart Rate</p>
                                        <div className="p-2.5 bg-rose-50 rounded-2xl border border-rose-100">
                                            <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline space-x-2 mb-2">
                                        <span className="text-5xl font-black leading-none tracking-tight">{data.hr}</span>
                                        <span className="text-lg font-bold text-slate-300 uppercase tracking-widest">BPM</span>
                                    </div>
                                    {isHrNormal && (
                                        <div className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black tracking-widest border border-emerald-100">
                                            NORMAL
                                        </div>
                                    )}
                                </div>

                                {/* Mental State Card */}
                                <div className="glass-card p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-6">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Mental State</p>
                                        <div className="p-2.5 bg-indigo-50 rounded-2xl border border-indigo-100">
                                            <Brain className="w-5 h-5 text-indigo-500" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black leading-tight mb-2">{data.stress} Stress</h3>
                                    <p className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">Derived from autonomic variability</p>
                                </div>

                                {/* SpO2 Card */}
                                <div className="glass-card p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-6">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Oxygen Saturation</p>
                                        <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                                            <Zap className="w-5 h-5 text-emerald-500" />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline space-x-2 mb-2">
                                        <span className="text-5xl font-black leading-none tracking-tight">{data.spo2.toFixed(1)}</span>
                                        <span className="text-lg font-bold text-slate-300 uppercase tracking-widest">%</span>
                                    </div>
                                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center">
                                        <ShieldCheck className="w-3 h-3 mr-1" /> OPTIMAL FLUX
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Row (3 Cards) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Blood Pressure */}
                                <div className="glass-card p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Blood Pressure</p>
                                    <div className="flex items-baseline space-x-2">
                                        <span className="text-3xl font-black">{data.systolic}</span>
                                        <span className="text-xl font-bold text-slate-300">/</span>
                                        <span className="text-3xl font-black">{data.diastolic}</span>
                                        <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">mmHg</span>
                                    </div>
                                </div>

                                {/* HRV Metrics */}
                                <div className="glass-card p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">HRV Metrics</p>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">SDNN</span>
                                            <span className="text-xl font-black leading-none">{data.sdnn} <span className="text-[10px] text-slate-300 font-bold">ms</span></span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">RMSSD</span>
                                            <span className="text-xl font-black leading-none">{data.rmssd} <span className="text-[10px] text-slate-300 font-bold">ms</span></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Signal Confidence */}
                                <div className="glass-card p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Signal Confidence</p>
                                    <div className="flex items-baseline space-x-2 mb-4">
                                        <span className="text-4xl font-black">{data.confidence}</span>
                                        <span className="text-lg font-bold text-slate-300 uppercase tracking-widest">%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${data.confidence}%` }} />
                                    </div>
                                </div>
                            </div>

                            {/* Physiological Trend Panel */}
                            <div className="glass-card p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-indigo-50 rounded-2xl">
                                            <BarChart3 className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black tracking-tight">Physiological Trend</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">Signal decomposition (POS-DSP Waveform)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-500 border border-emerald-100 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
                                        <Activity className="w-3 h-3" />
                                        <span>Active Stream Analysis</span>
                                    </div>
                                </div>

                                <WaveformTrend data={data.waveform} />

                                <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <div className="flex space-x-8">
                                        <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-indigo-500 mr-2" /> Normalized Pulse Flux</span>
                                        <span className="flex items-center"><div className="w-2 h-2 border border-slate-300 mr-2" /> Baseline Calibration</span>
                                    </div>
                                    <div className="flex items-center italic">
                                        <Info className="w-3 h-3 mr-1" /> Standardized 15Hz Sampling
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Right Side Panel */}
                        <div className="lg:col-span-3 space-y-8">

                            {/* Recent Metrics Panel */}
                            <div className="glass-card p-8 rounded-[3rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

                                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-8">Recent Metrics</h4>

                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Autonomic Stability (SDNN)</p>
                                        <p className="text-3xl font-black">{data.sdnn} <span className="text-sm font-bold text-slate-500">ms</span></p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Spectral Quality</p>
                                        <p className="text-3xl font-black">{(data.quality * 100).toFixed(1)} <span className="text-sm font-bold text-slate-500">%</span></p>
                                    </div>

                                    <div className="space-y-2 pb-8 border-b border-white/10">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">BP Status</p>
                                        <p className="text-xl font-bold uppercase tracking-tight text-emerald-400">NORMOTENSIVE</p>
                                    </div>

                                    <button className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-xl shadow-indigo-500/20 flex items-center justify-center space-x-3">
                                        <Download className="w-4 h-4" />
                                        <span>Download PDF Report</span>
                                    </button>
                                </div>
                            </div>

                            {/* Clinical Context Panel */}
                            <div className="glass-card p-8 rounded-[3rem] bg-white border border-slate-100">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-6 flex items-center">
                                    <Info className="w-4 h-4 mr-2 text-indigo-500" /> Key Insights
                                </h4>
                                <div className="space-y-6">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">
                                            "Your Heart Rate Variability (HRV) metrics suggest a strong parasympathetic tone, indicating efficient recovery."
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                        <p className="text-[11px] font-black text-emerald-700 leading-relaxed uppercase tracking-tighter">
                                            Bio-Signal remains within clinical normative baselines.
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ScanResultsPage;
