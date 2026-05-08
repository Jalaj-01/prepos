"use client";

import {
    useState,
    useEffect
} from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Wand2,
    Save,
    Trash2,
    CheckCircle,
    FileUp,
    Loader2,
    ArrowLeft,
    
} from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

export default function BulkImporterLogic() {

    const [rawText, setRawText] = useState('');
    const [parsedQuestions, setParsedQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reviewFilter,setReviewFilter] = useState('All');
    const [extracting, setExtracting] = useState(false);
    const [visionProcessing, setVisionProcessing] = useState(false);
    const [
    selectedQuestionIndex,
    setSelectedQuestionIndex
] = useState(0);
const [
    extractedPages,
    setExtractedPages
] = useState([]);

    // =========================
    // PDF Upload
    // =========================

    const handleFileUpload = async (e) => {

        const file = e.target.files[0];

        if (!file || file.type !== 'application/pdf') {
            alert("Please upload a valid PDF.");
            return;
        }

        setExtracting(true);

        try {

            const {
    extractTextFromPDF
} = await import('@/lib/pdfHelper');

let text =
    await extractTextFromPDF(file);

// OCR FALLBACK

if (
    !text ||
    text.trim().length < 300
) {

    console.log(
        "Low PDF text detected. Running OCR..."
    );

    const {
        extractTextWithOCR
    } = await import('@/lib/pdfHelper');

    text =
        await extractTextWithOCR(file);
}

setRawText(text);

// RUN GEMINI VISION EXTRACTION
await handlePageImageExtraction(file);

        } catch (err) {

            console.error(err);

            alert("Error reading PDF. Please try pasting text manually.");

        } finally {

            setExtracting(false);

        }
    };

    // =========================
    // PARSER
    // =========================
    const handlePageImageExtraction =
async (file) => {

    try {

        setVisionProcessing(true);

        const {
            extractPDFPagesAsImages
        } = await import(
            '@/lib/pdfHelper'
        );

        const pages =
            await extractPDFPagesAsImages(
                file
            );

        setExtractedPages(pages);

    } catch (err) {

        console.error(
            "Image extraction failed",
            err
        );

    } finally {

        setVisionProcessing(false);
    }
};
    const detectTables = (text) => {

    const lines =
        text.split('\n');

    const tables = [];

    let currentTable = [];

    for (const line of lines) {

        const isTableLine =

            line.includes('|') ||

            /\t/.test(line);

        if (isTableLine) {

            currentTable.push(line);

        } else {

            if (currentTable.length >= 2) {

                const parsedRows =
                    currentTable.map(row =>

                        row
                            .split('|')
                            .map(cell =>
                                cell.trim()
                            )
                            .filter(Boolean)
                    );

                tables.push({

                    title: "Detected Table",

                    headers:
                        parsedRows[0] || [],

                    rows:
                        parsedRows.slice(1)
                });
            }

            currentTable = [];
        }
    }

    return tables;
};

    const handleParse = () => {

        if (!rawText.trim()) return;

        const lines = rawText
    .split('\n')
    .map(line => line.trim());

const questionBlocks = [];

let currentBlock = [];

for (let i = 0; i < lines.length; i++) {

    const line = lines[i];

    const isQuestionStart =
        /^Question\s*\d+/i.test(line) ||
        /^\d+\.\s/.test(line);

    if (isQuestionStart && currentBlock.length > 0) {

        questionBlocks.push(
            currentBlock.join('\n')
        );

        currentBlock = [];
    }

    currentBlock.push(line);
}

if (currentBlock.length > 0) {

    questionBlocks.push(
        currentBlock.join('\n')
    );
}

        const parsed = questionBlocks.map((block) => {

            const cleanBlock = block
                .replace(/\r/g, '')
                .trim();

            const answerMatch = cleanBlock.match(
                /Ans(?:wer)?\s*:\s*([A-D])/i
            );

            const correctOption = answerMatch
                ? answerMatch[1].toUpperCase()
                : 'A';

            const explanationMatch = cleanBlock.match(
                /(Explanation|Exp)\s*:\s*([\s\S]*)/i
            );

            const explanation = explanationMatch
                ? explanationMatch[2].trim()
                : '';

            const detectedTables =
    detectTables(cleanBlock);
            const yearMatch =
    cleanBlock.match(/(20\d{2})/);

const detectedYear =
    yearMatch
        ? Number(yearMatch[1])
        : 2024;

            const contentWithoutExplanation = cleanBlock
                .replace(/(Explanation|Exp)\s*:[\s\S]*/i, '')
                .trim();

            const optionRegex =
/\(([a-dA-D])\)\s*([\s\S]*?)(?=\n\s*\([a-dA-D]\)|\n\s*Ans|\n\s*Explanation|\n\s*Exp|$)/g;

            const options = [];

            let match;

            while ((match = optionRegex.exec(contentWithoutExplanation)) !== null) {

                options.push({
                    label: match[1].toUpperCase(),
                    text: match[2]
                        .replace(/\s+/g, ' ')
                        .trim()
                });
            }

            let questionText = contentWithoutExplanation;

            if (options.length > 0) {

               

                questionText = contentWithoutExplanation
                    .split(/\([a-dA-D]\)/)[0]
                    .replace(/^Question\s*\d+/i, '')
                    .replace(/^\d+\.\s*/, '')
                    .trim();
            }
             const isValidQuestion =
            questionText &&
            options.length >= 2;
            const matchingPageImage =

    extractedPages.find(
        page =>

            cleanBlock.includes(
                `Page ${page.pageNumber}`
            )
    );
            const parseWarnings = [];

            if (
    questionText.length < 15 ||
    /[|]{2,}/.test(questionText)
) {

    parseWarnings.push(
        "OCR quality issue"
    );
}

if (options.length < 4) {

    parseWarnings.push(
        "Incomplete options"
    );
}

if (!answerMatch) {

    parseWarnings.push(
        "No answer detected"
    );
}

if (questionText.length < 20) {

    parseWarnings.push(
        "Question too short"
    );
}

if (!explanation) {

    parseWarnings.push(
        "No explanation"
    );
}

const optionTexts =
    options.map(o =>
        o.text.toLowerCase().trim()
    );

const uniqueOptions =
    new Set(optionTexts);

if (
    uniqueOptions.size !== optionTexts.length
) {

    parseWarnings.push(
        "Duplicate options"
    );
}

if (
    /[@#$%^&*]{3,}/.test(questionText)
) {

    parseWarnings.push(
        "Possible OCR corruption"
    );
}

            return {
                questionText,

                options: [
                    options.find(o => o.label === 'A') || { label: 'A', text: '' },
                    options.find(o => o.label === 'B') || { label: 'B', text: '' },
                    options.find(o => o.label === 'C') || { label: 'C', text: '' },
                    options.find(o => o.label === 'D') || { label: 'D', text: '' }
                ],


                parseWarnings,

                isMalformed:
                    !isValidQuestion,

                correctOption,

                explanation,

                year: detectedYear,

                taxonomyIds: [],


                tags: [],

                difficulty: "Medium",

                images:

    matchingPageImage

        ? [

            {
                url:
                    matchingPageImage.image,

                caption:
                    `Page ${matchingPageImage.pageNumber}`,

                pageNumber:
                    matchingPageImage.pageNumber
            }

        ]

        : [],

                tables: detectedTables,
                reviewStatus: "Pending"
            };

        });

        setParsedQuestions(
            parsed.filter(q =>
                q.questionText &&
                q.options.some(o => o.text)
            )
        );
    };


    // =========================
    // SAVE TO DB
    // =========================

    const handleUploadToDB = async () => {

        setLoading(true);

        try {

            const userInfo = JSON.parse(
                localStorage.getItem('userInfo')
            );

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/questions/bulk`,
                {
    questions:
        parsedQuestions.filter(
            q => q.reviewStatus === "Approved"
        )
},
                {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`
                    }
                }
            );

            alert(
                `Successfully added ${parsedQuestions.length} questions!`
            );

            setParsedQuestions([]);
            setRawText('');

        } catch (err) {

            console.error(err);

            alert("Upload failed.");

        } finally {

            setLoading(false);

        }
    };

    const updateQuestionField = (
    index,
    field,
    value
) => {

    const updated =
        [...parsedQuestions];

    updated[index][field] = value;

    setParsedQuestions(updated);
    
};



