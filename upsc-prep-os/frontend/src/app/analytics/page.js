"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, AlertCircle, Calendar, Target, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

const COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#A855F7'];

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/dashboard`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setData(data);
            } catch (err) { 
                console.error("Analytics fetch failed", err); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchStats();
    }, []);

    // GITHUB GRID LOGIC - FIXED TYPO
    const generateGrid = () => {
        const weeks = [];
        const today = new Date();
        // Start from 51 weeks ago (total 52 columns) to align with today
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - (51 * 7) - today.getDay());

        for (let w = 0; w < 52; w++) { // Fixed: changed 'week' to 'w'
            const days = [];
            for (let d = 0; d < 7; d++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + (w * 7) + d);
                const dateStr = currentDate.toISOString().split('T')[0];
                const record = data?.heatmapData?.find(h => h._id === dateStr);
                days.push({ count: record ? record.count : 0, date: dateStr });
            }
            weeks.push(days);
        }
        return weeks;
    };

    const getMonthLabels = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const labels = [];
        const today = new Date();
        
        // Push last 12 months in order
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            labels.push(months[d.getMonth()]);
        }
        return labels;
    };

    if (loading) return (
        <div className="min-h-screen bg-brand-light flex items-center justify-center font-black animate-pulse uppercase tracking-widest text-brand-muted">
            Analyzing Performance...
        </div>
    );

    const grid = generateGrid();
    const monthLabels = getMonthLabels();

    return (
        <div className="min-h-screen bg-brand-light p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <Link href="/dashboard" className="flex items-center gap-2 text-brand-muted hover:text-brand-dark mb-8 font-bold text-sm transition-all">
                    <ArrowLeft size={16}/> Dashboard
                </Link>

                <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-brand-dark tracking-tighter">Performance Intelligence</h1>
                        <p className="text-brand-muted font-medium mt-1 tracking-tight">
                           {data?.totalSolvedYear || 0} questions mastered in the last year.
                        </p>
                    </div>
                    <div className="bg-brand-dark text-white p-7 rounded-[32px] shadow-2xl flex items-center gap-8 border border-white/5 relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase opacity-50 tracking-widest mb-1">Readiness Score</p>
                            <p className="text-5xl font-black">{data?.readinessScore}%</p>
                        </div>
                        <div className="h-14 w-[1px] bg-white/10 relative z-10" />
                        <TrendingUp className="text-brand-accent relative z-10" size={40} />
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    
                    {/* Mistake Analysis */}
                    <div className="bg-white p-10 rounded-[40px] border border-brand-border shadow-premium flex flex-col items-center">
                        <h2 className="text-sm font-black uppercase tracking-widest text-brand-muted mb-10 self-start flex items-center gap-2">
                            <AlertCircle size={16} /> Mistake Distribution
                        </h2>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={data?.mistakeStats.length > 0 ? data.mistakeStats : [{name: 'Waiting for Data', value: 1}]} 
                                        innerRadius={70} 
                                        outerRadius={95} 
                                        paddingAngle={8} 
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data?.mistakeStats.length > 0 ? 
                                            data.mistakeStats.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />) 
                                            : <Cell fill="#F1F5F9" />
                                        }
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Subject Accuracy */}
                    <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-brand-border shadow-premium">
                        <h2 className="text-sm font-black uppercase tracking-widest text-brand-muted mb-10 flex items-center gap-2">
                            <Target size={16} /> Subject-wise Mastery
                        </h2>
                        <div className="h-72 w-full">
                            {data?.subjectAccuracy?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.subjectAccuracy}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: '800', fill: '#737373'}} dy={15} />
                                        <YAxis hide domain={[0, 100]} />
                                        <Tooltip 
                                            cursor={{fill: '#FBFBFA'}} 
                                            contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} 
                                        />
                                        <Bar dataKey="accuracy" fill="#6366F1" radius={[12, 12, 12, 12]} barSize={45} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-brand-muted font-bold text-sm italic opacity-50">
                                    Continue practicing to see subject breakdown.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* CONSISTENCY ROADMAP (GITHUB STYLE) */}
                <div className="bg-white p-10 rounded-[40px] border border-brand-border shadow-premium">
                    <h2 className="text-sm font-black uppercase tracking-widest text-brand-muted mb-8 flex items-center gap-2">
                        <Calendar size={16} /> Consistency Roadmap
                    </h2>
                    
                    <div className="overflow-x-auto pb-4">
                        <div className="min-w-[850px]">
                            {/* Month Labels */}
                            <div className="flex text-[10px] font-bold text-brand-muted mb-3 ml-10">
                                {monthLabels.map((m, i) => (
                                    <div key={i} className="flex-1">{m}</div>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                {/* Weekday Labels */}
                                <div className="flex flex-col justify-between text-[10px] font-black text-brand-muted/40 py-1 uppercase h-[130px]">
                                    <span>Mon</span>
                                    <span>Wed</span>
                                    <span>Fri</span>
                                </div>

                                {/* The Actual Grid */}
                                <div className="flex flex-1 gap-1.5">
                                    {grid.map((week, wIdx) => (
                                        <div key={wIdx} className="flex flex-col gap-1.5">
                                            {week.map((day, dIdx) => (
                                                <motion.div 
                                                    key={dIdx}
                                                    whileHover={{ scale: 1.2, zIndex: 10 }}
                                                    title={`${day.date}: ${day.count} questions`}
                                                    className={`w-3.5 h-3.5 rounded-[3px] border border-black/5 transition-colors duration-700 ${
                                                        day.count > 20 ? 'bg-brand-accent' : 
                                                        day.count > 10 ? 'bg-brand-accent/70' : 
                                                        day.count > 0 ? 'bg-brand-accent/30' : 'bg-brand-light'
                                                    }`} 
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between text-[10px] font-black text-brand-muted uppercase px-1">
                        <p>Total Practice History (365 Days)</p>
                        <div className="flex gap-2 items-center bg-brand-light p-2.5 rounded-xl border border-brand-border">
                            <span>Less</span>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 bg-brand-light rounded-[2px] border border-black/5" />
                                <div className="w-3 h-3 bg-brand-accent/30 rounded-[2px]" />
                                <div className="w-3 h-3 bg-brand-accent/70 rounded-[2px]" />
                                <div className="w-3 h-3 bg-brand-accent rounded-[2px]" />
                            </div>
                            <span>More</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}