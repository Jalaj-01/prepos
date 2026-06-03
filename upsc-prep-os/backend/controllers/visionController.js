const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

// =========================
// DETAILED EXTRACTION PROMPT
// =========================

const EXTRACTION_PROMPT = `
You are an expert UPSC Civil Services Examination question extractor.

Your job is to extract ALL questions from the given content with EXTREME accuracy.

RULES:
1. Extract EVERY question — do not skip any
2. For each question, identify the CORRECT answer if available
3. Classify each question's subject and topic based on UPSC syllabus
4. Detect question type: Factual, Conceptual, Statement Based, Match the Following, Assertion Reason, Map Based, Chronology, Table Based
5. Estimate difficulty: Easy, Medium, Hard
6. Extract relevant keywords for each question
7. If a question has statements (Consider the following statements), extract them as part of questionText
8. For Match the Following questions, include the matching table in questionText
9. Preserve ALL original text exactly — do not rephrase
10. If answer/explanation is not available, leave those fields empty string

OUTPUT FORMAT (strict JSON):

{
  "questions": [
    {
      "questionText": "Full question text including any statements or table data",
      "options": [
        { "label": "A", "text": "Option A text" },
        { "label": "B", "text": "Option B text" },
        { "label": "C", "text": "Option C text" },
        { "label": "D", "text": "Option D text" }
      ],
      "correctOption": "A",
      "explanation": "Detailed explanation of why this answer is correct",
      "year": 2024,
      "paper": "GS1",
      "subjectName": "History",
      "topicName": "Modern Indian History",
      "subtopicName": "Freedom Struggle",
      "questionType": "Statement Based",
      "difficulty": "Medium",
      "keywords": ["freedom struggle", "gandhi", "civil disobedience"]
    }
  ]
}

SUBJECT CLASSIFICATION GUIDE:
- History: Ancient, Medieval, Modern Indian History, World History, Art & Culture
- Geography: Physical, Indian, World, Environmental Geography
- Polity: Constitution, Governance, Panchayati Raj, Public Policy
- Economy: Indian Economy, Banking, International Trade, Budget
- Environment: Ecology, Biodiversity, Climate Change, Environmental Laws
- Science & Technology: Space, Defense, Biotechnology, IT, Nuclear
- International Relations: India's Foreign Policy, International Organizations
- Current Affairs: Recent events, Government Schemes
- Ethics: Aptitude, Integrity, Case Studies (for GS4)

PAPER CLASSIFICATION:
- GS1 = History, Geography, Art & Culture, Society
- CSAT = Comprehension, Logical Reasoning, Decision Making, Math, Data Interpretation

IMPORTANT:
- Return ONLY valid JSON — no markdown, no explanations, no text outside JSON
- If you cannot determine a field, use empty string ""
- correctOption must be one of: "A", "B", "C", "D"
- year must be a number like 2024, 2023, etc.
`;

// =========================
// EXTRACT FROM IMAGE (Gemini Vision)
// =========================

