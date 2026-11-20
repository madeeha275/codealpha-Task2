// src/controllers/taskController.js
const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');

// Helper to emit task events
const emitTaskEvent = (io, projectId, event, payload) => {
  if (io) io.to(projectId.toString()).emit(event, payload);
};

// @desc Get tasks for a project (optional filters)
// @route GET /api/projects/:projectId/tasks
exports.getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // ensure member
    const isMember = project.owner.equals(req.user.id) || project.members.some(m => m.user.equals(req.user.id));
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const filter = { project: projectId };
    const { assignee, priority, label, search } = req.query;
    if (assignee) filter.assignees = assignee;
    if (priority) filter.priority = priority;
    if (label) filter.labels = label;
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ title: regex }, { description: regex }];
    }
    const tasks = await Task.find(filter)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .lean();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

// @desc Create task in project column
// @route POST /api/projects/:projectId/tasks
exports.createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { projectId } = req.params;
    const { title, description, columnId, priority, dueDate, labels, assignees } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const isMember = project.owner.equals(req.user.id) || project.members.some(m => m.user.equals(req.user.id));
    if (!isMember) return res.status(403).json({ message: 'Access denied' });
    // Determine order (append at end of column)
    const maxOrderTask = await Task.find({ project: projectId, column: columnId })
      .sort('-order')
      .limit(1)
      .lean();
    const order = maxOrderTask.length ? maxOrderTask[0].order + 1 : 0;
    const task = await Task.create({
      project: projectId,
      title,
      description,
      column: columnId,
      order,
      priority: priority || 'medium',
      dueDate,
      labels: labels || [],
      assignees: assignees || [],
      createdBy: req.user.id,
    });
    // Emit real‑time event
    emitTaskEvent(req.io, projectId, 'task_created', task);
    // Notify assignees
    if (assignees && assignees.length) {
      for (const uid of assignees) {
        await Notification.create({
          user: uid,
          type: 'task_assigned',
          message: `You were assigned to task "${task.title}"`,
          project: projectId,
          task: task._id,
        });
        // push live notification
        if (req.io) req.io.to(uid.toString()).emit('notification', { userId: uid, taskId: task._id });
      }
    }
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

// @desc Update task (title, description, priority, dueDate, labels)
// @route PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await Project.findById(task.project);
    const isMember = project.owner.equals(req.user.id) || project.members.some(m => m.user.equals(req.user.id));
    if (!isMember) return res.status(403).json({ message: 'Access denied' });
    const allowed = ['title', 'description', 'priority', 'dueDate', 'labels'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });
    await task.save();
    emitTaskEvent(req.io, task.project, 'task_updated', task);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

// @desc Delete task
// @route DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await Project.findById(task.project);
    const isMember = project.owner.equals(req.user.id) || project.members.some(m => m.user.equals(req.user.id));
    if (!isMember) return res.status(403).json({ message: 'Access denied' });
    await Task.findByIdAndDelete(id);
    emitTaskEvent(req.io, task.project, 'task_deleted', { taskId: id });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc Move task to different column / reorder
// @route PATCH /api/tasks/:id/move
exports.moveTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { columnId, newOrder } = req.body; // newOrder optional (position within column)
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await Project.findById(task.project);
    const isMember = project.owner.equals(req.user.id) || project.members.some(m => m.user.equals(req.user.id));
    if (!isMember) return res.status(403).json({ message: 'Access denied' });
    if (columnId) task.column = columnId;
    if (newOrder !== undefined) task.order = newOrder;
    await task.save();
    emitTaskEvent(req.io, task.project, 'task_moved', task);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

// @desc Assign / unassign users to task
// @route PATCH /api/tasks/:id/assign
exports.assignTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignees } = req.body; // array of user ids
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await Project.findById(task.project);
    const isMember = project.owner.equals(req.user.id) || project.members.some(m => m.user.equals(req.user.id));
    if (!isMember) return res.status(403).json({ message: 'Access denied' });
    task.assignees = assignees || [];
    await task.save();
    // Notify new assignees
    if (assignees && assignees.length) {
      for (const uid of assignees) {
        await Notification.create({
          user: uid,
          type: 'task_assigned',
          message: `You were assigned to task "${task.title}"`,
          project: task.project,
          task: task._id,
        });
        if (req.io) req.io.to(uid.toString()).emit('notification', { userId: uid, taskId: task._id });
      }
    }
    emitTaskEvent(req.io, task.project, 'task_assigned', task);
    res.json(task);
  } catch (err) {
    next(err);
  }
};
