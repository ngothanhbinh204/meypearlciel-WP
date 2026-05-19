import AOS from "aos";
import lozad from "lozad";
import { animations } from "./cursor";
import {
	setBackgroundElement,
	detectCloseElement,
	buttonToTop,
	clickScrollToDiv,
	appendCaptchaASP,
	menuSpy,
	ToggleItem,
	stickElementToEdge,
	countUpInit,
	customTab,
	showContent,
	replaceSvgImages
} from "./helper";
import { header } from "./header";
import { LoadMoreElement } from "./load-more";
import { swiperInit } from "./swiper";
import { homePage } from "./homePage";
import { initLocationCar } from "./location";
import { navAnimation } from "./navAnimation";
$(document).ready(function () {
	setBackgroundElement();
	stickElementToEdge();
	const svgReplaceDone = replaceSvgImages();
	menuSpy();
	animations.init();
	customTab();
	showContent();
	countUpInit();
	swiperInit();
	ToggleItem();
	homePage.init();
	initLocationCar();
	buttonToTop();
	header.init();
	showIntroPopup();
	svgReplaceDone.then(() => {
		navAnimation.init();
		if ($("body.home").length) homePage.home_1();
	});
	// Load more recruitment jobs
	if ($('[data-recruitment-list]').length) {
		new LoadMoreElement({
			parentSelector: '[data-recruitment-list]',
			itemSelector: '.recruitment-item-wrapper',
			buttonSelector: '[data-load-more-recruitment] button',
			visibleCount: 10,
			loadStep: 10,
		});
	}
	setTimeout(() => {
		AOS.init({
			offset: 80,
			once: true,
			disable: function () {
				return window.innerWidth < 1200;
			},
		});
	}, 100);
	setTimeout(() => {
		AOS.refresh();
	}, 1000);

	document.querySelectorAll(".wrap-scroll-container").forEach((wrap) => {
		const scrollContainer = wrap.querySelector(".scroll-container");
		if (!scrollContainer) return;

		const items = scrollContainer.querySelectorAll(".item");
		const quantity = items.length;

		// Gán --quantity cho scroll-container
		scrollContainer.style.setProperty("--quantity", quantity);

		// Gán --quantity cho wrap-scroll-container (nếu cần)
		wrap.style.setProperty("--quantity", quantity);

		// Gán --position cho từng item
		items.forEach((item, index) => {
			item.style.setProperty("--position", index + 1);
		});
	});

	document.querySelectorAll(".wrap-slide-mobile .scroll-container").forEach((container) => {
		const items = container.querySelectorAll(".item");
		const quantity = items.length;

		// Gán biến --quantity-mobile vào scroll-container
		container.style.setProperty("--quantity-mobile", quantity);

		// Gán --position-mobile cho từng item
		items.forEach((item, index) => {
			item.style.setProperty("--position-mobile", index + 1);
		});
	});



});

function showIntroPopup() {
	if (!$("#intro-popup").length) return;
	// Check if user has seen the popup (localStorage lasts forever until cleared)
	// const hasSeenPopup = localStorage.getItem("hasSeenIntroPopup");

	// // If already seen, don't show again
	// if (hasSeenPopup === "true") return;

	setTimeout(() => {
		Fancybox.show([{
			src: "#intro-popup",
			type: "inline",
		}], {
			animated: true,
			// on: {
			// 	done: () => {
			// 		// Mark as seen when popup is shown
			// 		localStorage.setItem("hasSeenIntroPopup", "true");
			// 	}
			// }
		});
	}, 500);
}


/*==================== Aos Init ====================*/
AOS.init({
	offset: 100,
});
/*==================== Lazyload JS ====================*/
const observer = lozad(); // lazy loads elements with default selector as '.lozad'
observer.observe();
window.lozad = observer;



// ── Fancybox global bind ─────────────────────────────────────────
Fancybox.bind("[data-fancybox]", {
	parentEl: document.body,
});


// ═══════════════════════════════════════════════════════════════
// BUILDING POPUP — openBuildingPopup(buildingId)
//
// Luong:
//   Image Map Pro (Run Script) → openBuildingPopup(42)
//     → fetch /wp-json/re/v1/building/42/floors
//     → renderBuildingPopup(building)   — dien noi dung vao #popup-plan
//     → Fancybox.show('#popup-plan')
//
// Click floor tab → renderFloorPlan(floor, building)
// Click anh mat bang → mo #popup-detail-plan
// ═══════════════════════════════════════════════════════════════

