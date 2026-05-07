"use client";
import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Wand2, Save, Trash2, CheckCircle, ArrowLeft, Upload, FileUp, Loader2 } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { extractTextFromPDF } from '@/lib/pdfHelper';

function BulkImporterContent() {
    const [rawText, setRawText] = useState('');
    const [parsedQuestions, setParsedQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [metadata, setMetadata] = useState({ year: 2024 });

    // 1. Handle PDF Upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || file.type !== 'application/pdf') {
            alert("Please upload a valid PDF file.");
            return;
        }

        setExtracting(true);
        try {
            const text = await extractTextFromPDF(file);
            setRawText(text);
        } catch (err) {
            console.error(err);
            alert("Failed to extract text from PDF.");
        } finally {
            setExtracting(false);
        }
    };

    // 2. Smart Parser Logic (Regex based for UPSC patterns)
    const handleParse = () => {
        // Splits by digits followed by a dot at start of line (e.g., 1. or 22.)
        const questionBlocks = rawText.split(/\n(?=\d+\.)/); 
        
        const parsed = questionBlocks.map(block => {
            const lines = block.trim().split('\n');
            const qText = lines[0].replace(/^\d+\.\s*/, '');
            
            // Regex to find options like (a), (b), (c), (d)
            const getOpt = (letter) => {
                const regex = new RegExp(`\\(${letter}\\)\\s*(.*?)(?=\\s*\\([a-d]\\)|$)`, 'i');
                const match = block.match(regex);
                return match ? match[1].trim() : '';
            };

            const options = [
                { label: 'A', text: getOpt('a') },
                { label: 'B', text: getOpt('b') },
                { label: 'C', text: getOpt('c') },
                { label: 'D', text: getOpt('d') }
            ];

            return {
                questionText: qText,
                options,
                correctOption: 'A', // Default for review
                explanation: 'Parsed from PDF',
                year: metadata.year,
                taxonomyIds: [] // User can tag these in database later or we can add bulk tagging
            };
        });

        setParsedQuestions(parsed.filter(q => q.questionText.length > 10));
    };

    const handleUploadToDB = async () => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/bulk`, 
                { questions: parsedQuestions },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );
            alert(`Success! ${parsedQuestions.length} questions added.`);
            setParsedQuestions([]);
            setRawText('');
        } catch (err) {
            alert("Database upload failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-light p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <Link href="/admin" className="flex items-center gap-2 text-brand-muted hover:text-brand-dark mb-8 font-bold text-sm">
                    <ArrowLeft size={16}/> Admin Dashboard
                </Link>

                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-brand-dark tracking-tighter">AI Bulk Importer</h1>
                        <p className="text-brand-muted font-medium mt-1">Upload PDF or paste text to generate structured PYQs.</p>
                    </div>
                    {parsedQuestions.length > 0 && (
                        <button onClick={handleUploadToDB} className="bg-brand-accent text-white px-8 py-4 rounded-2xl font-black shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
                            <Save size={20}/> Upload to Database
                        </button>
                    )}
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        {/* PDF UPLOAD ZONE */}
                        <div className="bg-white p-8 rounded-[40px] border-2 border-dashed border-brand-border hover:border-brand-accent transition-all text-center relative group">
                            <input 
                                type="file" 
                                accept=".pdf" 
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center">
                                <div className="bg-brand-accent/10 p-4 rounded-2xl text-brand-accent mb-4 group-hover:scale-110 transition-transform">
                                    {extracting ? <Loader2 className="animate-spin" size={32}/> : <FileUp size={32}/>}
                                </div>
                                <h3 className="font-bold text-brand-dark">
                                    {extracting ? "Extracting Text..." : "Upload UPSC PDF"}
                                </h3>
                                <p className="text-xs text-brand-muted mt-1">Drag and drop or click to browse</p>
                            </div>
                        </div>

                        {/* TEXT AREA */}
                        <div className="bg-white p-8 rounded-[40px] border border-brand-border shadow-premium">
                            <textarea 
                                className="w-full h-80 p-6 bg-brand-light border border-brand-border rounded-3xl font-medium text-sm outline-none focus:border-brand-accent resize-none"
                                placeholder="Extracted text will appear here... you can also paste manually."
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                            />
                            <button 
                                onClick={handleParse}
                                className="w-full mt-6 bg-brand-dark text-white p-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-brand-accent transition-all"
                            >
                                <Wand2 size={20} /> {extracting ? "Wait for extraction..." : "Run Smart Parser"}
                            </button>
                        </div>
                    </div>

                    {/* PREVIEW AREA */}
                    <div className="space-y-4 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
                        <div className="flex justify-between items-center px-4 mb-4">
                            <h2 className="text-sm font-black uppercase tracking-widest text-brand-muted flex items-center gap-2">
                                <CheckCircle size={18} /> Preview ({parsedQuestions.length})
                            </h2>
                        </div>
                        {parsedQuestions.length === 0 && (
                            <div className="bg-white/50 border-2 border-dashed border-brand-border rounded-[40px] p-20 text-center text-brand-muted font-bold">
                                No questions parsed yet.
                            </div>
                        )}
                        {parsedQuestions.map((q, idx) => (
                            <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} key={idx} className="bg-white p-6 rounded-[32px] border border-brand-border shadow-sm relative group">
                                <p className="text-[10px] font-black text-brand-accent mb-2">Q{idx+1}</p>
                                <h3 className="font-bold text-brand-dark text-sm leading-relaxed mb-4">{q.questionText}</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {q.options.map(o => (
                                        <div key={o.label} className={`text-[10px] font-bold p-2 rounded-lg border ${o.text ? 'bg-brand-light border-brand-border' : 'bg-red-50 border-red-100 text-red-400'}`}>
                                            <span className="text-brand-accent mr-1">{o.label}:</span> {o.text || 'Missing'}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BulkImporter() {
    return (
        <Suspense fallback={<div>Loading Parser...</div>}>
            <BulkImporterContent />
        </Suspense>
    );
}