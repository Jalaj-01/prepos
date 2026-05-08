// "use client";
// import { useState, Suspense } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//     FileText, Wand2, Save, Trash2, CheckCircle, 
//     ArrowLeft, FileUp, Loader2 
// } from 'lucide-react';
// import axios from 'axios';
// import Link from 'next/link';

// function BulkImporterContent() {
//     const [rawText, setRawText] = useState('');
//     const [parsedQuestions, setParsedQuestions] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [extracting, setExtracting] = useState(false);

//     // 1. PDF Extraction Logic
//     const handleFileUpload = async (e) => {
//         const file = e.target.files[0];
//         if (!file || file.type !== 'application/pdf') {
//             alert("Please upload a valid PDF.");
//             return;
//         }

//         setExtracting(true);
//         try {
//             const { extractTextFromPDF } = await import('@/lib/pdfHelper');
//             const text = await extractTextFromPDF(file);
//             setRawText(text);
//         } catch (err) {
//             console.error(err);
//             alert("Error reading PDF. Try pasting text manually.");
//         } finally {
//             setExtracting(false);
//         }
//     };

//     // 2. Parser Logic
//     const handleParse = () => {
//         const questionBlocks = rawText.split(/\n(?=\d+\.)/); 
//         const parsed = questionBlocks.map(block => {
//             const lines = block.trim().split('\n');
//             const qText = lines[0].replace(/^\d+\.\s*/, '');
//             const getOpt = (letter) => {
//                 const regex = new RegExp(`\\(${letter}\\)\\s*(.*?)(?=\\s*\\([a-d]\\)|$)`, 'i');
//                 const match = block.match(regex);
//                 return match ? match[1].trim() : '';
//             };
//             return {
//                 questionText: qText,
//                 options: [
//                     { label: 'A', text: getOpt('a') },
//                     { label: 'B', text: getOpt('b') },
//                     { label: 'C', text: getOpt('c') },
//                     { label: 'D', text: getOpt('d') }
//                 ],
//                 correctOption: 'A',
//                 explanation: 'Parsed from Bulk Input',
//                 year: 2024,
//                 taxonomyIds: []
//             };
//         });
//         setParsedQuestions(parsed.filter(q => q.questionText.length > 10));
//     };

//     const handleUploadToDB = async () => {
//         setLoading(true);
//         try {
//             const userInfo = JSON.parse(localStorage.getItem('userInfo'));
//             await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/bulk`, 
//                 { questions: parsedQuestions },
//                 { headers: { Authorization: `Bearer ${userInfo.token}` } }
//             );
//             alert(`Success! ${parsedQuestions.length} questions added.`);
//             setParsedQuestions([]);
//             setRawText('');
//         } catch (err) { alert("Upload failed."); }
//         finally { setLoading(false); }
//     };

//     return (
//         <div className="min-h-screen bg-brand-light p-6 md:p-12">
//             <div className="max-w-6xl mx-auto">
//                 <header className="mb-10">
//                     <Link href="/admin" className="flex items-center gap-2 text-brand-muted hover:text-brand-dark mb-4 font-bold text-sm transition-all">
//                         <ArrowLeft size={16}/> Back
//                     </Link>
//                     <h1 className="text-4xl font-black text-brand-dark tracking-tight">AI Bulk Importer</h1>
//                     <p className="text-brand-muted font-medium mt-1 tracking-tight">Paste text from UPSC PDFs to auto-generate question cards.</p>
//                 </header>

//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
//                     {/* LEFT SIDE: INPUT */}
//                     <div className="space-y-8">
//                         {/* PDF Upload Card */}
//                         <div className="bg-white p-8 rounded-[40px] border-2 border-dashed border-brand-border hover:border-brand-accent transition-all text-center relative group shadow-sm">
//                             <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
//                             <div className="flex flex-col items-center">
//                                 <div className="bg-brand-accent/5 p-4 rounded-2xl text-brand-accent mb-3 group-hover:scale-110 transition-transform">
//                                     {extracting ? <Loader2 className="animate-spin" size={28}/> : <FileUp size={28}/>}
//                                 </div>
//                                 <h3 className="font-black text-brand-dark text-sm uppercase tracking-widest">
//                                     {extracting ? "Extracting Text..." : "Upload PDF Source"}
//                                 </h3>
//                             </div>
//                         </div>

