const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Room = require('../models/Room');
const mongoose = require('mongoose');

// GET /api/messages/:roomIdentifier - Get messages (by name or ID)
router.get('/:roomIdentifier', async (req, res) => {
  try {
    const { roomIdentifier } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Find room by name OR by ID
    let room;
    if (mongoose.Types.ObjectId.isValid(roomIdentifier)) {
      room = await Room.findById(roomIdentifier);
    } else {
      room = await Room.findOne({ name: roomIdentifier.toLowerCase() });
    }

    if (!room) {
      return res.json({ messages: [], pagination: { page, limit, total: 0, pages: 0, hasMore: false } });
    }

    const messages = await Message.find({ room: room._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username')
      .populate('reactions.user', 'username')
      .populate('readBy', 'username');

    const total = await Message.countDocuments({ room: room._id });

    // Add room name to each message for frontend filtering
    const messagesWithRoom = messages.map(msg => ({
      ...msg.toObject(),
      roomName: room.name,
      roomId: room._id
    }));

    res.json({
      messages: messagesWithRoom.reverse(),
      pagination: { page, limit, total, pages: Math.ceil(total / limit), hasMore: skip + limit < total },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;