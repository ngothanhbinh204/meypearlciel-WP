Bạn là một Senior WordPress Spatial CMS Architect có hơn 10 năm kinh nghiệm trong:

* ACF Pro
* Interactive SVG Systems
* Polygon Editors
* Spatial UI Systems
* Real Estate Interactive CMS
* Camera Viewport Systems
* Floorplan Interaction Systems
* Frontend-ready JSON Architecture

Nhiệm vụ của bạn là refactor và mở rộng:

# Utilities ALL IN ONE Spatial Polygon System

Hiện tại hệ thống đã có:

* repeater floor_groups
* amenities polygon
* polygon JSON field

Nhưng:

* polygon đang nhập tay
* chưa có visual polygon editor
* chưa có camera viewport editor
* chưa có masterplan focus system

Mục tiêu mới:

* editor thao tác trực quan hoàn toàn
* polygon được vẽ trực tiếp trên ảnh
* mỗi tầng có camera focus riêng
* frontend chỉ consume normalized JSON
* scalable cho interactive amenity system

Frontend sử dụng:

* HTML
* CSS
* TailwindCSS
* Vanilla JavaScript

Frontend render bằng:

* SVG overlay
* polygon interaction
* CSS transform
* JS event system

---

# QUAN TRỌNG

Hệ thống này KHÔNG còn là:

* content form bình thường
* hotspot marker đơn giản

Đây là:

# Multi-Layer Spatial Interaction System

---

# Kiến trúc nghiệp vụ mới

# SECTION:

Hệ Tiện Ích ALL IN ONE

---

# Hiện tại structure đang là:

* section_image
* floor_groups
* amenities
* amenity_polygon

---

# Nhưng kiến trúc cần thay đổi:

# CHỈ dùng:

## 1 masterplan image duy nhất

Ví dụ:

* ảnh tổng thể tiện ích

KHÔNG dùng:

* mỗi tầng một image riêng

---

# Flow editor mong muốn

## STEP 1

Upload:

* 1 ảnh masterplan tiện ích tổng

Ví dụ:

* toàn bộ tiện ích dự án

---

## STEP 2

Tạo:

* floor_groups

Ví dụ:

* Tầng 1
* Tầng 2
* Outdoor
* Rooftop

---

# QUAN TRỌNG

Mỗi floor_group:
KHÔNG có image riêng.

Thay vào đó:

* tất cả dùng chung:
  section_image

---

# STEP 3

Editor chọn:

* floor_group

Ví dụ:

* Tầng 1

---

# STEP 4

Editor dùng:

# Camera Viewport Editor

để:

* zoom tới vùng tầng 1 trên masterplan
* pan tới đúng khu vực
* save viewport state

---

# Camera state phải lưu:

{
"scale": 2.5,
"x": 41.2,
"y": 63.8
}

---

# Camera state dùng cho frontend:

Khi click:

* tab tầng 1
  Frontend sẽ:
* animate camera
* zoom tới vùng tầng 1

---

# STEP 5

Trong floor_group:

* có repeater amenities

Ví dụ:

* Gym
* Ballroom
* BBQ
* Kid Zone

---

# STEP 6

Editor chọn amenity:

* dùng chuột vẽ polygon trực tiếp trên masterplan image

Polygon đại diện:

* vùng thật của tiện ích

---

# QUAN TRỌNG

Polygon phải:

* relative theo masterplan image duy nhất
* không relative theo viewport
* không relative theo screen

---

# Frontend Interaction Flow

Frontend sẽ:

## Khi chọn tầng

* đọc camera_state
* animate zoom/pan

---

## Khi hover polygon tiện ích

* active polygon
* highlight vùng
* show popup
* show tooltip

---

# Backend chỉ cần trả:

* polygon
* color
* popup data
* camera state

Frontend tự xử lý interaction.

---

# Structure mới mong muốn