//                         {/* Text Card Style from Image 2 */}
//                         <div className="bg-white p-8 rounded-[40px] border border-brand-border shadow-premium relative">
//                             <div className="flex items-center gap-2 mb-6 text-[10px] font-black text-brand-muted uppercase tracking-widest">
//                                 <FileText size={14} /> Raw PDF Text
//                             </div>
//                             <textarea 
//                                 className="w-full h-80 p-6 bg-brand-light border border-brand-border rounded-[32px] font-medium text-sm outline-none focus:border-brand-accent resize-none placeholder:text-brand-muted/40"
//                                 placeholder="Example: 1. Which of the following is... (a) Option 1 (b) Option 2..."
//                                 value={rawText}
//                                 onChange={(e) => setRawText(e.target.value)}
//                             />
//                         </div>

//                         {/* Run Parser Button */}
//                         <button 
//                             onClick={handleParse}
//                             className="w-full bg-brand-dark text-white p-5 rounded-[24px] font-black flex items-center justify-center gap-3 hover:bg-brand-accent transition-all shadow-lg active:scale-95 cursor-pointer"
//                         >
//                             <Wand2 size={20} /> Run Smart Parser
//                         </button>
//                     </div>

//                     {/* RIGHT SIDE: PREVIEW */}
//                     <div className="space-y-6">
//                         <div className="flex justify-between items-center px-4">
//                             <h2 className="text-sm font-black uppercase tracking-widest text-brand-muted flex items-center gap-2">
//                                 <CheckCircle size={16} /> Preview & Review
//                             </h2>
//                             {parsedQuestions.length > 0 && (
//                                 <button onClick={handleUploadToDB} className="text-xs font-black text-brand-accent flex items-center gap-1 hover:underline">
//                                     <Save size={14}/> Save to DB
//                                 </button>
//                             )}
//                         </div>

//                         <div className="max-h-[750px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
//                             {parsedQuestions.length === 0 ? (
//                                 <div className="bg-white/40 border-2 border-dashed border-brand-border rounded-[40px] p-24 text-center">
//                                     <p className="text-brand-muted font-bold text-sm opacity-60">No questions parsed yet.</p>
//                                 </div>
//                             ) : (
//                                 parsedQuestions.map((q, idx) => (
//                                     <motion.div 
//                                         initial={{ opacity: 0, x: 20 }} 
//                                         animate={{ opacity: 1, x: 0 }} 
//                                         key={idx} 
//                                         className="bg-white p-6 rounded-[32px] border border-brand-border shadow-sm group hover:border-brand-accent transition-all"
//                                     >
//                                         <div className="flex justify-between items-start mb-3">
//                                             <p className="text-[10px] font-black text-brand-accent uppercase tracking-tighter">Question {idx+1}</p>
//                                             <button 
//                                                 onClick={() => setParsedQuestions(parsedQuestions.filter((_, i) => i !== idx))}
//                                                 className="text-brand-muted hover:text-status-error opacity-0 group-hover:opacity-100 transition-all"
//                                             >
//                                                 <Trash2 size={16} />
//                                             </button>
//                                         </div>
//                                         <h3 className="font-bold text-brand-dark text-sm leading-relaxed mb-4">{q.questionText}</h3>
//                                         <div className="grid grid-cols-2 gap-2">
//                                             {q.options.map(o => (
//                                                 <div key={o.label} className="text-[10px] font-bold bg-brand-light p-2 rounded-xl border border-brand-border truncate">
//                                                     <span className="text-brand-accent mr-1">{o.label}:</span> {o.text}
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </motion.div>
//                                 ))
//                             )}
//                         </div>
//                     </div>

//                 </div>
//             </div>
//         </div>
//     );
// }

// export default function BulkImporter() {
//     return (
//         <Suspense fallback={<div className="min-h-screen bg-brand-light flex items-center justify-center font-black animate-pulse text-brand-muted">Loading Importer...</div>}>
//             <BulkImporterContent />
//         </Suspense>
//     );
// }

"use client";

import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const BulkImporterLogic = nextDynamic(
    () => import("./BulkImporterLogic"),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen bg-brand-light flex items-center justify-center font-black animate-pulse text-brand-muted uppercase tracking-widest">
                Initializing Engine...
            </div>
        ),
    }
);

export default function BulkImporterPage() {
    return <BulkImporterLogic />;
}