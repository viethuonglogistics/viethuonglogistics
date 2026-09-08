# TỔNG QUAN DỰ ÁN & KIẾN TRÚC HỆ THỐNG — VIỆT HƯƠNG LOGISTICS

---

## 1. THÔNG TIN CHUNG

- **Tên dự án**: Website Doanh Nghiệp & CMS Quản Trị Việt Hương Logistics
- **Tên miền chính thức**: `https://viethuonglogistics.com`
- **Lĩnh vực hoạt động**: Vận tải hàng hóa Bắc - Nam, logistics, chuyển phát nhanh, lưu kho và phân phối
- **Mục tiêu hệ thống**:
  1. Cung cấp cổng thông tin chuyên nghiệp, tra cứu dịch vụ, tin tức ngành vận tải, bảng giá và chi nhánh cho khách hàng.
  2. Cung cấp hệ thống quản trị nội dung (CMS) tập trung và mini CRM tiếp nhận, xử lý báo giá khách hàng.
  3. Phân quyền bảo mật 2 cấp (Super Admin cho Sếp điều hành và Admin cho Nhân viên nghiệp vụ).

---

## 2. CÔNG NGHỆ & NGĂN XẾP KỸ THUẬT (TECH STACK)

### Frontend
- **Framework & Tooling**: React 18, Vite, React Router v7, Helmet Async (SEO)
- **Styling**: SCSS Modules, CSS Variables design tokens
- **Hiệu ứng & 3D**: GSAP (ScrollTrigger), Three.js (Mô hình xe tải 3D tương tác)
- **Rich Text Editor**: Tiptap Editor (Hỗ trợ cấu hình ảnh, bảng, định dạng chuyên sâu)
- **Icons**: Lucide React

### Backend
- **Nền tảng**: Node.js, Express.js
- **Kết nối Cơ sở dữ liệu**: `mysql2/promise` với Connection Pool và auto-reconnect
- **Xác thực & Bảo mật**: JSON Web Token (JWT), `bcryptjs`, CORS middleware
- **File Upload**: Multer, Cloudinary SDK
- **Email Service**: Resend API

### Database & Storage
- **Cơ sở dữ liệu**: MySQL 8.0+ (utf8mb4_unicode_ci)
- **Lưu trữ hình ảnh/video**: Cloudinary Media Storage
- **Quản lý Schema**: Migration SQL theo phiên bản có lưu vết (`001_initial_schema.sql` -> `011_crm_reminders.sql`)

---

## 3. KIẾN TRÚC TRIỂN KHAI (DEPLOYMENT ARCHITECTURE)

```text
               +----------------------------------------+
               |          Người dùng / Khách hàng       |
               +----------------------------------------+
                                   |
                                   v
+----------------------------------------------------------------------+
|                     FRONTEND (React + Vite)                          |
|  - Production: cPanel / AZDIGI (Domain: viethuonglogistics.com)       |
|  - Staging / Testing: Vercel                                         |
|  - Localhost: http://localhost:5173                                  |
+----------------------------------------------------------------------+
                                   |
                                   | REST API (HTTPS + Bearer JWT)
                                   v
+----------------------------------------------------------------------+
|                     BACKEND (Node.js + Express)                      |
|  - Production: Render Web Service (viethuonglogistics-un9p.onrender) |
|  - Localhost: http://localhost:5001/api                              |
+----------------------------------------------------------------------+
          |                            |                     |
          v                            v                     v
+--------------------+       +-------------------+  +------------------+
|    MYSQL DATABASE  |       |    CLOUDINARY     |  |    RESEND API    |
| - Prod: Aiven SSL  |       | - Quản lý ảnh/    |  | - Email thông    |
| - Local: Port 3306 |       |   media bài viết  |  |   báo báo giá    |
+--------------------+       +-------------------+  +------------------+
```

### Môi trường Localhost (Chuẩn phát triển bắt buộc)
- **Frontend**: `http://localhost:5173/` (Vite dev server)
- **Backend**: `http://localhost:5001/` (Express API)
- **MySQL Local**: `localhost:3306`, User: `root`, DB: `vantaiviethuong`
- **File Build Artifact**: `dist.zip` (Tạo từ thư mục `frontend/dist`) lưu tại Desktop để người dùng dễ dàng upload cPanel khi cần.
- **Quy định bất di bất dịch về `.env`**:
  - Mọi thao tác code, thêm, sửa, xóa, debug hay chạy test luôn luôn giữ tất cả file `.env` ở chế độ **Localhost**.
  - Tuyệt đối cấm để `.env` ở chế độ Deploy khi đang phát triển.
  - **Chỉ khi nào có mệnh lệnh/chỉ thị trực tiếp từ Sếp (User)**: Mới được phép chuyển `.env` sang thông số Deploy để chuẩn bị hoặc thực hiện triển khai thực tế.


---

## 4. CẤU TRÚC MÔ-ĐUN & CHỨC NĂNG

