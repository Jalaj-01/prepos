"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings2, Book, Calendar, Play, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PracticeSetup() {
    const [taxonomies, setTaxonomies] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [limit, setLimit] = useState(10);
    const router = useRouter();

    const yearsList = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];

    useEffect(() => {
        const fetchTaxonomy = async () => {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/taxonomy`);
            setTaxonomies(data);
        };
        fetchTaxonomy();
    }, []);

    const toggle = (list, setList, id) => {
        if (list.includes(id)) setList(list.filter(i => i !== id));
        else setList([...list, id]);
    };

    const startPractice = () => {
        const params = new URLSearchParams();
        if (selectedSubjects.length) params.append('subjects', selectedSubjects.join(','));
        if (selectedTopics.length) params.append('topics', selectedTopics.join(','));
        if (selectedYears.length) params.append('years', selectedYears.join(','));
        params.append('limit', limit);
        
        router.push(`/practice?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-brand-light p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <Link href="/dashboard" className="flex items-center gap-2 text-brand-muted hover:text-brand-dark mb-8 font-bold text-sm">
                    <ArrowLeft size={16}/> Back
                </Link>

                <header className="mb-10">
                    <h1 className="text-4xl font-black text-brand-dark tracking-tighter">Customize Practice</h1>
                    <p className="text-brand-muted font-medium">Select subjects, topics, or years to focus on.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Year Selection */}
                    <div className="bg-white p-8 rounded-[32px] border border-brand-border shadow-premium">
                        <h2 className="text-sm font-black uppercase tracking-widest text-brand-muted mb-6 flex items-center gap-2">
                            <Calendar size={18} className="text-brand-accent"/> Select Years
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {yearsList.map(year => (
                                <button 
                                    key={year}
                                    onClick={() => toggle(selectedYears, setSelectedYears, year)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${selectedYears.includes(year) ? 'bg-brand-dark text-white border-brand-dark' : 'bg-brand-light border-brand-border text-brand-muted'}`}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Limit Selection */}
                    <div className="bg-white p-8 rounded-[32px] border border-brand-border shadow-premium">
                        <h2 className="text-sm font-black uppercase tracking-widest text-brand-muted mb-6 flex items-center gap-2">
                            <Settings2 size={18} className="text-brand-accent"/> Questions Count
                        </h2>
                        <div className="flex gap-4">
                            {[5, 10, 20, 50].map(val => (
                                <button key={val} onClick={() => setLimit(val)} className={`flex-1 py-3 rounded-xl font-black border-2 transition-all ${limit === val ? 'bg-brand-accent border-brand-accent text-white' : 'bg-brand-light border-brand-border text-brand-muted'}`}>
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subject/Topic Selection */}
                    <div className="md:col-span-2 bg-white p-8 rounded-[32px] border border-brand-border shadow-premium">
                        <h2 className="text-sm font-black uppercase tracking-widest text-brand-muted mb-6 flex items-center gap-2">
                            <Book size={18} className="text-brand-accent"/> Select Subjects & Topics
                        </h2>
                        <div className="space-y-6">
                            {taxonomies.filter(t => t.level === 'subject').map(subject => (
                                <div key={subject._id} className="p-4 bg-brand-light/50 rounded-2xl border border-brand-border">
                                    <button 
                                        onClick={() => toggle(selectedSubjects, setSelectedSubjects, subject._id)}
                                        className={`font-black uppercase tracking-tight text-sm mb-4 block px-4 py-1 rounded-full border-2 ${selectedSubjects.includes(subject._id) ? 'bg-brand-accent border-brand-accent text-white' : 'bg-white border-brand-border text-brand-dark'}`}
                                    >
                                        {subject.name}
                                    </button>
                                    <div className="flex flex-wrap gap-2">
                                        {taxonomies.filter(t => t.parentId?._id === subject._id).map(topic => (
                                            <button 
                                                key={topic._id}
                                                onClick={() => toggle(selectedTopics, setSelectedTopics, topic._id)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${selectedTopics.includes(topic._id) ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white border-brand-border text-brand-muted'}`}
                                            >
                                                {topic.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button 
                    onClick={startPractice}
                    className="w-full mt-10 bg-brand-dark text-white p-6 rounded-[24px] font-black text-xl shadow-xl hover:bg-brand-accent transition-all flex items-center justify-center gap-4 cursor-pointer"
                >
                    <Play fill="white"/> Start Practice Session
                </button>
            </div>
        </div>
    );
}