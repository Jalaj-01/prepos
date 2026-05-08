const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

exports.extractQuestionsFromImage = async (req, res) => {

    try {

        const {
            image
        } = req.body;

        if (!image) {

            return res.status(400).json({
                message: "Image is required"
            });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        const prompt = `
You are an expert UPSC question extraction engine.

Analyze the uploaded UPSC exam page image carefully.

Extract ALL questions visible.

Return ONLY valid JSON.

Format:

{
  "questions": [
    {
      "questionText": "",
      "options": [
        {
          "label": "A",
          "text": ""
        }
      ],
      "correctOption": "",
      "explanation": "",
      "year": 2024,

      "tables": [],

      "images": [],

      "aiMetadata": {
        "subject": "",
        "topic": "",
        "subtopic": "",
        "questionType": "",
        "difficultyPrediction": "",
        "keywords": [],
        "confidenceScore": 0.0
      }
    }
  ]
}

IMPORTANT:
- Preserve table structure.
- Detect image/map-based questions.
- Preserve multiline statements.
- Return clean JSON only.
`;

        const imagePart = {
            inlineData: {
                data: image.split(',')[1],
                mimeType: "image/png"
            }
        };

        const result = await model.generateContent([
            prompt,
            imagePart
        ]);

        const response = await result.response;

        const text = response.text();

        const cleaned = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        const parsed = JSON.parse(cleaned);

        res.json(parsed);

    } catch (error) {

        console.error(
            "Gemini Vision Extraction Error:",
            error
        );

        res.status(500).json({
            message: "Vision extraction failed"
        });
    }
};