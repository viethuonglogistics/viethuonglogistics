# BẢNG TIÊU CHUẨN KIỂM THỬ — TEST CHECKLIST

Tài liệu này định nghĩa ma trận kiểm thử phân tầng (**Testing Depth Matrix**) và danh mục các kịch bản kiểm thử bắt buộc cho dự án Việt Hương Logistics.

---

## 1. PHÂN TẦNG ĐỘ SÂU KIỂM THỬ (TESTING DEPTH MATRIX)

| Cấp độ | Phạm vi thay đổi | Yêu cầu kiểm thử tối thiểu |
| :--- | :--- | :--- |
| **Tier 1 (Nhẹ)** | Sửa text, cập nhật CSS/SCSS nhỏ, chỉnh sửa nhãn giao diện | - Kiểm tra hiển thị giao diện trên trình duyệt.<br>- Chạy `npm run build` xác nhận không lỗi biên dịch. |
| **Tier 2 (Trung bình)** | Sửa component React, thêm field biểu mẫu, logic validate form | - Kiểm tra tương tác component (click, submit, modal, toast).<br>- Kiểm tra trạng thái rỗng (empty state) và trạng thái tải (loading state).<br>- Chạy `npm run build`. |
| **Tier 3 (Nghiêm trọng)** | Sửa API routes, controller, JWT auth, middleware, helper backend | - Viết và chạy script kiểm thử API tự động trên Localhost (`node script.js`).<br>- Kiểm tra các mã trạng thái HTTP (200, 201, 400, 401, 403, 404, 500).<br>- Chạy bài test hồi quy cho các endpoint kế cận. |
| **Tier 4 (Tối quan trọng)** | Sửa đổi CSDL, Schema migration, phân quyền RBAC, bảo mật hệ thống | - Kiểm thử 100% kịch bản phân quyền (Ma trận Superadmin vs Admin).<br>- Kiểm thử khóa/mở khóa tài khoản và thu hồi session.<br>- Kiểm tra tính toàn vẹn CSDL và lỗi Collation MySQL.<br>- Chạy toàn bộ bộ test hồi quy hệ thống (Full Regression Suite). |

---

## 2. DANH MỤC KIỂM THỬ CHI TIẾT (TEST CHECKLISTS)

### 2.1. Xác thực & Quản lý Phiên (Authentication & Session)
- [ ] **TC-AUTH-01**: Đăng nhập Superadmin với username/password đúng -> Cấp Token JWT, lưu role `superadmin`.
- [ ] **TC-AUTH-02**: Đăng nhập với mật khẩu sai -> Trả về HTTP 401 Unauthorized, thông báo rõ ràng.
- [ ] **TC-AUTH-03**: Đăng nhập với username không tồn tại -> Trả về HTTP 401 Unauthorized.
- [ ] **TC-AUTH-04**: Đăng nhập bằng tài khoản bị khóa (`is_active = 0`) -> Trả về HTTP 403 Forbidden (*"Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Sếp"*).
- [ ] **TC-AUTH-05**: Gọi API có `authMiddleware` khi token hết hạn hoặc sai -> Trả về HTTP 401.
- [ ] **TC-AUTH-06**: Tài khoản bị khóa trong lúc đang mở web -> Phiên làm việc bị thu hồi ngay ở thao tác kế tiếp (HTTP 401).
- [ ] **TC-AUTH-07**: Đăng nhập thành công -> CSDL tự động ghi nhận thời gian `last_login` và địa chỉ `last_login_ip`.

---

### 2.2. Phân quyền & Giới hạn Vai trò (RBAC Security & Role Boundaries)
- [ ] **TC-RBAC-01 (Bảo vệ Sếp tối cao)**: Thao tác khóa hoặc hạ cấp Superadmin gốc (`id: 1` hoặc `username: admin`) -> Bị từ chối với HTTP 400. Nút khóa trên giao diện bị mờ (Disabled).
- [ ] **TC-RBAC-02 (Ngăn tự khóa)**: Người dùng đang đăng nhập không thể tự bấm khóa tài khoản của chính mình -> HTTP 400.
- [ ] **TC-RBAC-03 (Bảo vệ Superadmin cuối)**: Không thể khóa Superadmin nếu đó là Superadmin duy nhất còn hoạt động trong hệ thống.
- [ ] **TC-RBAC-04 (Chặn nhân viên vào Quản lý User)**: Nhân viên (`admin`) gọi GET/POST `/api/users` -> Trả về HTTP 403 Forbidden. Menu "Tài khoản Admin" ẩn trên Sidebar.
- [ ] **TC-RBAC-05 (Chặn nhân viên vào Nhật ký)**: Nhân viên (`admin`) gọi `/api/cms-revisions` -> Trả về HTTP 403 Forbidden. Menu "Lịch sử chỉnh sửa" ẩn trên Sidebar.
- [ ] **TC-RBAC-06 (Quyền vận hành của nhân viên)**: Nhân viên (`admin`) được phép thêm/sửa tin tức, dịch vụ, xem và xử lý báo giá khách hàng (CRM) mà không gặp trở ngại.

---

### 2.3. Biểu mẫu Quản lý Tài khoản Đơn giản (User Management UX)
- [ ] **TC-USER-01**: Sếp tạo tài khoản nhân viên mới CHỈ ĐIỀN Tên đăng nhập & Mật khẩu (bỏ trống Họ tên & Email) -> Tạo thành công HTTP 201.
- [ ] **TC-USER-02**: Họ tên mặc định tự lấy theo Tên đăng nhập nếu không nhập. Email tự động lưu `null`.
- [ ] **TC-USER-03**: Nhập trùng tên đăng nhập đã có -> Trả về HTTP 400 (*"Tên đăng nhập này đã tồn tại"*).
- [ ] **TC-USER-04**: Đặt lại mật khẩu nhân viên với mật khẩu mới >= 6 ký tự -> Cập nhật thành công bằng mã băm `bcryptjs`.
- [ ] **TC-USER-05**: Bảng danh sách hiển thị huy hiệu `🌐 IP: [địa chỉ]` để Sếp giám sát dùng chung tài khoản.

---

### 2.4. Tính toàn vẹn Cơ sở dữ liệu & Collation MySQL
- [ ] **TC-DB-01**: Mọi câu lệnh `JOIN` giữa bảng có chứa chuỗi text tiếng Việt (ví dụ `blogs b JOIN blog_categories c ON b.category = c.name`) phải có `COLLATE utf8mb4_unicode_ci` để không phát sinh lỗi `ER_CANT_AGGREGATE_2COLLATIONS`.
- [ ] **TC-DB-02**: Dữ liệu có dấu tiếng Việt hiển thị chính xác, không bị lỗi font hoặc biến thành dấu `?`.

---

### 2.5. Kiểm thử Hồi quy Tổng thể (Regression Test Suite)
- [ ] **Public APIs**:
  - `GET /api/health` -> HTTP 200 (database connected).
  - `GET /api/blogs` & `GET /api/blogs/:slug` -> HTTP 200.
  - `GET /api/services-page` -> HTTP 200.
  - `GET /api/about` -> HTTP 200.
  - `GET /api/branches` -> HTTP 200.
  - `GET /api/partners` -> HTTP 200.
  - `GET /api/faq-content` -> HTTP 200.
- [ ] **Client Frontend**:
  - Khách hàng xem được Trang chủ (mô hình 3D xe tải tải mượt).
  - Form báo giá gửi dữ liệu thành công vào bảng `contact_inquiries`.
- [ ] **Frontend Production Build**:
  - Chạy `npm --prefix frontend run build` -> Đạt `0 errors`.
