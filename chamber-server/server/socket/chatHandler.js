const Message = require('../models/Message');
const User = require('../models/User');

module.exports = (io, socket) => {
  socket.on('join-room', async ({ roomId, userId }) => {
    socket.join(roomId);
    const user = await User.findById(userId, 'username');
    socket.to(roomId).emit('user-joined', { userId, username: user?.username, roomId });
  });

  socket.on('leave-room', ({ roomId, userId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-left', { userId, roomId });
  });

  socket.on('send-message', async (data) => {
    try {
      const { senderId, roomId, text, isPrivate, recipientId } = data;

      const message = await Message.create({
        sender: senderId,
        room: roomId,
        text,
        isPrivate: isPrivate || false,
        recipient: recipientId || null,
      });

      const populatedMessage = await message.populate('sender', 'username');

      if (isPrivate && recipientId) {
        io.to(recipientId).emit('private-message', populatedMessage);
        socket.emit('new-message', populatedMessage);
      } else {
        io.to(roomId).emit('new-message', populatedMessage);
      }
    } catch (error) {
      socket.emit('message-error', { error: error.message });
    }
  });

  socket.on('typing-start', ({ roomId, username }) => {
    socket.to(roomId).emit('user-typing', { username, isTyping: true });
  });

  socket.on('typing-stop', ({ roomId, username }) => {
    socket.to(roomId).emit('user-typing', { username, isTyping: false });
  });

  socket.on('mark-read', async ({ messageId, userId }) => {
    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { readBy: userId } },
        { new: true }
      );
      if (message) {
        io.to(message.room.toString()).emit('message-read', { messageId, userId, readBy: message.readBy });
      }
    } catch (error) {
      socket.emit('error', { error: error.message });
    }
  });

  socket.on('add-reaction', async ({ messageId, userId, emoji }) => {
    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { $push: { reactions: { user: userId, emoji } } },
        { new: true }
      ).populate('reactions.user', 'username');
      if (message) {
        io.to(message.room.toString()).emit('message-reaction', { messageId, reactions: message.reactions });
      }
    } catch (error) {
      socket.emit('error', { error: error.message });
    }
  });
};