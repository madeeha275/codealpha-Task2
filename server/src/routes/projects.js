// src/routes/projects.js
const express = require('express');
const { body, param } = require('express-validator');
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  addColumn,
} = require('../controllers/projectController');

const { getProjectTasks, createTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getProjects);
router.post(
  '/',
  [body('name').notEmpty(), body('description').optional(), body('color').optional()],
  createProject
);
router.get('/:id', getProject);
router.put(
  '/:id',
  [body('name').optional(), body('description').optional(), body('color').optional()],
  updateProject
);
router.delete('/:id', deleteProject);

// Member management
router.post('/:id/members', [body('email').isEmail()], addMember);
router.delete('/:id/members/:userId', removeMember);

// Column management (add column for simplicity)
router.post('/:id/columns', [body('title').notEmpty()], addColumn);

// Task routes under project
router.get('/:projectId/tasks', getProjectTasks);
router.post('/:projectId/tasks', [body('title').notEmpty(), body('columnId').notEmpty()], createTask);

module.exports = router;
