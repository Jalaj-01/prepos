"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Flame, 
  CheckCircle2, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Clock,
  BarChart3,
  Trophy,
  Lock,
  Settings, // Added for the modal
  X
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [dailyProgress, setDailyProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    
    // State for the Date Update Modal
    const [showSettings, setShowSettings] = useState(false);
    const [newDate, setNewDate] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const info = localStorage.getItem('userInfo');
        if (!info) {
            window.location.href = '/login';
            return;
        }
        const parsedUser = JSON.parse(info);
        setUser(parsedUser);

        try {
            const config = { headers: { Authorization: `Bearer ${parsedUser.token}` } };
            
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/dashboard`, config);
            setStats(data);

            const statsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/attempts/stats`, config);
            setDailyProgress(statsRes.data.totalSolvedToday || 0);
        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
            if (err.response?.status === 401) {
                localStorage.removeItem('userInfo');
                window.location.href = '/login';
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDate = async () => {
        if (!newDate) return;
        setUpdating(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, 
                { targetCompletionDate: newDate }, 
                config
            );
            
            // Update local storage and state with new target questions/day
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            setShowSettings(false);
            alert("Target Updated! Daily MCQ goal recalculated.");
        } catch (err) {
            alert("Failed to update target date.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading || !user) return (
        <div className="min-h-screen bg-brand-light flex items-center justify-center font-black text-brand-muted animate-pulse uppercase tracking-widest">
            Loading PrepOS...
        </div>
    );

    const progressPercentage = Math.min((dailyProgress / user.dailyMcqTarget) * 100, 100);

    return (
        <div className="min-h-screen bg-brand-light pb-20">
            <nav className="bg-white border-b border-brand-border p-4 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <span className="font-black text-xl tracking-tighter">PrepOS</span>
                    <div className="flex items-center gap-3">
                        {/* Settings Button */}
                        <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-brand-light rounded-full transition-all text-brand-muted cursor-pointer">
                            <Settings size={18} />
                        </button>
                        <div className="flex items-center gap-1.5 bg-brand-dark px-3 py-1.5 rounded-full border border-brand-border">
                            <TrendingUp size={14} className="text-brand-accent" />
                            <span className="text-white font-bold text-xs">{stats?.readinessScore || 0}% Readiness</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                            <Flame size={16} className="text-orange-500 fill-orange-500" />
                            <span className="text-orange-700 font-bold text-sm">{user.streak || 0} Days</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-6 md:p-10">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-black text-brand-dark tracking-tight">
                            Welcome back, {user.name.split(' ')[0]}
                        </motion.h1>
                        <p className="text-brand-muted font-medium mt-1 tracking-tight">Today is a great day to move 1% closer to your target.</p>
                    </div>
                    <Link href="/analytics" className="hidden md:flex items-center gap-2 text-brand-accent font-bold text-sm hover:underline">
                        <BarChart3 size={18} /> View Detailed Analytics
                    </Link>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div whileHover={{ y: -4 }} className="bg-white rounded-[32px] p-8 shadow-premium border border-brand-border relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl font-black flex items-center gap-3">
                                        <div className="bg-brand-accent/10 p-2 rounded-xl"><Target className="text-brand-accent" size={24} /></div>
                                        Daily Practice
                                    </h2>
                                    <div className="text-right">
                                        <p className="text-brand-muted text-xs font-bold uppercase tracking-widest leading-none mb-1">Progress</p>
                                        <p className="font-black text-xl">{dailyProgress} / {user.dailyMcqTarget}</p>
                                    </div>
                                </div>
                                <div className="w-full bg-brand-light h-4 rounded-full border border-brand-border overflow-hidden mb-6">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} className="bg-brand-accent h-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                    <p className="text-brand-muted text-sm font-medium">
                                        {dailyProgress >= user.dailyMcqTarget ? "Daily target achieved!" : `Solve ${user.dailyMcqTarget - dailyProgress} more MCQs to hit your goal.`}
                                    </p>
                                    <Link href="/practice/setup" className="w-full md:w-auto bg-brand-dark text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-accent transition-all text-center">Start Practice Engine</Link>
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DashboardSmallCard icon={<CheckCircle2 size={20} className="text-status-success" />} title="Weak Area" value={stats?.mistakeStats?.[0]?.name || "N/A"} subValue="Most common error type" />
                            <DashboardSmallCard icon={<Clock size={20} className="text-purple-500" />} title="Time Studied" value={stats?.timeSpentToday || "0m"} subValue="Activity recorded today" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-brand-dark text-white rounded-[32px] p-8 shadow-xl">
                            <TrendingUp size={18} className="mb-6 opacity-70" />
                            <h3 className="text-5xl font-black mb-1 leading-none">{user.dailyMcqTarget}</h3>
                            <p className="text-sm font-medium opacity-60">Questions / Day to Finish on Time</p>
                            <p className="text-[10px] font-bold mt-8 opacity-40 uppercase tracking-widest">
                                Target: {user.targetCompletionDate ? new Date(user.targetCompletionDate).toLocaleDateString('en-IN', {day:'numeric', month:'short'}) : 'Not Set'}
                            </p>
                        </div>

                        <div className="bg-white rounded-[32px] border border-brand-border p-4 space-y-1">
                             <QuickLink href="/analytics" icon={<BarChart3 size={18} />} label="Performance Intelligence" />
                             <QuickLink href="/rankings" icon={<Trophy size={18} />} label="Leaderboard & Rankings" />
                             <QuickLink href="/books" icon={<BookOpen size={18} />} label="Book Study Tracker" />
                             {user.isAdmin && <QuickLink href="/admin" icon={<Lock size={18} />} label="Admin Manager" />}
                        </div>
                    </div>
                </div>
            </main>

            {/* SETTINGS MODAL (FOR TARGET DATE CHANGE) */}
            <AnimatePresence>
                {showSettings && (
                    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl relative">
                            <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 text-brand-muted cursor-pointer"><X size={24}/></button>
                            <h2 className="text-2xl font-black mb-2 tracking-tight">Adjust Preparation Goal</h2>
                            <p className="text-brand-muted text-sm mb-8 leading-relaxed">Updating your target date will automatically recalculate your required daily MCQ count.</p>
                            
                            <label className="text-[10px] font-black uppercase text-brand-muted ml-1">New Completion Date</label>
                            <input 
                                type="date" 
                                className="w-full mt-2 p-4 bg-brand-light border border-brand-border rounded-2xl font-bold outline-none focus:border-brand-accent transition-all"
                                onChange={(e) => setNewDate(e.target.value)}
                            />
                            
                            <button 
                                onClick={handleUpdateDate}
                                disabled={updating || !newDate}
                                className="w-full mt-6 bg-brand-dark text-white py-4 rounded-2xl font-black shadow-lg hover:bg-brand-accent transition-all cursor-pointer disabled:opacity-50"
                            >
                                {updating ? "Recalculating..." : "Save New Target"}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function DashboardSmallCard({ icon, title, value, subValue }) {
    return (
        <div className="bg-white p-8 rounded-[32px] border border-brand-border flex items-center gap-5 shadow-sm">
            <div className="bg-brand-light p-4 rounded-2xl border border-brand-border">{icon}</div>
            <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">{title}</p>
                <p className="text-xl font-black text-brand-dark truncate">{value}</p>
                <p className="text-[11px] text-brand-muted font-medium truncate">{subValue}</p>
            </div>
        </div>
    )
}

function QuickLink({ href, icon, label }) {
    return (
        <Link href={href} className="flex items-center justify-between p-4 hover:bg-brand-light rounded-2xl transition-all group">
            <div className="flex items-center gap-3 text-brand-muted group-hover:text-brand-accent">
                {icon}
                <span className="text-sm font-bold text-brand-dark">{label}</span>
            </div>
            <ChevronRight size={16} className="text-brand-border group-hover:text-brand-accent transition-all" />
        </Link>
    )
}