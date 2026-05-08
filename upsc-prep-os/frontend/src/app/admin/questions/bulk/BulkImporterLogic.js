"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Wand2, Save, Trash2, CheckCircle, FileUp, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function BulkImporterLogic() {
    const [rawText, setRawText] = useState('');
    const [parsedQuestions, setParsedQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [extracting, setExtracting] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || file.type !== 'application/pdf') {
            alert("Please upload a valid PDF.");
            return;
        }

        setExtracting(true);
        try {
            // Import helper only when needed
            const { extractTextFromPDF } = await import('@/lib/pdfHelper');
            const text = await extractTextFromPDF(file);
            setRawText(text);
        } catch (err) {
            console.error(err);
            alert("Error reading PDF. Please try pasting text manually.");
        } finally {
            setExtracting(false);
        }
    };

    const handleParse = () => {
        if (!rawText.trim()) return;
        const questionBlocks = rawText.split(/\n(?=\d+\.)/); 
        const parsed = questionBlocks.map(block => {
            const lines = block.trim().split('\n');
            const qText = lines[0].replace(/^\d+\.\s*/, '');
            const getOpt = (letter) => {
                const regex = new RegExp(`\\(${letter}\\)\\s*(.*?)(?=\\s*\\([a-d]\\)|$)`, 'i');
                const match = block.match(regex);
                return match ? match[1].trim() : '';
            };
            return {
                questionText: qText,
                options: [
                    { label: 'A', text: getOpt('a') },
                    { label: 'B', text: getOpt('b') },
                    { label: 'C', text: getOpt('c') },
                    { label: 'D', text: getOpt('d') }
                ],
                correctOption: 'A',
                explanation: 'Parsed from PDF Source',
                year: 2024,
                taxonomyIds: []
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
            alert(`Successfully added ${parsedQuestions.length} questions!`);
            setParsedQuestions([]);
            setRawText('');
        } catch (err) {
            alert("Upload failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
            <div className="space-y-8">
                <div className="bg-white p-8 rounded-[40px] border-2 border-dashed border-brand-border hover:border-brand-accent transition-all text-center relative group shadow-sm">
                    <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center">
                        <div className="bg-brand-accent/5 p-4 rounded-2xl text-brand-accent mb-3 group-hover:scale-110 transition-transform">
                            {extracting ? <Loader2 className="animate-spin" size={28}/> : <FileUp size={28}/>}
                        </div>
                        <h3 className="font-black text-brand-dark text-sm uppercase tracking-widest">
                            {extracting ? "Extracting..." : "Upload PDF Source"}
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-brand-border shadow-premium">
                    <div className="flex items-center gap-2 mb-6 text-[10px] font-black text-brand-muted uppercase tracking-widest">
                        <FileText size={14} /> Raw Content
                    </div>
                    <textarea 
                        className="w-full h-80 p-6 bg-brand-light border border-brand-border rounded-[32px] font-medium text-sm outline-none focus:border-brand-accent resize-none"
                        placeholder="Paste text here or upload PDF..."
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                    />
                </div>

                <button 
                    onClick={handleParse}
                    disabled={extracting || !rawText}
                    className="w-full bg-brand-dark text-white p-5 rounded-[24px] font-black flex items-center justify-center gap-3 hover:bg-brand-accent transition-all shadow-lg cursor-pointer disabled:opacity-30"
                >
                    <Wand2 size={20} /> Run Smart Parser
                </button>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center px-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-brand-muted flex items-center gap-2">
                        <CheckCircle size={16} /> Review ({parsedQuestions.length})
                    </h2>
                    {parsedQuestions.length > 0 && (
                        <button onClick={handleUploadToDB} disabled={loading} className="text-xs font-black text-brand-accent flex items-center gap-1 hover:underline">
                            <Save size={14}/> {loading ? "Saving..." : "Save to DB"}
                        </button>
                    )}
                </div>

                <div className="max-h-[750px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                    {parsedQuestions.length === 0 ? (
                        <div className="bg-white/40 border-2 border-dashed border-brand-border rounded-[40px] p-24 text-center">
                            <p className="text-brand-muted font-bold text-sm opacity-60">No questions parsed yet.</p>
                        </div>
                    ) : (
                        parsedQuestions.map((q, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-[32px] border border-brand-border shadow-sm group hover:border-brand-accent transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <p className="text-[10px] font-black text-brand-accent uppercase">Question {idx+1}</p>
                                    <button onClick={() => setParsedQuestions(parsedQuestions.filter((_, i) => i !== idx))} className="text-brand-muted hover:text-status-error opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                                </div>
                                <h3 className="font-bold text-brand-dark text-sm leading-relaxed mb-4">{q.questionText}</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {q.options.map(o => (
                                        <div key={o.label} className="text-[10px] font-bold bg-brand-light p-2 rounded-xl border border-brand-border truncate">
                                            <span className="text-brand-accent mr-1">{o.label}:</span> {o.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}