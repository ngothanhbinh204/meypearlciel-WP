export function swiperInit() {
	// 1. First, Initialize all Video.js players
	document.querySelectorAll('.video-js').forEach((videoEl, index) => {
		if (!videoEl.id) videoEl.id = `vjs-player-${index}`;

		const type = videoEl.dataset.type;
		const src = videoEl.dataset.src;

		let options = {
			controls: true,
			autoplay: false,
			preload: 'auto',
			muted: true, // CRITICAL: Browsers block unmuted autoplay
			fluid: true,
			techOrder: type === 'youtube' ? ['youtube'] : ['html5'],
			sources: type === 'youtube' ? [{ type: 'video/youtube', src: src }] : undefined
		};

		videojs(videoEl.id, options);
	});

	// 2. Initialize Swiper
	var primarySwiper = new Swiper(".primary-banner .swiper", {
		slidesPerView: 1,
		speed: 1205,
		allowTouchMove: true,
		effect: 'fade',
		fadeEffect: {
			crossFade: true
		},
		init: false,
		noSwipingClass: 'video-js',
		navigation: {
			nextEl: ".primary-banner .next",
			prevEl: ".primary-banner .prev",
		},
		pagination: {
			el: ".primary-banner .swiper-pagination",
			clickable: true,
		},
	});

	let timer = null;
	let isPaused = false;
	const slideTimeout = 2000;

	function goNextSlide() {
		// If we are NOT at the end, move to the next slide
		if (!primarySwiper.isEnd) {
			primarySwiper.slideNext();
		}
	}

	// 3. Robust Playback Handler
	function handleVideoPlayback(slide) {
		if (timer) clearTimeout(timer);
		if (!slide) return;

		const videoElement = slide.querySelector('.video-js');

		if (videoElement) {
			const player = videojs(videoElement.id);

			player.ready(() => {
				player.off('ended');
				player.on('ended', () => {
					if (!isPaused) goNextSlide();
				});

				// Reset video to start
				player.currentTime(0);

				if (!isPaused) {
					// Wrap play in a promise check
					const playPromise = player.play();
					if (playPromise !== undefined) {
						playPromise.catch(err => {
							console.warn("Autoplay prevented. Video must be muted.", err);
							startImageTimer();
						});
					}
				}
			});
		} else {
			startImageTimer();
		}
	}

	function startImageTimer() {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			if (!isPaused) goNextSlide();
		}, slideTimeout);
	}

	// 4. Events
	primarySwiper.on("slideChangeTransitionStart", function () {
		document.querySelectorAll('.video-js').forEach((el) => {
			const player = videojs(el.id);
			if (player && !player.paused()) {
				player.pause();
			}
		});
	});

	primarySwiper.on("slideChangeTransitionEnd", function () {
		const currentSlide = primarySwiper.slides[primarySwiper.activeIndex];
		handleVideoPlayback(currentSlide);
	});

	// Manually init swiper AFTER video setup
	primarySwiper.init();
	handleVideoPlayback(primarySwiper.slides[primarySwiper.activeIndex]);
}