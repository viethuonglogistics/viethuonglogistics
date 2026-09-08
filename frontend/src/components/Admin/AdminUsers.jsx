import { useEffect, useState, useRef } from 'react'
import {
  Users, UserPlus, RefreshCw, KeyRound, ShieldAlert, ShieldCheck,
  CheckCircle2, XCircle, Lock, Unlock, Edit3, X, Save, AlertCircle, Laptop,
  Search, Trash2
} from 'lucide-react'
import { userApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useAdminToast } from './AdminToast'
import AdminConfirmDialog from './AdminConfirmDialog'
import styles from './AdminUsers.module.scss'

const EMPTY_FORM = {
  username: '',
  password: '',
  full_name: '',
  email: '',
  role: 'admin',
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const formRef = useRef(null)
  const { showToast } = useAdminToast()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  // Tìm kiếm
  const [searchQuery, setSearchQuery] = useState('')

  // Modal reset password
  const [resetModalUser, setResetModalUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resettingPassword, setResettingPassword] = useState(false)

  // Dialog xác nhận khóa / mở khóa
  const [toggleConfirmTarget, setToggleConfirmTarget] = useState(null)
  const [togglingStatus, setTogglingStatus] = useState(false)

  // Dialog xác nhận xóa vĩnh viễn tài khoản
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null)
  const [deletingUser, setDeletingUser] = useState(false)


  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await userApi.getAll()
      setUsers(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      showToast(err.message || 'Không thể tải danh sách tài khoản.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const updateField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleEdit = (u) => {
    setEditingId(u.id)
    setForm({
      username: u.username || '',
      password: '', // Không sửa password ở form chung, đã có chức năng reset riêng
      full_name: u.full_name || '',
      email: u.email || '',
      role: u.role || 'admin',
    })
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const handleSave = async (e) => {
    e.preventDefault()

    if (!editingId) {
      // Khi tạo mới: bắt buộc username và password
      if (!form.username.trim() || !form.password) {
        showToast('Vui lòng nhập Tên đăng nhập và Mật khẩu (bắt buộc).', 'error')
        return
      }
      if (form.username.trim().length < 3) {
        showToast('Tên đăng nhập phải có ít nhất 3 ký tự.', 'error')
        return
      }
      if (form.password.length < 6) {
        showToast('Mật khẩu phải có ít nhất 6 ký tự.', 'error')
        return
      }
    }

    setSaving(true)
    try {
      if (editingId) {
        // Cập nhật thông tin
        await userApi.update(editingId, {
          full_name: form.full_name,
          email: form.email,
          role: form.role,
        })
        showToast('Đã cập nhật thông tin tài khoản thành công.')
      } else {
        // Tạo mới
        await userApi.create({
          username: form.username.trim(),
          password: form.password,
          full_name: form.full_name,
          email: form.email,
          role: form.role,
        })
        showToast('Đã tạo tài khoản mới thành công.')
      }
      resetForm()
      await fetchUsers()
    } catch (err) {
      showToast(err.message || 'Lỗi khi lưu thông tin tài khoản.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmToggleStatus = async () => {
    if (!toggleConfirmTarget) return
    setTogglingStatus(true)
    try {
      const res = await userApi.toggleStatus(toggleConfirmTarget.id)
      showToast(res.message || 'Đã thay đổi trạng thái tài khoản.')
      setToggleConfirmTarget(null)
      await fetchUsers()
    } catch (err) {
      showToast(err.message || 'Lỗi khi thay đổi trạng thái tài khoản.', 'error')
    } finally {
      setTogglingStatus(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return
    setDeletingUser(true)
    try {
      const res = await userApi.delete(deleteConfirmTarget.id)
      showToast(res.message || 'Đã xóa vĩnh viễn tài khoản thành công.')
      setDeleteConfirmTarget(null)
      if (editingId === deleteConfirmTarget.id) {
        resetForm()
      }
      await fetchUsers()
    } catch (err) {
      showToast(err.message || 'Lỗi khi xóa tài khoản.', 'error')
    } finally {
      setDeletingUser(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!resetModalUser || !newPassword) return

    if (newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự.', 'error')
      return
    }

    setResettingPassword(true)
    try {
      const res = await userApi.resetPassword(resetModalUser.id, { new_password: newPassword })
      showToast(res.message || 'Đặt lại mật khẩu thành công.')
      setResetModalUser(null)
      setNewPassword('')
    } catch (err) {
      showToast(err.message || 'Lỗi khi đặt lại mật khẩu.', 'error')
    } finally {
      setResettingPassword(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.last_login_ip && u.last_login_ip.toLowerCase().includes(q)) ||
      (q === 'admin' && u.role === 'admin') ||
      (q === 'superadmin' && u.role === 'superadmin') ||
      (q === 'sếp' && u.role === 'superadmin') ||
      (q === 'nhân viên' && u.role === 'admin')
    )
  })


  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Chưa có dữ liệu'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <Users size={24} /> Quản lý tài khoản Admin & Nhân viên
          </h1>
          <p className={styles.subtitle}>
            Khu vực đặc quyền của Super Admin (Sếp): Phân quyền nhân viên, cấp tài khoản, kiểm soát IP và trạng thái đăng nhập.
          </p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchUsers} disabled={loading}>
          <RefreshCw size={15} /> Làm mới
        </button>
      </div>

      {/* Form Tạo mới / Chỉnh sửa */}
      <form ref={formRef} className={styles.formCard} onSubmit={handleSave}>
        <div className={styles.formHeader}>
          <h2>
            {editingId ? (
              <>
                <Edit3 size={18} /> Chỉnh sửa tài khoản: <strong>{form.username}</strong>
              </>
            ) : (
              <>
                <UserPlus size={18} /> Thêm tài khoản nhân viên mới
              </>
            )}
          </h2>
          {editingId && (
            <button type="button" className={styles.cancelBtn} onClick={resetForm}>
              <X size={14} /> Hủy sửa
            </button>
          )}
        </div>

        <p className={styles.formHint}>
          💡 <strong>Quy tắc tối giản:</strong> Sếp chỉ cần điền <strong>Tên đăng nhập</strong> và <strong>Mật khẩu</strong> là tạo được tài khoản. Ô "Họ và tên" và "Email" <strong>hoàn toàn có thể để trống</strong>. Khi nhân viên đăng nhập, họ <strong>chỉ cần nhập đúng Tên đăng nhập và Mật khẩu</strong> là vào làm việc được ngay.
        </p>

        <div className={styles.grid}>
          {/* Tên đăng nhập */}
          <div className={styles.formGroup}>
            <label>
              Tên đăng nhập {!editingId && <span className={styles.required}>*</span>}
            </label>
            <input
              type="text"
              placeholder="VD: nguyenvanan, linh.nhanvien..."
              value={form.username}
              onChange={(e) => updateField('username', e.target.value)}
              disabled={!!editingId || saving}
              required={!editingId}
            />
            {editingId && <span className={styles.inputNote}>Tên đăng nhập không thể thay đổi sau khi tạo.</span>}
          </div>

          {/* Mật khẩu */}
          {!editingId ? (
            <div className={styles.formGroup}>
              <label>
                Mật khẩu ban đầu <span className={styles.required}>*</span>
              </label>
              <input
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                disabled={saving}
                required
              />
            </div>
          ) : (
            <div className={styles.formGroup}>
              <label>Mật khẩu</label>
              <div className={styles.passwordNoteWrap}>
                <span className={styles.inputNote}>
                  Dùng chức năng <strong>"Đổi mật khẩu"</strong> tại bảng bên dưới nếu cần cấp lại mật khẩu cho nhân viên.
                </span>
              </div>
            </div>
          )}

          {/* Họ và tên (Không bắt buộc) */}
          <div className={styles.formGroup}>
            <label>Họ và tên nhân viên (Không bắt buộc — có thể để trống)</label>
            <input
              type="text"
              placeholder="Có thể để trống hoặc điền sau..."
              value={form.full_name}
              onChange={(e) => updateField('full_name', e.target.value)}
              disabled={saving}
            />
          </div>

          {/* Email (Không bắt buộc) */}
          <div className={styles.formGroup}>
            <label>Email (Không bắt buộc — có thể để trống)</label>
            <input
              type="email"
              placeholder="Có thể để trống hoặc điền sau..."
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              disabled={saving}
            />
          </div>


          {/* Vai trò / Phân quyền */}
          <div className={styles.formGroup}>
            <label>
              Phân quyền tài khoản <span className={styles.required}>*</span>
            </label>
            <select
              value={form.role}
              onChange={(e) => updateField('role', e.target.value)}
              disabled={saving || (editingId && (form.username === 'admin' || editingId === 1))}
            >
              <option value="admin">ADMIN / NHÂN VIÊN — Vận hành hằng ngày (Tin tức, Dịch vụ, Chi nhánh, CRM...)</option>
              <option value="superadmin">SUPER ADMIN — Toàn quyền quản trị hệ thống & quản lý tài khoản</option>
            </select>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            <Save size={16} />
            {saving ? 'Đang lưu...' : editingId ? 'Lưu cập nhật' : 'Tạo tài khoản'}
          </button>
        </div>
      </form>

      {/* Danh sách tài khoản */}
      <div className={styles.listCard}>
        <div className={styles.listHeader}>
          <div className={styles.listHeaderLeft}>
            <h2>
              Danh sách tài khoản hệ thống ({filteredUsers.length}
              {filteredUsers.length !== users.length ? ` / ${users.length}` : ''})
            </h2>
            <span className={styles.listMeta}>Hiển thị thời gian và IP đăng nhập để giám sát an toàn</span>
          </div>

          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm theo tài khoản, họ tên, email, IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.searchClearBtn}
                onClick={() => setSearchQuery('')}
                title="Xóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tài khoản / Nhân viên</th>
                <th>Phân quyền</th>
                <th>Lần đăng nhập cuối & IP máy trạm</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isMaster = u.id === 1 || u.username === 'admin'
                const isSelf = u.id === currentUser?.id
                const isLocked = u.is_active === 0

                return (
                  <tr key={u.id} className={isLocked ? styles.rowLocked : ''}>
                    {/* Tài khoản */}
                    <td>
                      <div className={styles.userInfoCol}>
                        <span className={styles.usernameText}>{u.username}</span>
                        <span className={styles.fullNameText}>
                          {u.full_name ? u.full_name : <span className={styles.emptyVal}>(Chưa có họ tên)</span>}
                        </span>
                        {u.email ? (
                          <span className={styles.emailText}>{u.email}</span>
                        ) : (
                          <span className={styles.emptyVal}>(Chưa có email)</span>
                        )}
                      </div>
                    </td>


                    {/* Phân quyền */}
                    <td>
                      {u.role === 'superadmin' ? (
                        <span className={`${styles.badge} ${styles.badgeSuper}`}>
                          <ShieldAlert size={12} /> SUPER ADMIN
                        </span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeStaff}`}>
                          <ShieldCheck size={12} /> ADMIN / NHÂN VIÊN
                        </span>
                      )}
                    </td>

                    {/* IP & Thời gian đăng nhập */}
                    <td>
                      <div className={styles.loginTrackCol}>
                        {u.last_login ? (
                          <>
                            <div className={styles.loginTime}>
                              {formatDateTime(u.last_login)}
                            </div>
                            <div className={styles.ipBadgeWrap}>
                              <Laptop size={12} />
                              <span className={styles.ipBadge}>
                                {u.last_login_ip || '127.0.0.1'}
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className={styles.emptyVal}>Chưa đăng nhập lần nào</span>
                        )}
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td>
                      {isLocked ? (
                        <span className={`${styles.badge} ${styles.badgeLocked}`}>
                          <XCircle size={12} /> Đang bị khóa
                        </span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeActive}`}>
                          <CheckCircle2 size={12} /> Đang hoạt động
                        </span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td>
                      <div className={styles.actionCol}>
                        {/* Sửa thông tin */}
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => handleEdit(u)}
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit3 size={15} />
                        </button>

                        {/* Reset password */}
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => {
                            setResetModalUser(u)
                            setNewPassword('')
                          }}
                          title="Đổi mật khẩu cho nhân viên"
                        >
                          <KeyRound size={15} />
                        </button>

                        {/* Khóa / Mở khóa */}
                        {isMaster ? (
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnDisabled}`}
                            disabled
                            title="Tài khoản Superadmin gốc của Sếp được bảo vệ, không thể khóa."
                          >
                            <Lock size={15} />
                          </button>
                        ) : isSelf ? (
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnDisabled}`}
                            disabled
                            title="Bạn không thể tự khóa tài khoản của chính mình."
                          >
                            <Lock size={15} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${isLocked ? styles.unlockBtn : styles.lockBtn}`}
                            onClick={() => setToggleConfirmTarget(u)}
                            title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          >
                            {isLocked ? <Unlock size={15} /> : <Lock size={15} />}
                          </button>
                        )}

                        {/* Xóa vĩnh viễn tài khoản */}
                        {isMaster ? (
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnDisabled}`}
                            disabled
                            title="Tài khoản Superadmin gốc của Sếp được bảo vệ, tuyệt đối không thể xóa."
                          >
                            <Trash2 size={15} />
                          </button>
                        ) : isSelf ? (
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnDisabled}`}
                            disabled
                            title="Bạn không thể tự xóa tài khoản của chính mình."
                          >
                            <Trash2 size={15} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => setDeleteConfirmTarget(u)}
                            title="Xóa vĩnh viễn tài khoản nhân viên"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className={styles.emptyRow}>
                    {searchQuery.trim()
                      ? `Không tìm thấy tài khoản nào khớp với từ khóa "${searchQuery.trim()}".`
                      : 'Chưa có tài khoản nào được hiển thị.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Modal Reset Mật Khẩu */}
      {resetModalUser && (
        <div className={styles.modalOverlay} onClick={() => !resettingPassword && setResetModalUser(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleWrap}>
                <KeyRound size={20} />
                <h3>Đổi mật khẩu cho: {resetModalUser.username}</h3>
              </div>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setResetModalUser(null)}
                disabled={resettingPassword}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className={styles.modalBody}>
                <p className={styles.modalDesc}>
                  Nhập mật khẩu mới bên dưới để đặt lại cho tài khoản <strong>{resetModalUser.username}</strong> ({resetModalUser.full_name || 'Nhân viên'}).
                </p>

                <div className={styles.formGroup}>
                  <label>Mật khẩu mới (Tối thiểu 6 ký tự) *</label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu mới..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    autoFocus
                    disabled={resettingPassword}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setResetModalUser(null)}
                  disabled={resettingPassword}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={resettingPassword}
                >
                  {resettingPassword ? 'Đang lưu...' : 'Xác nhận đặt mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog xác nhận khóa / mở khóa tài khoản */}
      <AdminConfirmDialog
        open={!!toggleConfirmTarget}
        title={toggleConfirmTarget?.is_active ? 'Khóa tài khoản nhân viên?' : 'Mở khóa tài khoản?'}
        message={
          toggleConfirmTarget?.is_active
            ? `Khi bị khóa, nhân viên "${toggleConfirmTarget?.username}" sẽ bị đăng xuất ngay lập tức và không thể truy cập hệ thống nữa.`
            : `Mở khóa cho tài khoản "${toggleConfirmTarget?.username}" để nhân viên có thể tiếp tục đăng nhập.`
        }
        target={toggleConfirmTarget?.username}
        confirmText={toggleConfirmTarget?.is_active ? 'Khóa tài khoản' : 'Mở khóa ngay'}
        cancelText="Hủy"
        variant={toggleConfirmTarget?.is_active ? 'delete' : 'restore'}
        busy={togglingStatus}
        onCancel={() => setToggleConfirmTarget(null)}
        onConfirm={handleConfirmToggleStatus}
      />

      {/* Dialog xác nhận xóa vĩnh viễn tài khoản */}
      <AdminConfirmDialog
        open={!!deleteConfirmTarget}
        title="Xóa vĩnh viễn tài khoản nhân viên?"
        message="Hành động này sẽ xóa hoàn toàn tài khoản khỏi cơ sở dữ liệu và không thể khôi phục lại."
        target={deleteConfirmTarget ? `${deleteConfirmTarget.username} (${deleteConfirmTarget.full_name || 'Nhân viên'})` : ''}
        confirmText="Xóa vĩnh viễn"
        cancelText="Hủy"
        variant="delete"
        busy={deletingUser}
        onCancel={() => setDeleteConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

