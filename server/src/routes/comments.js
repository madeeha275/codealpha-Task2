// src/routes/comments.js
const express = require('express');
const { body } = require('express-validator');
const {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

// Get comments for a task
router.get('/:taskId', getComments);
// Add comment to a task
router.post('/:taskId', [body('text').notEmpty()], addComment);
// Edit comment
router.put('/:id', updateComment);
// Delete comment
router.delete('/:id', deleteComment);

module.exports = router;