/**
 * Dien noi dung vao #popup-plan shell.
 * @param {Object} building  Response tu GET /re/v1/building/{id}/floors
 */
function renderBuildingPopup(building) {
	// Lay mau toa tu RE_DATA (duoc inject san qua wp_localize_script)
	const meta  = (window.RE_DATA?.buildings || []).find(b => b.id === building.id);
	const color = meta?.color || '#f97316';

	// Ten toa
	document.getElementById('popup-building-header').textContent = building.name || '';

	// Floor tabs
	const floorsEl = document.getElementById('popup-floor-tabs');
	floorsEl.innerHTML = '';
	const floors = building.floors || [];

	floors.forEach((floor, index) => {
		const key = floor.number_end
			? `${floor.number}-${floor.number_end}`
			: floor.number;

		const btn       = document.createElement('div');
		btn.className   = 'floor-item' + (index === 0 ? ' active' : '');
		btn.dataset.floor   = key;
		btn.dataset.floorId = floor.id;
		btn.textContent = floor.name;

		btn.addEventListener('click', () => {
			floorsEl.querySelectorAll('.floor-item').forEach(el => el.classList.remove('active'));
			btn.classList.add('active');
			renderFloorPlan(floor, building);
		});

		floorsEl.appendChild(btn);
	});

	// Hien thi anh tang dau tien
	renderFloorPlan(floors[0] || null, building);

	// Legend mau toa
	document.getElementById('popup-building-legend').innerHTML = `
		<div class="plan-legend-item">
			<div class="plan-legend-item-color" style="background-color:${color}"></div>
			<div class="plan-legend-item-name">${building.name || ''}</div>
		</div>
	`;
}

/**
 * Render anh mat bang vao #popup-building-plan.
 * Uu tien: floor.image → building.master_plan.
 * @param {Object|null} floor
 * @param {Object}      building
 */
// SVG namespace
const SVG_NS = 'http://www.w3.org/2000/svg';

// Swiper instances cho apartment detail popup
let aptSwiperMain  = null;
let aptSwiperThumb = null;

/**
 * Render anh mat bang + SVG polygon overlay cho tung can ho.
 * Uu tien kich thuoc tu floor.image, fallback ratio 550:960.
 * @param {Object|null} floor
 * @param {Object}      building
 */
function renderFloorPlan(floor, building) {
	const planEl   = document.getElementById('popup-building-plan');
	const image    = floor?.image || null;
	const imageUrl = image?.url || building?.master_plan?.url || '';

	if (!imageUrl) {
		planEl.innerHTML = '';
		return;
	}

	// Aspect ratio tu kich thuoc anh thuc, fallback 550:960
	const aspectPct = (image?.height && image?.width)
		? (image.height / image.width * 100).toFixed(4)
		: (550 / 960 * 100).toFixed(4);

	// Container ratio
	const ratioDiv = document.createElement('div');
	ratioDiv.style.cssText = `position:relative;width:100%;padding-top:${aspectPct}%;`;

	// Floor plan image
	const img = document.createElement('img');
	img.src   = imageUrl;
	img.alt   = building?.name || '';
	img.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:fill;display:block;';
	ratioDiv.appendChild(img);

	// SVG overlay — ve polygon cho tung can ho
	const apartments = floor?.apartments || [];
	if (apartments.length) {
		const svg = document.createElementNS(SVG_NS, 'svg');
		svg.setAttribute('viewBox', '0 0 100 100');
		svg.setAttribute('preserveAspectRatio', 'none');
		svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;';

		apartments.forEach(apt => {
			if (!apt.interaction?.polygon?.length) return;
			svg.appendChild(buildApartmentPolygon(apt));
		});

		ratioDiv.appendChild(svg);
	}

	planEl.innerHTML = '';
	planEl.appendChild(ratioDiv);
}

/**
 * Tao SVG <polygon> cho mot can ho.
 * Hover: lam dam; Click: openApartmentDetail(apt).
 */
