import { swiperInit } from "./swiper";

document.addEventListener("DOMContentLoaded", () => {

	// ── Video.js init ────────────────────────────────────────────
	document.querySelectorAll('.video-js').forEach((videoEl, index) => {
		if (!videoEl.id) videoEl.id = `vjs-player-${index}`;

		const type = videoEl.dataset.type;
		const src  = videoEl.dataset.src;

		let options = {
			controls: true,
			autoplay: false,
			preload: 'auto',
			fluid: true,
			controlBar: {
				children: ['progressControl', 'currentTimeDisplay', 'volumePanel', 'playToggle', 'fullscreenToggle']
			}
		};

		if (type === 'youtube' && src) {
			options.techOrder = ['youtube'];
			options.sources   = [{ type: 'video/youtube', src: src }];
		}

		videojs(videoEl, options);
	});

	// ── Swiper init ──────────────────────────────────────────────
	setTimeout(() => {
		swiperInit();
	}, 500);

});

