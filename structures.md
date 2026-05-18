Bạn là một Senior WordPress System Architect có hơn 10 năm kinh nghiệm trong:

* ACF Pro
* WordPress scalable architecture
* Real Estate Platform
* Interactive Masterplan Viewer
* Frontend-ready JSON Architecture
* Data Modeling
* Flexible Content
* Spatial UI systems
* WordPress performance optimization

Nhiệm vụ của bạn là thiết kế:

1. Kiến trúc ACF JSON
2. Kiến trúc CPT
3. Data modeling
4. Formatter Layer
5. Frontend-ready Response JSON
6. Quan hệ dữ liệu
7. Naming convention
8. Folder structure
9. Frontend contract structure

cho một website Landing Page bất động sản có hệ thống:

* interactive masterplan
* building viewer
* floor viewer
* apartment popup
* hotspot interaction

Frontend sử dụng:

* HTML
* CSS
* TailwindCSS
* Vanilla JavaScript

Frontend KHÔNG sử dụng:

* React
* Vue
* NextJS

Do đó:

* JSON structure phải cực kỳ rõ ràng
* frontend dễ loop/render
* frontend không cần “mò” nested ACF
* frontend không phụ thuộc raw ACF structure

---

# Bối cảnh dự án

Đây là:

* website landingpage
* chỉ dành cho 1 dự án bất động sản duy nhất

Do đó:

* KHÔNG tạo CPT re_project
* website itself chính là project

Hệ thống có section:

# “Tổng thể mặt bằng dự án”

Section này là:

* interactive spatial viewer
* multi-level popup system
* hotspot interaction system

KHÔNG phải:

* content section thông thường

---

# Flow nghiệp vụ thực tế

# Level 1 — Masterplan

Hiển thị:

* 1 ảnh tổng thể dự án

Trong ảnh:

* mỗi vùng tương ứng 1 tòa nhà
* hover vào building:

  * hiện overlay màu cam
  * hiện popup thông tin tòa

Popup building gồm:

* tên tòa
* số tầng
* số căn hộ
* diện tích
* mô tả ngắn

Click building:

* mở popup chi tiết building

---

# Level 2 — Building Popup

Popup building gồm:

## Sidebar tầng

Ví dụ:

* Tầng 1
* Tầng 2
* Tầng 3
* Tầng 4-35

Có trạng thái:

* active
* hover

---

## Khu vực trung tâm

Hiển thị:

* sơ đồ mặt bằng tầng
* floor plan image

Khi đổi tầng:

* đổi image tầng tương ứng

---

## Sidebar ghi chú màu

Ví dụ:

* màu đỏ = đã bán
* màu xanh = available
* màu vàng = duplex

---

# Level 3 — Floor Interaction

Trong floor plan:

* từng căn hộ có hotspot riêng
* hover căn hộ:

  * highlight
* click căn hộ:

  * mở popup chi tiết căn hộ

Căn hộ KHÔNG phải hình chữ nhật đơn giản.

Do đó:

* hotspot nên hỗ trợ polygon points
* không chỉ x/y đơn giản

---

# Level 4 — Apartment Popup

Popup căn hộ gồm:

* gallery hình ảnh
* tên căn hộ
* mã căn hộ
* diện tích thông thủy
* diện tích tim tường
* số phòng ngủ
* số WC
* hướng căn hộ
* trạng thái
* mô tả

---

# Danh sách tiện ích căn hộ

Hiển thị:

* icon
* label
* value

Ví dụ:

* 🛏 Phòng ngủ: 2
* 🚿 WC: 2
* 🌅 Ban công: 1

---

# Kiến trúc bắt buộc

# Architecture Layer

ACF
↓
Formatter Layer
↓
Frontend-ready JSON
↓
Frontend JS Render

---

# QUAN TRỌNG

Frontend KHÔNG được:

* đọc raw ACF structure
* mò nested repeater
* phụ thuộc flexible content structure
* phụ thuộc relationship raw data

Frontend chỉ consume:

* clean JSON
* normalized structure
* stable contract

---

# Cấu trúc Post Type

# 1. re_building

Đại diện:

* tòa nhà
* block

---

## Fields

* building_name
* building_code
* building_thumbnail
* building_overlay_image
* building_master_plan
* building_total_floor
* building_total_apartment
* building_area
* building_status
* building_description
* building_popup_summary

---

# Hotspot data của building

building_hotspots
└── hotspot_item
├── x
├── y
├── width
├── height
├── polygon_points
├── overlay_image
├── popup_position

---

# 2. re_floor

Đại diện:

* từng tầng

---

## Fields

* floor_name
* floor_number
* floor_image
* floor_thumbnail
* floor_description
* floor_status

---

# Chú thích màu

floor_legend_items
└── item
├── color
├── label

---

# Quan hệ

Floor
→ parent_building

---

