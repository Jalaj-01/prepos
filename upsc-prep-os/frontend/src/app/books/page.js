"use client";

import { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import {
    BookOpen,
    Plus,
    ChevronRight,
    Bookmark,
    LayoutDashboard,
    ArrowLeft,
    Trash2,
    ListPlus,
    Type
} from 'lucide-react';

import axios from 'axios';

import Link from 'next/link';

import Footer from "@/components/layout/Footer";
import { showToast } from "@/components/ui/Toast";
import { confirmAction } from "@/components/ui/ConfirmModal";

export default function BookTracker() {

    const [books, setBooks] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);

    const [isBulkMode, setIsBulkMode] = useState(false);

    const [singleBook, setSingleBook] = useState({
        title: '',
        author: '',
        totalPages: ''
    });

    const [bulkInput, setBulkInput] = useState('');

    useEffect(() => { fetchBooks(); }, []);

    const fetchBooks = async () => {

        try {

            const userInfo = JSON.parse(localStorage.getItem('userInfo'));

            const { data } = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/books`,
                {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                }
            );

            setBooks(data);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {

        e.preventDefault();

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));

        const config = {
            headers: { Authorization: `Bearer ${userInfo.token}` }
        };

        try {

            if (isBulkMode) {

                const bookLines = bulkInput.split('\n').filter(line => line.trim() !== '');

                const booksArray = bookLines.map(line => {
                    const [title, author, pages] = line.split(',');
                    return {
                        title,
                        author: author || "Unknown",
                        totalPages: pages || 0
                    };
                });

                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/books/add/bulk`,
                    { books: booksArray },
                    config
                );

            } else {

                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/books/add`,
                    singleBook,
                    config
                );
            }

            setShowAddModal(false);
            setBulkInput('');
            setSingleBook({ title: '', author: '', totalPages: '' });
            fetchBooks();

        } catch (err) {
            showToast.error("Couldn't add the book");
        }
    };

    const handleDeleteBook = async (id) => {

        const ok = await confirmAction({
    title: "Remove this book?",
    message: "All chapters will be deleted too. This cannot be undone.",
    type: "warning",
    confirmText: "Remove",
});
if (!ok) return;

        try {

            const userInfo = JSON.parse(localStorage.getItem('userInfo'));

            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/api/books/${id}`,
                {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                }
            );

            fetchBooks();

        } catch (err) {
            showToast.error("Couldn't delete the book");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-brand-light flex items-center justify-center font-black animate-pulse">
            SYNCING LIBRARY...
        </div>
    );

    return (

        <div className="min-h-screen bg-brand-light flex flex-col">

            <div className="flex-1 p-6 md:p-12">

                <div className="max-w-6xl mx-auto">

                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-brand-muted hover:text-brand-dark mb-8 font-bold text-sm transition-all"
                    >
                        <ArrowLeft size={16} /> Dashboard
                    </Link>

                    <header className="flex justify-between items-end mb-12 flex-wrap gap-4">

                        <div>

                            <h1 className="text-4xl font-black text-brand-dark tracking-tighter">

                                Physical Study Tracker

                            </h1>

                            <p className="text-brand-muted font-medium mt-1 tracking-tight">

                                Sync your physical readings with digital preparation data.

                            </p>

                        </div>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-brand-dark text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-accent transition-all shadow-lg cursor-pointer"
                        >
                            <Plus size={20} /> Add New Book
                        </button>

                    </header>

                    {books.length === 0 ? (

                        <div className="bg-white rounded-[40px] border border-brand-border p-16 text-center">

                            <div className="text-6xl mb-4">📚</div>

                            <h2 className="text-2xl font-black text-brand-dark mb-2">

                                No books yet

                            </h2>

                            <p className="text-brand-muted font-bold text-sm mb-6">

                                Add your first book to start tracking your physical study progress

                            </p>

                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center gap-2 px-5 py-3 bg-brand-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-accent transition-all"
                            >
                                <Plus size={14} />
                                Add First Book
                            </button>

                        </div>

                    ) : (

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                            {books.map((book) => (

                                <motion.div
                                    key={book._id}
                                    whileHover={{ y: -5 }}
                                    className="bg-white rounded-[40px] border border-brand-border p-8 shadow-premium relative group"
                                >

                                    <div className="flex justify-between items-start mb-6">

                                        <div className="bg-brand-light p-3 rounded-2xl text-brand-accent">

                                            <Bookmark size={24} />

                                        </div>

                                        <div className="flex items-center gap-2">

                                            <div className="text-[10px] font-black text-brand-muted uppercase bg-brand-light px-2 py-1 rounded-md">

                                                {book.chapters?.filter(c => c.status === 'Completed').length || 0} / {book.chapters?.length || 0} Chapters

                                            </div>

                                            <button
                                                onClick={() => handleDeleteBook(book._id)}
                                                className="p-2 text-brand-muted hover:text-status-error opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                        </div>

                                    </div>

                                    <h3 className="text-2xl font-black text-brand-dark mb-1 truncate tracking-tight">

                                        {book.title}

                                    </h3>

                                    <p className="text-sm font-medium text-brand-muted mb-8">

                                        {book.author}

                                    </p>

                                    <div className="space-y-4">

                                        <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-brand-muted">

                                            <span>Preparation Level</span>

                                            <span className="text-brand-dark text-xs">

                                                {book.currentPage}%

                                            </span>

                                        </div>

                                        <div className="w-full bg-brand-light h-2.5 rounded-full overflow-hidden border border-brand-border">

                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${book.currentPage}%` }}
                                                className="bg-brand-accent h-full shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                                            />

                                        </div>

                                        <div className="pt-4">

                                            <Link
                                                href={`/books/${book._id}`}
                                                className="w-full bg-brand-light text-brand-dark py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-accent hover:text-white transition-all"
                                            >
                                                Manage Chapters <ChevronRight size={14} />
                                            </Link>

                                        </div>

                                    </div>

                                </motion.div>
                            ))}

                        </div>
                    )}

                </div>

            </div>

            <Footer />

            {/* MODAL (ADD BOOK) */}

            <AnimatePresence>

                {showAddModal && (

                    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl"
                        >

                            <div className="flex justify-between items-center mb-8">

                                <h2 className="text-2xl font-black">Add to Library</h2>

                                <button
                                    onClick={() => setIsBulkMode(!isBulkMode)}
                                    className="text-[9px] font-black uppercase bg-brand-light px-3 py-1.5 rounded-full text-brand-muted border border-brand-border hover:bg-brand-accent hover:text-white transition-all"
                                >
                                    {isBulkMode ? "Single Mode" : "Bulk Mode"}
                                </button>

                            </div>

                            <form onSubmit={handleAdd} className="space-y-5">

                                {isBulkMode ? (

                                    <div>

                                        <p className="text-[10px] font-black text-brand-accent uppercase mb-3 tracking-widest">

                                            Format: Title, Author, Pages

                                        </p>

                                        <textarea
                                            required
                                            className="w-full h-48 p-5 bg-brand-light border border-brand-border rounded-[24px] font-bold outline-none resize-none text-sm focus:border-brand-accent"
                                            placeholder="Laxmikant, Polity, 850&#10;Spectrum, History, 600"
                                            value={bulkInput}
                                            onChange={e => setBulkInput(e.target.value)}
                                        />

                                    </div>

                                ) : (

                                    <>

                                        <div>

                                            <label className="text-[10px] font-black uppercase text-brand-muted ml-2">

                                                Book Title

                                            </label>

                                            <input
                                                required
                                                className="w-full mt-1.5 p-4 bg-brand-light border border-brand-border rounded-2xl font-bold outline-none focus:border-brand-accent"
                                                placeholder="e.g. M. Laxmikant"
                                                value={singleBook.title}
                                                onChange={e => setSingleBook({ ...singleBook, title: e.target.value })}
                                            />

                                        </div>

                                        <div>

                                            <label className="text-[10px] font-black uppercase text-brand-muted ml-2">

                                                Subject / Author

                                            </label>

                                            <input
                                                className="w-full mt-1.5 p-4 bg-brand-light border border-brand-border rounded-2xl font-bold outline-none focus:border-brand-accent"
                                                placeholder="e.g. Indian Polity"
                                                value={singleBook.author}
                                                onChange={e => setSingleBook({ ...singleBook, author: e.target.value })}
                                            />

                                        </div>

                                        <div>

                                            <label className="text-[10px] font-black uppercase text-brand-muted ml-2">

                                                Approx. Pages

                                            </label>

                                            <input
                                                type="number"
                                                required
                                                className="w-full mt-1.5 p-4 bg-brand-light border border-brand-border rounded-2xl font-bold outline-none focus:border-brand-accent"
                                                placeholder="e.g. 850"
                                                value={singleBook.totalPages}
                                                onChange={e => setSingleBook({ ...singleBook, totalPages: e.target.value })}
                                            />

                                        </div>

                                    </>
                                )}

                                <div className="flex gap-4 pt-4">

                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 p-4 rounded-2xl font-bold text-brand-muted"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="flex-1 bg-brand-dark text-white p-4 rounded-2xl font-black shadow-lg hover:bg-brand-accent transition-all"
                                    >
                                        Register Book
                                    </button>

                                </div>

                            </form>

                        </motion.div>

                    </div>
                )}

            </AnimatePresence>

        </div>
    );
}