const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { recordAdminAudit } = require('../services/adminAuditService');

async function logAuditAction(req, action, entityId, summary, before = null, after = null) {
  await recordAdminAudit({
    module: 'admin_users',
    action,
    entityType: 'admin_user',
    entityId: entityId ? String(entityId) : null,
    summary,
    before,
    after,
    userId: req.user?.id || null,
  });
}

// GET /api/users - Lấy danh sách toàn bộ admin_users (Chỉ dành cho superadmin)
const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, full_name, email, role, is_active, last_login, last_login_ip, created_at, updated_at 
       FROM admin_users 
       ORDER BY id DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getUsers error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách người dùng.' });
  }
};

// POST /api/users - Tạo tài khoản người dùng mới (Chỉ dành cho superadmin)
const createUser = async (req, res) => {
  try {
    const { username, password, full_name, email, role = 'admin' } = req.body;

    // Bắt buộc tên đăng nhập và mật khẩu
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    if (cleanUsername.length < 3 || cleanUsername.length > 50) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập phải từ 3 đến 50 ký tự.' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    const allowedRoles = ['superadmin', 'admin'];
    const targetRole = allowedRoles.includes(role) ? role : 'admin';

    // Kiểm tra username trùng lặp
    const [existing] = await pool.query('SELECT id FROM admin_users WHERE username = ?', [cleanUsername]);
    if (existing.length) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập này đã tồn tại.' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    // Họ tên và Email hoàn toàn không bắt buộc (để trống -> null)
    const cleanFullName = String(full_name || '').trim() || null;
    const cleanEmail = String(email || '').trim() || null;


    const [result] = await pool.query(
      `INSERT INTO admin_users (username, password, full_name, email, role, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [cleanUsername, passwordHash, cleanFullName, cleanEmail, targetRole]
    );

    // Ghi nhật ký hệ thống
    await logAuditAction(
      req,
      'create',
      result.insertId,
      `Tạo tài khoản: ${cleanUsername} (Quyền: ${targetRole})`,
      null,
      { username: cleanUsername, full_name: cleanFullName, email: cleanEmail, role: targetRole, is_active: 1 }
    );

    const [newUsers] = await pool.query(
      'SELECT id, username, full_name, email, role, is_active, last_login, last_login_ip, created_at FROM admin_users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản mới thành công!',
      data: newUsers[0],
    });
  } catch (err) {
    console.error('createUser error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo tài khoản.' });
  }
};

// PUT /api/users/:id - Cập nhật thông tin tài khoản (Chỉ dành cho superadmin)
const updateUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { full_name, email, role, is_active } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'ID người dùng không hợp lệ.' });
    }

    const [existing] = await pool.query('SELECT * FROM admin_users WHERE id = ?', [userId]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    const targetUser = existing[0];

    // Bảo vệ tài khoản Superadmin gốc (id = 1 hoặc username = 'admin')
    const isPrimarySuperadmin = targetUser.id === 1 || targetUser.username === 'admin';

    // Không cho phép hạ cấp hoặc vô hiệu hóa Superadmin gốc
    if (isPrimarySuperadmin) {
      if (role && role !== 'superadmin') {
        return res.status(400).json({ success: false, message: 'Không thể thay đổi quyền của tài khoản Superadmin gốc.' });
      }
      if (is_active === 0) {
        return res.status(400).json({ success: false, message: 'Tài khoản Superadmin gốc không thể bị khóa.' });
      }
    }

    // Không cho phép tự vô hiệu hóa tài khoản của chính mình
    if (req.user.id === userId && is_active === 0) {
      return res.status(400).json({ success: false, message: 'Bạn không thể tự khóa tài khoản của chính mình.' });
    }

    const allowedRoles = ['superadmin', 'admin'];
    const newRole = allowedRoles.includes(role) ? role : targetUser.role;
    const newActiveState = typeof is_active === 'boolean' ? (is_active ? 1 : 0) : (is_active !== undefined ? Number(is_active) : targetUser.is_active);
    const cleanFullName = full_name !== undefined ? String(full_name).trim() : targetUser.full_name;
    const cleanEmail = email !== undefined ? (String(email).trim() || null) : targetUser.email;

    await pool.query(
      `UPDATE admin_users 
       SET full_name = ?, email = ?, role = ?, is_active = ? 
       WHERE id = ?`,
      [cleanFullName, cleanEmail, newRole, newActiveState, userId]
    );

    await logAuditAction(
      req,
      'update',
      userId,
      `Cập nhật tài khoản: ${targetUser.username}`,
      { full_name: targetUser.full_name, email: targetUser.email, role: targetUser.role, is_active: targetUser.is_active },
      { full_name: cleanFullName, email: cleanEmail, role: newRole, is_active: newActiveState }
    );

    const [updated] = await pool.query(
      'SELECT id, username, full_name, email, role, is_active, updated_at FROM admin_users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Cập nhật tài khoản thành công!',
      data: updated[0],
    });
  } catch (err) {
    console.error('updateUser error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật tài khoản.' });
  }
};

// POST /api/users/:id/toggle-status - Khóa / Mở khóa tài khoản (Chỉ dành cho superadmin)
const toggleUserStatus = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ.' });
    }

    const [existing] = await pool.query('SELECT id, username, role, is_active FROM admin_users WHERE id = ?', [userId]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    }

    const targetUser = existing[0];

    // 1. Bảo vệ tuyệt đối Superadmin gốc hệ thống (id = 1 hoặc username = 'admin')
    if (targetUser.id === 1 || targetUser.username === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản Superadmin gốc của Sếp không thể bị khóa để đảm bảo an toàn hệ thống.',
      });
    }

    // 2. Ngăn người dùng tự khóa tài khoản của chính mình
    if (req.user.id === userId) {
      return res.status(400).json({ success: false, message: 'Bạn không thể tự khóa tài khoản của chính mình.' });
    }

    // 3. Kiểm tra số lượng Superadmin còn lại nếu định khóa 1 Superadmin khác
    if (targetUser.role === 'superadmin' && targetUser.is_active === 1) {
      const [activeSuperadmins] = await pool.query(
        "SELECT COUNT(*) AS count FROM admin_users WHERE role = 'superadmin' AND is_active = 1"
      );
      if (activeSuperadmins[0].count <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Không thể khóa Superadmin duy nhất còn lại trong hệ thống.',
        });
      }
    }

    const newStatus = targetUser.is_active ? 0 : 1;
    await pool.query('UPDATE admin_users SET is_active = ? WHERE id = ?', [newStatus, userId]);

    await logAuditAction(
      req,
      'status',
      userId,
      `${newStatus ? 'Mở khóa' : 'Khóa'} tài khoản: ${targetUser.username}`,
      { is_active: targetUser.is_active },
      { is_active: newStatus }
    );

    res.json({
      success: true,
      message: newStatus ? `Đã mở khóa tài khoản ${targetUser.username}.` : `Đã khóa tài khoản ${targetUser.username} thành công.`,
      is_active: newStatus,
    });
  } catch (err) {
    console.error('toggleUserStatus error detail:', err.message, err.stack);
    res.status(500).json({ success: false, message: 'Lỗi server khi đổi trạng thái tài khoản: ' + err.message });
  }
};

// POST /api/users/:id/reset-password - Đặt lại mật khẩu cho nhân viên (Chỉ dành cho superadmin)
const resetUserPassword = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { new_password } = req.body;

    if (!userId || !new_password || String(new_password).length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải từ 6 ký tự trở lên.' });
    }

    const [existing] = await pool.query('SELECT id, username FROM admin_users WHERE id = ?', [userId]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    }

    const hashed = await bcrypt.hash(String(new_password), 10);
    await pool.query('UPDATE admin_users SET password = ? WHERE id = ?', [hashed, userId]);

    await logAuditAction(
      req,
      'update',
      userId,
      `Đặt lại mật khẩu cho tài khoản: ${existing[0].username}`,
      null,
      { password_reset: 'Đã cập nhật mật khẩu mới' }
    );

    res.json({
      success: true,
      message: `Đã đặt lại mật khẩu cho tài khoản ${existing[0].username} thành công.`,
    });
  } catch (err) {
    console.error('resetUserPassword error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi đặt lại mật khẩu.' });
  }
};

// DELETE /api/users/:id - Xóa vĩnh viễn tài khoản nhân viên (Chỉ dành cho superadmin)
const deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'ID người dùng không hợp lệ.' });
    }

    const [existing] = await pool.query('SELECT id, username, role FROM admin_users WHERE id = ?', [userId]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản để xóa.' });
    }

    const targetUser = existing[0];

    // 1. Tuyệt đối không cho phép xóa Superadmin gốc (id = 1 hoặc username = 'admin')
    if (targetUser.id === 1 || targetUser.username === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản Superadmin gốc của Sếp được bảo vệ, tuyệt đối không thể xóa.',
      });
    }

    // 2. Không cho phép người dùng tự xóa tài khoản của chính mình
    if (req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể tự xóa tài khoản của chính mình.',
      });
    }

    // Thực hiện xóa vĩnh viễn tài khoản
    await pool.query('DELETE FROM admin_users WHERE id = ?', [userId]);

    // Ghi nhật ký hệ thống
    await logAuditAction(
      req,
      'delete',
      userId,
      `Xóa vĩnh viễn tài khoản: ${targetUser.username} (Role: ${targetUser.role})`,
      { username: targetUser.username, full_name: targetUser.full_name, email: targetUser.email, role: targetUser.role },
      null
    );

    res.json({
      success: true,
      message: `Đã xóa vĩnh viễn tài khoản ${targetUser.username} thành công.`,
    });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa tài khoản: ' + err.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  resetUserPassword,
  deleteUser,
};