# 3. re_apartment

Đại diện:

* từng căn hộ

---

## Fields

* apartment_name
* apartment_code
* apartment_type
* apartment_area_net
* apartment_area_gross
* apartment_choose_facility ( relationship : chọn ra các tiện ích, ví dụ: ban công, logia, phòng giặt, phòng kho,... được tạo trong danh mục tiện ích chung -> apartment_utilities , để tránh việc phải tạo nhiều field tiện ích giống nhau cho từng căn hộ, chỉ cần chọn tiện ích và nhập value tương ứng)
* apartment_direction
* apartment_layout
* apartment_gallery

---

# Hotspot data của apartment

apartment_hotspot
├── x
├── y
├── width
├── height
├── polygon_points
├── popup_position
├── hover_color

---

# Tiện ích căn hộ

apartment_utilities
└── utility_item
├── icon
├── label
├── value

---

# Quan hệ

Apartment
→ parent_floor

---

# Flexible Content Architecture

Landing Page phải dùng:

page_sections

KHÔNG hardcode:

* section_1
* section_2
* section_3

---

# Layout cần có

* hero_banner
* overview
* location
* utilities
* gallery
* apartment_layout
* faq
* cta

---

# Section apartment_layout

Đây là section quan trọng nhất.

Fields:

* section_title
* section_description
* relationship_buildings
* default_building
* display_style

Frontend flow:

Select Building
↓
Load Floors
↓
Load Apartments
↓
Render Popup

---

# QUY TẮC KIẾN TRÚC CỰC KỲ QUAN TRỌNG

# KHÔNG dùng nested repeater sâu

KHÔNG làm:

building
└── repeater floors
└── repeater apartments

vì sẽ gây:

* admin lag
* save_post nặng
* ACF meta hell
* khó maintain
* khó query
* khó scale

---

# Chỉ dùng repeater cho UI-only data

Ví dụ:

* FAQ
* CTA
* gallery
* timeline
* hotspot
* utilities

---

# Relationship Architecture

CHỈ dùng:

* child → parent

Ví dụ:

Apartment
→ parent_floor

Floor
→ parent_building

KHÔNG dùng:

* bidirectional relationship
* recursive relationship

---

# Naming Convention

## CPT

* re_building
* re_floor
* re_apartment

---

## Fields

BẮT BUỘC prefix rõ ràng:

* building_name
* floor_image
* apartment_gallery

KHÔNG dùng:

* title
* image
* gallery
* data

---

# ACF JSON Structure

acf-json/
├── group_building.json
├── group_floor.json
├── group_apartment.json
├── group_page_sections.json
├── group_hotspot.json
└── group_shared_fields.json

---

# Formatter Layer Requirements

Tạo formatter functions:

* format_building()
* format_floor()
* format_apartment()
* format_sections()

Mục tiêu:

* normalize data
* clean output
* hide raw ACF structure
* frontend consume dễ dàng

---

# Frontend-ready JSON Structure

Frontend cần JSON dạng:

{
"buildings": [
{
"id": 1,
"name": "Tòa A",
"overlay": {},
"floors": [
{
"id": 11,
"floor": 4,
"image": "...",
"legend": [],
"apartments": [
{
"id": 111,
"name": "CH-12B",
"hotspot": {},
"gallery": [],
"utilities": []
}
]
}
]
}
]
}

---

# Frontend Requirements

Frontend JS cần:

* loop dễ dàng
* render popup dễ dàng
* detect hotspot dễ dàng
* active state dễ dàng
* không phải parse raw ACF
* không phải query nested field phức tạp

---

# Performance Requirements

Tối ưu:

* admin performance
* save_post performance
* relationship query
* frontend rendering
* image loading

Tránh:

* nested repeater sâu
* duplicate relationship
* recursive data
* giant flexible content

---

# Editor UX Requirements

Editor phải:

* dễ nhập liệu
* dễ maintain
* không bị nested quá nhiều cấp
* dễ clone content
* dễ tìm field

---

# Điều cần output

Hãy tạo:

1. Tổng quan kiến trúc hệ thống
2. Sơ đồ data tree
3. Danh sách CPT
4. Danh sách field chi tiết
5. Quan hệ dữ liệu
6. Flexible Content structure
7. ACF JSON structure
8. Naming convention
9. Formatter layer architecture
10. Frontend-ready JSON structure
11. PHP formatter examples
12. Frontend JS consumption examples
13. Performance best practices
14. Editor UX best practices
15. Các lỗi architecture cần tránh
16. Folder structure đề xuất
17. Data flow tổng thể Backend → Frontend

Mục tiêu cuối cùng:

* frontend JS render dễ dàng
* không cần mò dữ liệu
* JSON output sạch
* dữ liệu normalized
* backend dễ maintain
* scalable về lâu dài
* complexity hợp lý cho landingpage BĐS tương tác cao
