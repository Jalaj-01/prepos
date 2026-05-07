"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FolderTree, Book, Trash2, LayoutDashboard, Layers, ListPlus } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

export default function AdminPanel() {
    const [taxonomies, setTaxonomies] = useState([]);
    const [subjectInput, setSubjectInput] = useState('');
    const [topicInput, setTopicInput] = useState('');
    const [selectedParent, setSelectedParent] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchTaxonomy(); }, []);

    const fetchTaxonomy = async () => {
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/taxonomy`);
            setTaxonomies(data);
        } catch (err) { console.error(err); }
    };

    const handleBulkSubmit = async (type) => {
        setLoading(true);
        const input = type === 'subject' ? subjectInput : topicInput;
        // Split by new line or comma, then remove empty strings
        const namesArray = input.split(/[\n,]+/).map(n => n.trim()).filter(n => n !== '');

        if (namesArray.length === 0) {
            alert("Please enter at least one name.");
            setLoading(false);
            return;
        }

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/taxonomy`, {
                names: namesArray,
                level: type,
                parentId: type === 'topic' ? selectedParent : null
            }, config);
            
            if(type === 'subject') setSubjectInput('');
            else setTopicInput('');
            
            fetchTaxonomy();
        } catch (error) {
            alert(error.response?.data?.message || "Action failed");
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (id) => {
        if(!confirm("Delete this item and its associations?")) return;
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`http://localhost:5000/api/taxonomy/${id}`, config);
        fetchTaxonomy();
    };

    return (
        <div className="min-h-screen bg-brand-light p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-brand-dark">Content Manager</h1>
                        <p className="text-brand-muted font-medium">Manage Subjects & Topics side-by-side</p>
                    </div>
                    <Link href="/dashboard" className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-brand-border font-bold text-sm hover:bg-brand-light transition-all">
                        <LayoutDashboard size={18} /> Dashboard
                    </Link>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN: SEPARATE ADDING CARDS */}
                    <div className="space-y-6 h-fit sticky top-10">
                        
                        {/* 1. BULK SUBJECTS CARD */}
                        <div className="bg-white p-6 rounded-[24px] border border-brand-border shadow-premium">
                            <h2 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-brand-dark">
                                <Layers size={16} className="text-brand-accent" /> Add Subjects
                            </h2>
                            <textarea 
                                className="w-full p-4 bg-brand-light border border-brand-border rounded-2xl focus:ring-2 focus:ring-brand-accent outline-none font-medium text-sm transition-all h-24 resize-none"
                                placeholder="Polity, History, Economy..."
                                value={subjectInput}
                                onChange={(e) => setSubjectInput(e.target.value)}
                            />
                            <button 
                                onClick={() => handleBulkSubmit('subject')}
                                className="w-full mt-3 bg-brand-dark text-white py-3 rounded-xl font-bold text-sm hover:bg-brand-accent transition-all cursor-pointer"
                            >
                                Create Subjects
                            </button>
                        </div>

                        {/* 2. BULK TOPICS CARD */}
                        <div className="bg-white p-6 rounded-[24px] border border-brand-border shadow-premium">
                            <h2 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-brand-dark">
                                <ListPlus size={16} className="text-orange-500" /> Add Topics
                            </h2>
                            <select 
                                className="w-full mb-3 p-3 bg-brand-light border border-brand-border rounded-xl font-bold text-sm outline-none cursor-pointer"
                                value={selectedParent}
                                onChange={(e) => setSelectedParent(e.target.value)}
                            >
                                <option value="">Select Subject</option>
                                {taxonomies.filter(t => t.level === 'subject').map(s => (
                                    <option key={s._id} value={s._id}>{s.name}</option>
                                ))}
                            </select>
                            <textarea 
                                className="w-full p-4 bg-brand-light border border-brand-border rounded-2xl focus:ring-2 focus:ring-brand-accent outline-none font-medium text-sm transition-all h-32 resize-none"
                                placeholder="Fundamental Rights, Preamble, Parliament..."
                                value={topicInput}
                                onChange={(e) => setTopicInput(e.target.value)}
                            />
                            <button 
                                onClick={() => handleBulkSubmit('topic')}
                                className="w-full mt-3 bg-brand-dark text-white py-3 rounded-xl font-bold text-sm hover:bg-brand-accent transition-all cursor-pointer disabled:opacity-50"
                                disabled={!selectedParent}
                            >
                                Add Topics to Subject
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: ACTIVE STRUCTURE LIST */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-sm font-black uppercase tracking-widest mb-4 px-2 flex items-center gap-2 text-brand-muted">
                            <FolderTree size={16} /> Active Structure
                        </h2>
                        
                        {taxonomies.filter(t => t.level === 'subject').map(subject => (
                            <div key={subject._id} className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-sm hover:shadow-premium transition-all mb-4">
                                <div className="bg-brand-light/50 p-5 flex justify-between items-center border-b border-brand-border">
                                    <div className="flex items-center gap-3 font-black text-brand-dark uppercase tracking-tight">
                                        <Book size={18} className="text-brand-accent" />
                                        {subject.name}
                                    </div>
                                    <button onClick={() => deleteItem(subject._id)} className="text-brand-muted hover:text-status-error transition-colors cursor-pointer">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="p-5 flex flex-wrap gap-2">
                                    {taxonomies.filter(t => t.parentId?._id === subject._id).map(topic => (
                                        <div key={topic._id} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-brand-border rounded-xl text-xs font-bold text-brand-dark hover:border-brand-accent transition-all group">
                                            {topic.name}
                                            <button onClick={() => deleteItem(topic._id)} className="opacity-0 group-hover:opacity-100 text-brand-muted hover:text-status-error transition-all cursor-pointer">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {taxonomies.filter(t => t.parentId?._id === subject._id).length === 0 && (
                                        <p className="text-[10px] font-bold text-brand-muted uppercase">No topics added yet.</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}