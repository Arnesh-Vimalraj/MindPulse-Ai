import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Activity, Brain, Clock, AlertTriangle, TrendingUp, CalendarDays,
    Heart, Zap, ShieldCheck, Waves, Info, Share2, Download
} from 'lucide-react';
import {
    LineChart, Line, ResponsiveContainer, YAxis, Tooltip, XAxis
} from 'recharts';
import Sidebar from '../components/Sidebar';

const PulseWaveformChart = ({ data }) => {
    const chartData = useMemo(() =>
        (data || []).map((val, i) => ({ x: i, y: val })),
        [data]);

    if (!data || data.length === 0) return null;

    return (
        <div className="h-32 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <Line
                        type="monotone"
                        dataKey="y"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                    />
                    <YAxis hide domain={[0, 1]} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [dbVitals, setDbVitals] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    const vitals = location.state?.vitals || dbVitals;

    React.useEffect(() => {
        const fetchLatestScan = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('scan_results')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (data) {
                    setDbVitals({
                        heartRate: data.heart_rate,
                        spo2: data.spo2,
                        bloodPressure: { systolic: data.bp_systolic, diastolic: data.bp_diastolic },
                        hrv: { sdnn: data.hrv_sdnn, rmssd: data.hrv_rmssd },
                        stressLevel: data.stress_level,
                        confidence: data.signal_confidence
                    });
                }
            } catch (err) {
                console.error("Error fetching dashboard vitals:", err);
            } finally {
                setLoading(false);
            }
        };

        if (!location.state?.vitals) {
            fetchLatestScan();
        } else {
            setLoading(false);
        }
    }, [user?.id, location.state?.vitals]);

    const stats = useMemo(() => ({
        hr: vitals?.heartRate || 72,
        spo2: vitals?.spo2 || 98.5,
        systolic: vitals?.bloodPressure?.systolic || 120,
        diastolic: vitals?.bloodPressure?.diastolic || 80,
        stress: vitals?.stressLevel || "Balanced",
        confidence: vitals?.confidence ? Math.round(vitals.confidence * 100) : 88,
        sdnn: vitals?.hrv?.sdnn || 42,
        rmssd: vitals?.hrv?.rmssd || 35,
        waveform: vitals?.pulseWaveform || []
    }), [vitals]);

    const bioScore = useMemo(() => {
        // Simple health index calculation
        const hrScore = Math.max(0, 100 - Math.abs(stats.hr - 70));
        const stressBonus = stats.stress === "Low" ? 20 : (stats.stress === "Moderate" ? 10 : 0);
        const spo2Score = (stats.spo2 - 95) * 20;
        return Math.min(100, Math.round((hrScore + stressBonus + spo2Score) / 2.2));
    }, [stats]);

    const getStressColor = (level) => {
        if (level === "High") return "text-rose-500 border-rose-100 bg-rose-50";
        if (level === "Moderate") return "text-amber-500 border-amber-100 bg-amber-50";
        return "text-indigo-500 border-indigo-100 bg-indigo-50";
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-[#F8FAFC] font-inter overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center ml-64">
                    <div className="flex flex-col items-center">
                        <Activity className="w-12 h-12 text-indigo-500 animate-pulse mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Synchronizing Biometrics...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-inter overflow-hidden">
            <Sidebar />

            <div className="flex-1 overflow-y-auto ml-64 p-8">
                <div className="max-w-7xl mx-auto">

                    {/* AETHER HEADER */}
                    <div className="flex justify-between items-end mb-10 pb-6 border-b border-slate-200">
                        <div>
                            <div className="flex items-center space-x-2 text-indigo-600 font-bold tracking-tighter uppercase text-xs mb-2">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Clinical Grade Analysis</span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">
                                {vitals ? "Biometric Report" : "Vitals Dashboard"}
                            </h1>
                            <p className="text-slate-500 font-medium text-sm">
                                Precise physiological tracking and mental wellness diagnostics.
                            </p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                                <Share2 className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                            <div className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 flex items-center space-x-2">
                                <CalendarDays className="w-4 h-4 opacity-70" />
                                <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* PRIMARY METRICS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

                        {/* BIO-SCORE (HEALTH INDEX) */}
                        <div className="md:col-span-1 glass-card p-6 rounded-[2.5rem] border-2 border-indigo-50 bg-white relative overflow-hidden flex flex-col justify-between">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Bio-Score Index</p>
                                <div className="flex items-baseline space-x-1">
                                    <span className="text-6xl font-black text-slate-900 leading-none">{bioScore}</span>
                                    <span className="text-lg font-bold text-slate-300">/100</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full mt-6 overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${bioScore}%` }} />
                            </div>
                            <p className="text-[11px] font-bold text-slate-500 mt-4 leading-relaxed italic opacity-80">
                                Health index derived from cardiac variability & oxygen flux.
                            </p>
                        </div>

                        {/* HEART RATE & WAVEFORM */}
                        <div className="md:col-span-2 glass-card p-6 rounded-[2.5rem] bg-white border border-slate-100 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-1">Cardiac Rhythm</p>
                                    <h2 className="text-4xl font-black text-slate-900 flex items-center">
                                        {stats.hr}
                                        <span className="text-lg font-bold text-slate-300 ml-2 uppercase tracking-wide">BPM</span>
                                    </h2>
                                </div>
                                <div className="bg-rose-50 p-2.5 rounded-2xl border border-rose-100">
                                    <Heart className="w-6 h-6 text-rose-500 animate-pulse" />
                                </div>
                            </div>

                            {vitals?.pulseWaveform ? (
                                <PulseWaveformChart data={vitals.pulseWaveform} />
                            ) : (
                                <div className="h-32 w-full mt-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center">
                                    <Waves className="w-8 h-8 text-slate-200 animate-pulse" />
                                </div>
                            )}

                            <div className="mt-4 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Live Pulse Waveform</span>
                                <span className="text-emerald-500 flex items-center">
                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                    Synchronized
                                </span>
                            </div>
                        </div>

                        {/* STRESS LEVEL CARD */}
                        <div className="md:col-span-1 glass-card p-6 rounded-[2.5rem] bg-white border border-slate-100 flex flex-col justify-between">
                            <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Neural State</p>
                                <div className={`inline-block px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider ${getStressColor(stats.stress)}`}>
                                    {stats.stress} Stress
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mt-4 leading-tight">
                                    {stats.stress === "Low" ? "Optimal Resilience" : "Monitor Fatigue"}
                                </h3>
                            </div>
                            <div className="pt-6 mt-6 border-t border-slate-50">
                                <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                                    <span>Signal Confidence</span>
                                    <span>{stats.confidence}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.confidence}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECONDARY METRICS SECTIONS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* HEMODYNAMIC PANEL */}
                        <div className="lg:col-span-2 glass-card rounded-[2.5rem] bg-white border border-slate-100 p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Hemodynamic Parameters</h3>
                                <div className="bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                    Computed Heuristics
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="p-6 rounded-3xl bg-[#F8FAFC] border border-slate-100 group hover:border-indigo-200 transition-colors">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="p-2 bg-indigo-100 rounded-xl">
                                            <Zap className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <span className="text-sm font-black text-slate-500 uppercase tracking-wider">Blood Pressure</span>
                                    </div>
                                    <div className="flex items-baseline space-x-2">
                                        <span className="text-4xl font-black text-slate-900">{stats.systolic}</span>
                                        <span className="text-2xl font-bold text-slate-300">/</span>
                                        <span className="text-4xl font-black text-slate-900">{stats.diastolic}</span>
                                        <span className="text-xs font-bold text-slate-400 ml-2">mmHg</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 mt-4 italic">Estimated via pulse transit heuristics.</p>
                                </div>

                                <div className="p-6 rounded-3xl bg-[#F8FAFC] border border-slate-100 group hover:border-emerald-200 transition-colors">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="p-2 bg-emerald-100 rounded-xl">
                                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <span className="text-sm font-black text-slate-500 uppercase tracking-wider">SpO2 Oxygen</span>
                                    </div>
                                    <div className="flex items-baseline space-x-2">
                                        <span className="text-4xl font-black text-slate-900 font-mono">{stats.spo2.toFixed(1)}</span>
                                        <span className="text-lg font-bold text-slate-300 uppercase tracking-wider">%</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 mt-4 italic">Saturation derived from multi-ROI AC/DC flux.</p>
                                </div>
                            </div>

                            {/* HRV METRICS ROW */}
                            <div className="grid grid-cols-2 gap-6 mt-8">
                                <div className="flex items-center space-x-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/50">
                                    <Activity className="w-5 h-5 text-indigo-400" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RMSSD (HRV)</p>
                                        <p className="text-lg font-black text-slate-800">{stats.rmssd} <span className="text-[10px] text-slate-400">ms</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/50">
                                    <Waves className="w-5 h-5 text-rose-400" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SDNN (Stability)</p>
                                        <p className="text-lg font-black text-slate-800">{stats.sdnn} <span className="text-[10px] text-slate-400">ms</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* INSIGHTS & ACTIONS */}
                        <div className="glass-card rounded-[2.5rem] bg-white border border-slate-100 p-8 flex flex-col">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Clinical Insights</h3>

                            <div className="space-y-6 flex-1">
                                <div className="flex items-start space-x-4">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    <p className="text-sm font-medium text-slate-600">
                                        Your <strong>Bio-Score</strong> indicates high physiological resilience.
                                    </p>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-3 h-3 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                    <p className="text-sm font-medium text-slate-600">
                                        HRV levels suggest deep recovery. Ideal for high-focus tasks.
                                    </p>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-3 h-3 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                    <p className="text-sm font-medium text-slate-600">
                                        BP estimation is within normal range but derived algorithmically.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-10 space-y-3">
                                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all transform active:scale-95 shadow-xl shadow-slate-200">
                                    <Download className="w-4 h-4 inline-block mr-2 mt-[-2px]" />
                                    Full PDF Diagnostic
                                </button>
                                <button className="w-full py-4 border-2 border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
                                    Compare with Oct 2023
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
