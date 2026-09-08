const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth');
const {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  resetUserPassword,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

// Tất cả endpoints quản lý tài khoản người dùng chỉ dành riêng cho superadmin
router.use(authMiddleware, requireRole('superadmin'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.post('/:id/toggle-status', toggleUserStatus);
router.post('/:id/reset-password', resetUserPassword);
router.delete('/:id', deleteUser);

module.exports = router;

