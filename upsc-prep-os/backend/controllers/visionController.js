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
2. For each question, identify the CORRECT answer
3. DETECT the exam YEAR from the content (look for year mentions, header, footer)
4. DETECT the PAPER type (GS1 or CSAT) based on question style:
   - GS1 = History, Geography, Polity, Economy, Environment, Science, Current Affairs
   - CSAT = Comprehension, Logical Reasoning, Decision Making, Math, Data Interpretation
5. Classify each question's subject and topic based on UPSC syllabus
6. Detect question type: Factual, Conceptual, Statement Based, Match the Following, Assertion Reason, Map Based, Chronology, Table Based
7. Estimate difficulty: Easy, Medium, Hard
8. Extract relevant keywords
9. If a question has statements, include them in questionText
10. Preserve ALL original text exactly — do not rephrase
11. If answer/explanation is not available, leave empty string

YEAR DETECTION:
- Look for patterns like "UPSC 2024", "CSE 2023", "Prelims 2022"
- Check headers, footers, watermarks in the text
- If year is mentioned anywhere, use it for ALL questions
- If year cannot be determined, set year to null

PAPER DETECTION:
- GS1 questions are about: History, Geography, Polity, Economy, Environment, Science, Art & Culture, Current Affairs
- CSAT questions are about: Comprehension passages, Logical Reasoning, Mathematical ability, Data Interpretation, Decision Making
- Detect automatically from question content

OUTPUT FORMAT (strict JSON):

{
  "detectedYear": 2024,
  "detectedPaper": "GS1",
  "questions": [
    {
      "questionText": "Full question text",
      "options": [
        { "label": "A", "text": "Option A text" },
        { "label": "B", "text": "Option B text" },
        { "label": "C", "text": "Option C text" },
        { "label": "D", "text": "Option D text" }
      ],
      "correctOption": "A",
      "explanation": "Detailed explanation",
      "year": 2024,
      "paper": "GS1",
      "subjectName": "History",
      "topicName": "Modern Indian History",
      "subtopicName": "Freedom Struggle",
      "questionType": "Statement Based",
      "difficulty": "Medium",
      "keywords": ["freedom struggle", "gandhi"]
    }
  ]
}

SUBJECT CLASSIFICATION:
- History: Ancient, Medieval, Modern Indian History, World History, Art & Culture
- Geography: Physical, Indian, World, Environmental Geography
- Polity: Constitution, Governance, Panchayati Raj, Public Policy
- Economy: Indian Economy, Banking, International Trade, Budget
- Environment: Ecology, Biodiversity, Climate Change
- Science & Technology: Space, Defense, Biotechnology, IT
- International Relations: Foreign Policy, International Organizations
- Current Affairs: Recent events, Government Schemes
- Ethics: Aptitude, Integrity, Case Studies (GS4)

IMPORTANT:
- Return ONLY valid JSON
- correctOption must be: "A", "B", "C", or "D"
- Auto-detect year and paper — do NOT leave them empty if detectable
`;

// =========================
// EXTRACT FROM IMAGE
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
            `✅ Vision: ${parsed.questions?.length || 0} questions (Year: ${parsed.detectedYear}, Paper: ${parsed.detectedPaper})`
        );

        res.json(parsed);

    } catch (error) {

        console.error("Gemini Vision Error:", error);

        res.status(500).json({
            message: "Vision extraction failed: " + error.message
        });
    }
};

// =========================
// EXTRACT FROM TEXT
// =========================

exports.extractQuestionsFromText = async (req, res) => {

    try {

        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                message: "Text content is required"
            });
        }

        if (text.length > 50000) {
            return res.status(400).json({
                message: "Text too long. Maximum 50,000 characters."
            });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        const fullPrompt =
            EXTRACTION_PROMPT +
            "\n\nHere is the raw text to extract questions from:\n\n" +
            text;

        const result = await model.generateContent(fullPrompt);
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
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("AI response was not valid JSON");
            }
        }

        // Apply detected year/paper to questions that don't have them

        if (parsed.questions && Array.isArray(parsed.questions)) {

            parsed.questions = parsed.questions.map(q => ({
                ...q,
                year: q.year || parsed.detectedYear || null,
                paper: q.paper || parsed.detectedPaper || "GS1"
            }));
        }

        console.log(
            `✅ Text: ${parsed.questions?.length || 0} questions (Year: ${parsed.detectedYear}, Paper: ${parsed.detectedPaper})`
        );

        res.json(parsed);

    } catch (error) {

        console.error("Gemini Text Error:", error);

        res.status(500).json({
            message: "Text extraction failed: " + error.message
        });
    }
};

// =========================
// EXTRACT FROM MULTIPLE PAGES
// =========================

exports.extractQuestionsFromPages = async (req, res) => {

    try {

        const { pages } = req.body;

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
        let detectedYear = null;
        let detectedPaper = null;

        for (let i = 0; i < pages.length; i++) {

            const page = pages[i];

            try {

                const pagePrompt =
                    EXTRACTION_PROMPT +
                    `\n\nPage ${page.pageNumber || i + 1} of ${pages.length}`;

                const imagePart = {
                    inlineData: {
                        data: page.image.split(',')[1],
                        mimeType: "image/png"
                    }
                };

                const result = await model.generateContent([
                    pagePrompt,
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

                // Capture detected year/paper from first successful page

                if (!detectedYear && parsed.detectedYear) {
                    detectedYear = parsed.detectedYear;
                }

                if (!detectedPaper && parsed.detectedPaper) {
                    detectedPaper = parsed.detectedPaper;
                }

                if (parsed.questions) {

                    const questionsWithMeta = parsed.questions.map(q => ({
                        ...q,
                        year: q.year || parsed.detectedYear || detectedYear || null,
                        paper: q.paper || parsed.detectedPaper || detectedPaper || "GS1",
                        sourcePage: page.pageNumber || i + 1
                    }));

                    allQuestions.push(...questionsWithMeta);
                }

                console.log(
                    `✅ Page ${i + 1}/${pages.length}: ${parsed.questions?.length || 0} questions`
                );

                if (i < pages.length - 1) {
                    await new Promise(r => setTimeout(r, 1000));
                }

            } catch (pageErr) {

                console.error(`❌ Page ${i + 1} failed:`, pageErr.message);

                errors.push({
                    page: i + 1,
                    error: pageErr.message
                });
            }
        }

        console.log(
            `✅ Total: ${allQuestions.length} questions from ${pages.length} pages (Year: ${detectedYear}, Paper: ${detectedPaper})`
        );

        res.json({
            detectedYear,
            detectedPaper,
            questions: allQuestions,
            totalPages: pages.length,
            successPages: pages.length - errors.length,
            errors
        });

    } catch (error) {

        console.error("Gemini Pages Error:", error);

        res.status(500).json({
            message: "Pages extraction failed: " + error.message
        });
    }
};