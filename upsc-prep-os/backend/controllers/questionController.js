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

        if (topics) {
            const topicIds = topics.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));
            matchQuery.taxonomyIds = { $in: topicIds };
        } else if (subjects) {
            const subjectIds = subjects.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));
            matchQuery.taxonomyIds = { $in: subjectIds };
        }

        if (years) {
            const yearArray = years.split(',').map(Number);
            matchQuery.year = { $in: yearArray };
        }

        const countLimit = parseInt(limit) || 10;

        const questions = await Question.aggregate([
            { $match: matchQuery },
            { $sample: { size: countLimit } }
        ]);

        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getQuestionsByTopic = async (req, res) => {
    try {
        const questions = await Question.find({ taxonomyIds: req.params.topicId });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// FIX: Added this export which was missing
exports.addBulkQuestions = async (req, res) => {
    try {
        const { questions } = req.body;
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