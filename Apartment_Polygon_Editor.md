Bạn là một Senior WordPress Spatial System Architect có hơn 10 năm kinh nghiệm trong:

* ACF Pro
* Interactive SVG Systems
* Polygon Editors
* Spatial CMS Architecture
* Real Estate Floorplan Systems
* Interactive Apartment Selector
* Masterplan UI
* WordPress Admin UX
* Frontend-ready JSON Architecture

Nhiệm vụ của bạn là tiếp tục mở rộng hệ thống:

# Polygon Spatial Editor System

để hỗ trợ:

# Apartment Polygon Editor

Mục tiêu:

* mỗi căn hộ có polygon riêng
* polygon được vẽ trực tiếp trên ảnh floor plan của tầng
* frontend hover đúng căn hộ
* frontend click đúng vùng căn hộ
* popup căn hộ hoạt động chính xác
* scalable cho multi-floor real estate interaction system

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

# Kiến trúc hiện tại

Đã có:

## 1. CPT Building

Ví dụ:

* Tòa A
* Tòa B

---

## 2. CPT Floor

Ví dụ:

* Tầng 1
* Tầng 2
* Tầng 3-5

Floor hiện có:

* floor image
* thông tin tầng
* relationship tới building

---

## 3. CPT Apartment

Ví dụ:

* CH-12B
* CH-15A

Apartment hiện có:

* thông tin căn hộ
* gallery
* diện tích
* facilities
* relationship field:
  “Thuộc tầng”

Apartment hiện tại:

* đã liên kết tới post type Floor

---

# Kiến trúc mới cần bổ sung

# Apartment Polygon Interaction Layer

---

# Luồng editor mong muốn

## STEP 1

Editor tạo:

* Floor Post

Ví dụ:

* Tầng 1

---

## STEP 2

Upload:

* ảnh floor plan của tầng

Ví dụ:

* sơ đồ mặt bằng tầng

---

## STEP 3

Editor tạo:

* Apartment Post

Ví dụ:

* CH-12B

---

## STEP 4

Trong Apartment Post:

* chọn field “Thuộc tầng”
* relationship tới CPT Floor

---

## STEP 5

Sau khi chọn floor:
System phải:

* tự lấy ảnh floor plan từ Floor Post
* render ảnh đó trong admin editor

---

## STEP 6

Editor dùng chuột:

* vẽ polygon trực tiếp trên ảnh floor plan
* polygon đại diện vùng thật của căn hộ

---

# Đây là điểm QUAN TRỌNG

Polygon apartment:

* KHÔNG được vẽ trên masterplan tổng
* KHÔNG được vẽ trên ảnh khác

Polygon apartment:

# phải vẽ trên floor plan image

của Floor đang được relationship.

---

# Apartment Polygon Requirements

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

## 7. Edit polygon sau khi save

---

# Apartment Structure mong muốn

Apartment:

apartment
├── apartment_name
├── apartment_code
├── floor_relationship
├── apartment_layout
├── apartment_gallery
│
└── interaction
├── polygon
├── hover_color
├── popup_position
└── active_color

---

# Polygon data structure

KHÔNG lưu:

* SVG raw
* HTML
* inline style

PHẢI lưu:

* normalized coordinate

Ví dụ:

{
"polygon": [
{
"x": 12.5,
"y": 18.1
},
{
"x": 25.8,
"y": 18.3
},
{
"x": 26.1,
"y": 39.2
},
{
"x": 11.9,
"y": 39.8
}
]
}

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

# Admin UI Requirements

Sau khi chọn Floor relationship:

System phải:

* tự load floor image
* render SVG overlay editor
* enable polygon drawing

---

# Nếu chưa chọn floor

Hiển thị:

* empty state
* yêu cầu chọn floor trước

---

# SVG Architecture Requirements

Polygon render bằng:

<svg>
  <polygon points="..." />
</svg>

KHÔNG dùng:

* image map HTML cũ
* div absolute hotspot

---

# Realtime Sync Requirements

Khi editor:

* drag vertex
* add vertex
* remove vertex

System phải:

* update hidden ACF field realtime
* trigger ACF change event

---

# Frontend Requirements

Frontend sẽ dùng polygon để:

* hover apartment
* active apartment
* highlight apartment
* open popup apartment
* show apartment detail

---

# Frontend-ready JSON Structure

Apartment trả về:

{
"interaction": {
"polygon": [
{
"x": 12.5,
"y": 18.1
},
{
"x": 25.8,
"y": 18.3
}
],
"hover_color": "#F97316",
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
* SVG
* SVG.js
* Interact.js
* Panzoom

KHÔNG dùng:

* React admin app
* Vue admin app
* heavy framework

---

# Relationship Synchronization Requirements

Khi đổi:

* Floor Relationship

System phải:

* reload floor image mới
* reload polygon layer
* reset interaction đúng context

---

# Kiến trúc mong muốn

Floor Post
↓
Floor Plan Image
↓
Apartment Relationship
↓
Polygon Editor
↓
SVG Overlay
↓
Normalized JSON
↓
Frontend Interaction

---

# Scalability Requirements

Architecture phải dễ mở rộng cho:

* apartment tooltip
* apartment availability
* apartment hover state
* apartment filter
* apartment search
* multi-floor navigation
* floor switching animation

---

# Điều cần output

Hãy tạo:

1. Tổng quan Apartment Polygon System
2. Kiến trúc relationship synchronization
3. Flow lấy floor image từ relationship
4. SVG overlay architecture
5. Apartment polygon editor workflow
6. Vertex editing strategy
7. Polygon normalization logic
8. Realtime sync strategy
9. ACF integration architecture
10. Hidden field synchronization
11. Example apartment polygon JSON
12. Example SVG rendering logic
13. Example relationship watcher logic
14. Example polygon draw logic
15. Example drag vertex logic
16. Example frontend hover logic
17. Example apartment active logic
18. Folder structure
19. Performance best practices
20. Các lỗi kiến trúc cần tránh

Mục tiêu cuối cùng:

* editor chọn Floor
* system tự load floor image
* editor vẽ polygon trực tiếp trên floor plan
* frontend hover đúng căn hộ
* popup căn hộ hoạt động chính xác
* responsive tuyệt đối
* scalable cho real estate floor interaction system
