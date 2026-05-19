# Real Estate REST API

Base URL: `/wp-json/re/v1`
ví dụ: `https://example.com/wp-json/re/v1/masterplan`,

---

## Masterplan (Home-7 — Mặt bằng dự án)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/masterplan` | Full JSON: tất cả buildings + floors + apartments (Level 1-4) |
| GET | `/buildings` | Building list + hotspot polygon (Level 1) |
| GET | `/building/{id}/floors` | Floors + apartments của một tòa (Level 2-3) |
| GET | `/apartment/{id}` | Chi tiết căn hộ: gallery, tiện ích, polygon (Level 4) |
| GET | `/page/{page_id}/apartment-layout` | Buildings + polygon/color từ section ACF + floors + apartments |

### `/page/{page_id}/apartment-layout` — Response
```json
{
  "section_title": "Mặt bằng dự án",
  "masterplan_image": { "id": 10, "url": "...", "width": 1920, "height": 1080, "alt": "" },
  "buildings": [
    {
      "id": 42,
      "name": "Block A",
      "code": "A",
      "color": "#f97316",
      "polygon": [{ "x": 10.5, "y": 20.0 }, { "x": 30.0, "y": 20.0 }],
      "floors": [
        {
          "id": 10,
          "name": "Tầng 1",
          "number": 1,
          "number_end": null,
          "apartments": [
            {
              "id": 55,
              "name": "Căn A101",
              "code": "A101",
              "type": "2PN",
              "status": "available",
              "area_net": 65.5,
              "area_gross": 72.0,
              "direction": "Đông Nam",
              "layout": { "url": "..." },
              "gallery": [{ "url": "..." }],
              "facilities": [{ "icon": "...", "label": "Bếp", "value": "Có" }],
              "interaction": {
                "polygon": [{ "x": 5.0, "y": 10.0 }],
                "hover_color": "#f97316",
                "popup_position": "top"
              }
            }
          ]
        }
      ]
    }
  ],
  "legend": [{ "color": "#22c55e", "status": "available", "label": "Còn trống" }]
}
```

---

## Utilities (Home-5 — Hệ tiện ích ALL IN ONE)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/page/{page_id}/utilities` | Floor groups + amenity list + polygon overlay |

### `/page/{page_id}/utilities` — Response
```json
{
  "section_title": "ALL IN ONE",
  "section_description": "<p>...</p>",
  "masterplan_image": { "url": "..." },
  "floor_groups": [
    {
      "name": "Tầng 1-5",
      "code": "F1",
      "camera_state": { "scale": 1.5, "x": 40.0, "y": 60.0 },
      "amenities": [
        {
          "name": "Hồ bơi vô cực",
          "description": "<p>...</p>",
          "polygon": [{ "x": 12.5, "y": 22.1 }, { "x": 42.8, "y": 19.2 }]
        }
      ]
    }
  ],
  "meta": {
    "api_base": "https://example.com/wp-json/re/v1",
    "page_id": 5,
    "nonce": "abc123"
  }
}
```

---

## Inline JS (không cần AJAX thêm)

Khi trang có section `apartment_layout` hoặc `utilities_all_in_one`,
dữ liệu được inject sẵn vào `window` qua `wp_localize_script`:

```js
// Home-7: Masterplan data
window.RE_DATA = {
  buildings: [...],  // kèm polygon + color từ section ACF
  legend: [...],
  meta: { masterplan_image, api_base, nonce }
}

// Home-5: Utilities data
window.RE_UTILITIES = {
  section_title, masterplan_image, floor_groups: [...],
  meta: { api_base, page_id, nonce }
}
```

> **Ưu tiên dùng inline data** cho lần render đầu tiên.  
> Chỉ gọi API khi cần reload data động (filter, lazy load thêm tầng, v.v.).

---

## Ghi chú chung

- Tất cả endpoint đều `public` (không cần auth).
- `polygon` luôn trả về mảng `[{ x: float, y: float }]` — tọa độ `%` so với ảnh.
- `camera_state` dùng cho thư viện zoom/pan (Panzoom, Pixi.js...).
- `nonce` truyền qua header `X-WP-Nonce` nếu có endpoint `POST`/`PUT` trong tương lai.