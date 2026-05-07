const Question = require('../models/Question');
const mongoose = require('mongoose');

exports.createQuestion = async (req, res) => {
    try {
        const question = await Question.create(req.body);
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDailyQuestions = async (req, res) => {
    try {
        const { limit, subjects, topics, years } = req.query;
        let matchQuery = {};

        // 1. STRICT TAXONOMY FILTERING
        // We MUST convert String IDs to Mongoose ObjectIds for aggregation to work
        if (topics) {
            const topicIds = topics.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));
            matchQuery.taxonomyIds = { $in: topicIds };
        } else if (subjects) {
            const subjectIds = subjects.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));
            matchQuery.taxonomyIds = { $in: subjectIds };
        }

        // 2. STRICT YEAR FILTERING
        if (years) {
            const yearArray = years.split(',').map(Number);
            matchQuery.year = { $in: yearArray };
        }

        const countLimit = parseInt(limit) || 10;

        console.log("🛠️ STRICT QUERY:", JSON.stringify(matchQuery));

        // 3. EXECUTE AGGREGATION
        const questions = await Question.aggregate([
            { $match: matchQuery },
            { $sample: { size: countLimit } }
        ]);

        // 4. STRICT RESPONSE
        // If no questions found for this specific combination, return empty array with 200
        console.log(`📊 Found ${questions.length} strictly matching questions.`);
        res.json(questions);

    } catch (error) {
        console.error("🔥 Strict Fetch Error:", error.message);
        res.status(500).json({ message: "Strict Filter Error: " + error.message });
    }
};

exports.getQuestionsByTopic = async (req, res) => {
    try {
        const questions = await Question.find({ taxonomyIds: req.params.topicId });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }};
exports.addBulkQuestions = async (req, res) => {
    try {
        const { questions } = req.body;
        // This takes an array of questions and saves them all at once
        const createdQuestions = await Question.insertMany(questions);
        res.status(201).json({ 
            message: "Bulk upload successful", 
            count: createdQuestions.length 
        });
    } catch (error) {
        console.error("Bulk Upload Error:", error);
        res.status(500).json({ message: error.message });
    }
};
