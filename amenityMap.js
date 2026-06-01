import tippy from "tippy.js";
let mapNames = [];
let mapReady = false;
let pendingFloorCode = "";
let mapIdFloorIndex = {};
let activeFloorCode = "";

const $amenityRoot = () => $("#home-5, .home-5").first();
const $mapWrapper = () => $amenityRoot().find(".image-map-wrapper").first();

function isFloorZoomObject($object) {
	const title = String($object.data("title") || $object.data("slug") || "");
	return title.endsWith("-zoom") || $object.hasClass("amenity-floor-zoom-poly");
}

function collectMapNames(initMapName) {
	const names = [];

	if (initMapName) names.push(initMapName);

	const $root = $amenityRoot();
	const attrName = $root.attr("data-image-map-name");
	if (attrName) names.push(attrName);

	const mapId = $(".image-map-wrapper .imp-object[data-image-map-id]")
		.first()
		.attr("data-image-map-id");
	if (mapId) names.push(mapId);

	return names.filter(function (name, index, arr) {
		return name && arr.indexOf(name) === index;
	});
}

function getFloorZoomTitle($toggle) {
	const focus = $toggle.attr("data-floor-focus");
	if (focus) return focus;

	const fromLegend = $toggle
		.find("[data-imp-focus-object-on-click]")
		.first()
		.attr("data-imp-focus-object-on-click");
	if (fromLegend) return fromLegend;

	const floorCode = $toggle.attr("data-floor-code") || $toggle.data("floor-code") || "";
	return floorCode ? `${floorCode}-zoom` : "";
}

function clickMapObject(exactTitle) {
	const el = document.querySelector(
		`.image-map-wrapper .imp-object[data-title="${exactTitle}"],` +
		`.image-map-wrapper .imp-object[data-slug="${exactTitle}"]`
	);
	if (!el) return false;
	el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
	return true;
}

function focusMapObject(exactTitle) {
	if (!exactTitle || typeof ImageMapPro === "undefined") return;

	const names = mapNames.length ? mapNames : collectMapNames();

	if (typeof ImageMapPro.focusObject === "function" && names.length) {
		names.forEach(function (name) {
			ImageMapPro.focusObject(name, exactTitle);
		});
	}

	clickMapObject(exactTitle);
}

function runFloorZoom(floorCodeOrToggle) {
	let exactTitle = "";
	if (typeof floorCodeOrToggle === "string") {
		const $toggle = $amenityRoot()
			.find(`.item-toggle[data-floor-code="${floorCodeOrToggle}"]`)
			.first();
		exactTitle = $toggle.length ? getFloorZoomTitle($toggle) : `${floorCodeOrToggle}-zoom`;
	} else {
		exactTitle = getFloorZoomTitle(floorCodeOrToggle);
	}
	if (!exactTitle) return;

	focusMapObject(exactTitle);
	setTimeout(function () {
		focusMapObject(exactTitle);
	}, 200);
	setTimeout(function () {
		focusMapObject(exactTitle);
	}, 500);
}

function focusFloorZoom(floorCodeOrToggle) {
	if (!mapReady) {
		pendingFloorCode =
			typeof floorCodeOrToggle === "string"
				? floorCodeOrToggle
				: floorCodeOrToggle.attr("data-floor-code") ||
				floorCodeOrToggle.data("floor-code") ||
				"";
		return;
	}
	runFloorZoom(floorCodeOrToggle);
}

function buildMapIdFloorIndex() {
	const index = {};

	$amenityRoot()
		.find(".item-toggle[data-floor-code]")
		.each(function () {
			const floorCode =
				$(this).attr("data-floor-code") || $(this).data("floor-code") || "";
			if (!floorCode) return;

			$(this)
				.find(".amenity-legend-item")
				.each(function () {
					const mapId =
						$(this).attr("data-map-id") ||
						$(this).attr("data-imp-trigger-object-on-mouseover") ||
						"";
					if (mapId) index[mapId] = floorCode;
				});

			const zoomTitle = getFloorZoomTitle($(this));
			if (zoomTitle) index[zoomTitle] = floorCode;
		});

	mapIdFloorIndex = index;
	return index;
}

