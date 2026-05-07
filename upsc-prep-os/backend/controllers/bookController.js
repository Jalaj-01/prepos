const Book = require('../models/Book');

exports.getMyBooks = async (req, res) => {
    try {
        const books = await Book.find({ userId: req.user._id });
        const updatedBooks = books.map(book => {
            const completedCount = book.chapters.filter(c => c.status === 'Completed').length;
            book.currentPage = book.chapters.length > 0 ? Math.round((completedCount / book.chapters.length) * 100) : 0;
            return book;
        });
        res.json(updatedBooks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });
        if (!book) return res.status(404).json({ message: "Book not found" });
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addBooksBulk = async (req, res) => {
    try {
        const { books } = req.body;
        const createdBooks = [];
        for (let b of books) {
            const newBook = await Book.create({
                userId: req.user._id,
                title: b.title.trim(),
                author: b.author || "Unknown",
                totalPages: Number(b.totalPages) || 0,
                chapters: []
            });
            createdBooks.push(newBook);
        }
        res.status(201).json(createdBooks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addBook = async (req, res) => {
    try {
        const { title, author, totalPages } = req.body;
        const book = await Book.create({
            userId: req.user._id,
            title,
            author,
            totalPages: Number(totalPages) || 0,
            chapters: []
        });
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// NEW: DELETE BOOK FUNCTION
exports.deleteBook = async (req, res) => {
    try {
        const book = await Book.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!book) return res.status(404).json({ message: "Book not found" });
        res.json({ message: "Book removed from library" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addChaptersBulk = async (req, res) => {
    try {
        const { names } = req.body;
        const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });
        const newChapters = names.map(name => ({
            name: name.trim(),
            status: 'Not Started',
            confidenceLevel: 'Moderate',
            revisionCount: 0
        }));
        book.chapters.push(...newChapters);
        await book.save();
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateChapter = async (req, res) => {
    try {
        const { chapterId, status, confidenceLevel, deleteAction } = req.body;
        const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });
        
        if (deleteAction) {
            book.chapters = book.chapters.filter(c => c._id.toString() !== chapterId);
        } else {
            const chapter = book.chapters.id(chapterId);
            if (status === 'Completed' && chapter.status !== 'Completed') {
                chapter.revisionCount += 1;
            }
            if (status) chapter.status = status;
            if (confidenceLevel) chapter.confidenceLevel = confidenceLevel;
        }

        const completedCount = book.chapters.filter(c => c.status === 'Completed').length;
        book.currentPage = book.chapters.length > 0 ? Math.round((completedCount / book.chapters.length) * 100) : 0; 

        await book.save();
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};