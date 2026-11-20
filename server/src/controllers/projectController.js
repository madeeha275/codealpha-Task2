// src/controllers/projectController.js
const Project = require('../models/Project');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Helper to create default columns if none provided
const defaultColumns = [
  { title: 'To Do', order: 0 },
  { title: 'In Progress', order: 1 },
  { title: 'In Review', order: 2 },
  { title: 'Done', order: 3 },
];

// @desc Get all projects for logged‑in user
// @route GET /api/projects
exports.getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .lean();
    res.json(projects);
  } catch (err) {
    next(err);
  }
};

// @desc Create a new project
// @route POST /api/projects
exports.createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, description, color } = req.body;
    const ownerId = req.user.id;
    const project = await Project.create({
      name,
      description,
      color,
      owner: ownerId,
      // Ensure the creator is added as a member with role "owner"
      members: [{ user: ownerId, role: 'owner' }],
      columns: defaultColumns.map((c) => ({ ...c })),
    });
    // Return a consistent shape { project }
    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
};

// @desc Get single project with details
// @route GET /api/projects/:id
exports.getProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }
    // Do not use .lean() to retain document methods like equals()
    const project = await Project.findById(id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // ensure requester is member (owner or listed member)
    const isMember =
      project.owner.equals(req.user.id) ||
      project.members.some((m) => m.user.equals(req.user.id));
    if (!isMember) return res.status(403).json({ message: 'Access denied' });
    res.json(project);
  } catch (err) {
    next(err);
  }
};

// @desc Update project (name, description, color)
// @route PUT /api/projects/:id
exports.updateProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // only owner or admin can edit
    const member = project.members.find((m) => m.user.equals(req.user.id));
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    if (name) project.name = name;
    if (description) project.description = description;
    if (color) project.color = color;
    await project.save();
    res.json(project);
  } catch (err) {
    next(err);
  }
};

// @desc Delete project
// @route DELETE /api/projects/:id
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // only owner can delete
    if (!project.owner.equals(req.user.id)) {
      return res.status(403).json({ message: 'Only owner can delete project' });
    }
    await project.remove();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc Invite member by email
// @route POST /api/projects/:id/members
exports.addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body; // role optional, defaults to member
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // only owner or admin can invite
    const member = project.members.find((m) => m.user.equals(req.user.id));
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    // prevent duplicate
    if (project.members.some((m) => m.user.equals(user._id))) {
      return res.status(400).json({ message: 'User already a member' });
    }
    project.members.push({ user: user._id, role: role || 'member' });
    await project.save();
    // Emit notification via Socket.IO (if connected)
    if (req.io) {
      req.io.to(project._id.toString()).emit('member_added', {
        projectId: project._id,
        userId: user._id,
        role: role || 'member',
      });
    }
    res.status(201).json({ message: 'Member added', member: { user: user._id, role: role || 'member' } });
  } catch (err) {
    next(err);
  }
};

// @desc Remove member
// @route DELETE /api/projects/:id/members/:userId
exports.removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // only owner or admin can remove, and cannot remove owner
    const requester = project.members.find((m) => m.user.equals(req.user.id));
    if (!requester || (requester.role !== 'owner' && requester.role !== 'admin')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    if (project.owner.equals(userId)) {
      return res.status(400).json({ message: 'Cannot remove owner' });
    }
    const beforeCount = project.members.length;
    project.members = project.members.filter((m) => !m.user.equals(userId));
    if (project.members.length === beforeCount) {
      return res.status(404).json({ message: 'Member not found in project' });
    }
    await project.save();
    if (req.io) {
      req.io.to(project._id.toString()).emit('member_removed', { projectId: project._id, userId });
    }
    res.json({ message: 'Member removed' });
  } catch (err) {
    next(err);
  }
};

// @desc Column CRUD (add, rename, delete, reorder)
// For brevity, implement add column. Others can be extended similarly.
exports.addColumn = async (req, res, next) => {
  try {
    const { title } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // only owner/admin can modify columns
    const member = project.members.find((m) => m.user.equals(req.user.id));
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    const maxOrder = project.columns.reduce((max, col) => (col.order > max ? col.order : max), -1);
    project.columns.push({ title, order: maxOrder + 1 });
    await project.save();
    res.status(201).json(project.columns);
  } catch (err) {
    next(err);
  }
};