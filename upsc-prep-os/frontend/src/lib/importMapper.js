// =========================
// MAP ANY AI OUTPUT FORMAT → Our Schema
// =========================

export function mapImportedQuestion(question) {

    // Handle different option formats

    let options = question.options || [];

    // If options is array of strings → convert

    if (options.length > 0 && typeof options[0] === "string") {

        const labels = ["A", "B", "C", "D"];

        options = options.map((text, i) => ({
            label: labels[i] || String.fromCharCode(65 + i),
            text: text
        }));
    }

    // If options have "a", "b" → normalize to "A", "B"

    options = options.map(opt => ({
        label: (opt.label || opt.key || "").toUpperCase(),
        text: opt.text || opt.value || opt.content || ""
    }));

    // Normalize correct option

    let correctOption = (
        question.correctOption ||
        question.correct_option ||
        question.answer ||
        question.correctAnswer ||
        question.correct_answer ||
        ""
    ).toUpperCase().trim();

    // Handle formats like "(a)", "a)", "a."

    correctOption = correctOption
        .replace(/[().\s]/g, "")
        .toUpperCase();

    // If it's a full text answer, try to match to label

    if (correctOption.length > 1) {

        const matchedOpt = options.find(o =>
            o.text.toLowerCase().includes(correctOption.toLowerCase())
        );

        if (matchedOpt) {
            correctOption = matchedOpt.label;
        }
    }

    return {

        id:
            question.id ||
            question._id ||
            `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,

        questionText:
            question.questionText ||
            question.question_text ||
            question.question ||
            question.text ||
            "",

        options,

        correctOption,

        explanation:
            question.explanation ||
            question.solution ||
            question.answer_explanation ||
            "",

        year:
            question.year ||
            question.exam_year ||
            null,

        paper:
            question.paper ||
            question.exam_paper ||
            "GS1",

        subject:
            question.subjectName ||
            question.subject ||
            question.subject_name ||
            question.aiMetadata?.subject ||
            "",

        topic:
            question.topicName ||
            question.topic ||
            question.topic_name ||
            question.aiMetadata?.topic ||
            "",

        subTopic:
            question.subtopicName ||
            question.subTopic ||
            question.subtopic ||
            question.aiMetadata?.subtopic ||
            "",

        type:
            question.questionType ||
            question.question_type ||
            question.type ||
            question.aiMetadata?.questionType ||
            "Factual",

        difficulty:
            question.difficulty ||
            question.difficultyPrediction ||
            question.aiMetadata?.difficultyPrediction ||
            "Medium",

        keywords:
            question.keywords ||
            question.aiMetadata?.keywords ||
            [],

        // Table data

        tables:
            question.tables || [],

        tableData:
            question.tableData || null,

        // Statements

        statements:
            question.statements || [],

        // Match pairs

        matchPairs:
            question.matchPairs || [],

        // Source

        sourcePage:
            question.sourcePage || null,

        reviewStatus: "Pending",

        isMalformed: false,

        parseWarnings: []
    };
}

// =========================
// CONVERT BACK TO DB FORMAT
// =========================

export function toDBFormat(questions) {

    return questions.map((q) => ({

        questionText: q.questionText || "",

        options: (q.options || []).map(o => ({
            label: o.label || "",
            text: o.text || ""
        })),

        correctOption: q.correctOption || "",

        explanation: q.explanation || "",

        year: q.year ? parseInt(q.year) : null,

        paper: q.paper || "GS1",

        subjectName: q.subject || "",

        topicName: q.topic || "",

        subtopicName: q.subTopic || "",

        keywords: q.keywords || [],

        difficulty: q.difficulty || "Medium",

        questionFormat: q.type || "Text",

        tables: q.tables || [],

        aiMetadata: {

            subject: q.subject || "",

            topic: q.topic || "",

            subtopic: q.subTopic || "",

            questionType: q.type || "Factual",

            difficultyPrediction: q.difficulty || "Medium",

            keywords: q.keywords || [],

            confidenceScore: 0.8
        }
    }));
} 