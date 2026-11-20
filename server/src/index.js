// src/index.js
const { app, server, io } = require('./app');
const PORT = process.env.PORT || 5000;

// Start server with error handling for EADDRINUSE
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please change the PORT in .env or stop the other process.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  // Authenticate socket using JWT from query token
  const token = socket.handshake.auth?.token;
  if (token) {
    const jwt = require('jsonwebtoken');
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.id;
      // Join rooms for each project the user is member of (handled later after auth)
    } catch (err) {
      console.error('Socket auth error:', err.message);
    }
  }
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});