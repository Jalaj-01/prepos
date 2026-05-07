"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Target, Medal, ArrowLeft, LayoutDashboard, Zap } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

export default function Rankings() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('consistency');

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/leaderboard`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setData(data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchRankings();
    }, []);

    if (loading) return <div className="min-h-screen bg-brand-light flex items-center justify-center font-black animate-pulse text-brand-muted">CALCULATING STANDINGS...</div>;

    const currentList = activeTab === 'consistency' ? data?.consistency : data?.accuracy;

    return (
        <div className="min-h-screen bg-brand-light p-6 md:p-12 pb-32">
            <div className="max-w-4xl mx-auto">
                <Link href="/dashboard" className="flex items-center gap-2 text-brand-muted hover:text-brand-dark mb-8 font-bold text-sm transition-all">
                    <ArrowLeft size={16}/> Dashboard
                </Link>

                <header className="mb-12">
                    <h1 className="text-4xl font-black text-brand-dark tracking-tighter flex items-center gap-3">
                        Discipline Leaderboard <Trophy className="text-brand-accent" size={32} />
                    </h1>
                    <p className="text-brand-muted font-medium mt-1">UPSC is a marathon. Celebrate consistency over speed.</p>
                </header>

                {/* Tab Switcher */}
                <div className="flex bg-white p-2 rounded-[24px] border border-brand-border shadow-sm mb-10 max-w-sm">
                    <button 
                        onClick={() => setActiveTab('consistency')}
                        className={`flex-1 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'consistency' ? 'bg-brand-dark text-white' : 'text-brand-muted hover:bg-brand-light'}`}
                    >
                        <Flame size={14} /> Consistency
                    </button>
                    <button 
                        onClick={() => setActiveTab('accuracy')}
                        className={`flex-1 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'accuracy' ? 'bg-brand-dark text-white' : 'text-brand-muted hover:bg-brand-light'}`}
                    >
                        <Target size={14} /> Accuracy
                    </button>
                </div>

                {/* Ranking List */}
                <div className="space-y-3">
                    {currentList?.map((item, index) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={index}
                            className={`p-6 rounded-[32px] border flex items-center justify-between transition-all ${index === 0 ? 'bg-brand-dark text-white border-brand-dark shadow-xl scale-[1.02]' : 'bg-white text-brand-dark border-brand-border hover:border-brand-accent'}`}
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg ${index === 0 ? 'bg-brand-accent text-white' : 'bg-brand-light text-brand-muted'}`}>
                                    {index + 1}
                                </div>
                                <div>
                                    <h3 className="font-black tracking-tight">{item.name}</h3>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${index === 0 ? 'opacity-60' : 'text-brand-muted'}`}>
                                        {activeTab === 'consistency' ? 'Continuous Streak' : 'Session Accuracy'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black">{activeTab === 'consistency' ? item.streak : item.value}</span>
                                <span className="text-sm font-bold opacity-60">
                                    {activeTab === 'consistency' ? <Zap size={18} fill={index === 0 ? '#6366F1' : '#737373'} /> : '%'}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* User's Context Note */}
                <div className="mt-12 bg-indigo-50 border border-indigo-100 p-8 rounded-[40px] flex items-start gap-6">
                    <div className="bg-brand-accent p-4 rounded-2xl text-white">
                        <Medal size={24} />
                    </div>
                    <div>
                        <h4 className="text-brand-accent font-black uppercase text-xs tracking-widest mb-1">Your Standing</h4>
                        <p className="text-brand-dark font-medium leading-relaxed">
                            You are currently in the <strong>Top 15%</strong> of aspirants for consistency this week. Keep your streak alive to enter the Top 10.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}