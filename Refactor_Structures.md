Bạn là một Senior WordPress Architect có hơn 10 năm kinh nghiệm trong:

* WordPress Core Architecture
* CPT & Taxonomy Design
* ACF Pro
* Real Estate Data Systems
* Image Map Pro
* WordPress Native Relationship Modeling
* Frontend-ready API Design

Nhiệm vụ của bạn là:

# Refactor lại toàn bộ hệ thống liên kết dữ liệu bất động sản

Từ:

# ACF Relationship / Post Object architecture

Sang:

# WordPress Native Taxonomy Architecture

Mục tiêu:

* tối ưu kiến trúc dữ liệu
* giảm nested relationship phức tạp
* WordPress-native hơn
* query/filter tốt hơn
* dễ tích hợp Image Map Pro
* dễ maintain
* scalable
* frontend-friendly

---

# KIẾN TRÚC CŨ HIỆN TẠI

Hiện tại hệ thống đang dùng:

## CPT:

* re_building
* re_floor
* re_apartment

---

# Liên kết bằng ACF:

## Floor

→ field relationship:

* building_id

## Apartment

→ field relationship:

* floor_id

---

# Kiến trúc hiện tại:

Building
└── Floor
└── Apartment

---

# VẤN ĐỀ CỦA KIẾN TRÚC CŨ

* nested relationship sâu
* query khó
* frontend normalize phức tạp
* WordPress không tối ưu cho nested relationship kiểu này
* Image Map Pro khó attach entity
* maintain khó
* scalable kém khi dữ liệu lớn

---

# MỤC TIÊU REFACTOR MỚI

# Chuyển:

Building + Floor
→ sang Taxonomy Hierarchy

# Giữ:

Apartment
→ là CPT

---

# KIẾN TRÚC MỚI MONG MUỐN

# 1. APARTMENT

Giữ:

# CPT re_apartment

Vì apartment là business entity chính.

Apartment chứa:

* gallery
* layout
* diện tích
* metadata
* popup data
* trạng thái
* media
* chi tiết căn hộ

---

# 2. BUILDING + FLOOR

KHÔNG dùng CPT nữa.

Chuyển sang:

# Hierarchical Taxonomy

Ví dụ taxonomy:

* re_location
  hoặc:
* re_structure

---

# Cấu trúc taxonomy mong muốn:

Tòa A
├── Tầng 1
├── Tầng 2
├── Tầng 3

Tòa B
├── Tầng 1
├── Tầng 2

---

# MỤC TIÊU

Dùng taxonomy tree để mô hình hóa:

Building
└── Floor

---

# Apartment sẽ attach taxonomy term:

Ví dụ:

Apartment CH-12B
→ Tòa A > Tầng 2

---

# YÊU CẦU QUAN TRỌNG

# KHÔNG dùng:

* ACF Relationship
* Post Object
* nested repeater để liên kết

---

# Thay vào đó:

Dùng:

# taxonomy hierarchy native của WordPress

---

# IMAGE MAP PRO REQUIREMENTS

Image Map Pro sẽ:

* attach polygon vào apartment
* attach polygon vào utility
* attach polygon vào building

---

# Vì vậy:

Apartment cần:

* stable taxonomy relationship
* clean entity structure
* dễ query

---

# API REQUIREMENTS

Frontend cần query:

## Lấy apartment theo building

Ví dụ:

* tất cả apartment của Tòa A

---

## Lấy apartment theo floor

Ví dụ:

* tất cả apartment của Tầng 2

---

# Vì vậy taxonomy query phải tối ưu.

---

# YÊU CẦU THIẾT KẾ

Hãy refactor kiến trúc theo hướng:

# Apartment (CPT)

*

# Building/Floor (Hierarchical Taxonomy)

---

# CẦN OUTPUT

Hãy tạo:

1. Kiến trúc taxonomy mới
2. Taxonomy hierarchy structure
3. Naming convention
4. CPT architecture mới
5. Apartment structure mới
6. Taxonomy structure mới
7. Relationship flow mới
8. Query strategy
9. API strategy
10. Image Map Pro integration strategy
11. Migration strategy từ ACF relationship sang taxonomy
12. Các field ACF cần xóa
13. Các field taxonomy cần thêm
14. Cách attach apartment vào floor
15. Cách query apartment theo building
16. Cách query apartment theo floor
17. Kiến trúc frontend-friendly
18. Những lỗi kiến trúc cần tránh
19. Performance best practices
20. Production-grade recommendations

---

# MỤC TIÊU CUỐI CÙNG

Kiến trúc mới phải:

* WordPress-native
* scalable
* dễ query
* dễ filter
* frontend-friendly
* phù hợp Image Map Pro
* maintain tốt
* production-ready cho Real Estate Interactive System
