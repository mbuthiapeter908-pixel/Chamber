const User = require('../models/User');

const createUser = async (req, res) => {
  try {
    const { username, socketId } = req.body;
    let user = await User.findOne({ username });
    if (user) {
      user.socketId = socketId; user.isOnline = true; user.lastSeen = new Date();
      await user.save();
    } else {
      user = await User.create({ username, socketId, isOnline: true });
    }
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).populate('rooms', 'name');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOnlineUsers = async (req, res) => {
  try {
    const users = await User.find({ isOnline: true }).select('username lastSeen');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isOnline, socketId } = req.body;
    const user = await User.findByIdAndUpdate(userId, { isOnline, socketId: socketId || null, lastSeen: new Date() }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createUser, getUser, getOnlineUsers, updateStatus };