Bạn là một Senior WordPress Spatial System Architect có hơn 10 năm kinh nghiệm trong:

* ACF Pro
* Interactive Map Systems
* Polygon Editors
* Spatial UI Architecture
* Real Estate Masterplan Systems
* SVG Overlay Systems
* Interactive Hotspot Engine
* WordPress Admin UX
* Frontend-ready JSON Architecture

Nhiệm vụ của bạn là refactor lại toàn bộ kiến trúc:

# “ACF Custom Visual Admin Picker System”

Từ:

* point hotspot picker

Thành:

# Polygon Spatial Editor System

Mục tiêu:

* editor có thể vẽ polygon trực tiếp trên ảnh
* frontend hover đúng vùng
* frontend active đúng area
* hỗ trợ overlay chính xác
* responsive tuyệt đối
* scalable cho real estate interactive system

Frontend sử dụng:

* HTML
* CSS
* TailwindCSS
* Vanilla JavaScript

Frontend KHÔNG sử dụng:

* React
* Vue
* Canvas engine

Frontend sẽ render bằng:

* SVG overlay
* polygon
* CSS transform
* JS interaction

---

# QUAN TRỌNG

Đây KHÔNG còn là:

* content editor thông thường
* hotspot marker đơn giản

Đây là:

# Spatial Polygon Interaction System

---

# Yêu cầu nghiệp vụ mới

# SECTION 1 — Tổng thể dự án

Editor workflow:

## Step 1

Upload:

* ảnh masterplan tổng thể dự án

Ví dụ:

* ảnh tổng thể các tòa nhà

---

## Step 2

Có repeater:

* mỗi repeater = 1 tòa nhà

Ví dụ:

* Tòa A
* Tòa B
* Tòa C

---

## Step 3

Khi tạo repeater item mới:

Editor có thể:

* click trực tiếp lên ảnh masterplan
* vẽ polygon cho tòa nhà đó
* polygon đại diện vùng thật của building trên ảnh

KHÔNG dùng:

* point hotspot
* x/y đơn giản
* bounding box rectangle

---

# Polygon building phải hỗ trợ:

* add vertex
* drag vertex
* remove vertex
* close polygon
* hover preview
* active state
* polygon overlay preview

---

# Building repeater structure

project_buildings
└── building_item
├── building_name
├── building_code
├── building_polygon
├── building_overlay_color
├── building_popup_data
└── related_building_post

---

# Polygon data structure

KHÔNG lưu SVG raw.

PHẢI lưu normalized coordinate:

{
"points": [
[12.5, 22.1],
[42.8, 19.2],
[48.1, 51.3],
[21.2, 62.4]
]
}

---

# Coordinate system requirements

# BẮT BUỘC:

lưu theo percentage.

KHÔNG lưu pixel.

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

# SECTION 2 — Hệ Tiện Ích ALL IN ONE

Editor workflow:

## Step 1

Upload:

* ảnh masterplan tiện ích tổng thể

Ví dụ:

* tầng 1
* tầng 2
* tiện ích ngoài trời

---

## Step 2

Có repeater:

* mỗi repeater = 1 tầng / 1 khu tiện ích

Ví dụ:

* Tầng 1
* Tầng 2
* Outdoor

---

## Step 3

Trong mỗi tầng:

* có repeater tiện ích

Ví dụ:

* Gym
* Kid Zone
* BBQ
* Ballroom

---

## Step 4

Mỗi tiện ích:

* editor dùng chuột để vẽ polygon trực tiếp trên ảnh
* polygon đại diện đúng vùng tiện ích trên map

Frontend sẽ:

* hover polygon
* active polygon
* show tooltip
* show popup

---

# Amenity repeater structure

floor_groups
└── floor_item
├── floor_name
├── floor_image
├── camera_state
│
└── amenities
└── amenity_item
├── amenity_name
├── amenity_description
├── amenity_polygon
├── amenity_popup_image
├── amenity_overlay_color
└── amenity_icon

