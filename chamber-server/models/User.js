const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    socketId: {
      type: String,
      default: null,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    rooms: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);