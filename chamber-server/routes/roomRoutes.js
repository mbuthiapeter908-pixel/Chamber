const express = require('express');
const router = express.Router();
const {
  getRooms,
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomMembers,
} = require('../controllers/roomController');

router.get('/', getRooms);
router.post('/', createRoom);
router.post('/:roomId/join', joinRoom);
router.post('/:roomId/leave', leaveRoom);
router.get('/:roomId/members', getRoomMembers);

module.exports = router;