const updateOptionField = (
    questionIndex,
    optionIndex,
    value
) => {

    const updated =
        [...parsedQuestions];

    updated[questionIndex]
        .options[optionIndex]
        .text = value;

    setParsedQuestions(updated);
};

const updateReviewStatus = (
    index,
    status
) => {

    const updated =
        [...parsedQuestions];

    updated[index].reviewStatus =
        status;

    setParsedQuestions(updated);
};


useEffect(() => {

    const handleKeyDown = (e) => {

        if (
            parsedQuestions.length === 0
        ) return;

        // APPROVE

        if (e.key === 'a') {

            const updated =
                [...parsedQuestions];

            updated[selectedQuestionIndex]
                .reviewStatus = 'Approved';

            setParsedQuestions(updated);
        }

        // REJECT

        if (e.key === 'r') {

            const updated =
                [...parsedQuestions];

            updated[selectedQuestionIndex]
                .reviewStatus = 'Rejected';

            setParsedQuestions(updated);
        }

        // DELETE

        if (e.key === 'Delete') {

            const updated =
                parsedQuestions.filter(
                    (_, idx) =>
                        idx !== selectedQuestionIndex
                );

            setParsedQuestions(updated);

            setSelectedQuestionIndex(0);
        }

        // DOWN

        if (e.key === 'ArrowDown') {

            setSelectedQuestionIndex(prev =>

                Math.min(
                    prev + 1,
                    parsedQuestions.length - 1
                )
            );
        }

        // UP

        if (e.key === 'ArrowUp') {

            setSelectedQuestionIndex(prev =>

                Math.max(
                    prev - 1,
                    0
                )
            );
        }
    };

    window.addEventListener(
        'keydown',
        handleKeyDown
    );

    return () => {

        window.removeEventListener(
            'keydown',
            handleKeyDown
        );
    };

}, [
    parsedQuestions,
    selectedQuestionIndex
]);


    return (
        

        
        <div className="min-h-screen bg-brand-light p-6 md:p-12">

            <div className="max-w-6xl mx-auto">

                <header className="mb-10">

                    <Link
                        href="/admin"
                        className="flex items-center gap-2 text-brand-muted hover:text-brand-dark mb-4 font-bold text-sm transition-all"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </Link>

                    <h1 className="text-4xl font-black text-brand-dark tracking-tight">
                        Bulk Question Importer
                    </h1>

                    <p className="text-brand-muted font-medium mt-1 tracking-tight">
                        Upload UPSC PDFs to extract, review, and save structured questions.
                    </p>

                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* LEFT */}

                    <div className="space-y-8">

                        <div className="bg-white p-8 rounded-[40px] border-2 border-dashed border-brand-border hover:border-brand-accent transition-all text-center relative group shadow-sm">

                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />

                            <div className="flex flex-col items-center">

                                <div className="bg-brand-accent/5 p-4 rounded-2xl text-brand-accent mb-3 group-hover:scale-110 transition-transform">

                                    {
                                        extracting || visionProcessing
                                            ? <Loader2 className="animate-spin" size={28} />
                                            : <FileUp size={28} />
                                    }

                                </div>

                                <h3 className="font-black text-brand-dark text-sm uppercase tracking-widest">

                                    {
                                        extracting || visionProcessing
                                             ? "Processing..."
                                            : "Upload PDF Source"
                                    }

                                </h3>

                            </div>

                        </div>

                        <div className="bg-white p-8 rounded-[40px] border border-brand-border shadow-premium">

                            <div className="flex items-center gap-2 mb-6 text-[10px] font-black text-brand-muted uppercase tracking-widest">

                                <FileText size={14} />
                                Raw Content

                            </div>

                            <button
                                onClick={() => {
                                    setRawText(prev => prev + `

1. Your Question Here

(a) Option A
(b) Option B
(c) Option C
(d) Option D

Ans: A

Explanation: Your explanation here.
`);
                                }}
                                className="mb-4 text-xs font-black text-brand-accent hover:underline"
                            >
                                + Add Question Template
                            </button>

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
                            className="w-full bg-brand-dark text-white p-5 rounded-[24px] font-black flex items-center justify-center gap-3 hover:bg-brand-accent transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-30"
                        >

                            <Wand2 size={20} />
                            Run Smart Parser

                        </button>

                    </div>

                    {/* RIGHT */}

                    <div className="space-y-6">

                        <div className="flex justify-between items-center px-4">

                            <h2 className="text-sm font-black uppercase tracking-widest text-brand-muted flex items-center gap-2">
                            <div className="flex flex-wrap gap-2 mt-3">

    {
        [
            'All',
            'Pending',
            'Approved',
            'Rejected',
            'Malformed'
        ].map(filter => (

            <button

                key={filter}

                onClick={() =>
                    setReviewFilter(filter)
                }

                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all

                ${
                    reviewFilter === filter

                    ? "bg-brand-dark text-white"

                    : "bg-brand-light border border-brand-border text-brand-muted"
                }`}
            >

                {filter}

            </button>
        ))
    }

</div>
                                <CheckCircle size={16} />
                                Review ({parsedQuestions.length})

                            </h2>

                            <div className="flex items-center gap-3">
           
                                {
                                    parsedQuestions.length > 0 && (
                             

        <button

            onClick={() => {

                const updated =
                    parsedQuestions.map(q => ({

                        ...q,

                        reviewStatus:
                            q.isMalformed
                                ? "Pending"
                                : "Approved"

                    }));

                setParsedQuestions(updated);
            }}

            className="text-xs font-black text-green-700 flex items-center gap-1 hover:underline"
        >

            Approve Valid

        </button>
    )
}


                                        <button
                                            onClick={handleUploadToDB}
                                            disabled={loading}
                                            className="text-xs font-black text-brand-accent flex items-center gap-1 hover:underline"
                                        >

                                            <Save size={14} />

                                            {
                                                loading
                                                    ? "Saving..."
                                                    : "Save to DB"
                                            }

                                        </button>
                                    
                                

                            </div>

                        </div>

                        <div className="max-h-[750px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">

                            {
                                parsedQuestions.length === 0 ? (

                                    <div className="bg-white/40 border-2 border-dashed border-brand-border rounded-[40px] p-24 text-center">

                                        <p className="text-brand-muted font-bold text-sm opacity-60">
                                            No questions parsed yet.
                                        </p>

                                    </div>

                                ) : (

                                    parsedQuestions

.filter(q => {

    if (reviewFilter === 'All')
        return true;

    if (reviewFilter === 'Malformed')
        return q.isMalformed;

    return q.reviewStatus === reviewFilter;
})

.map((q, idx) => (

                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={idx}
                                            className={`bg-white p-6 rounded-[32px] border shadow-sm group transition-all

${
    idx === selectedQuestionIndex

    ? "border-brand-accent ring-2 ring-brand-accent/20"

    : "border-brand-border hover:border-brand-accent"
}`}
                                        >

                                            <div className="flex justify-between items-start mb-3">

                                                <div className="flex items-center gap-2">

    <p className="text-[10px] font-black text-brand-accent uppercase">
        Question {idx + 1}
    </p>

    <div
        className={`text-[9px] px-2 py-1 rounded-full font-black uppercase

        ${
            q.reviewStatus === "Approved"
            ? "bg-green-100 text-green-700"

            : q.reviewStatus === "Rejected"
            ? "bg-red-100 text-red-700"

            : "bg-yellow-100 text-yellow-700"
        }`}
    >

        {q.reviewStatus}

    </div>

</div>

                                                <button
                                                    onClick={() =>
                                                        setParsedQuestions(
                                                            parsedQuestions.filter((_, i) => i !== idx)
                                                        )
                                                    }
                                                    className="text-brand-muted hover:text-status-error opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                            </div>

                                            <textarea
                                            value={q.questionText}
                                            onChange={(e) =>
                                                updateQuestionField(
                                                    idx,
                                                    'questionText',
                                                    e.target.value
                                                )
                                            }
                                            className="w-full bg-brand-light border border-brand-border rounded-2xl p-4 text-sm font-bold text-brand-dark outline-none focus:border-brand-accent resize-none mb-4"
                                            rows={4}
                                        />

                                            {
                                                q.images &&
                                                q.images.length > 0 && (

                                                    <div className="mb-4 space-y-3">

                                                        {
                                                            q.images.map((img, imgIdx) => (

                                                                <div
                                                                    key={imgIdx}
                                                                    className="overflow-hidden rounded-2xl border border-brand-border bg-brand-light"
                                                                >

                                                                    <img
                                                                        src={img.url}
                                                                        alt={img.caption || "Question Image"}
                                                                        className="w-full object-contain max-h-[350px]"
                                                                    />

                                                                    {
                                                                        img.caption && (

                                                                            <div className="p-3 text-xs text-brand-muted font-medium border-t border-brand-border">

                                                                                {img.caption}

                                                                            </div>
                                                                        )
                                                                    }

                                                                </div>
                                                            ))
                                                        }

                                                    </div>
                                                )
                                            }

                                            {
                                                q.tables &&
                                                q.tables.length > 0 && (

                                                    <div className="mb-4 space-y-4">

                                                        {
                                                            q.tables.map((table, tableIdx) => (

                                                                <div
                                                                    key={tableIdx}
                                                                    className="overflow-x-auto border border-brand-border rounded-2xl"
                                                                >

                                                                    {
                                                                        table.title && (

                                                                            <div className="px-4 py-2 bg-brand-light border-b border-brand-border text-xs font-black uppercase text-brand-muted">

                                                                                {table.title}

                                                                            </div>
                                                                        )
                                                                    }

                                                                    <table className="min-w-full text-xs">

                                                                        <thead className="bg-brand-light">

                                                                            <tr>

                                                                                {
                                                                                    table.headers?.map((header, idx) => (

                                                                                        <th
                                                                                            key={idx}
                                                                                            className="px-4 py-3 text-left font-black border-b border-brand-border"
                                                                                        >

                                                                                            {header}

                                                                                        </th>
                                                                                    ))
                                                                                }

                                                                            </tr>

                                                                        </thead>

                                                                        <tbody>

                                                                            {
                                                                                table.rows?.map((row, rowIdx) => (

                                                                                    <tr
                                                                                        key={rowIdx}
                                                                                        className="border-b border-brand-border"
                                                                                    >

                                                                                        {
                                                                                            row.map((cell, cellIdx) => (

                                                                                                <td
                                                                                                    key={cellIdx}
                                                                                                    className="px-4 py-3 text-brand-dark"
                                                                                                >

                                                                                                    {cell}

                                                                                                </td>
                                                                                            ))
                                                                                        }

                                                                                    </tr>
                                                                                ))
                                                                            }

                                                                        </tbody>

                                                                    </table>

                                                                </div>
                                                            ))
                                                        }

                                                    </div>
                                                )
                                            }

                                            <div className="grid grid-cols-2 gap-2">

                                                {
                                                    q.options.map((o, optionIdx) => (

                                                        <div
                                                            key={o.label}
                                                            className="bg-brand-light p-3 rounded-xl border border-brand-border"
                                                        >

                                                            <div className="text-[10px] font-black text-brand-accent mb-1">
                                                                {o.label}
                                                            </div>

                                                            <textarea
                                                                value={o.text}
                                                                onChange={(e) =>
                                                                    updateOptionField(
                                                                        idx,
                                                                        optionIdx,
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full bg-transparent text-xs font-bold outline-none resize-none"
                                                                rows={2}
                                                            />

                                                        </div>
                                                    ))
                                                }

                                            </div>

                                            <div className="mt-4 space-y-3">

    <div className="flex items-center gap-2 mb-3">

        <button
            onClick={() =>
                updateReviewStatus(
                    idx,
                    "Approved"
                )
            }
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all

            ${
                q.reviewStatus === "Approved"

                ? "bg-green-600 text-white"

                : "bg-green-100 text-green-700"
            }`}
        >

            Approve

        </button>

        <button
            onClick={() =>
                updateReviewStatus(
                    idx,
                    "Rejected"
                )
            }
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all

            ${
                q.reviewStatus === "Rejected"

                ? "bg-red-600 text-white"

                : "bg-red-100 text-red-700"
            }`}
        >

            Reject

        </button>

    </div>

    <div className="flex items-center gap-2">

        <span className="text-xs font-black text-brand-accent">
            Correct Answer:
        </span>

        <select
            value={q.correctOption}
            onChange={(e) =>
                updateQuestionField(
                    idx,
                    'correctOption',
                    e.target.value
                )
            }
            className="bg-brand-light border border-brand-border rounded-xl px-3 py-1 text-xs font-bold outline-none"
        >

            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>

        </select>

    </div>

</div>
                                                <textarea
                                                    value={q.explanation || ''}
                                                    onChange={(e) =>
                                                        updateQuestionField(
                                                            idx,
                                                            'explanation',
                                                            e.target.value
                                                        )
                                                        
                                                    }
                                                    
                                                    placeholder="Explanation..."
                                                    className="w-full bg-brand-light border border-brand-border rounded-2xl p-3 text-xs text-brand-muted outline-none resize-none"
                                                    rows={4}
                                                />

                                                <div className="text-[10px] font-black uppercase text-brand-muted">
                                                    Year: {q.year}
                                                    {
    q.parseWarnings &&
    q.parseWarnings.length > 0 && (

        <div className="mt-4 flex flex-wrap gap-2">

            {
                q.parseWarnings.map(
                    (warning, warningIdx) => (

                        <div
                            key={warningIdx}
                            className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase"
                        >

                            {warning}

                        </div>
                    )
                )
            }

        </div>
    )
}
                                                </div>

                                        </motion.div>

                                    ))
                                )
                            }

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}