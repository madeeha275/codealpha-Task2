// src/routes/tasks.js
const express = require('express');
const { body, param } = require('express-validator');
const {
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  assignTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

// Get tasks for a project
router.get('/project/:projectId', getProjectTasks);

// CRUD for tasks
router.post('/project/:projectId', [body('title').notEmpty(), body('columnId').notEmpty()], createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/move', [body('columnId').optional(), body('newOrder').optional()], moveTask);
router.patch('/:id/assign', [body('assignees').isArray()], assignTask);

module.exports = router;
