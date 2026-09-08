# QUY TRÌNH PHÁT TRIỂN TIÊU CHUẨN DÀNH CHO AGENT (AGENT WORKFLOW)

Tài liệu này quy định quy trình chuẩn mực 7 bước (**7-Step Workflow**) bắt buộc mọi Agent AI phải thực hiện tuần tự cho mỗi nhiệm vụ được giao.

> **Khẩu hiệu cốt lõi**:  
> *"Hiểu → Kiểm tra → Test Plan → Sửa tối thiểu → Chạy Test → Regression → Review → Hoàn thành"*

---

## BƯỚC 1: ĐỌC HIỂU & XÁC ĐỊNH PHẠM VI (UNDERSTAND & SCOPE)

1. Đọc kỹ yêu cầu của người dùng, làm rõ mục tiêu thực sự cần đạt được.
2. Xác định các file, component, function, API, database schema và logic liên quan.
3. Kiểm tra mã nguồn hiện tại bằng `view_file`, `grep_search` trước khi kết luận.
4. **Tuyệt đối không suy đoán** trạng thái mã nguồn khi chưa đọc file thực tế.

---

## BƯỚC 2: TÁI SỬ DỤNG & LẬP KẾ HOẠCH (REUSE & MINIMAL PLAN)

1. **Thẩm định khả năng tái sử dụng**:
   - `REUSE` (Tái sử dụng): Component/hàm hiện có có đáp ứng được không?
   - `MODIFY` (Chỉnh sửa nhẹ): Có thể thêm prop/tham số tùy chọn để mở rộng không?
   - `CREATE` (Tạo mới): Chỉ tạo mới khi thực sự độc lập và không thể mở rộng từ cái cũ.
2. **Lập kế hoạch thay đổi tối thiểu**:
   - Xác định danh sách file cần sửa.
   - Tránh xa các file không thuộc phạm vi yêu cầu (nhất là các trang công khai hoặc cấu hình production).
3. **Đánh giá rủi ro `⚠️ PRODUCTION IMPACT`**:
   - Nếu có tác động đến API contract, database schema, `.env`, xác thực hoặc triển khai -> Báo cáo người dùng trước khi tiến hành.

---

## BƯỚC 3: XÂY DỰNG KỊCH BẢN KIỂM THỬ TRƯỚC (PRE-CHANGE TEST PLAN)

1. Dựa trên tài liệu `tests/TEST_CHECKLIST.md` để xác định mức độ kiểm thử (Tier 1 đến Tier 4).
2. Liệt kê các Test Cases cần kiểm tra:
   - Happy paths (Trường hợp thành công chuẩn).
   - Edge cases & Error handling (Lỗi dữ liệu, sai quyền, thiếu trường, tài khoản bị khóa).
   - Bảo mật & Phân quyền (Superadmin vs Admin).

---

## BƯỚC 4: THỰC HIỆN SỬA ĐỔI TỐI THIỂU (MINIMAL IMPLEMENTATION)

1. Thực hiện các chỉnh sửa bằng công cụ `replace_file_content` hoặc `multi_replace_file_content`.
2. Không viết code dư thừa, không viết code dự phòng không được yêu cầu.
3. Không để lại mã chết (dead code), console.log rác hoặc các chú thích tạm bợ.
4. Đảm bảo mã nguồn giữ nguyên quy ước định dạng và bình luận có sẵn.

---

## BƯỚC 5: KIỂM THỬ TRÊN MÔI TRƯỜNG LOCALHOST (LOCAL VERIFICATION)

1. Khởi động / Khởi động lại dịch vụ backend local nếu có sửa đổi backend logic:
   - Backend chạy tại: `http://localhost:5001` (kết nối MySQL `localhost:3306`).
2. Chạy kịch bản kiểm thử tự động qua script (ví dụ Node.js request test script).
3. Nếu test thất bại (`FAIL`):
   - Tìm **Root Cause** trong code để sửa.
   - **Tuyệt đối không sửa assertion của test để ép test PASS một cách giả tạo**.

---

## BƯỚC 6: KIỂM THỬ HỒI QUY (REGRESSION CHECK)

1. Chạy bài test hồi quy trên các endpoint/chức năng lân cận:
   - Các API công khai (Public APIs: `/api/health`, `/api/blogs`, `/api/services-page`, `/api/contact`).
   - Các API quản trị hiện có (CMS CRUD, Settings, CRM).
2. Kiểm tra tính toàn vẹn của Frontend Build:
   - Chạy `npm --prefix frontend run build` -> Đảm bảo `0 errors`.
   - Cập nhật gói artifact `dist.zip` trên Desktop nếu có thay đổi frontend.

---

## BƯỚC 7: BÁO CÁO KẾT THÚC THEO CHUẨN (STANDARD REPORTING)

Mỗi khi hoàn thành nhiệm vụ, Agent xuất báo cáo có cấu trúc bắt buộc:

```markdown
### 1. Đã thay đổi gì
- Tóm tắt súc tích các logic cốt lõi đã xử lý.

### 2. Danh sách file đã thay đổi
- Liệt kê chính xác đường dẫn các file đã modified / created.

### 3. Kịch bản kiểm thử đã thực hiện
- Liệt kê các Test Case đã chạy (TC-01, TC-02,...).

### 4. Kết quả Test & Regression
- Số lượng Test PASSED / FAILED.
- Kết quả kiểm tra hồi quy các chức năng liên quan.
- Kết quả `npm run build`.

### 5. Cảnh báo Production Impact (Nếu có)
- Ghi nhận `⚠️ PRODUCTION IMPACT` hoặc xác nhận `Không ảnh hưởng Production`.

### 6. Kết luận
- **PASS** hoặc **CẦN HƯỚNG DẪN THÊM**.
```

---

## ⛔ DANH SÁCH HÀNH VI BỊ NGHIÊM CẤM (PROHIBITED ACTIONS)

- ❌ Tự ý chạy `git push` lên GitHub remote khi chưa được yêu cầu.
- ❌ Tự ý chạy lệnh migration hoặc chỉnh sửa dữ liệu trên Aiven Cloud DB.
- ❌ Tự ý chỉnh sửa biến môi trường production trên Render hoặc hosting cPanel.
- ❌ Tự ý tạo trang đăng nhập thứ hai hoặc sidebar/dashboard thứ hai khi thêm role mới.
- ❌ Khẳng định nhiệm vụ đã xong nhưng chưa chạy build hoặc test kiểm chứng.
