const express = require('express');
const router = express.Router();
const { getMyBooks, getBookById, addBook, addChaptersBulk, updateChapter, addBooksBulk, deleteBook } = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyBooks);
router.get('/:id', protect, getBookById);
router.post('/add', protect, addBook);
router.post('/:id/chapters/bulk', protect, addChaptersBulk); // NEW
router.put('/:id/chapters', protect, updateChapter);
router.post('/add/bulk', protect, addBooksBulk);
router.delete('/:id', protect, deleteBook);

module.exports = router;