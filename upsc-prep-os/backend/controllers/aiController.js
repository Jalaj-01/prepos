const axios = require('axios');


// =========================================
// AI QUESTION CLASSIFICATION
// =========================================

exports.classifyQuestion = async (req, res) => {

    try {

        const {
            questionText,
            options,
            explanation
        } = req.body;

        const apiKey =
            process.env.GEMINI_API_KEY;

        const prompt = `

You are an expert UPSC question classifier.

Analyze the following UPSC question and return ONLY valid JSON.

Return format:

{
  "subject": "",
  "topic": "",
  "subtopic": "",
  "difficulty": "Easy | Medium | Hard",
  "questionType": "",
  "keywords": [],
  "confidenceScore": 0.0
}

Allowed questionType values:
- Factual
- Conceptual
- Statement Based
- Match the Following
- Assertion Reason
- Map Based
- Chronology
- Table Based
- Image Based

Question:
${questionText}

Options:
${JSON.stringify(options)}

Explanation:
${explanation || ""}

`;

        const response =
            await axios.post(

                `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,

                {
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                }
            );

        const text =
            response.data
                ?.candidates?.[0]
                ?.content?.parts?.[0]
                ?.text || "";

        // Remove markdown wrappers
        const cleaned = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        const parsed =
            JSON.parse(cleaned);

        res.json(parsed);

    } catch (error) {

        console.error(
            "Gemini Classification Error:",
            error.response?.data || error
        );

        res.status(500).json({
            message: "AI classification failed"
        });
    }
};


// =========================================
// AI EXPLANATION GENERATION
// =========================================

exports.generateExplanation = async (
    req,
    res
) => {

    try {

        const {
            questionText,
            options,
            correctOption
        } = req.body;

        const apiKey =
            process.env.GEMINI_API_KEY;

        const prompt = `

You are a UPSC expert.

Generate a concise UPSC-style explanation.

Question:
${questionText}

Options:
${options.map(
    o => `${o.label}. ${o.text}`
).join('\n')}

Correct Answer:
${correctOption}

Rules:
- Explain WHY correct answer is right
- Mention WHY other options are wrong if needed
- Keep explanation concise
- UPSC factual tone
- No markdown

`;

        const response =
            await axios.post(

                `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,

                {
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                }
            );

        const explanation =
            response.data
                ?.candidates?.[0]
                ?.content?.parts?.[0]
                ?.text || '';

        res.json({
            explanation
        });

    } catch (error) {

        console.error(
            "Explanation Generation Error:",
            error.response?.data || error
        );

        res.status(500).json({
            message:
                "Explanation generation failed"
        });
    }
};