function resolveFloorCode($object) {
	const title = String($object.data("title") || $object.attr("data-title") || "");
	const slug = String($object.data("slug") || $object.attr("data-slug") || "");
	const key = title || slug;

	if (key && mapIdFloorIndex[key]) return mapIdFloorIndex[key];

	if (key.endsWith("-zoom")) {
		const zoomMatch = key.match(/^(floor-\d+)-zoom$/);
		if (zoomMatch) return zoomMatch[1];
	}

	const prefixMatch = key.match(/^(floor-\d+)-/);
	if (prefixMatch) return prefixMatch[1];

	return "";
}

function tagMapObjectsWithFloor() {
	buildMapIdFloorIndex();

	$mapWrapper()
		.find(".imp-object")
		.each(function () {
			const $el = $(this);
			const floorCode = resolveFloorCode($el);
			if (floorCode) {
				$el.attr("data-floor-code", floorCode);
			}
		});
}

function setObjectFloorVisible($object, visible) {
	const $el = $object.jquery ? $object : $($object);
	const $spot = $el.closest(".imp-object-spot");

	if (visible) {
		$el.removeClass("amenity-floor-hidden");
		if ($spot.length) $spot.removeClass("amenity-floor-hidden");
	} else {
		$el.addClass("amenity-floor-hidden");
		if ($spot.length) $spot.addClass("amenity-floor-hidden");
		if ($el[0] && $el[0]._tippy) {
			$el[0]._tippy.hide();
		}
	}
}

function applyFloorFilter(floorCode) {
	activeFloorCode = floorCode || "";
	const $wrap = $mapWrapper();
	if (!$wrap.length) return;

	$wrap.removeClass(function (i, className) {
		return (className.match(/\bis-floor-[\w-]+-active\b/g) || []).join(" ");
	});

	if (floorCode) {
		$wrap.addClass(`is-${floorCode}-active`);
		$wrap.attr("data-active-floor", floorCode);
	} else {
		$wrap.removeAttr("data-active-floor");
	}

	$wrap.find(".imp-object").each(function () {
		const $el = $(this);
		const objectFloor = $el.attr("data-floor-code") || resolveFloorCode($el) || "";
		if (!floorCode) {
			setObjectFloorVisible($el, true);
			return;
		}
		setObjectFloorVisible($el, !objectFloor || objectFloor === floorCode);
	});
}

function onAmenityFloorChange(floorCode) {
	if (!mapReady) {
		pendingFloorCode = floorCode || "";
		return;
	}
	applyFloorFilter(floorCode);
	runFloorZoom(floorCode);
}

function getTooltipHtmlForObject($object) {
	const title = $object.data("title") || "";
	const slug = $object.data("slug") || "";
	return (
		$(`.amenity-tooltip-wrapper[data-title="${title}"]`).html() ||
		$(`.amenity-tooltip-wrapper[data-index="${slug}"]`).html() ||
		""
	);
}

function getLegendForObject($object) {
	if (isFloorZoomObject($object)) return $();

	const title = $object.data("title") || "";
	if (!title) return $();

	return $(
		`.amenity-legend-item[data-imp-trigger-object-on-mouseover="${title}"],` +
		`.amenity-legend-item[data-map-id="${title}"]`
	);
}

function getLegendSelectorForTitle(title) {
	return (
		`.amenity-legend-item[data-imp-trigger-object-on-mouseover="${title}"],` +
		`.amenity-legend-item[data-map-id="${title}"]`
	);
}

function normalizeHexColor(value) {
	if (!value) return "";
	const color = String(value).trim();
	if (/^#([0-9a-f]{3}){1,2}$/i.test(color)) {
		if (color.length === 4) {
			return (
				"#" +
				color[1] + color[1] +
				color[2] + color[2] +
				color[3] + color[3]
			).toLowerCase();
		}
		return color.toLowerCase();
	}
	return "";
}

function parseRgbColor(value) {
	if (!value) return "";
	const raw = String(value).trim();
	const match = raw.match(/^rgba?\(([^)]+)\)$/i);
	if (!match) return "";

	const parts = match[1].split(",").map((part) => Number(String(part).trim()));
	if (parts.length < 3 || parts.slice(0, 3).some((n) => Number.isNaN(n))) return "";

	const toHex = (n) => {
		const clamped = Math.max(0, Math.min(255, Math.round(n)));
		return clamped.toString(16).padStart(2, "0");
	};

	return `#${toHex(parts[0])}${toHex(parts[1])}${toHex(parts[2])}`;
}