exports.extractQuestionsFromImage = async (req, res) => {

    try {

        const { image } = req.body;

        if (!image) {

            return res.status(400).json({
                message: "Image is required"
            });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        const imagePart = {
            inlineData: {
                data: image.split(',')[1],
                mimeType: "image/png"
            }
        };

        const result = await model.generateContent([
            EXTRACTION_PROMPT,
            imagePart
        ]);

        const response = await result.response;

        const text = response.text();

        const cleaned = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        const parsed = JSON.parse(cleaned);

        console.log(
            `✅ Gemini Vision extracted ${parsed.questions?.length || 0} questions`
        );

        res.json(parsed);

    } catch (error) {

        console.error(
            "Gemini Vision Extraction Error:",
            error
        );

        res.status(500).json({
            message: "Vision extraction failed: " + error.message
        });
    }
};

// =========================
// EXTRACT FROM TEXT (Gemini Text)
// NEW — For pasting raw text from PDFs
// =========================

exports.extractQuestionsFromText = async (req, res) => {

    try {

        const { text, year, paper } = req.body;

        if (!text || !text.trim()) {

            return res.status(400).json({
                message: "Text content is required"
            });
        }

        if (text.length > 50000) {

            return res.status(400).json({
                message: "Text too long. Maximum 50,000 characters. Try splitting into smaller sections."
            });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        // Add context about year and paper if provided

        let contextPrompt = EXTRACTION_PROMPT;

        if (year) {

            contextPrompt += `\n\nIMPORTANT CONTEXT: These questions are from UPSC ${year} exam.`;
        }

        if (paper) {

            contextPrompt += `\nPaper: ${paper}`;
        }

        contextPrompt += `\n\nHere is the raw text to extract questions from:\n\n${text}`;

        const result = await model.generateContent(contextPrompt);

        const response = await result.response;

        const responseText = response.text();

        const cleaned = responseText
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        let parsed;

        try {

            parsed = JSON.parse(cleaned);

        } catch (parseErr) {

            // Try to extract JSON from the response

            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

            if (jsonMatch) {

                parsed = JSON.parse(jsonMatch[0]);

            } else {

                throw new Error("AI response was not valid JSON");
            }
        }

        // Ensure year and paper are set if provided

        if (parsed.questions && Array.isArray(parsed.questions)) {

            parsed.questions = parsed.questions.map(q => ({

                ...q,

                year: q.year || (year ? parseInt(year) : null),

                paper: q.paper || paper || "GS1"
            }));
        }

        console.log(
            `✅ Gemini Text extracted ${parsed.questions?.length || 0} questions`
        );

        res.json(parsed);

    } catch (error) {

        console.error(
            "Gemini Text Extraction Error:",
            error
        );

        res.status(500).json({
            message: "Text extraction failed: " + error.message
        });
    }
};

// =========================
// EXTRACT FROM PDF PAGES (Multiple images)
// NEW — Process multiple pages at once
// =========================

exports.extractQuestionsFromPages = async (req, res) => {

    try {

        const { pages, year, paper } = req.body;

        if (!pages || !Array.isArray(pages) || pages.length === 0) {

            return res.status(400).json({
                message: "Pages array is required"
            });
        }

        if (pages.length > 20) {

            return res.status(400).json({
                message: "Maximum 20 pages per batch"
            });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        const allQuestions = [];

        const errors = [];

        for (let i = 0; i < pages.length; i++) {

            const page = pages[i];

            try {

                let contextPrompt = EXTRACTION_PROMPT;

                if (year) {
                    contextPrompt += `\n\nContext: UPSC ${year} exam`;
                }

                if (paper) {
                    contextPrompt += `, Paper: ${paper}`;
                }

                contextPrompt += `\nPage ${page.pageNumber || i + 1} of ${pages.length}`;

                const imagePart = {
                    inlineData: {
                        data: page.image.split(',')[1],
                        mimeType: "image/png"
                    }
                };

                const result = await model.generateContent([
                    contextPrompt,
                    imagePart
                ]);

                const response = await result.response;

                const text = response.text();

                const cleaned = text
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .trim();

                let parsed;

                try {

                    parsed = JSON.parse(cleaned);

                } catch {

                    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

                    if (jsonMatch) {

                        parsed = JSON.parse(jsonMatch[0]);

                    } else {

                        throw new Error("Invalid JSON from AI");
                    }
                }

                if (parsed.questions) {

                    const questionsWithMeta = parsed.questions.map(q => ({

                        ...q,

                        year: q.year || (year ? parseInt(year) : null),

                        paper: q.paper || paper || "GS1",

                        sourcePage: page.pageNumber || i + 1
                    }));

                    allQuestions.push(...questionsWithMeta);
                }

                console.log(
                    `✅ Page ${i + 1}/${pages.length}: ${parsed.questions?.length || 0} questions`
                );

                // Small delay between API calls to avoid rate limiting

                if (i < pages.length - 1) {

                    await new Promise(r => setTimeout(r, 1000));
                }

            } catch (pageErr) {

                console.error(
                    `❌ Page ${i + 1} failed:`,
                    pageErr.message
                );

                errors.push({
                    page: i + 1,
                    error: pageErr.message
                });
            }
        }

        console.log(
            `✅ Total: ${allQuestions.length} questions from ${pages.length} pages (${errors.length} errors)`
        );

        res.json({

            questions: allQuestions,

            totalPages: pages.length,

            successPages: pages.length - errors.length,

            errors
        });

    } catch (error) {

        console.error(
            "Gemini Pages Extraction Error:",
            error
        );

        res.status(500).json({
            message: "Pages extraction failed: " + error.message
        });
    }
};