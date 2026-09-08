# TỔNG QUAN HỆ THỐNG VIỆT HƯƠNG LOGISTICS (AGENT KNOWLEDGE BASE)

> **MỤC ĐÍCH TÀI LIỆU**: Tài liệu này là "Single Source of Truth" (Nguồn chân lý duy nhất) dành cho các Agent AI (ChatGPT, Gemini, Claude, Cursor, Copilot, v.v.) và các kỹ sư phần mềm khi tiếp nhận dự án **Việt Hương Logistics**. Đọc xong tài liệu này, AI có thể hiểu trọn vẹn kiến trúc, cấu trúc thư mục, luồng dữ liệu, các dịch vụ bên ngoài và quy chuẩn an toàn bắt buộc khi phát triển hoặc bảo trì hệ thống.

---

## 1. THÔNG TIN DOANH NGHIỆP & TỔNG QUAN DỰ ÁN

* **Tên doanh nghiệp**: CÔNG TY TNHH VẬN TẢI & LOGISTICS VIỆT HƯƠNG
* **Tên thương hiệu**: Việt Hương Logistics
* **Website chính thức**: [https://viethuonglogistics.com](https://viethuonglogistics.com)
* **Email chính thức / Nhận thông báo**: `it@viethuongceramics.com`
* **Trụ sở chính**: Số 62 Phước Lý 9, Phường Hòa Minh, Quận Liên Chiểu, TP. Đà Nẵng
* **Lĩnh vực hoạt động**:
  * Vận chuyển hàng hóa Bắc - Nam (Đường bộ, xe tải, container).
  * Vận chuyển hỏa tốc & chuyển phát liên tỉnh.
  * Dịch vụ kho bãi lưu trữ, bốc xếp, phân phối hàng hóa.
  * Ghép hàng, vận chuyển hàng lẻ (LTL) và nguyên chuyến (FTL).
* **Mục tiêu dự án**:
  1. Xây dựng cổng thông tin doanh nghiệp đẳng cấp, tốc độ cao, tối ưu SEO, hỗ trợ 3D tương tác.
  2. Hệ thống Quản trị Nội dung (CMS) toàn diện cho nhân viên và ban giám đốc.
  3. Phân quyền bảo mật 2 cấp (RBAC): Sếp tối cao (`superadmin`) và Nhân viên nghiệp vụ (`admin`).
  4. Mini CRM quản lý thông tin khách hàng, báo giá, phễu trạng thái và tự động gửi email nhắc lịch hẹn qua Resend API.

---

## 2. KIẾN TRÚC KỸ THUẬT & CÔNG NGHỆ (TECH STACK)

### 2.1. Ngăn Xếp Kỹ Thuật (Tech Stack)
* **Frontend**:
  * **Framework**: React 18, Vite (biên dịch siêu nhanh).
  * **Routing**: React Router v7 (`react-router-dom`).
  * **Styling**: Vanilla SCSS Modules (`*.module.scss`), biến toàn cục `variables.scss`, `global.scss`. Thiết kế chuẩn Dark Navy / Slate hiện đại, hỗ trợ hiệu ứng Glassmorphism và Responsive.
  * **3D & Hiệu ứng**: Three.js, `@react-three/fiber`, `@react-three/drei` (hiển thị mô hình xe tải 3D tương tác), GSAP (ScrollTrigger).
  * **Trình soạn thảo văn bản**: Tiptap Editor (`@tiptap/react`, `@tiptap/starter-kit`, hỗ trợ chèn và cấu hình thuộc tính ảnh chuyên sâu, bảng số liệu table giữ nguyên khung viền).
  * **SEO**: `react-helmet-async`, script sinh `sitemap.xml` và `robots.txt` tự động trước mỗi lần build.
  * **Icons**: `lucide-react`.
* **Backend**:
  * **Nền tảng**: Node.js, Express.js.
  * **Cơ sở dữ liệu**: MySQL 8.0+ kết nối qua `mysql2/promise` (sử dụng Connection Pool, tự động reconnect).
  * **Xác thực**: JSON Web Token (JWT) Bearer Token, mã hóa mật khẩu `bcryptjs`.
  * **CORS**: Cấu hình mở quyền cho domain chính thức, Vercel và Render.
  * **Media Upload**: `multer` kết hợp `cloudinary` SDK.
  * **Email Service**: Resend API (gọi trực tiếp qua `fetch` / Resend SDK).

### 2.2. Sơ Đồ Kiến Trúc Hệ Thống

```text
                                  +------------------------------+
                                  |   KHÁCH HÀNG / QUẢN TRỊ VIÊN |
                                  +------------------------------+
                                                  |
                         +------------------------+------------------------+
                         | (Truy cập Web)                                  | (Truy cập Admin)
                         v                                                 v
  +---------------------------------------------+   +---------------------------------------------+
  |        FRONTEND (React 18 + Vite)           |   |       CMS QUẢN TRỊ (/admin)                 |
  |  - Host: cPanel / AZDIGI                    |   |  - Bảo vệ qua ProtectedRoute & RBAC         |
  |  - Domain: viethuonglogistics.com           |   |  - Lưu JWT trong localStorage               |
  +---------------------------------------------+   +---------------------------------------------+
                         \                                                 /
                          \                                               /
                           \----- HTTPS REST API Requests (Bearer Token) /
                                                 |
                                                 v
  +-----------------------------------------------------------------------------------------------+
  |                                BACKEND (Node.js + Express)                                    |
  |  - Host: Render Web Service (viethuonglogistics-un9p.onrender.com)                            |
  |  - Auto Deploy: Tự động pull & deploy khi nhánh 'main' có commit mới                          |
  |  - Rate limiting, Token Verification, RBAC Check Middleware                                   |
  +-----------------------------------------------------------------------------------------------+
           |                                     |                                      |
           v                                     v                                      v
+-----------------------+             +-----------------------+              +--------------------+
|  AIVEN MYSQL CLOUD    |             |      CLOUDINARY       |              |     RESEND API     |
| - DB: defaultdb       |             | - Lưu trữ ảnh đại diện|              | - Gửi email thông  |
| - SSL connection      |             |   tin tức, chi nhánh, |              |   báo liên hệ mới, |
| - Lưu toàn bộ bảng dữ |             |   banner quảng cáo    |              |   nhắc lịch hẹn CRM|
|   liệu nghiệp vụ & CMS|             | - Tối ưu nén ảnh WebP |              |   đến hộp thư Sếp  |
+-----------------------+             +-----------------------+              +--------------------+
```

---

## 3. CÁC DỊCH VỤ BÊN NGOÀI & VAI TRÒ (EXTERNAL SERVICES)

Hệ thống tích hợp 5 dịch vụ đám mây bên ngoài:

### 3.1. Render Web Service (Backend Hosting)
* **URL Production**: `https://viethuonglogistics-un9p.onrender.com`
* **Cơ chế hoạt động**: Liên kết trực tiếp với GitHub repo (`main` branch). Khi có lệnh `git push origin main`, Render tự động chạy `npm install` và `npm start`.
* **Biến môi trường trên Render Dashboard**:
  * `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Kết nối CSDL Aiven Cloud.
  * `JWT_SECRET`, `JWT_EXPIRES_IN`: Khóa bí mật ký token đăng nhập.
  * `FRONTEND_URL`: `https://viethuonglogistics.com`.
  * `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Kết nối Cloudinary.
  * `RESEND_API_KEY`: Key gửi email lấy từ Resend Dashboard (đã cấu hình an toàn trên Render Dashboard).
  * `NOTIFICATION_EMAIL`: `it@viethuongceramics.com`.
  * `RESEND_FROM_EMAIL`: `Viet Huong Logistics <onboarding@resend.dev>`.

### 3.2. Aiven Cloud MySQL (Production Database)
* **Nền tảng**: Dịch vụ Database-as-a-Service chạy MySQL 8 trên đám mây.
* **Đặc tính bắt buộc**: Yêu cầu kết nối bảo mật qua giao thức SSL (`ssl: { rejectUnauthorized: false }` hoặc sử dụng chứng chỉ CA).
* **Bảng mã hóa**: Bắt buộc mọi bảng và cột văn bản phải dùng `utf8mb4` và collation `utf8mb4_unicode_ci` để hỗ trợ tiếng Việt có dấu đầy đủ và không bị lỗi xung đột collation khi `JOIN`.

### 3.3. cPanel Hosting / AZDIGI (Frontend Production)
* **Domain phục vụ**: `https://viethuonglogistics.com`
* **Cách triển khai**:
  * Frontend được đóng gói thành file tĩnh qua lệnh `npm run build` với biến `VITE_API_URL=https://viethuonglogistics-un9p.onrender.com/api`.
  * Thư mục đầu ra `dist/` (chứa `index.html`, `assets/`, `models/`, `.htaccess`, `sitemap.xml`) được nén thành file `dist.zip` trên Desktop.
  * Sếp tải `dist.zip` lên thư mục `public_html` trên cPanel và giải nén.
  * **File `.htaccess` quan trọng**: Giúp máy chủ Apache điều hướng toàn bộ request về `index.html` (SPA Routing), ngăn chặn lỗi 404 khi người dùng tải lại trang (F5).

### 3.4. Cloudinary Media Storage (Lưu Trữ Ảnh)
* **Tài khoản Cloud**: `zrepedgq`
* **Vai trò**: Lưu trữ hình ảnh bài viết tin tức, ảnh đại diện, ảnh đại diện chi nhánh, banner trang chủ.
* **Cơ chế**: Backend nhận file qua `multer` (bộ nhớ tạm RAM), sau đó upload stream lên Cloudinary và lưu URL bảo mật `https://res.cloudinary.com/...` vào CSDL.

### 3.5. Resend API (Dịch Vụ Gửi Email)
* **Hòm thư nhận email**: `it@viethuongceramics.com` (Hòm thư của công ty và quản trị viên).
* **Vai trò**:
  1. Nhận thông báo khi có khách hàng điền form **"Liên hệ tư vấn"** tại trang chủ hoặc trang liên hệ.
  2. Nhận thông báo khi có khách hàng gửi câu hỏi tại trang **"Giải đáp"** (`/giai-dap`).
  3. Nhận email chi tiết về **Lịch hẹn chăm sóc khách hàng CRM** (tiêu đề hẹn, tên khách, số điện thoại, ngày giờ hẹn, loại công việc, độ ưu tiên, ghi chú và nút link dẫn thẳng vào CRM) khi admin chọn bật "Nhắc lịch qua email".

---

## 4. CẤU TRÚC THƯ MỤC DỰ ÁN (PROJECT DIRECTORY TREE)

```text
VietHuongLogistics/
├── backend/                              # SOURCE CODE MÁY CHỦ API (Node.js/Express)
│   ├── config/
│   │   ├── database.js                   # Cấu hình Pool kết nối MySQL (hỗ trợ SSL Aiven & Local)
│   │   ├── cloudinary.js                 # Cấu hình tài khoản Cloudinary SDK
│   │   ├── blogCategories.js             # Danh mục tin tức mặc định
│   │   └── init.sql                      # Script tạo cấu trúc database ban đầu
│   ├── controllers/                      # CÁC BỘ ĐIỀU KHIỂN XỬ LÝ LOGIC NGHIỆP VỤ
│   │   ├── authController.js             # Đăng nhập, kiểm tra phiên, đổi mật khẩu, lưu IP
│   │   ├── userController.js             # Quản lý tài khoản nhân viên (RBAC - chỉ Superadmin)
│   │   ├── blogController.js             # Thêm, sửa, xóa, tìm kiếm tin tức, upload ảnh
│   │   ├── branchController.js           # Quản lý hệ thống chi nhánh kho bãi
│   │   ├── contactController.js          # Tiếp nhận liên hệ từ website khách
│   │   ├── crmController.js              # Phễu CRM, lịch hẹn, ghi chú và kích hoạt gửi mail Resend
│   │   ├── homePageController.js         # Nội dung động trang chủ (banner, số liệu)
│   │   ├── aboutcontroller.js            # Nội dung động trang giới thiệu
│   │   ├── servicesPageController.js     # Nội dung dịch vụ vận tải
│   │   ├── faqController.js              # Quản lý câu hỏi thường gặp & giải đáp
│   │   ├── faqContentController.js       # Nội dung tĩnh trang FAQ
│   │   ├── settingsController.js         # Cài đặt website (Hotline, email, logo, mạng xã hội)
│   │   ├── partnerController.js          # Quản lý danh sách đối tác vận chuyển
│   │   └── cmsRevisionController.js      # Lịch sử phiên bản CMS & Audit log (Superadmin)
│   ├── middleware/
│   │   └── auth.js                       # Xác thực JWT Token & Phân quyền Role (checkRole, requireSuperAdmin)
│   ├── migrations/                       # CÁC FILE MIGRATION CƠ SỞ DỮ LIỆU CÓ THỨ TỰ
│   │   ├── 001_initial_schema.sql        # Bảng cơ sở đầu tiên
│   │   ├── 002_home_page.sql             # Bảng trang chủ
│   │   ├── 003_branches.sql              # Bảng chi nhánh
│   │   ├── 004_cms_revisions.sql         # Bảng lịch sử chỉnh sửa
│   │   ├── 005_admin_audit_logs.sql      # Bảng nhật ký kiểm toán hành vi
│   │   ├── 006_service_detail_content.sql# Nội dung chi tiết dịch vụ
│   │   ├── 007_faq_inquiry_email.sql     # Email trong bảng giải đáp
│   │   ├── 008_mini_crm_fields.sql       # Mở rộng trường CRM
│   │   ├── 009_blog_categories.sql       # Phân loại tin tức
│   │   ├── 010_crm_pipeline.sql          # Các giai đoạn phễu CRM
│   │   ├── 011_crm_reminders.sql         # Lịch hẹn nhắc việc CRM
│   │   └── 012_admin_users_last_login_ip.sql # Lưu vết IP đăng nhập gần nhất
│   ├── routes/                           # ĐỊNH NGHĨA CÁC ROUTE API VÀ GẮN MIDDLEWARE
│   │   ├── auth.js, users.js, blogs.js, branches.js, contact.js, crm.js,
│   │   ├── homePage.js, About.js, Servicespage.js, Faq.js, Faqcontent.js,
│   │   ├── settings.js, partners.js, cmsRevisions.js
│   ├── services/
│   │   ├── emailService.js               # Đóng gói HTML email chuẩn và gọi Resend API
│   │   ├── adminAuditService.js          # Tự động ghi log mọi hành động nhạy cảm vào DB
│   │   └── cmsRevisionService.js         # Lưu bản chụp snapshot nội dung trước khi cập nhật
│   ├── utils/
│   │   └── cmsSanitizer.js               # Làm sạch mã HTML, chống tấn công XSS
│   ├── server.js                         # File khởi động Backend Express, gắn CORS, tự chạy Migration
│   ├── .env                              # Biến môi trường Localhost (Được .gitignore bảo vệ)
│   └── .env.example                      # Mẫu biến môi trường cho các lập trình viên khác
│
├── frontend/                             # SOURCE CODE GIAO DIỆN CLIENT & ADMIN (React/Vite)
│   ├── public/
│   │   ├── .htaccess                     # Cấu hình Apache Rewrite cho cPanel (Chống lỗi 404 SPA)
│   │   ├── favicon.svg                   # Biểu tượng website
│   │   ├── robots.txt                    # Hướng dẫn bot tìm kiếm Google
│   │   ├── sitemap.xml                   # Bản đồ trang web (tự động cập nhật động khi build)
│   │   ├── models/                       # File 3D GLB mô hình xe tải (truck.glb, truck1.glb...)
│   │   └── videos/                       # Video nền banner trang chủ (hero-truck.mp4)
│   ├── scripts/
│   │   └── generate-sitemap.mjs          # Script NodeJS tự động kéo bài viết/dịch vụ từ API để tạo sitemap
│   ├── src/
│   │   ├── assets/                       # Logo, hình ảnh đối tác, banner tĩnh
│   │   ├── context/
│   │   │   └── AuthContext.jsx           # Quản lý trạng thái đăng nhập, user role, token và hàm logout
│   │   ├── hooks/
│   │   │   └── useScrollReveal.js        # Hook hiệu ứng cuộn trang
│   │   ├── services/
│   │   │   └── api.js                    # Đóng gói Axios client, tự chèn Bearer Token vào header
│   │   ├── styles/
│   │   │   ├── variables.scss            # Biến màu, font chữ, độ bo góc, bóng đổ toàn hệ thống
│   │   │   └── global.scss               # Định dạng CSS toàn trang
│   │   ├── components/
│   │   │   ├── Navbar/                   # Menu điều hướng chính website
│   │   │   ├── Footer/                   # Chân trang website
│   │   │   ├── Hero/                     # Banner mở đầu trang chủ tích hợp xe tải 3D Three.js
│   │   │   ├── About/                    # Trang giới thiệu và chi tiết giới thiệu
│   │   │   ├── Services/                 # Danh sách dịch vụ và trang chi tiết từng dịch vụ
│   │   │   ├── Blog/                     # Trang tin tức, lọc danh mục, chi tiết bài viết
│   │   │   ├── Contact/                  # Form liên hệ tư vấn báo giá
│   │   │   ├── FAG/                      # Trang câu hỏi thường gặp & form thắc mắc
│   │   │   ├── WhyUs/                    # Khối lý do chọn Việt Hương Logistics
│   │   │   ├── Partners/                 # Khối đối tác đồng hành
│   │   │   ├── Seo/                      # Thẻ Meta SEO tự động thay đổi theo từng trang
│   │   │   └── Admin/                    # HỆ THỐNG GIAO DIỆN QUẢN TRỊ NỘI DUNG (CMS)
│   │   │       ├── AdminLayout.jsx       # Khung giao diện Admin chuẩn (Sidebar + Header + Content)
│   │   │       ├── AdminSidebar.jsx      # Menu bên trái (tự lọc ẩn/hiện mục theo quyền RBAC)
│   │   │       ├── ProtectedRoute.jsx    # Bọc route, kiểm tra role hợp lệ, chặn truy cập trái phép
│   │   │       ├── AdminLogin.jsx        # Màn hình đăng nhập tài trị
│   │   │       ├── AdminDashboard.jsx    # Bảng số liệu thống kê tổng hợp
│   │   │       ├── AdminHome.jsx         # Quản trị nội dung trang chủ
│   │   │       ├── AdminAbout.jsx        # Quản trị nội dung giới thiệu
│   │   │       ├── Adminservices.jsx     # Quản trị danh mục và bài viết dịch vụ
│   │   │       ├── AdminBlogs.jsx        # Quản trị bài viết tin tức (Tiptap Rich Text Editor)
│   │   │       ├── Richtexteditor.jsx    # Trình soạn thảo văn bản Tiptap (Cấu hình ảnh, bảng table)
│   │   │       ├── AdminBranches.jsx     # Quản lý địa chỉ kho bãi & bản đồ Google Maps
│   │   │       ├── AdminContacts.jsx     # Danh sách liên hệ gửi từ web
│   │   │       ├── AdminCrm.jsx          # Phễu khách hàng CRM, ghi chú, lịch hẹn & gửi mail Resend
│   │   │       ├── AdminUsers.jsx        # Quản lý nhân viên (Superadmin)
│   │   │       ├── AdminCmsHistory.jsx   # Lịch sử chỉnh sửa CMS & Nhật ký kiểm toán (Superadmin)
│   │   │       ├── AdminFaq.jsx          # Quản lý danh mục FAQ & câu hỏi
│   │   │       ├── AdminFaqContent.jsx   # Quản lý chữ mô tả trang FAQ
│   │   │       ├── AdminSettings.jsx     # Quản lý cấu hình chung (Hotline, Logo, Email)
│   │   │       └── AdminProfile.jsx      # Xem hồ sơ cá nhân và tự đổi mật khẩu
│   │   ├── App.jsx                       # Khai báo các Route của website và phân vùng Admin
│   │   └── main.jsx                      # Điểm vào chính của ứng dụng React
│   ├── .env                              # Biến môi trường Frontend (VITE_API_URL)
│   └── package.json                      # Danh sách thư viện phụ thuộc Frontend
│
├── .gitignore                            # Khai báo loại bỏ file nhạy cảm (.env, dist/, node_modules/)
├── PROJECT_RULES.md                      # QUY TẮC PHÁT TRIỂN BẮT BUỘC DÀNH CHO KỸ SƯ / AGENT
├── AGENT_WORKFLOW.md                     # QUY TRÌNH TIẾP NHẬN YÊU CẦU & KIỂM THỬ 5 BƯỚC
├── project.md                            # TÀI LIỆU KIẾN TRÚC KỸ THUẬT VẮN TẮT
└── tongquanviethuonglogistics.md         # TÀI LIỆU TỔNG QUAN NÀY
```

---

## 5. PHÂN QUYỀN BẢO MẬT 2 CẤP (RBAC MODEL)

Hệ thống triển khai mô hình phân quyền nghiêm ngặt với 2 cấp độ:

| Cấp quyền (Role) | Đối tượng sử dụng | Quyền hạn trong hệ thống |
| :--- | :--- | :--- |
| **`superadmin`** | Sếp / Ban Giám Đốc điều hành | **Toàn quyền tối cao**: Xem và chỉnh sửa toàn bộ CMS, quản lý CRM, tạo mới/khóa/đổi mật khẩu/xóa nhân viên (`/admin/users`), xem vết IP đăng nhập, xem toàn bộ lịch sử chỉnh sửa CMS (`/admin/history`) và hoàn tác dữ liệu cũ. |
| **`admin`** | Nhân viên vận hành / Biên tập viên | **Quản lý nghiệp vụ thường nhật**: Đăng bài tin tức, cập nhật dịch vụ, quản lý chi nhánh, tiếp nhận liên hệ, chăm sóc khách hàng trên CRM. **Bị chặn tuyệt đối** không thể truy cập vào mục Quản lý Tài khoản (`/admin/users`) và Nhật ký Lịch sử (`/admin/history`). |

### Quy Tắc Bảo Vệ Bất Khả Xâm Phạm Của Superadmin Gốc
1. Tài khoản Sếp tối cao (`id: 1` hoặc `username: 'admin'`):
   * Không thể bị bất kỳ ai khóa (`is_active` luôn được giữ = 1).
   * Không thể bị hạ cấp quyền (luôn là `superadmin`).
   * Không thể bị xóa khỏi cơ sở dữ liệu.
2. Không một tài khoản nào (kể cả Sếp) được phép tự khóa tài khoản của chính mình khi đang đăng nhập.
3. Khi một tài khoản nhân viên bị khóa (`is_active = 0`):
   * Nếu đang thao tác trên trang web: Yêu cầu API tiếp theo sẽ bị từ chối với mã **HTTP 401** và bị đẩy ra màn hình đăng nhập ngay lập tức.
   * Nếu cố đăng nhập lại: Hệ thống từ chối với mã **HTTP 403** kèm thông báo tài khoản đã bị khóa.

---

## 6. QUẢN LÝ DỮ LIỆU & SCHEMA DATABASE (MYSQL)

Các bảng chính trong CSDL MySQL (`defaultdb` / `vantaiviethuong`):

1. **`admin_users`**: Tài khoản quản trị.
   * `id`, `username`, `password` (bcrypt hash), `full_name`, `email`, `role` (`superadmin` | `admin`), `is_active`, `last_login`, `last_login_ip`, `created_at`, `updated_at`.
2. **`blogs`**: Bài viết tin tức logistics.
   * `id`, `title`, `slug`, `excerpt`, `content` (HTML phong phú từ Tiptap), `thumbnail_url`, `category`, `status` (`published` | `draft`), `view_count`, `published_at`, `created_at`, `updated_at`.
3. **`blog_categories`**: Danh mục tin tức (`id`, `name`, `slug`, `sort_order`, `is_active`).
4. **`branches`**: Danh sách chi nhánh kho bãi (`id`, `name`, `address`, `phone`, `email`, `map_embed_url`, `is_headquarter`, `sort_order`).
5. **`contact_inquiries`**: Yêu cầu báo giá từ khách hàng (`id`, `name`, `phone`, `email`, `service`, `message`, `status`, `notes`, `created_at`).
6. **`crm_pipeline_stages`**: Các bước trong phễu bán hàng CRM (Mới, Đang tư vấn, Đã gửi báo giá, Đã ký hợp đồng, Thất bại).
7. **`contact_activities`**: Nhật ký chăm sóc khách hàng (Ghi chú cuộc gọi, hẹn gặp, tư vấn).
8. **`contact_reminders`**: Lịch hẹn nhắc việc CRM (`id`, `contact_id`, `user_id`, `title`, `remind_at`, `priority`, `reminder_type`, `email_reminder_enabled`, `is_completed`, `notes`).
9. **`faq_items` & `faq_categories` & `faq_inquiries`**: Hệ thống hỏi đáp và câu hỏi khách gửi đến.
10. **`website_settings`**: Cài đặt thông tin toàn diện (Hotline, email, logo, mạng xã hội, copyright).
11. **`cms_revisions`**: Bản chụp lịch sử (Snapshot) nội dung CMS trước mỗi lần sửa đổi, cho phép Superadmin xem lại sự thay đổi và khôi phục khi cần.
12. **`admin_audit_logs`**: Ghi vết các hành động quan trọng (Tạo nhân viên, đổi pass, khóa tài khoản, đăng nhập).

---

## 7. QUY TẮC PHÁT TRIỂN & AN TOÀN BẮT BUỘC (DÀNH CHO AGENT AI)

Mọi AI khi thực hiện sửa đổi mã nguồn trong dự án này **BẮT BUỘC PHẢI TUÂN THỦ 5 NGUYÊN TẮC**:

### Nguyên Tắc 1: Localhost First (Ưu Tiên Tuyệt Đối Môi Trường Cục Bộ)
* Toàn bộ việc viết code, kiểm thử, chạy lệnh, sửa bug **phải thực hiện 100% trên Localhost**:
  * Frontend: `http://localhost:5173`
  * Backend: `http://localhost:5001/api`
  * Database: MySQL `localhost:3306` (`vantaiviethuong`)
* **File `.env` phải luôn ở trạng thái Local khi đang code**:
  * Tuyệt đối không để thông số Aiven Cloud hoặc Render trong lúc đang phát triển tính năng.
  * Chỉ khi nào **Sếp ra lệnh rõ ràng bằng văn bản** (ví dụ: *"hãy deploy dự án"*), AI mới được phép chuyển `.env` sang Production và tiến hành deploy.

### Nguyên Tắc 2: Tái Sử Dụng Trước Khi Tạo Mới (Reuse -> Modify -> Create)
* Hệ thống đã có sẵn `AdminLayout`, `AdminSidebar`, `ProtectedRoute`, `Richtexteditor`, `useScrollReveal`, `emailService`. Tuyệt đối **không tạo layout mới, login page mới hay dịch vụ gửi mail song song**.
* Khi cần mở rộng tính năng: Kiểm tra code hiện có, kế thừa và mở rộng trên component/route cũ.

### Nguyên Tắc 3: Ràng Buộc Collation MySQL
* Bảng và cột văn bản luôn dùng `utf8mb4` và collation `utf8mb4_unicode_ci`.
* Trong các câu lệnh `JOIN` giữa 2 bảng có trường chuỗi ký tự (như so sánh danh mục), luôn thêm `COLLATE utf8mb4_unicode_ci` để tránh lỗi `Illegal mix of collations`.

### Nguyên Tắc 4: Bảo Vệ File Nhạy Cảm & Dữ Liệu Thật
* Tuyệt đối không đưa các file `.env` vào Git (`.gitignore` đã cấu hình chặn).
* Không xóa hàng loạt ảnh trên Cloudinary.
* Không tự ý xóa bảng hay dữ liệu trên CSDL Aiven Cloud.

### Nguyên Tắc 5: Quy Trình Đóng Gói Deploy Production Chuẩn
Khi Sếp yêu cầu deploy:
1. **Kiểm tra cú pháp**: Chạy `node -c` cho các file backend sửa đổi.
2. **Cập nhật biến môi trường**:
   * `frontend/.env`: `VITE_API_URL=https://viethuonglogistics-un9p.onrender.com/api`
   * `backend/.env`: chuyển sang khối `#chạy deloy`.
3. **Commit & Push GitHub**: Stage các file đã sửa và push lên `origin main` để Render tự động build Backend.
4. **Build Frontend**: Chạy `npm --prefix frontend run build` (tự động cập nhật `sitemap.xml` và đóng gói Vite vào `frontend/dist`).
5. **Đóng gói file cho cPanel**: Nén thư mục `frontend/dist` (phải gồm cả file ẩn `.htaccess`) thành file `/Users/an/Desktop/dist.zip` để Sếp tải lên `public_html` của cPanel.

---

## 8. DANH SÁCH TÀI KHOẢN & LIÊN KẾT HỆ THỐNG

* **Website Khách hàng**: [https://viethuonglogistics.com](https://viethuonglogistics.com)
* **Trang Quản trị CMS**: [https://viethuonglogistics.com/admin](https://viethuonglogistics.com/admin)
* **Backend API Render**: [https://viethuonglogistics-un9p.onrender.com](https://viethuonglogistics-un9p.onrender.com)
* **Kiểm tra sức khỏe Backend**: [https://viethuonglogistics-un9p.onrender.com/api/health](https://viethuonglogistics-un9p.onrender.com/api/health)
* **Tài khoản Superadmin mặc định**:
  * Tên đăng nhập: `admin`
  * Quyền: `superadmin` (Toàn quyền quản lý tài khoản nhân viên và lịch sử audit)
* **Hòm thư thông báo công ty**: `it@viethuongceramics.com`

---

*Tài liệu này được tạo tự động và chuẩn hóa bởi Antigravity AI Assistant. Khi có sự thay đổi lớn về kiến trúc hoặc dịch vụ đám mây, các Agent kế tiếp vui lòng cập nhật bổ sung vào file này.*
