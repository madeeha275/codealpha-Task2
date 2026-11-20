// src/routes/notifications.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  markRead,
  markAllRead,
} = require('../controllers/notificationController');

const router = express.Router();
router.use(protect);
router.get('/', getNotifications);
router.patch('/:id/read', markRead);
router.patch('/read-all', markAllRead);

module.exports = router;
