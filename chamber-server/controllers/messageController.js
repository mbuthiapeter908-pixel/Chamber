const Message = require('../models/Message');

const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ room: roomId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username')
      .populate('reactions.user', 'username')
      .populate('readBy', 'username');

    const total = await Message.countDocuments({ room: roomId });

    res.json({
      messages: messages.reverse(),
      pagination: { page, limit, total, pages: Math.ceil(total / limit), hasMore: skip + limit < total },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { senderId, roomId, text, isPrivate, recipientId, fileUrl, fileType } = req.body;
    const message = await Message.create({
      sender: senderId, room: roomId, text,
      isPrivate: isPrivate || false, recipient: recipientId || null,
      fileUrl: fileUrl || null, fileType: fileType || null,
    });
    const populatedMessage = await message.populate('sender', 'username');
    const io = req.app.get('io');
    if (isPrivate && recipientId) {
      io.to(recipientId).emit('private-message', populatedMessage);
    } else {
      io.to(roomId.toString()).emit('new-message', populatedMessage);
    }
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;
    const message = await Message.findByIdAndUpdate(
      messageId, { $addToSet: { readBy: userId } }, { new: true }
    ).populate('readBy', 'username');
    const io = req.app.get('io');
    io.to(message.room.toString()).emit('message-read', { messageId, userId });
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, emoji } = req.body;
    const message = await Message.findByIdAndUpdate(
      messageId, { $push: { reactions: { user: userId, emoji } } }, { new: true }
    ).populate('reactions.user', 'username');
    const io = req.app.get('io');
    io.to(message.room.toString()).emit('message-reaction', { messageId, reactions: message.reactions });
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const searchMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { query } = req.query;
    const messages = await Message.find({
      room: roomId, text: { $regex: query, $options: 'i' },
    }).populate('sender', 'username').sort({ createdAt: -1 }).limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getMessages, sendMessage, markAsRead, addReaction, searchMessages };