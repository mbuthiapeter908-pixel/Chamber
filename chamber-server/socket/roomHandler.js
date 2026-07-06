const Room = require('../models/Room');
const User = require('../models/User');

module.exports = (io, socket) => {
  socket.on('create-room', async ({ name, userId, description }) => {
    try {
      const user = await User.findOne({ socketId: socket.id });
      if (!user) {
        socket.emit('room-error', { error: 'User not found. Please rejoin.' });
        return;
      }

      const roomName = name.toLowerCase().trim();
      const existingRoom = await Room.findOne({ name: roomName });
      if (existingRoom) {
        socket.emit('room-error', { error: 'Room already exists use another name' });
        return;
      }

      const room = await Room.create({
        name: roomName,
        createdBy: user._id,
        members: [user._id],
        description: description || '',
      });

      await User.findByIdAndUpdate(user._id, {
        $addToSet: { rooms: room._id },
      });

      const populatedRoom = await room.populate('members', 'username isOnline');
      
      io.emit('room-created', populatedRoom);
      socket.emit('room-created-success', populatedRoom);
    } catch (error) {
      console.error('Room creation error:', error);
      socket.emit('room-error', { error: error.message });
    }
  });

  socket.on('get-rooms', async () => {
    try {
      const rooms = await Room.find()
        .populate('members', 'username isOnline')
        .populate('createdBy', 'username');
      socket.emit('room-list', rooms);
    } catch (error) {
      socket.emit('room-error', { error: error.message });
    }
  });
};