### 4.1. Khách Hàng (Public Facing)
- **Trang chủ (`/`)**: Hero banner video, mô hình xe tải 3D, giải pháp vận tải, số liệu năng lực, đánh giá khách hàng, form đăng ký báo giá.
- **Về chúng tôi (`/ve-chung-toi`)**: Lịch sử hình thành, tầm nhìn, sứ mệnh, giá trị cốt lõi.
- **Dịch vụ (`/dich-vu`, `/dich-vu/:id`)**: Danh mục và chi tiết dịch vụ (Vận tải đường bộ, Hỏa tốc, Kho bãi, Ghép hàng).
- **Tin tức (`/tin-tuc`, `/tin-tuc/:id`)**: Kiến thức logistics, tin tức doanh nghiệp, hỗ trợ bài viết có ảnh và bảng dữ liệu.
- **Chi nhánh & Liên hệ (`/chi-nhanh`)**: Hệ thống văn phòng, kho bãi tại Hà Nội, Đà Nẵng, TP.HCM, bản đồ Google Maps.
- **Giải đáp (`/giai-dap`)**: Câu hỏi thường gặp và form gửi thắc mắc của khách hàng.

### 4.2. Trang Quản Trị (Admin CMS)
- **Tổng quan (`/admin`)**: Thống kê số liệu bài viết, dịch vụ, lượt liên hệ mới.
- **Trang chủ CMS (`/admin/home`)**: Chỉnh sửa banner, số liệu nổi bật, đánh giá đối tác.
- **Giới thiệu CMS (`/admin/about`)**: Quản lý mốc thời gian lịch sử và khối nội dung.
- **Dịch vụ CMS (`/admin/services`)**: Thêm/sửa danh mục và chi tiết từng dịch vụ vận tải.
- **Tin tức CMS (`/admin/blogs`)**: Trình soạn thảo bài viết phong phú, upload ảnh thumbnail, gắn thẻ tag, chọn danh mục.
- **Chi nhánh CMS (`/admin/branches`)**: Quản lý địa chỉ kho, số hotline, định vị chi nhánh.
- **CRM Khách hàng (`/admin/contacts`, `/admin/crm`)**: Tiếp nhận thông tin báo giá, pipeline trạng thái (Mới -> Đang tư vấn -> Đã ký hợp đồng), nhắc việc và nhật ký chăm sóc.
- **Hồ sơ cá nhân (`/admin/profile`)**: Cập nhật thông tin cá nhân và đổi mật khẩu của tài khoản đang đăng nhập.
- **Quản lý Tài khoản (`/admin/users`) — CHỈ SUPERADMIN**:
  - Xem danh sách nhân viên, xem IP máy và thời gian đăng nhập gần nhất.
  - Tạo tài khoản nhân viên nhanh (chỉ cần Username + Password ban đầu).
  - Khóa/Mở khóa tài khoản nhân viên.
  - Đặt lại mật khẩu nhân viên.
  - Bảo vệ tuyệt đối tài khoản Sếp tối cao (`id: 1` hoặc `username: admin`).
- **Nhật ký chỉnh sửa (`/admin/history`) — CHỈ SUPERADMIN**:
  - Xem toàn bộ lịch sử chỉnh sửa các bài viết/nội dung CMS.
  - Hoàn tác phiên bản sửa đổi (Restore revision).
  - Xóa vết kiểm toán khi cần dọn dẹp.

---

## 5. CƠ SỞ DỮ LIỆU & BẢNG CHÍNH (DATABASE SCHEMA)

1. `admin_users`: Tài khoản quản trị viên (`id`, `username`, `password`, `full_name`, `email`, `role`, `is_active`, `last_login`, `last_login_ip`, `created_at`, `updated_at`).
2. `blogs`: Bài viết tin tức chuyên ngành (`id`, `title`, `slug`, `excerpt`, `content`, `thumbnail_url`, `category`, `status`, `view_count`, `published_at`).
3. `blog_categories`: Danh mục bài viết (`id`, `name`, `slug`, `sort_order`, `is_active`).
4. `branches`: Chi nhánh văn phòng/kho bãi (`id`, `name`, `address`, `phone`, `email`, `map_embed_url`, `is_headquarter`, `sort_order`).
5. `contact_inquiries`: Yêu cầu báo giá từ khách hàng (`id`, `name`, `phone`, `email`, `service`, `message`, `status`, `notes`, `created_at`).
6. `crm_pipeline_stages` & `contact_reminders` & `contact_activities`: Hỗ trợ quản lý phễu khách hàng CRM và lịch hẹn chăm sóc.
7. `faq_items` & `faq_categories` & `faq_inquiries`: Hệ thống câu hỏi thường gặp và hòm thư giải đáp thắc mắc.
8. `website_settings`: Cấu hình toàn diện website (Logo, hotline, email, mạng xã hội, thông tin bản quyền).
9. `cms_revisions` & `admin_audit_logs`: Lưu vết lịch sử thay đổi nội dung và nhật ký đăng nhập, phục vụ kiểm toán bảo mật.
