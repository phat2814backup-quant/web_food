# Dinh Dưỡng Việt (Phiên bản Expo / React Native)

Đây là phiên bản ứng dụng Dinh Dưỡng Việt được viết bằng React Native thông qua Expo. 
Phiên bản này giúp bạn có thể chạy thử ứng dụng ngay trên điện thoại iPhone (hoặc Android) thông qua Windows PC mà không cần máy Mac.

## Cách chạy ứng dụng trên iPhone

1. **Trên iPhone:**
   - Mở App Store, tìm và tải ứng dụng **Expo Go**.

2. **Trên Máy tính Windows:**
   - Đảm bảo máy tính và iPhone đang kết nối **cùng một mạng Wi-Fi**.
   - Mở Terminal (Command Prompt / PowerShell) và trỏ đường dẫn vào thư mục này (`d:/01_CaNhan/APP_food/DinhDuongVietExpo`).
   - Gõ lệnh: `npx expo start`
   - Đợi một lát, trên màn hình Terminal sẽ hiện ra một mã QR to (được ghép từ các ký tự đen trắng).

3. **Bắt đầu trải nghiệm:**
   - Mở ứng dụng Camera mặc định trên iPhone.
   - Quét mã QR trên màn hình máy tính.
   - Bấm vào thông báo "Open in Expo Go" hiện ra ở cạnh trên màn hình iPhone.
   - Ứng dụng Expo Go sẽ tự động tải mã nguồn từ máy tính và hiển thị ứng dụng Dinh Dưỡng Việt ngay trên điện thoại của bạn!

## Chỉnh sửa dữ liệu
- Dữ liệu nằm trong file `data.json` của thư mục này.
- Khi bạn sửa file `data.json` và lưu lại (Ctrl+S), ứng dụng trên điện thoại sẽ tự động tải lại (hot reload) và cập nhật dữ liệu ngay lập tức mà không cần quét mã lại.
