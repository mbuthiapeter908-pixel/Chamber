const Message = require('../models/Message');
const User = require('../models/User');
const Room = require('../models/Room');

module.exports = (io, socket) => {
  // Join a room
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

  // Start private chat
  socket.on('start-private-chat', async ({ targetUserId }) => {
    try {
      const currentUser = await User.findOne({ socketId: socket.id });
      const targetUser = await User.findById(targetUserId);
      
      if (!currentUser || !targetUser) {
        socket.emit('error', { error: 'User not found' });
        return;
      }

      // Don't DM yourself
      if (currentUser._id.toString() === targetUserId) {
        socket.emit('error', { error: 'You cannot message yourself' });
        return;
      }

      // Create short unique room name
      const ids = [currentUser._id.toString(), targetUser._id.toString()].sort();
      const shortId1 = ids[0].slice(-8);
      const shortId2 = ids[1].slice(-8);
      const dmRoomName = `dm-${shortId1}-${shortId2}`;
      
      console.log('🔒 Creating DM:', dmRoomName);
      
      let dmRoom = await Room.findOne({ name: dmRoomName });
      if (!dmRoom) {
        dmRoom = await Room.create({
          name: dmRoomName,
          createdBy: currentUser._id,
          members: [currentUser._id, targetUser._id],
          isPrivate: true,
          description: `DM: ${currentUser.username} & ${targetUser.username}`,
        });
        console.log('📁 Created DM room:', dmRoomName);
      }

      socket.join(dmRoomName);
      console.log(`👤 ${currentUser.username} joined DM: ${dmRoomName}`);

      if (targetUser.socketId) {
        const targetSocket = io.sockets.sockets.get(targetUser.socketId);
        if (targetSocket) {
          targetSocket.join(dmRoomName);
        }
      }

      socket.emit('private-room-created', {
        room: {
          name: dmRoomName,
          displayName: targetUser.username,
          isPrivate: true,
          id: dmRoom._id,
        },
      });

      if (targetUser.socketId) {
        io.to(targetUser.socketId).emit('private-room-created', {
          room: {
            name: dmRoomName,
            displayName: currentUser.username,
            isPrivate: true,
            id: dmRoom._id,
          },
        });
      }
    } catch (error) {
      console.error('Private chat error:', error);
      socket.emit('error', { error: error.message });
    }
  });

  // Send message
  socket.on('send-message', async (data) => {
    try {
      const { roomId, text } = data;

      const user = await User.findOne({ socketId: socket.id });
      if (!user) {
        socket.emit('message-error', { error: 'User not found' });
        return;
      }

      let room = await Room.findOne({ name: roomId.toLowerCase() });
      if (!room) {
        room = await Room.findOne({ name: roomId });
      }
      
      if (!room) {
        room = await Room.create({
          name: roomId.toLowerCase(),
          createdBy: user._id,
          members: [user._id],
        });
      }

      const message = await Message.create({
        sender: user._id,
        room: room._id,
        text: text,
        isPrivate: room.isPrivate || false,
      });

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username')
        .populate('room', 'name isPrivate');

      const messageToSend = {
        _id: populatedMessage._id,
        text: populatedMessage.text,
        sender: populatedMessage.sender,
        room: room.name,
        roomName: room.name,
        roomId: room._id,
        isPrivate: room.isPrivate,
        createdAt: populatedMessage.createdAt,
        reactions: [],
        readBy: [],
      };

      io.to(roomId).emit('new-message', messageToSend);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('message-error', { error: error.message });
    }
  });

  // Typing
  socket.on('typing-start', ({ roomId, username }) => {
    socket.to(roomId).emit('user-typing', { username, isTyping: true });
  });

  socket.on('typing-stop', ({ roomId, username }) => {
    socket.to(roomId).emit('user-typing', { username, isTyping: false });
  });

  // Mark read
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
          messageId, userId: user._id, readBy: message.readBy,
        });
      }
    } catch (error) {
      socket.emit('error', { error: error.message });
    }
  });

  // Reactions
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
          messageId, reactions: message.reactions,
        });
      }
    } catch (error) {
      socket.emit('error', { error: error.message });
    }
  });
};