import { swiperInit } from "./swiper";





document.addEventListener("DOMContentLoaded", () => {


	document.querySelectorAll('.video-js').forEach((videoEl, index) => {
		// Ensure every video has a unique ID for videojs() lookup
		if (!videoEl.id) videoEl.id = `vjs-player-${index}`;

		const type = videoEl.dataset.type;
		const src = videoEl.dataset.src;

		let options = {
			controls: true,
			autoplay: false, // Better to trigger via Swiper logic
			preload: 'auto',
			fluid: true,
			controlBar: {
				children: ['progressControl', 'currentTimeDisplay', 'volumePanel', 'playToggle', 'fullscreenToggle']
			}
		};

		if (type === 'youtube' && src) {
			options.techOrder = ['youtube'];
			options.sources = [{ type: 'video/youtube', src: src }];
		}

		videojs(videoEl, options);
	});

	setTimeout(() => {
		swiperInit();
		console.log(123);
	}, 500);



});





Fancybox.bind("[data-fancybox]", {
	parentEl: document.body[0], // Element containing main structure
});




