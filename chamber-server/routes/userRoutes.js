const express = require('express');
const router = express.Router();
const {
  createUser,
  getUser,
  getOnlineUsers,
  updateStatus,
} = require('../controllers/userController');

router.post('/', createUser);
router.get('/:username', getUser);
router.get('/status/online', getOnlineUsers);
router.put('/:userId/status', updateStatus);

module.exports = router;