function getAmenityColorFromLegend($legend) {
	if (!$legend || !$legend.length) return "";

	const dataColor = normalizeHexColor($legend.first().attr("data-amenity-color"));
	if (dataColor) return dataColor;

	const inlineColor = normalizeHexColor($legend.first().find(".amenity-legend-item-number").css("background-color"));
	if (inlineColor) return inlineColor;

	return parseRgbColor($legend.first().find(".amenity-legend-item-number").css("background-color"));
}

function getContrastTextColor(bgHex) {
	const hex = normalizeHexColor(bgHex);
	if (!hex) return "#ffffff";

	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	const yiq = (r * 299 + g * 587 + b * 114) / 1000;

	return yiq >= 160 ? "#1f2937" : "#ffffff";
}

function applySpotInnerColor($spotInner, bgColor) {
	if (!$spotInner || !$spotInner.length || !bgColor) return;
	$spotInner.css({
		backgroundColor: bgColor,
		color: getContrastTextColor(bgColor),
	});
}

function initPlan() {
	$(".image-map-wrapper .imp-object").each(function () {
		const ref = $(this);
		if (isFloorZoomObject(ref)) return;

		const tooltip = getTooltipHtmlForObject(ref);
		if (!tooltip) return;

		if (ref[0]._tippy) {
			ref[0]._tippy.destroy();
		}

		const triggerTarget = [ref[0]];
		const $legend = getLegendForObject(ref);
		if ($legend.length) {
			triggerTarget.push($legend[0]);
		}

		tippy(ref[0], {
			content: tooltip,
			allowHTML: true,
			arrow: true,
			placement: $(window).width() > 1024.98 ? "top" : "bottom",
			theme: "amenity-master-theme",
			interactive: true,
			trigger: "click",
			triggerTarget,
			// popperOptions: {
			// 	strategy: "fixed",
			// },
			interactiveBorder: 5,
			// offset: $(window).width() > 1024 ? [80, 20] : [0, 40],
			appendTo: () => document.body,
			onShow(instance) {
				$(instance.reference).addClass("imp-object-active");
			},
			onHide(instance) {
				$(instance.reference).removeClass("imp-object-active");
			},
		});
	});
}

jQuery(document).ready(function ($) {
	if (typeof ImageMapPro === "undefined") return;

	document.addEventListener("amenityFloorChange", function (e) {
		onAmenityFloorChange(e.detail.floorCode || "");
	});

	ImageMapPro.subscribe((action) => {
		if (action.type === "mapInit") {
			const initMapName = action.payload && action.payload.map ? action.payload.map : "";
			mapNames = collectMapNames(initMapName);
			mapReady = true;

			tagMapObjectsWithFloor();

			$(".section-amenity .imp-object, .image-map-wrapper .imp-object").each(function () {
				if (isFloorZoomObject($(this))) return;

				const slug = $(this).data("slug");
				const matchElement = getLegendForObject($(this));

				if (matchElement.length > 0) {
					const number = matchElement.first().find(".amenity-legend-item-number").text();
					const amenityColor = getAmenityColorFromLegend(matchElement);
					if (matchElement.first().data("src") !== undefined) {
						$(this).attr("data-fancybox", slug);
						$(this).attr("data-src", "#" + slug);
					}

					let $spotInner = $(this).find(".imp-object-spot-inner");
					if ($spotInner.length === 0) {
						$(this).append(`<div class="imp-object-spot-inner">${number}</div>`);
						$spotInner = $(this).find(".imp-object-spot-inner");
					} else {
						$spotInner.text(number);
					}

					applySpotInnerColor($spotInner, amenityColor);

					$(this).find("svg").remove();
				}
			});

			initPlan();

			const $activeFloor = $amenityRoot().find(".item-toggle.active").first();
			const floorToApply = pendingFloorCode || $activeFloor.attr("data-floor-code") || "";

			if (floorToApply) {
				applyFloorFilter(floorToApply);
				runFloorZoom(floorToApply);
			}

			pendingFloorCode = "";
		}

		if (action.type === "objectHighlight") {
			const title = action.payload.object;
			if (String(title).endsWith("-zoom")) return;
			$(getLegendSelectorForTitle(title)).addClass("active");
		}
		if (action.type === "objectUnhighlight") {
			const title = action.payload.object;
			if (String(title).endsWith("-zoom")) return;
			$(getLegendSelectorForTitle(title)).removeClass("active");
		}
	});
});
