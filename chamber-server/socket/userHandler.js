const User = require('../models/User');

module.exports = (io, socket) => {
  socket.on('user-online', async ({ username }) => {
    try {
      let user = await User.findOne({ username });
      if (user) {
        user.socketId = socket.id; user.isOnline = true; user.lastSeen = new Date();
        await user.save();
      } else {
        user = await User.create({ username, socketId: socket.id, isOnline: true });
      }
      socket.join(user._id.toString());
      io.emit('user-status-change', { userId: user._id, username: user.username, isOnline: true });
      const onlineUsers = await User.find({ isOnline: true }).select('username lastSeen');
      io.emit('online-users', onlineUsers);
    } catch (error) {
      socket.emit('error', { error: error.message });
    }
  });

  socket.on('user-offline', async ({ userId }) => {
    try {
      await User.findByIdAndUpdate(userId, { isOnline: false, socketId: null, lastSeen: new Date() });
      io.emit('user-status-change', { userId, isOnline: false });
      const onlineUsers = await User.find({ isOnline: true }).select('username lastSeen');
      io.emit('online-users', onlineUsers);
    } catch (error) {
      socket.emit('error', { error: error.message });
    }
  });

  socket.on('disconnect', async () => {
    try {
      const user = await User.findOneAndUpdate(
        { socketId: socket.id }, { isOnline: false, socketId: null, lastSeen: new Date() }, { new: true }
      );
      if (user) {
        io.emit('user-status-change', { userId: user._id, username: user.username, isOnline: false });
        const onlineUsers = await User.find({ isOnline: true }).select('username lastSeen');
        io.emit('online-users', onlineUsers);
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  });
};