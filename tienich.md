Tôi cần xây dựng một section tương tác cao trên Landing Page Bất động sản với Image Map Pro và ACF.
Mô tả chức năng tổng thể:

Bên trái: Sidebar với Tabs Tầng (Tầng 1, Tầng 2) và danh sách các tiện ích theo thứ tự.
Bên phải: Hình Master Plan được làm bằng Image Map Pro.
Tương tác hai chiều giữa Sidebar và Image Map Pro.

Quy ước Naming Convention (Quan trọng):

Polygon trong Image Map Pro phải tuân thủ prefix:
Polygon zoom cho tầng: floor-1-zoom, floor-2-zoom (polygon lớn bao quát khu vực tầng)
Polygon tiện ích: floor-1-ballroom, floor-1-fitness, floor-2-kidclub, floor-2-thuvien, floor-2-coworkingspace, v.v.


Yêu cầu chi tiết:
1. Quản lý dữ liệu (ACF)

Tạo 1 ACF Group tên: "All In One - Hệ Tiện Ích"
Bên trong có:
Repeater "floor_tabs": floor_number (text), floor_label (text)
Repeater "amenities" với các sub fields:
number (số thứ tự)
name (Tên tiện ích)
mapping_id (text) → Bắt buộc phải khớp chính xác với data-title của Polygon trong Image Map Pro
description (textarea) → dùng cho tooltip



2. Giao diện

Sidebar bên trái : UI nằm ở Home-5, có thể dùng lại code cũ nhưng cần chỉnh sửa để hiển thị theo cấu trúc mới.

3. Tương tác (JavaScript)

Click Tab Tầng:
Active tab hiện tại
Highlight tất cả polygon có prefix floor-{số}- (trừ zoom object)
Zoom camera đến polygon floor-{số}-zoom

Hover vào một tiện ích trong danh sách:
Reset highlight cũ
Highlight polygon tương ứng theo mapping_id
Hiển thị Tooltip/Popup của Image Map Pro

Click vào một tiện ích:
Zoom camera đến polygon đó

Sử dụng ImageMapPro.getInstance(mapId) để tương tác.

4. Output yêu cầu:

Code PHP Template (Elementor Custom Code hoặc template riêng) để render sidebar từ ACF
CSS chi tiết (hover effect, active state, responsive)
JavaScript đầy đủ, sạch sẽ, có comment rõ ràng
Hướng dẫn cách cấu hình Image Map Pro (các Title cần đặt)

Công nghệ:

WordPress + ACF Pro
Image Map Pro (plugin)
Vanilla JavaScript (không dùng jQuery nếu có thể)

Hãy triển khai toàn bộ chức năng theo đúng yêu cầu trên, ưu tiên tính linh hoạt và dễ bảo trì sau này.