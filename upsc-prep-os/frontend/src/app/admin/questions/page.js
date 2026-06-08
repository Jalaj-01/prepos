"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, BookOpen, ImagePlus } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { showToast } from "@/components/ui/Toast";
import QuestionImageGallery from "@/components/admin/QuestionImageGallery";

export default function AddQuestion() {
    const [user, setUser] = useState(() => {
        try {
            const info = typeof window !== 'undefined' ? localStorage.getItem("userInfo") : null;
            return info ? JSON.parse(info) : null;
        } catch (e) {
            return null;
        }
    });
    const [taxonomies, setTaxonomies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);

    const [formData, setFormData] = useState({
        questionText: '',
        options: [
            { label: 'A', text: '' }, { label: 'B', text: '' },
            { label: 'C', text: '' }, { label: 'D', text: '' }
        ],
        correctOption: 'A',
        explanation: '',
        year: 2024,
        difficulty: 'Medium',
        paper: 'GS1',
        subjectId: '',
        topicId: ''
    });

    useEffect(() => {
        // user is initialized from localStorage via useState lazy initializer

        const fetchTaxonomy = async () => {
            try {
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/taxonomy`
                );
                setTaxonomies(data);
            } catch (err) {
                console.warn("Taxonomy fetch failed:", err.message);
            }
        };
        fetchTaxonomy();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Find subject + topic NAMES from selected IDs
            const subjectNode = taxonomies.find(t => t._id === formData.subjectId);
            const topicNode = taxonomies.find(t => t._id === formData.topicId);

            const payload = {
                questionText: formData.questionText,
                options: formData.options,
                correctOption: formData.correctOption,
                explanation: formData.explanation,
                year: parseInt(formData.year),
                difficulty: formData.difficulty,
                paper: formData.paper,
                subjectName: subjectNode?.name || "",
                topicName: topicNode?.name || "",
                taxonomyIds: [formData.subjectId, formData.topicId].filter(id => id !== ''),

                // ─── Images (NEW) ───
                images: images.map(img => ({
                    url: img.url,
                    caption: img.caption || "",
                    cloudinaryId: img.cloudinaryId || null,
                    pageNumber: img.pageNumber || null,
                })),
                questionFormat: images.length > 0 ? "Image" : "Text",
            };

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/questions/add`,
                payload,
                config
            );

            showToast.success("Question saved!");

            // Reset form
            setFormData({
                ...formData,
                questionText: '',
                explanation: '',
                options: [
                    { label: 'A', text: '' }, { label: 'B', text: '' },
                    { label: 'C', text: '' }, { label: 'D', text: '' }
                ]
            });
            setImages([]);
        } catch (error) {
            showToast.error(error.response?.data?.message || "Failed to save question");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-light p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/admin"
                    className="flex items-center gap-2 text-brand-muted hover:text-brand-dark mb-6 font-bold text-sm transition-all"
                >
                    <ArrowLeft size={16} /> Back to Content Manager
                </Link>

                <header className="mb-10">
                    <h1 className="text-3xl font-black text-brand-dark">PYQ Creator</h1>
                    <p className="text-brand-muted font-medium">
                        Add questions with rich metadata for intelligent practice.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Question & Options */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-[32px] border border-brand-border shadow-premium">
                            <label className="block text-xs font-black uppercase tracking-widest text-brand-muted mb-4">
                                Question Text
                            </label>
                            <textarea
                                required
                                className="w-full h-40 p-4 bg-brand-light border border-brand-border rounded-2xl outline-none focus:ring-2 focus:ring-brand-accent font-medium text-lg resize-none"
                                placeholder="Enter the UPSC question here..."
                                value={formData.questionText}
                                onChange={(e) =>
                                    setFormData({ ...formData, questionText: e.target.value })
                                }
                            />

                            {/* ─── IMAGES (NEW) ─── */}
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-black uppercase tracking-widest text-brand-muted">
                                        Images (optional)
                                    </label>
                                    {images.length > 0 && (
                                        <span className="text-[10px] font-black px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full uppercase">
                                            {images.length} attached
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-brand-muted font-medium mb-3 flex items-center gap-1">
                                    <ImagePlus size={11} />
                                    Upload maps, charts, diagrams — auto-saves to Cloudinary
                                </p>
                                <QuestionImageGallery
                                    images={images}
                                    onChange={setImages}
                                    token={user?.token}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                {formData.options.map((opt, index) => (
                                    <div key={opt.label} className="relative">
                                        <span className="absolute left-4 top-4 font-black text-brand-accent">
                                            {opt.label}
                                        </span>
                                        <input
                                            required
                                            className="w-full pl-10 p-4 bg-brand-light border border-brand-border rounded-xl outline-none focus:border-brand-accent font-bold text-sm"
                                            placeholder={`Option ${opt.label}`}
                                            value={opt.text}
                                            onChange={(e) => {
                                                const newOpts = [...formData.options];
                                                newOpts[index].text = e.target.value;
                                                setFormData({ ...formData, options: newOpts });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[32px] border border-brand-border shadow-premium">
                            <label className="block text-xs font-black uppercase tracking-widest text-brand-muted mb-4">
                                Detailed Explanation
                            </label>
                            <textarea
                                className="w-full h-32 p-4 bg-brand-light border border-brand-border rounded-2xl outline-none focus:ring-2 focus:ring-brand-accent font-medium text-sm"
                                placeholder="Why is this answer correct? (Source: NCERT/Laxmikant)"
                                value={formData.explanation}
                                onChange={(e) =>
                                    setFormData({ ...formData, explanation: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {/* Sidebar: Metadata */}
                    <div className="space-y-6">
                        <div className="bg-brand-dark text-white p-8 rounded-[32px] shadow-xl">
                            <h3 className="font-bold mb-6 flex items-center gap-2 underline underline-offset-4 decoration-brand-accent">
                                Metadata
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase opacity-60">
                                        Correct Answer
                                    </label>
                                    <select
                                        className="w-full mt-1 bg-white/10 border border-white/20 p-3 rounded-xl font-bold outline-none cursor-pointer"
                                        value={formData.correctOption}
                                        onChange={(e) =>
                                            setFormData({ ...formData, correctOption: e.target.value })
                                        }
                                    >
                                        {['A', 'B', 'C', 'D'].map(o => (
                                            <option key={o} value={o} className="text-black">{o}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase opacity-60">
                                        UPSC Year
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full mt-1 bg-white/10 border border-white/20 p-3 rounded-xl font-bold outline-none"
                                        value={formData.year}
                                        onChange={(e) =>
                                            setFormData({ ...formData, year: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase opacity-60">
                                        Paper
                                    </label>
                                    <select
                                        className="w-full mt-1 bg-white/10 border border-white/20 p-3 rounded-xl font-bold outline-none cursor-pointer"
                                        value={formData.paper}
                                        onChange={(e) =>
                                            setFormData({ ...formData, paper: e.target.value })
                                        }
                                    >
                                        {['GS1', 'GS2', 'GS3', 'GS4', 'Essay', 'Optional', 'CSAT'].map(p => (
                                            <option key={p} value={p} className="text-black">{p}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase opacity-60">
                                        Difficulty
                                    </label>
                                    <select
                                        className="w-full mt-1 bg-white/10 border border-white/20 p-3 rounded-xl font-bold outline-none cursor-pointer"
                                        value={formData.difficulty}
                                        onChange={(e) =>
                                            setFormData({ ...formData, difficulty: e.target.value })
                                        }
                                    >
                                        {['Easy', 'Medium', 'Hard'].map(d => (
                                            <option key={d} value={d} className="text-black">{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[32px] border border-brand-border shadow-premium">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-brand-muted">
                                        Subject
                                    </label>
                                    <select
                                        required
                                        className="w-full mt-1 p-3 bg-brand-light border border-brand-border rounded-xl font-bold text-sm outline-none cursor-pointer"
                                        value={formData.subjectId}
                                        onChange={(e) =>
                                            setFormData({ ...formData, subjectId: e.target.value, topicId: '' })
                                        }
                                    >
                                        <option value="">Select Subject</option>
                                        {taxonomies.filter(t => t.level === 'subject').map(s => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-brand-muted">
                                        Topic
                                    </label>
                                    <select
                                        required
                                        className="w-full mt-1 p-3 bg-brand-light border border-brand-border rounded-xl font-bold text-sm outline-none cursor-pointer disabled:opacity-30"
                                        disabled={!formData.subjectId}
                                        value={formData.topicId}
                                        onChange={(e) =>
                                            setFormData({ ...formData, topicId: e.target.value })
                                        }
                                    >
                                        <option value="">Select Topic</option>
                                        {taxonomies
                                            .filter(t => t.parentId?._id === formData.subjectId)
                                            .map(tp => (
                                                <option key={tp._id} value={tp._id}>{tp.name}</option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                className="w-full mt-8 bg-brand-accent text-white p-4 rounded-2xl font-black shadow-lg hover:shadow-brand-accent/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <Save size={18} /> {loading ? "Saving..." : "Save PYQ"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}