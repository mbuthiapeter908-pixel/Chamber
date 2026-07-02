const User = require('../models/User');

module.exports = (io, socket) => {
  socket.on('user-online', async ({ username }) => {
    try {
      // Find existing user or create new one
      let user = await User.findOne({ username });

      if (user) {
        // Existing user — update socket ID and status
        user.socketId = socket.id;
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();
        console.log(`User reconnected: ${username} (${user._id})`);
      } else {
        // New user — create
        user = await User.create({
          username,
          socketId: socket.id,
          isOnline: true,
        });
        console.log(`New user created: ${username} (${user._id})`);
      }

      // Join socket room for private messaging
      socket.join(user._id.toString());

      // Broadcast online status
      io.emit('user-status-change', {
        userId: user._id,
        username: user.username,
        isOnline: true,
      });

      // Send updated online users list
      const onlineUsers = await User.find({ isOnline: true }).select('username lastSeen');
      io.emit('online-users', onlineUsers);
    } catch (error) {
      console.error('User online error:', error);
      socket.emit('error', { error: error.message });
    }
  });

  socket.on('user-offline', async ({ username }) => {
    try {
      const user = await User.findOneAndUpdate(
        { username },
        { isOnline: false, socketId: null, lastSeen: new Date() },
        { new: true }
      );

      if (user) {
        io.emit('user-status-change', {
          userId: user._id,
          username: user.username,
          isOnline: false,
        });

        const onlineUsers = await User.find({ isOnline: true }).select('username lastSeen');
        io.emit('online-users', onlineUsers);
      }
    } catch (error) {
      console.error('User offline error:', error);
    }
  });

  socket.on('disconnect', async () => {
    try {
      const user = await User.findOneAndUpdate(
        { socketId: socket.id },
        { isOnline: false, socketId: null, lastSeen: new Date() },
        { new: true }
      );

      if (user) {
        console.log(`User disconnected: ${user.username}`);
        io.emit('user-status-change', {
          userId: user._id,
          username: user.username,
          isOnline: false,
        });

        const onlineUsers = await User.find({ isOnline: true }).select('username lastSeen');
        io.emit('online-users', onlineUsers);
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  });
};