---

# Frontend interaction requirements

Frontend phải hỗ trợ:

* polygon hover
* polygon active
* polygon overlay
* tooltip
* popup
* active transition
* responsive scaling

---

# Frontend rendering architecture

Frontend render bằng:

<svg>
  <polygon points="..." />
</svg>

KHÔNG dùng:

* HTML image map cũ
* canvas-only solution

---

# Admin Polygon Editor Requirements

Editor phải có thể:

## 1. Click để tạo vertex

---

## 2. Drag vertex

---

## 3. Remove vertex

---

## 4. Close polygon

---

## 5. Preview overlay realtime

---

## 6. Highlight polygon đang active

---

## 7. Chọn polygon theo repeater item

Ví dụ:

* click repeater item “Tòa A”
  → active polygon “Tòa A”

---

# Polygon Editor UI Requirements

Editor UI cần:

* zoom image
* pan image
* overlay preview
* vertex handles
* active polygon state
* hover polygon state

---

# Kiến trúc Admin JS mong muốn

/assets
├── polygon-editor.js
├── polygon-editor.css
├── viewport-editor.js
└── svg-overlay-engine.js

---

# Technical Requirements

Admin JS dùng:

* Vanilla JavaScript
* SVG
* hoặc lightweight interaction library

KHÔNG dùng:

* React admin app
* Vue admin app
* heavy framework

---

# SVG Architecture Requirements

Polygon render bằng:

* SVG overlay layer

KHÔNG render polygon bằng:

* absolute div
* HTML map area

---

# Repeater Synchronization Requirements

Khi:

* add repeater item
  → auto create polygon

Khi:

* remove repeater item
  → remove polygon

Khi:

* select repeater item
  → highlight polygon tương ứng

---

# Data Synchronization Requirements

Polygon editor phải sync realtime với:

* hidden ACF field
* repeater item state

---

# Frontend-ready JSON Requirements

Frontend chỉ consume:

{
"polygon": {
"points": [
[12.5,22.1],
[42.8,19.2],
[48.1,51.3]
]
}
}

Frontend KHÔNG được:

* parse SVG raw
* parse HTML
* đọc admin structure

---

# Responsive Requirements

Polygon phải:

* responsive tuyệt đối
* scale đúng theo image
* hoạt động mobile
* hoạt động zoom/pan

---

# Scalability Requirements

Architecture phải dễ mở rộng cho:

* apartment polygon
* floor polygon
* tooltip engine
* multi-layer overlay
* animation system
* masterplan viewer

---

# Performance Requirements

Tránh:

* DOM quá nhiều
* re-render toàn bộ SVG
* recursive event listener
* pixel-based coordinate

Tối ưu:

* SVG rendering
* event delegation
* polygon normalization
* coordinate transformation

---

# Điều cần output

Hãy tạo:

1. Tổng quan kiến trúc Polygon Spatial System
2. Kiến trúc ACF integration
3. Polygon data architecture
4. SVG rendering architecture
5. Admin Polygon Editor workflow
6. Vertex editing strategy
7. Repeater synchronization strategy
8. Polygon normalization logic
9. Coordinate conversion logic
10. Viewport editor architecture
11. Frontend SVG interaction architecture
12. Event handling strategy
13. Folder structure
14. Example ACF field structure
15. Example polygon JSON
16. Example SVG render logic
17. Example drag vertex implementation
18. Example polygon overlay system
19. Example frontend hover logic
20. Performance best practices
21. Các lỗi kiến trúc cần tránh

Mục tiêu cuối cùng:

* editor vẽ polygon trực tiếp trên ảnh
* frontend hover đúng vùng
* overlay chính xác
* responsive tuyệt đối
* scalable cho real estate spatial interaction system
* maintain dễ
* dữ liệu normalized sạch cho frontend render
