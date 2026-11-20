// src/controllers/commentController.js
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { validationResult } = require('express-validator');

// @desc Get comments for a task
// @route GET /api/comments/:taskId
exports.getComments = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await Project.findById(task.project);
    const isMember = project.owner.equals(req.user.id) || project.members.some(m => m.user.equals(req.user.id));
    if (!isMember) return res.status(403).json({ message: 'Access denied' });
    const comments = await Comment.find({ task: taskId })
      .populate('author', 'name email avatar')
      .sort('createdAt')
      .lean();
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

// @desc Add comment to a task
// @route POST /api/comments/:taskId
exports.addComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { taskId } = req.params;
    const { text } = req.body;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await Project.findById(task.project);
    const isMember = project.owner.equals(req.user.id) || project.members.some(m => m.user.equals(req.user.id));
    if (!isMember) return res.status(403).json({ message: 'Access denied' });
    const comment = await Comment.create({
      task: taskId,
      project: task.project,
      author: req.user.id,
      text,
    });
    // Emit via socket
    if (req.io) req.io.to(project._id.toString()).emit('comment_added', comment);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

// @desc Edit own comment
// @route PUT /api/comments/:id
exports.updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (!comment.author.equals(req.user.id)) {
      return res.status(403).json({ message: 'Cannot edit others\' comment' });
    }
    comment.text = text;
    await comment.save();
    res.json(comment);
  } catch (err) {
    next(err);
  }
};

// @desc Delete own comment
// @route DELETE /api/comments/:id
exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (!comment.author.equals(req.user.id)) {
      return res.status(403).json({ message: 'Cannot delete others\' comment' });
    }
    await comment.remove();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};
