const Room = require('../models/Room');
const User = require('../models/User');

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('members', 'username isOnline').populate('createdBy', 'username');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createRoom = async (req, res) => {
  try {
    const { name, userId, isPrivate, description } = req.body;
    const existingRoom = await Room.findOne({ name: name.toLowerCase() });
    if (existingRoom) return res.status(400).json({ error: 'Room already exists' });
    const room = await Room.create({ name: name.toLowerCase(), createdBy: userId, members: [userId], isPrivate: isPrivate || false, description: description || '' });
    await User.findByIdAndUpdate(userId, { $addToSet: { rooms: room._id } });
    const populatedRoom = await room.populate('members', 'username isOnline');
    const io = req.app.get('io');
    io.emit('room-created', populatedRoom);
    res.status(201).json(populatedRoom);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;
    const room = await Room.findByIdAndUpdate(roomId, { $addToSet: { members: userId } }, { new: true }).populate('members', 'username isOnline');
    if (!room) return res.status(404).json({ error: 'Room not found' });
    await User.findByIdAndUpdate(userId, { $addToSet: { rooms: roomId } });
    const io = req.app.get('io');
    const user = await User.findById(userId, 'username');
    io.to(roomId).emit('user-joined-room', { roomId, user: { id: userId, username: user.username } });
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;
    await Room.findByIdAndUpdate(roomId, { $pull: { members: userId } });
    await User.findByIdAndUpdate(userId, { $pull: { rooms: roomId } });
    const io = req.app.get('io');
    const user = await User.findById(userId, 'username');
    io.to(roomId).emit('user-left-room', { roomId, user: { id: userId, username: user.username } });
    res.json({ message: 'Left room successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getRoomMembers = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId).populate('members', 'username isOnline lastSeen');
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room.members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getRooms, createRoom, joinRoom, leaveRoom, getRoomMembers };