function buildApartmentPolygon(apt) {
	const pts       = apt.interaction.polygon.map(p => `${p.x},${p.y}`).join(' ');
	const baseColor = apt.interaction.hover_color || '#f97316';
	const fillIdle  = hexToRgba(baseColor, 0.15);
	const fillHover = hexToRgba(baseColor, 0.50);

	const poly = document.createElementNS(SVG_NS, 'polygon');
	poly.setAttribute('points', pts);
	poly.setAttribute('fill', fillIdle);
	poly.setAttribute('stroke', baseColor);
	poly.setAttribute('stroke-width', '0.3');
	poly.setAttribute('data-apt-id', apt.id);
	poly.style.cssText = 'pointer-events:all;cursor:pointer;transition:fill 0.18s;';

	poly.addEventListener('mouseenter', () => poly.setAttribute('fill', fillHover));
	poly.addEventListener('mouseleave', () => poly.setAttribute('fill', fillIdle));
	poly.addEventListener('click',      () => openApartmentDetail(apt));

	return poly;
}

/**
 * Dien noi dung can ho vao #popup-detail-plan roi mo Fancybox.
 * @param {Object} apt  Apartment object tu API
 */
function openApartmentDetail(apt) {
	// Ten can ho
	document.querySelector('.js-apt-name').textContent = apt.name || '';

	// Thong tin dien tich
	const areaEl = document.querySelector('.js-apt-area');
	areaEl.innerHTML = '';
	if (apt.area_net)   areaEl.insertAdjacentHTML('beforeend', `<div class="info-item text-Primary-4 font-normal">DT thong thuy: ${apt.area_net}m²</div>`);
	if (apt.area_gross) areaEl.insertAdjacentHTML('beforeend', `<div class="info-item text-Primary-4 font-normal">DT tim tuong: ${apt.area_gross}m²</div>`);

	// Tien ich
	const facEl = document.querySelector('.js-apt-facilities');
	facEl.innerHTML = (apt.facilities || []).map(f => `
		<div class="facility-item">
			<div class="facility-item-icon">
				<div class="icon">${f.icon ? `<img class="img-svg" src="${f.icon}" alt="">` : ''}</div>
				<div class="facility-item-name">${f.label}</div>
			</div>
			<div class="facility-item-quantity body-4 font-normal text-Primary-4">${f.value}</div>
		</div>
	`).join('');

	// Gallery: dung gallery neu co, fallback layout
	const gallery = apt.gallery?.length ? apt.gallery : (apt.layout ? [apt.layout] : []);
	populateAptSwiper(gallery);

	Fancybox.show([{ src: '#popup-detail-plan', type: 'inline' }]);
}

/**
 * Khoi tao/reset swiper gallery can ho.
 * @param {Array} gallery  Mang anh [{id, url, alt}]
 */
function populateAptSwiper(gallery) {
	if (aptSwiperMain)  { aptSwiperMain.destroy(true, true);  aptSwiperMain  = null; }
	if (aptSwiperThumb) { aptSwiperThumb.destroy(true, true); aptSwiperThumb = null; }

	const slides = gallery.map(img => `
		<div class="swiper-slide">
			<div class="img"><a class="img-ratio"><img src="${img.url}" alt="${img.alt || ''}"></a></div>
		</div>
	`).join('');

	document.querySelector('.js-apt-swiper-main .swiper-wrapper').innerHTML  = slides;
	document.querySelector('.js-apt-swiper-thumb .swiper-wrapper').innerHTML = slides;

	aptSwiperThumb = new Swiper('.js-apt-swiper-thumb', {
		direction: 'vertical',
		slidesPerView: 4,
		spaceBetween: 8,
		freeMode: true,
		watchSlidesProgress: true,
	});

	aptSwiperMain = new Swiper('.js-apt-swiper-main', {
		spaceBetween: 0,
		thumbs: { swiper: aptSwiperThumb },
	});
}

/** Chuyen hex color sang rgba. */
function hexToRgba(hex, alpha) {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Mo popup toa nha — expose ra window de Image Map Pro goi duoc.
 *
 * Cau hinh trong Image Map Pro:
 *   Action → "Run Script"
 *   Script → openBuildingPopup(42)   // 42 = post ID cua re_building
 *
 * @param {number} buildingId  Post ID cua toa nha (re_building CPT)
 */
window.openBuildingPopup = async function(buildingId) {
	try {
		const apiBase = window.RE_DATA?.meta?.api_base || '/wp-json/re/v1';
		const res     = await fetch(`${apiBase}/building/${buildingId}/floors`);

		if (!res.ok) throw new Error(`HTTP ${res.status}`);

		const building = await res.json();
		renderBuildingPopup(building);

		Fancybox.show([{ src: '#popup-plan', type: 'inline' }]);
	} catch (err) {
		console.error('[openBuildingPopup]', err);
	}
};
