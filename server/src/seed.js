// src/seed.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Comment = require('./models/Comment');
const { connectDB } = require('./config/db');

const seed = async () => {
  // Use the shared DB connection helper (includes in‑memory fallback)
  await connectDB();
  console.log('MongoDB connected for seeding');

  // Clean existing data
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    Comment.deleteMany({}),
  ]);

  // Create demo users
  const passwordHash = await bcrypt.hash('password123', 10);
  const userA = await User.create({ name: 'Alice Demo', email: 'alice@example.com', password: passwordHash, avatar: '' });
  const userB = await User.create({ name: 'Bob Demo', email: 'bob@example.com', password: passwordHash, avatar: '' });

  // Create demo project with default columns
  const project = await Project.create({
    name: 'Demo Project',
    description: 'A sample project for demo purposes',
    color: '#ffcc00',
    owner: userA._id,
    members: [
      { user: userA._id, role: 'owner' },
      { user: userB._id, role: 'member' },
    ],
    columns: [
      { title: 'To Do', order: 0 },
      { title: 'In Progress', order: 1 },
      { title: 'In Review', order: 2 },
      { title: 'Done', order: 3 },
    ],
  });

  // Create demo tasks
  const todoColumn = project.columns.find(c => c.title === 'To Do');
  const task1 = await Task.create({
    project: project._id,
    title: 'Set up repository',
    description: 'Initialize git repo and push initial commit',
    column: todoColumn._id,
    order: 0,
    priority: 'high',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days later
    labels: ['setup'],
    assignees: [userA._id],
    createdBy: userA._id,
  });

  const task2 = await Task.create({
    project: project._id,
    title: 'Design UI mockups',
    description: 'Create wireframes for the Kanban board',
    column: todoColumn._id,
    order: 1,
    priority: 'medium',
    labels: ['design'],
    assignees: [userB._id],
    createdBy: userA._id,
  });

  // Add a comment
  await Comment.create({
    task: task1._id,
    project: project._id,
    author: userB._id,
    text: 'Looks good! I will start working on this.',
  });

  console.log('Seeding complete. Demo credentials:');
  console.log('Alice: alice@example.com / password123');
  console.log('Bob:   bob@example.com / password123');
  process.exit(0);
};

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
