"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, CheckCircle2, Circle, 
  ShieldCheck, ShieldAlert, Shield, 
  Trash2, RefreshCw, ListPlus, Type
} from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

export default function BookDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newChapterInput, setNewChapterInput] = useState('');
    const [isBulkMode, setIsBulkMode] = useState(false);

    useEffect(() => { 
        if (id) fetchBookDetails(); 
    }, [id]);

    const fetchBookDetails = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo) {
                router.push('/login');
                return;
            }
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/books/${id}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setBook(data);
        } catch (err) { 
            console.error("Fetch failed:", err);
            // If the book isn't found (404), go back to library
            if (err.response?.status === 404) {
               showToast.error("Book not found in your library");
                router.push('/books');
            }
        } finally { 
            setLoading(false); 
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newChapterInput.trim()) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/books/${id}/chapters/bulk`;
            
            const names = isBulkMode 
                ? newChapterInput.split(/[\n,]+/).map(n => n.trim()).filter(n => n !== "")
                : [newChapterInput.trim()];

            await axios.post(url, { names }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            
            setNewChapterInput('');
            setIsBulkMode(false);
            fetchBookDetails();
        } catch (err) { showToast.error("Couldn't add chapters"); }
    };

    const updateChapterData = async (chapterId, update) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/books/${id}/chapters`, { chapterId, ...update }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            fetchBookDetails();
        } catch (err) { console.error(err); }
    };

    const deleteChapter = async (chapterId) => {
        const ok = await confirmAction({
    title: "Delete this chapter?",
    type: "warning",
    confirmText: "Delete",
});
if (!ok) return;
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/books/${id}/chapters`, { chapterId, deleteAction: true }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            fetchBookDetails();
         } catch (err) { showToast.error("Couldn't delete chapter"); }
    };

    // SAFETY GUARD 1: Show loading spinner while fetching
    if (loading) return (
        <div className="min-h-screen bg-brand-light flex items-center justify-center font-black animate-pulse text-brand-muted uppercase tracking-widest">
            Syncing preparation data...
        </div>
    );

    // SAFETY GUARD 2: If data didn't load or book is null, show a safe UI instead of crashing
    if (!book) return (
        <div className="min-h-screen bg-brand-light flex flex-col items-center justify-center p-6">
            <p className="font-bold text-brand-muted mb-4">Could not load book details.</p>
            <Link href="/books" className="bg-brand-dark text-white px-6 py-2 rounded-xl font-bold">Return to Library</Link>
        </div>
    );

    const completedCount = book.chapters ? book.chapters.filter(c => c.status === 'Completed').length : 0;
    const totalChapters = book.chapters ? book.chapters.length : 0;
    const highMasteryCount = book.chapters ? book.chapters.filter(c => c.confidenceLevel === 'Strong').length : 0;

    return (
        <div className="min-h-screen bg-brand-light p-6 md:p-12 pb-32">
            <div className="max-w-4xl mx-auto">
                <Link href="/books" className="flex items-center gap-2 text-brand-muted hover:text-brand-dark mb-8 font-bold text-sm transition-all">
                    <ArrowLeft size={16}/> Library
                </Link>

                <div className="bg-brand-dark text-white p-10 rounded-[40px] shadow-2xl mb-12 relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black tracking-tighter">{book.title}</h1>
                        <div className="flex gap-10 mt-8">
                           <div>
                                <p className="text-[10px] font-black uppercase opacity-40 mb-1">Progress</p>
                                <p className="text-3xl font-black">{book.currentPage || 0}%</p>
                           </div>
                           <div className="h-12 w-[1px] bg-white/10" />
                           <div>
                                <p className="text-[10px] font-black uppercase opacity-40 mb-1">Chapters Done</p>
                                <p className="text-3xl font-black text-brand-accent">{completedCount} <span className="text-lg opacity-40 font-bold">/ {totalChapters}</span></p>
                           </div>
                           <div className="h-12 w-[1px] bg-white/10 hidden md:block" />
                           <div className="hidden md:block">
                                <p className="text-[10px] font-black uppercase opacity-40 mb-1">Mastery</p>
                                <p className="text-3xl font-black">{highMasteryCount} High</p>
                           </div>
                        </div>
                    </div>
                    <div className="absolute top-[-20%] right-[-5%] w-64 h-64 bg-brand-accent/20 rounded-full blur-[100px]" />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center px-4 mb-4">
                        <h2 className="text-xs font-black uppercase tracking-widest text-brand-muted">Course Content</h2>
                        <button 
                            onClick={() => setIsBulkMode(!isBulkMode)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${isBulkMode ? 'bg-brand-accent text-white' : 'bg-white border border-brand-border text-brand-muted cursor-pointer'}`}
                        >
                            {isBulkMode ? <Type size={12}/> : <ListPlus size={12}/>}
                            {isBulkMode ? "Switch to Single" : "Bulk Add Mode"}
                        </button>
                    </div>

                    {book.chapters && book.chapters.map((chapter) => (
                        <div key={chapter._id} className="bg-white p-6 rounded-3xl border border-brand-border shadow-sm flex items-center justify-between group hover:border-brand-accent transition-all">
                            <div className="flex items-center gap-5">
                                <button onClick={() => updateChapterData(chapter._id, { status: chapter.status === 'Completed' ? 'Not Started' : 'Completed' })} className="cursor-pointer">
                                    {chapter.status === 'Completed' ? <CheckCircle2 size={26} className="text-status-success" /> : <Circle size={26} className="text-brand-border hover:text-brand-accent" />}
                                </button>
                                <div>
                                    <h3 className={`font-bold text-lg ${chapter.status === 'Completed' ? 'text-brand-muted line-through opacity-50' : ''}`}>{chapter.name}</h3>
                                    <span className="text-[9px] font-black text-brand-muted uppercase flex items-center gap-1.5 bg-brand-light px-2 py-0.5 rounded-md mt-1 w-fit">
                                        <RefreshCw size={10} className="text-brand-accent" /> Cycles: {chapter.revisionCount || 0}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <ConfidenceBtn active={chapter.confidenceLevel === 'Weak'} onClick={() => updateChapterData(chapter._id, { confidenceLevel: 'Weak' })} icon={<ShieldAlert size={18} />} color="text-red-500" bg="bg-red-50" label="Weak" />
                                <ConfidenceBtn active={chapter.confidenceLevel === 'Moderate'} onClick={() => updateChapterData(chapter._id, { confidenceLevel: 'Moderate' })} icon={<Shield size={18} />} color="text-orange-500" bg="bg-orange-50" label="Mid" />
                                <ConfidenceBtn active={chapter.confidenceLevel === 'Strong'} onClick={() => updateChapterData(chapter._id, { confidenceLevel: 'Strong' })} icon={<ShieldCheck size={18} />} color="text-green-500" bg="bg-green-50" label="High" />
                                <button onClick={() => deleteChapter(chapter._id)} className="p-2 ml-2 text-brand-muted hover:text-status-error opacity-0 group-hover:opacity-100 transition-all cursor-pointer"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}

                    <form onSubmit={handleAdd} className="mt-8">
                        {isBulkMode ? (
                            <div className="bg-white p-6 rounded-[32px] border-2 border-dashed border-brand-accent shadow-premium text-center">
                                <textarea autoFocus value={newChapterInput} onChange={(e) => setNewChapterInput(e.target.value)} placeholder="Paste chapter list here (one per line)..." className="w-full h-40 bg-transparent font-bold text-sm outline-none resize-none text-center" />
                                <button className="w-full mt-4 bg-brand-dark text-white p-4 rounded-2xl font-black hover:bg-brand-accent transition-all cursor-pointer">Add All Chapters</button>
                            </div>
                        ) : (
                            <div className="flex gap-3 p-2 bg-white rounded-[28px] border border-brand-border shadow-sm focus-within:border-brand-accent transition-all">
                                <input value={newChapterInput} onChange={(e) => setNewChapterInput(e.target.value)} placeholder="Type chapter name..." className="flex-1 bg-transparent px-6 font-bold text-sm outline-none" />
                                <button className="bg-brand-dark text-white p-4 rounded-[22px] font-bold hover:bg-brand-accent transition-all cursor-pointer"><Plus size={20} /></button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

function ConfidenceBtn({ active, onClick, icon, color, bg, label }) {
    return (
        <button onClick={onClick} className={`p-2.5 rounded-xl transition-all border flex flex-col items-center group relative cursor-pointer ${active ? `${bg} border-current ${color}` : 'bg-transparent border-transparent text-brand-border hover:bg-brand-light'}`}>
            {icon}
            {active && <span className="absolute -bottom-6 text-[8px] font-black uppercase tracking-tighter whitespace-nowrap">{label}</span>}
        </button>
    )
}