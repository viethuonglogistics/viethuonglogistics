const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth');
const {
  getAuditHistory,
  deleteAuditEntry,
  restoreRevisionEntry,
  bulkDeleteAuditEntries,
} = require('../controllers/cmsRevisionController');

const router = express.Router();

router.get('/', authMiddleware, requireRole('superadmin'), getAuditHistory);
router.post('/revision/:id/restore', authMiddleware, requireRole('superadmin'), restoreRevisionEntry);
router.post('/bulk-delete', authMiddleware, requireRole('superadmin'), bulkDeleteAuditEntries);
router.delete('/:source/:id', authMiddleware, requireRole('superadmin'), deleteAuditEntry);

module.exports = router;
