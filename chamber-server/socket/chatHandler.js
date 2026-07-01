const Message = require('../models/Message');
const User = require('../models/User');
const Room = require('../models/Room');

module.exports = (io, socket) => {
  socket.on('join-room', async ({ roomId }) => {
    socket.join(roomId);
    const user = await User.findOne({ socketId: socket.id });
    if (user) {
      socket.to(roomId).emit('user-joined', { userId: user._id, username: user.username, roomId });
    }
  });

  socket.on('leave-room', ({ roomId }) => {
    socket.leave(roomId);
  });

  socket.on('send-message', async (data) => {
    try {
      const { roomId, text } = data;

      // Find the actual user by socket ID
      const user = await User.findOne({ socketId: socket.id });
      if (!user) {
        socket.emit('message-error', { error: 'User not found. Please rejoin.' });
        return;
      }

      // Find or create the room
      let room = await Room.findOne({ name: roomId.toLowerCase() });
      if (!room) {
        room = await Room.create({
          name: roomId.toLowerCase(),
          createdBy: user._id,
          members: [user._id],
        });
      }

      // Create the message
      const message = await Message.create({
        sender: user._id,
        room: room._id,
        text: text,
      });

      // Populate sender info
      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username')
        .populate('room','name')
        .populate('reactions.user', 'username');

      console.log('Message saved:', populatedMessage.text);

      // Send to all in room
      io.to(roomId).emit('new-message', populatedMessage);
    } catch (error) {
      console.error('Message error:', error);
      socket.emit('message-error', { error: error.message });
    }
  });

  socket.on('typing-start', ({ roomId, username }) => {
    socket.to(roomId).emit('user-typing', { username, isTyping: true });
  });

  socket.on('typing-stop', ({ roomId, username }) => {
    socket.to(roomId).emit('user-typing', { username, isTyping: false });
  });

  socket.on('mark-read', async ({ messageId }) => {
    try {
      const user = await User.findOne({ socketId: socket.id });
      if (!user) return;

      const message = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { readBy: user._id } },
        { new: true }
      );
      if (message) {
        io.to(message.room.toString()).emit('message-read', {
          messageId,
          userId: user._id,
          readBy: message.readBy,
        });
      }
    } catch (error) {
      socket.emit('error', { error: error.message });
    }
  });

  socket.on('add-reaction', async ({ messageId, emoji }) => {
    try {
      const user = await User.findOne({ socketId: socket.id });
      if (!user) return;

      const message = await Message.findByIdAndUpdate(
        messageId,
        { $push: { reactions: { user: user._id, emoji } } },
        { new: true }
      ).populate('reactions.user', 'username');

      if (message) {
        io.to(message.room.toString()).emit('message-reaction', {
          messageId,
          reactions: message.reactions,
        });
      }
    } catch (error) {
      socket.emit('error', { error: error.message });
    }
  });
};