utilities_all_in_one
│
├── section_title
├── section_description
├── masterplan_image
│
└── floor_groups
│
├── floor_name
├── floor_code
├── camera_state
│
└── amenities
│
├── amenity_name
├── amenity_description
├── amenity_overlay_color
├── amenity_popup_image
├── amenity_icon
│
└── interaction
├── polygon
├── hover_color
├── active_color
└── popup_position

---

# Kiến trúc cần loại bỏ

XÓA:

* floor_image riêng cho từng tầng

Vì:

* chỉ dùng 1 masterplan image duy nhất

---

# Polygon Editor Requirements

Editor phải có thể:

## 1. Click tạo vertex

---

## 2. Drag vertex

---

## 3. Remove vertex

---

## 4. Close polygon

---

## 5. Preview overlay realtime

---

## 6. Highlight polygon active

---

## 7. Chọn repeater item

→ highlight polygon tương ứng

---

# Camera Viewport Editor Requirements

Editor phải có thể:

* zoom image
* pan image
* save current viewport
* preview camera focus

---

# Coordinate Requirements

BẮT BUỘC:

* lưu percentage
* không lưu pixel

ĐÚNG:

{
"x": 42.5,
"y": 61.2
}

SAI:

{
"x": 412,
"y": 918
}

---

# Polygon JSON Requirements

KHÔNG lưu:

* SVG raw
* HTML
* inline style

PHẢI lưu:

{
"points": [
{
"x": 12.5,
"y": 18.1
},
{
"x": 25.8,
"y": 18.3
}
]
}

---

# SVG Rendering Requirements

Frontend render bằng:

<svg>
  <polygon points="..." />
</svg>

KHÔNG dùng:

* image map HTML cũ
* div absolute hotspot

---

# Repeater Synchronization Requirements

Khi:

* add amenity
  → auto create polygon binding

Khi:

* remove amenity
  → remove polygon

Khi:

* select amenity repeater
  → highlight polygon tương ứng

---

# Frontend-ready JSON Requirements

Frontend chỉ consume:

{
"camera_state": {
"scale": 2.5,
"x": 41.2,
"y": 63.8
},
"interaction": {
"polygon": [],
"hover_color": "#3b82f6",
"active_color": "#2563eb",
"popup_position": "top"
}
}

---

# Responsive Requirements

Polygon phải:

* responsive tuyệt đối
* scale theo image
* đúng trên mobile
* đúng khi zoom/pan

---

# Technical Requirements

Admin JS dùng:

* Vanilla JavaScript
* SVG.js
* Interact.js
* Panzoom

KHÔNG dùng:

* React admin app
* Vue admin app
* heavy framework

---

# Architecture Requirements

Kiến trúc cần tách rõ:

# Data Layer

* polygon data
* camera state
* amenity info

---

# Admin Editor Layer

* polygon editor
* viewport editor
* SVG overlay

---

# Frontend Render Layer

* hover
* active
* popup
* animation

---

# Scalability Requirements

Architecture phải dễ mở rộng cho:

* multi-floor transition
* animated camera
* tooltip engine
* polygon animation
* apartment interaction
* building interaction
* layer visibility
* map filtering

---

# Điều cần output

Hãy tạo:

1. Tổng quan Utilities Spatial System
2. Refactor ACF structure
3. Masterplan image architecture
4. Camera viewport architecture
5. Polygon editor workflow
6. Floor focus workflow
7. SVG overlay architecture
8. Coordinate normalization strategy
9. Repeater synchronization logic
10. Example camera JSON
11. Example polygon JSON
12. Example viewport save logic
13. Example polygon draw logic
14. Example frontend camera animation logic
15. Example frontend hover interaction
16. Example frontend popup interaction
17. Folder structure
18. Performance best practices
19. Các lỗi kiến trúc cần tránh
20. Frontend-ready JSON response architecture

Mục tiêu cuối cùng:

* editor chỉ upload 1 masterplan image
* mỗi floor_group có camera focus riêng
* mỗi amenity có polygon riêng
* frontend animate đúng vùng
* hover đúng polygon
* popup đúng tiện ích
* responsive tuyệt đối
* scalable cho interactive spatial real estate system
