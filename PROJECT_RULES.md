# PROJECT RULES — VIỆT HƯƠNG LOGISTICS

Tài liệu này định nghĩa các nguyên tắc cốt lõi, quy chuẩn kỹ thuật và giới hạn an toàn bắt buộc cho mọi Agent AI và kỹ sư khi tham gia phát triển dự án Việt Hương Logistics.

---

## 1. NGUYÊN TẮC CỐT LÕI (CORE PRINCIPLES)

1. **REUSE → MODIFY → CREATE (Tái sử dụng là ưu tiên số 1)**:
   - Trước khi tạo file, component, hook, route hoặc helper mới: **Bắt buộc kiểm tra code hiện có**.
   - Nếu component hoặc workflow hiện tại có thể mở rộng: **Tái sử dụng và mở rộng**, tuyệt đối không tạo bản sao hoặc tạo quy trình song song.
   - Không tạo dashboard mới, layout mới, login page mới khi hệ thống đã có sẵn.

2. **TỐI THIỂU HÓA PHẠM VI SỬA ĐỔI (MINIMAL FOOTPRINT)**:
   - Chỉ sửa những dòng code thực sự cần thiết để đáp ứng yêu cầu.
   - Không tự ý refactor các phần không liên quan.
   - Giữ nguyên cấu trúc code, comments và conventions có sẵn.

3. **KHÔNG VÁ LỖI CHỒNG CHÉO (NO PATCH-ON-PATCH)**:
   - Khi gặp bug: Tìm nguyên nhân gốc rễ (**Root Cause**) và các dependencies liên quan trước khi sửa.
   - Cấm thêm `if/else`, thêm flag tạm bợ hoặc tạo component bọc quanh để che giấu lỗi mà không xử lý tận gốc.

4. **KHÔNG SUY ĐOÁN THIẾU CĂN CỨ (EVIDENCE-BASED ENGINEERING)**:
   - Tuyệt đối không khẳng định "chắc chắn hoạt động" khi chưa đọc code và chưa chạy test thực tế trên môi trường localhost.

---

## 2. AN TOÀN MÔI TRƯỜNG & DỮ LIỆU (ENVIRONMENT & SAFETY RULES)

1. **MÔI TRƯỜNG LOCAL LÀ TRÊN HẾT**:
   - Toàn bộ quá trình code, chỉnh sửa, debug và kiểm thử ban đầu phải diễn ra **100% trên Localhost**:
     - Frontend Dev Server: `http://localhost:5173/`
     - Backend API Server: `http://localhost:5001/api`
     - Local Database: MySQL `localhost:3306` (`vantaiviethuong`)
   - Tuyệt đối không deploy, không push remote (`git push`), không chạy migration lên Production database trừ khi người dùng ra lệnh rõ ràng bằng văn bản.

2. **CẢNH BÁO `⚠️ PRODUCTION IMPACT` BẮT BUỘC**:
   - Nếu bất kỳ thay đổi nào có khả năng tác động đến:
     - Cơ sở dữ liệu Production (Aiven MySQL Cloud)
     - Dịch vụ Backend Production (Render Web Service)
     - Dịch vụ Frontend Production (cPanel / AZDIGI / Vercel)
     - File cấu hình môi trường (`.env`, `.env.example`, `DATABASE_URL`)
     - Cấu trúc API Contract (Endpoint URL, HTTP method, Request/Response payload)
     - Cơ chế xác thực (JWT Token, Hash password, Roles)
   - Agent **BẮT BUỘC PHẢI DỪNG LẠI VÀ BÁO CÁO RÕ RÀNG**:
     > `⚠️ PRODUCTION IMPACT: [Mô tả chi tiết tác động và rủi ro]`

3. **BẢO VỆ TÀI NGUYÊN MEDIA & EMAIL**:
   - Cloudinary: Quản lý ảnh có cấu trúc folder, không xóa hàng loạt ảnh production.
   - Resend API: Chỉ gửi email kiểm thử khi cần thiết, tránh spam quota.

---

## 3. QUY CHUẨN BACKEND & DATABASE (MYSQL RULES)

1. **Ràng buộc mã hóa & Collation MySQL**:
   - Mọi bảng và cột text đều sử dụng `utf8mb4` với collation `utf8mb4_unicode_ci`.
   - Trong các truy vấn `JOIN` phức tạp giữa các bảng có trường text (ví dụ `blogs.category = blog_categories.name`), bắt buộc ghi rõ `COLLATE utf8mb4_unicode_ci` để ngăn lỗi `Illegal mix of collations (utf8mb4_0900_ai_ci and utf8mb4_unicode_ci)`.

2. **Cơ chế Phân quyền (RBAC) & Bảo vệ Sếp Tối cao**:
   - Hệ thống có 2 cấp quyền chính:
     - `superadmin`: Quản trị viên tối cao (Sếp) — Toàn quyền, quản lý tài khoản nhân viên, xem/xóa nhật ký kiểm toán.
     - `admin`: Nhân viên vận hành — Thao tác tin tức, dịch vụ, CRM khách hàng, chi nhánh, hồ sơ cá nhân. Bị chặn xem/xóa nhật ký và không thể quản lý tài khoản người khác.
   - **Quy tắc bảo vệ Superadmin gốc (`id: 1` hoặc `username: 'admin'`)**:
     - Không thể bị khóa (`is_active` luôn = 1).
     - Không thể bị hạ cấp role.
     - Không thể bị xóa.
     - Không cho phép người dùng tự khóa tài khoản của chính mình.
   - **Khóa tài khoản nhân viên**: Khi nhân viên bị khóa, đăng nhập mới bị từ chối với HTTP 403, phiên đăng nhập đang dùng bị thu hồi tức thì (HTTP 401).

3. **Cơ chế Lưu vết IP & Audit Log**:
   - Mọi lần đăng nhập thành công phải lưu lại `last_login` và `last_login_ip` để Sếp theo dõi chống dùng chung tài khoản.
   - Các hành động nhạy cảm (tạo tài khoản, đổi mật khẩu, khóa/mở khóa) phải ghi vào bảng `admin_audit_logs`.

---

## 4. QUY CHUẨN FRONTEND & UI/UX

1. **Thống nhất Design System**:
   - Sử dụng bảng màu Dark Navy / Slate hiện có: Nền `#0a1628` / `#1e293b`, màu nhấn vàng cam `#e8a020` / `#f59e0b`, xanh dương `#3b82f6`.
   - Typography: Font hiện đại, không dùng font trình duyệt mặc định.
   - Hiệu ứng: Glassmorphism nhẹ nhàng (`backdrop-filter: blur`), micro-animations mượt mà, hỗ trợ trạng thái Responsive đầy đủ.

2. **Biểu mẫu Tối giản & Thân thiện với Người dùng**:
   - Khi tạo tài khoản nhân viên mới: **Chỉ bắt buộc Username và Password**.
   - Họ tên và Email là thông tin tùy chọn (nếu trống, hệ thống tự động gán tên đăng nhập làm tên hiển thị).

3. **Bảo vệ Route & Sidebar Frontend**:
   - `ProtectedRoute`: Hỗ trợ prop `allowedRoles`. Nếu role của user không nằm trong danh sách được phép, tự động chuyển hướng về `/admin` an toàn, không hiển thị trang trắng.
   - `AdminSidebar`: Lọc danh sách menu động dựa trên `user.role`, ẩn triệt để các tab nhạy cảm với nhân viên.
