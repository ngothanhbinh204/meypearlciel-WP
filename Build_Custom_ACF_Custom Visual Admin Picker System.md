Bạn là một Senior WordPress Plugin Engineer có hơn 10 năm kinh nghiệm trong:

* ACF Pro
* WordPress Admin UX
* Custom ACF Field
* Interactive Spatial UI
* JavaScript Admin Tools
* Interactive Map Systems
* Hotspot Editors
* Drag & Drop Interfaces
* Real Estate CMS

Nhiệm vụ của bạn là xây dựng:

# Custom Visual Admin Picker System

cho WordPress Admin sử dụng:

* ACF Pro
* Vanilla JavaScript
* Tailwind-friendly output
* Interactive draggable hotspot UI

Mục tiêu:

* giúp editor KHÔNG phải nhập tay x/y
* thao tác trực tiếp trên ảnh
* kéo thả hotspot trực quan
* save dữ liệu sạch cho frontend render

---

# Bối cảnh thực tế

Website là:

* landingpage bất động sản
* có interactive masterplan
* có tiện ích dạng hotspot
* có popup interaction

Editor cần:

* upload ảnh map/aerial
* click tạo hotspot
* kéo hotspot
* save position
* preview trực quan

Frontend dùng:

* HTML
* CSS
* TailwindCSS
* Vanilla JavaScript

Do đó:

* dữ liệu cần normalized
* coordinate phải responsive
* KHÔNG lưu pixel

---

# Yêu cầu hệ thống

# KHÔNG build:

* React app
* Vue app
* Gutenberg block
* canvas phức tạp
* WebGL

Chỉ build:

* admin enhancement tool
* lightweight JS system
* draggable hotspot UI

---

# Kiến trúc mong muốn

ACF Repeater
↓
Hidden coordinate fields
↓
Custom Admin JS
↓
Visual Interactive Picker
↓
Save normalized JSON

---

# ACF Structure hiện tại

Section:
Hệ Tiện Ích All In One

Structure:

section_all_in_one
│
├── section_title
├── aerial_image
│
└── floor_groups
│
├── floor_label
├── camera_scale
├── camera_x
├── camera_y
│
└── amenities
│
├── amenity_name
├── amenity_description
├── hotspot_x
├── hotspot_y
├── hotspot_popup_image
└── hotspot_id

---

# Yêu cầu Visual Picker

Editor phải có thể:

## 1. Click trên ảnh

→ tạo hotspot

---

## 2. Drag hotspot

→ thay đổi vị trí realtime

---

## 3. Hotspot sync với ACF fields

Khi drag:

* tự update hotspot_x
* tự update hotspot_y

---

## 4. Khi edit x/y

→ hotspot tự di chuyển realtime

---

## 5. Hỗ trợ nhiều hotspot

Vì amenities là repeater.

---

# Coordinate System Requirements

# BẮT BUỘC:

lưu theo percentage

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

# Vì frontend cần:

* responsive
* zoom
* scale
* mobile compatible

---

# Viewport Editor Requirements

Floor group có:

camera_scale
camera_x
camera_y

Editor cần:

* zoom image
* pan image
* save current viewport

---

# Viewport lưu dạng:

{
"scale": 2.5,
"x": 41.2,
"y": 63.8
}

---

# Frontend sẽ dùng để:

* focus đúng vị trí
* animate zoom
* camera transition

---

# Yêu cầu kỹ thuật

# Admin JS

Dùng:

* Vanilla JS
* hoặc Interact.js cho drag/drop

KHÔNG dùng:

* jQuery UI nặng
* React admin app

---

# Kiến trúc code mong muốn

/assets
├── admin-hotspot-picker.js
├── admin-hotspot-picker.css
└── viewport-picker.js

---

# Hotspot Rendering

Mỗi hotspot:

* draggable
* absolute positioned
* hiển thị số thứ tự
* active state
* hover state

---

# Realtime Sync

Khi drag:

* update hidden inputs
* trigger change event cho ACF

---

# Khi thêm repeater item mới

System phải:

* auto bind hotspot
* auto render marker mới

---

# Khi xoá repeater item

System phải:

* remove hotspot tương ứng

---

# Yêu cầu UI/UX

Editor phải:

* thao tác trực quan
* không cần nhập tay x/y
* dễ maintain
* dễ dùng cho non-tech editor

---

# Frontend Data Contract

Frontend chỉ cần:

{
"hotspot": {
"x": 42.1,
"y": 61.4
}
}

---

# KHÔNG render HTML trong DB

KHÔNG lưu:

* DOM
* HTML string
* inline style

Chỉ lưu:

* normalized coordinate data

---

# Hỗ trợ mở rộng tương lai

Architecture phải dễ mở rộng cho:

* polygon hotspot
* SVG overlay
* tooltip editor
* multi-floor interaction
* building masterplan

---

# Điều cần output

Hãy tạo:

1. Tổng quan kiến trúc hệ thống
2. Flow hoạt động editor
3. Kiến trúc ACF integration
4. Admin JS architecture
5. Repeater synchronization strategy
6. Coordinate calculation logic
7. Percentage coordinate conversion
8. Drag/drop implementation
9. Viewport save logic
10. Event handling strategy
11. DOM structure đề xuất
12. CSS architecture
13. Folder structure
14. Example ACF field integration
15. Example JS implementation
16. Example coordinate conversion
17. Example realtime sync
18. Example frontend render logic
19. Performance best practices
20. Các lỗi cần tránh

Mục tiêu cuối cùng:

* editor kéo thả trực tiếp trên ảnh
* save coordinate sạch
* frontend render dễ dàng
* responsive tuyệt đối
* maintain dễ
* scalable cho interactive real estate system
