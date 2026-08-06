# Siêu App Dinh Dưỡng - DinhDuongVietExpo

Dự án ứng dụng tra cứu, lọc và so sánh 130 loại thực phẩm (Super Foods) hỗ trợ phòng chống và điều trị bệnh tật, được tổng hợp từ các nguồn nghiên cứu y khoa, dinh dưỡng và dược liệu truyền thống.

## 🌟 Tính năng Nổi bật
- **Tìm kiếm Thông minh (Ranking):** Thuật toán tìm kiếm sử dụng hệ thống tự động chấm điểm để đẩy kết quả phù hợp nhất lên đầu tiên.
- **Thẻ Siêu Thực Phẩm:** Gắn nhãn tự động cho những thực phẩm đạt chuẩn dinh dưỡng cao (Ví dụ: `🍊 Vua Vitamin C`, `💪 Siêu Protein`).
- **Giỏ Thực Đơn & Cảnh Báo Kỵ Nhau:** Hỗ trợ lên thực đơn và tự động phát hiện, cảnh báo nếu có 2 món kỵ nhau (Ví dụ: Hải sản + Vitamin C liều cao).
- **So Sánh Trực Tiếp (Side-by-side):** Giao diện chẻ đôi màn hình giúp dễ dàng đưa 2 món ăn lên bàn cân.
- **Giao diện Light / Dark Mode:** Hỗ trợ chuyển đổi chế độ hiển thị linh hoạt theo hệ điều hành.

## 📂 Cấu trúc Dự án
Dự án được viết bằng React Native / Expo. Kiến trúc chia rõ ràng để dễ bảo trì:
- `data_source/`: Chứa các file gốc `.md` (dữ liệu thô).
- `scripts/`: Chứa script `build_database.js` sinh ra file `data.json`.
- `src/`: Mã nguồn React Native Frontend.
  - `components/`: Các Component UI dùng chung (Thẻ, Danh sách, Thẻ tag).
  - `context/`: Nơi chứa Context như `MealContext` để quản lý Giỏ Thực Đơn.
  - `screens/`: Các màn hình (Tab Thực Phẩm, Giỏ Hàng, Lời khuyên...).
  - `styles/`: Tổ chức các design token (Màu sắc, padding) ở `theme.js`.
- `App.js`: Entry point chính quản lý Navigation.

## 🛠 Cách Cập nhật Dữ liệu (Build Data)
Nếu bạn thay đổi hoặc thêm món ăn vào các file markdown trong thư mục `data_source/`, hãy chạy kịch bản sau để biên dịch lại file `data.json`:

```bash
node scripts/build_database.js
```

Script này sẽ tự động:
1. Đọc dữ liệu từ `source_per_food.md`.
2. Tạo **ID duy nhất** cho món ăn và thiết lập bad_combinations.
3. Bổ sung dữ liệu y khoa từ `Source_medical.md`.
4. Tìm và gắn huy hiệu Super Foods từ `source_supper_food.md`.

## 🚀 Đẩy Code Lên Vercel (Auto Deploy)
Chỉ cần mở Terminal tại thư mục `D:\01_CaNhan\APP_food` và nhấp đôi vào file `update_web.bat`. File này sẽ tự động build lại dữ liệu, commit lên Github, và kích hoạt Vercel deploy.
