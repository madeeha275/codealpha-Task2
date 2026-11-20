// src/controllers/notificationController.js
const Notification = require('../models/Notification');

// @desc Get notifications for logged‑in user
// @route GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort('-createdAt')
      .lean();
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

// @desc Mark single notification as read
// @route PATCH /api/notifications/:id/read
exports.markRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOne({ _id: req.params.id, user: req.user.id });
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    notif.isRead = true;
    await notif.save();
    res.json({ message: 'Marked as read' });
  } catch (err) {
    next(err);
  }
};

// @desc Mark all notifications as read
// @route PATCH /api/notifications/read-all
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};
