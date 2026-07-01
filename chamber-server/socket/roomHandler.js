const Room = require('../models/Room');
const User = require('../models/User');

module.exports = (io, socket) => {
  socket.on('create-room', async ({ name, userId }) => {
    try {
      console.log('Creating room:', name);

      // Find user by socket ID (since frontend sends socket.id as userId)
      const user = await User.findOne({ socketId: socket.id });
      
      if (!user) {
        console.log('User not found for socket:', socket.id);
        socket.emit('room-error', { error: 'User not found. Please rejoin.' });
        return;
      }

      const roomName = name.toLowerCase().trim();
      
      // Check if room exists
      const existingRoom = await Room.findOne({ name: roomName });
      if (existingRoom) {
        socket.emit('room-error', { error: 'Room already exists' });
        return;
      }

      // Create room
      const room = await Room.create({
        name: roomName,
        createdBy: user._id,
        members: [user._id],
      });

      // Add room to user
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { rooms: room._id },
      });

      const populatedRoom = await room.populate('members', 'username isOnline');
      
      console.log('Room created:', room.name);
      
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