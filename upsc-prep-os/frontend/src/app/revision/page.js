"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Calendar, CheckCircle2, 
  ArrowRight, Brain, LayoutDashboard, 
  Clock, Sparkles, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

export default function RevisionQueue() {
    const [dueItems, setDueAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDueRevisions();
    }, []);

    const fetchDueRevisions = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/revisions/due`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setDueAttempts(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="min-h-screen bg-brand-light flex items-center justify-center font-black animate-pulse">LOADING MISTAKE BANK...</div>;

    return (
        <div className="min-h-screen bg-brand-light p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-brand-dark tracking-tighter">Revision Center</h1>
                        <p className="text-brand-muted font-medium mt-1">Smart Spaced Repetition for your past mistakes.</p>
                    </div>
                    <Link href="/dashboard" className="p-3 bg-white border border-brand-border rounded-2xl hover:bg-brand-light transition-all shadow-sm">
                        <LayoutDashboard size={20} />
                    </Link>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Summary Card */}
                    <div className="space-y-6">
                        <div className="bg-brand-dark text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                            <Sparkles className="absolute top-4 right-4 text-brand-accent opacity-50" size={24} />
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Pending Items</p>
                            <h2 className="text-5xl font-black mb-4">{dueItems.length}</h2>
                            <p className="text-sm font-medium opacity-70 leading-relaxed">
                                These questions are due for revision based on your memory cycle.
                            </p>
                            <Link href="/practice" className="mt-8 block bg-brand-accent text-white p-4 rounded-2xl font-bold text-center hover:scale-[1.02] transition-all">
                                Start Revision Session
                            </Link>
                        </div>

                        <div className="bg-white p-6 rounded-[32px] border border-brand-border shadow-sm">
                            <h3 className="text-xs font-black uppercase text-brand-muted mb-4 flex items-center gap-2">
                                <Clock size={14} /> Memory Intervals
                            </h3>
                            <div className="space-y-3">
                                {[1, 3, 7, 21].map((day, i) => (
                                    <div key={day} className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-brand-dark">Stage {i+1}</span>
                                        <span className="text-[10px] font-bold bg-brand-light px-2 py-1 rounded-md text-brand-muted">{day} Days</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: The Queue */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-xs font-black uppercase text-brand-muted px-4 mb-2 tracking-widest flex items-center gap-2">
                            <RefreshCw size={14} /> The Revision Queue
                        </h3>

                        {dueItems.length === 0 ? (
                            <div className="bg-white rounded-[40px] border border-brand-border p-12 text-center">
                                <div className="bg-brand-light w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={32} className="text-status-success" />
                                </div>
                                <h4 className="text-lg font-bold">Zero items due today!</h4>
                                <p className="text-sm text-brand-muted mt-1">Your revision schedule is completely clear.</p>
                            </div>
                        ) : (
                            dueItems.map((item) => (
                                <motion.div 
                                    key={item._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white p-6 rounded-3xl border border-brand-border shadow-sm flex items-center justify-between group hover:border-brand-accent transition-all"
                                >
                                    <div className="flex-1 pr-8">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[9px] font-black text-white bg-status-error px-2 py-0.5 rounded-full uppercase">Previous Mistake</span>
                                            <span className="text-[9px] font-black text-brand-muted uppercase">Stage {item.revisionStage || 0}</span>
                                        </div>
                                        <h4 className="font-bold text-brand-dark line-clamp-1">{item.questionId?.questionText}</h4>
                                    </div>
                                    <Link 
                                        href={`/practice?id=${item.questionId?._id}`}
                                        className="p-3 bg-brand-light rounded-2xl text-brand-dark group-hover:bg-brand-accent group-hover:text-white transition-all"
                                    >
                                        <ArrowRight size={20} />
                                    </Link>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}