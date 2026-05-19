const plugin = require("tailwindcss/plugin");
const ROOT_FONT_SIZE = 19.2; // Base for 1rem in px (19.2px)
const BASE_VIEWPORT_WIDTH = 1920; // Base viewport width for calculations

// --- CORE UTILITY FUNCTIONS ---

// Simplified viewport calculation (remains as original)
const calcVP = (size) => {
	if (typeof size !== 'number' || isNaN(size)) {
		console.warn(`calcVP: Invalid size value: ${size}`);
		return '0px';
	}
	// Calculate size relative to the base viewport (1920px)
	return `calc(${size} / ${BASE_VIEWPORT_WIDTH} * 100vw)`;
};

// Simplified spacing calculation using REM instead of complex custom clamp for theme configuration
const calcSpacingRem = (size) => {
	if (typeof size !== 'number' || isNaN(size)) {
		console.warn(`calcSpacingRem: Invalid size value: ${size}`);
		return '0.25rem'; // Fallback for 4px
	}
	// Convert px size to rem based on standard 16px root or use your custom ROOT_FONT_SIZE
	// Using ROOT_FONT_SIZE for consistency with theme
	return `${size / ROOT_FONT_SIZE}rem`;
};


// Enhanced responsive font size (remains as original to keep custom min/max logic)
const calcFzVP = (size) => {
	if (typeof size !== 'number' || isNaN(size) || size <= 0) {
		console.warn(`calcFzVP: Invalid size value: ${size}`);
		return '1rem';
	}
	const getMinSize = (size) => {
		if (size <= 14) return size;
		if (size <= 20) return size - 2;
		if (size <= 30) return size - 4;
		if (size <= 38) return size - 8;
		if (size <= 60) return size - 12;
		if (size <= 80) return size - 16;
		if (size <= 100) return size - 28;
		return size - 4;
	};

	const min = Math.max(getMinSize(size), 12); // Accessibility minimum
	// Max value capped using rem conversion of the px size (based on ROOT_FONT_SIZE)
	const maxValue = `${size / ROOT_FONT_SIZE}rem`;

	// Preferred value using calcVP (vw-based)
	return `clamp(${min}px, ${calcVP(size)}, ${maxValue})`;
};

// Optimized numeric utilities generator (remains as original)
const generateUtilities = (config) => {
	const { start, end, step = 1, transform = (i) => i } = config;
	const utilities = {};

	for (let i = start; i <= end; i += step) {
		utilities[i] = transform(i);
	}
	return utilities;
};

// Pre-generate common ranges to avoid runtime computation
const COMMON_SIZES = [12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 40, 44, 48, 52, 56, 60, 64, 72];
const COMMON_LINE_HEIGHTS = [16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 52, 54, 56, 58, 60, 62, 64, 80];

// --- MODULE EXPORT (TAILWIND CONFIG) ---

module.exports = {
	content: [
		"./src/dist/**/*.{html,js}",
		"./src/components/**/*.{sass,pug}",
		"./src/modules/**/*.{sass,pug}",
	],

	theme: {
		// Screens remain the same
		screens: {
			xs: "320px",
			sm: "576.1px",
			md: "768.1px",
			lg: "1024.1px",
			xl: "1200.1px",
			"2xl": "1600px",
			// Max-width screens
			"max-sm": { max: "576px" },
			"max-md": { max: "768px" },
			"max-lg": { max: "1024px" },
			"max-xl": { max: "1200px" },
			"max-2xl": { max: "1600px" },
		},

		// Aspect ratio remains the same
		aspectRatio: {
			auto: "auto",
			square: "1",
			video: "16/9",
			...Object.fromEntries(
				Array.from({ length: 16 }, (_, i) => [i + 1, `${i + 1}`])
			),
		},

		// Border Width: Simplified to use pixel values for easier utility usage
		borderWidth: {
			DEFAULT: "1px",
			0: "0",
			...generateUtilities({
				start: 2,
				end: 10,
				transform: (i) => `${i}px` // Using px, not rem conversion
			}),
		},

		// Spacing: Simplified to use the custom REM calculation for consistent scaling
		spacing: {
			0: "0",
			px: "1px",
			...generateUtilities({
				start: 1,
				end: 25,
				transform: (i) => calcSpacingRem(i * 4) // i * 4px converted to rem
			}),
			full: "100%",
		},

		// Font Size: Remains the same, using the custom responsive calcFzVP
		fontSize: {
			xs: [calcFzVP(12), { lineHeight: "1.4" }],
			sm: [calcFzVP(14), { lineHeight: "1.4" }],
			base: [calcFzVP(16), { lineHeight: "1.4" }],
			lg: [calcFzVP(18), { lineHeight: "1.4" }],
			xl: [calcFzVP(20), { lineHeight: "1.4" }],
			"2xl": [calcFzVP(24), { lineHeight: "1.35" }],
			"3xl": [calcFzVP(30), { lineHeight: "1.3" }],
			"4xl": [calcFzVP(36), { lineHeight: "1.3" }],
			"5xl": [calcFzVP(48), { lineHeight: "1.2" }],
			"6xl": [calcFzVP(56), { lineHeight: "1.15" }],
			"7xl": [calcFzVP(60), { lineHeight: "1" }],
			"8xl": [calcFzVP(96), { lineHeight: "1" }],
			"9xl": [calcFzVP(128), { lineHeight: "1" }],

			...Object.fromEntries(
				COMMON_SIZES.map(size => [size, calcFzVP(size)])
			),
		},

		fontFamily: {
			"Playfair-Display": ["'Playfair Display'", "serif"],
			"sans-system": [
				"system-ui",
				"-apple-system",
				"BlinkMacSystemFont",
				"'Segoe UI'",
				"Arial",
				"Helvetica",
				"sans-serif",
			],
			"Font-Awesome": ["'Font Awesome 6 Pro'"],
		},

		// Colors: Improved organization and removed arbitrary keys from primary
		colors: {
			transparent: "transparent",
			dark: "#000000",
			white: "#ffffff",
			red: "#ff0000",
			green: "#00B35C",

			// Main scale
			primary: {
				50: "#EFF8FF",
				100: "#e3f1fb",
				200: "#c0e4f7",
				300: "#88cff1",
				400: "#8BC5E8",
				500: "#2da8df", // Main brand color
				600: "#01548F",
				700: "#106594",
				800: "#01548F",
				900: "#144866",
				950: "#0E2E43",
				1: "#0F5C21",
				2: "#266633",
				3: "#F37021",

			},
			secondary: {
				bg: "#CEE3FF",
				"bg-2": "#0A701C",
				1: "#F4F7F4",
				2: "#FEF6F4",
				3: "#D4E0D6",
				5: "#A8C2AD",
				7: "#5C8C66",
				9: "#27432C",
			},

			// Semantic/Utility colors
			success: "#41924F",
			danger: "#FB0200",
			grey: {
				"f5": "#F5F5F5",
				50: "#F6F6F6",
				100: "#EFEFEF",
				200: "#DCDCDC",
				300: "#BDBDBD",
				400: "#989898",
				500: "#818181",
				600: "#656565",
				700: "#525252",
				800: "#464646",
				900: "#3D3D3D",
				950: "#292929",
			},
		},

		extend: {
			// borderRadius: Using simplified calcSpacingRem for consistency
			borderRadius: {
				0: "0",
				...generateUtilities({
					start: 1,
					end: 10,
					transform: (i) => calcSpacingRem(i * 4) // Converted to rem
				}),
				full: "9999px",
			},
			fontFamily: {
				Awesome6: ["'Font Awesome 6 Pro'"],
				"Momo-Trust-Display": ["'Momo Trust Display',sans-serif"],
			},
			// boxShadow: Remains the same, correctly using calcVP for dynamic shadows
			boxShadow: {
				DEFAULT: "4px 4px 20px 4px rgba(0, 0, 0, 0.12)",
				soft: "0px 4px 40px 0px rgba(0, 0, 0, 0.04)",
				medium: `${calcVP(4)} ${calcVP(4)} ${calcVP(8)} ${calcVP(4)} rgba(0, 0, 0, 0.24)`,
				hard: `${calcVP(8)} ${calcVP(8)} ${calcVP(16)} ${calcVP(8)} rgba(0,0,0,0.4)`,
			},

			// zIndex remains the same
			zIndex: {
				...Object.fromEntries(
					[1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 99, 100, 200, 900, 990, 999]
						.map(z => [z, z])
				),
			},

			// lineHeight remains the same
			lineHeight: {
				...Object.fromEntries(
					[110, 115, 120, 125, 130, 135, 140, 145, 150].map(lh => [lh, `${lh}%`])
				),
				...Object.fromEntries(
					COMMON_LINE_HEIGHTS.map(lh => [lh, `${lh}px`])
				),
			},

			// backgroundImage remains the same
			backgroundImage: {
				"gradient-primary": "linear-gradient(105.88deg, #FFB800 0%, #FF710D 85.28%)",
				"gradient-success": "linear-gradient(135deg, #41924F 0%, #5dc360 100%)",
				"gradient-danger": "linear-gradient(135deg, #FB0200 0%, #ff4757 100%)",
				"gradient-default": " linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%)",
			},
		},
	},

	corePlugins: {
		container: false,
		aspectRatio: false, // Keep false as you have a custom utility for it
	},

	plugins: [
		plugin(({ addComponents, addUtilities, theme }) => {
			// Custom utilities (streamlined, removed basic flex duplicates)
			// --- NEW: Box Shadow Utilities Generator ---
			const insetShadowStyle = (colorValue) => ({
				boxShadow: `0px 0px 0px 3px ${colorValue} inset`,
			});

			// Flatten color config to iterate over all named colors (primary, grey, etc.)
			const allColors = theme('colors');
			const shadowColorUtilities = {};

			// Extract all simple and nested colors
			for (const colorName in allColors) {
				const colorValue = allColors[colorName];

				if (typeof colorValue === 'string') {
					// Simple color (e.g., 'dark', 'white', 'green', 'success', 'danger')
					shadowColorUtilities[`.shadow-inset-1-${colorName}`] = insetShadowStyle(colorValue);
				} else if (typeof colorValue === 'object' && colorValue !== null) {
					// Nested color scale (e.g., 'primary', 'grey')
					for (const shade in colorValue) {
						const shadeValue = colorValue[shade];
						// Ignore non-string values like '1', '2', '3' in primary
						if (typeof shadeValue === 'string' && shadeValue.startsWith('#')) {
							shadowColorUtilities[`.shadow-inset-1-${colorName}-${shade}`] = insetShadowStyle(shadeValue);
						}
					}
				}
			};
			const flexUtilities = {
				// Text Gradients remain
				".text-gradient-1": {
					"-webkit-background-clip": "text",
					"-webkit-text-fill-color": "transparent",
					"background-image":
						"linear-gradient(105.88deg, #FFB800 0%, #FF710D 85.28%)",
				},
				".text-gradient-2": {
					"-webkit-background-clip": "text",
					"-webkit-text-fill-color": "transparent",
					"background-image":
						" linear-gradient(106deg, #005BD2 18.64%, #006FFF 38.77%, #104891 77.4%)",
				},
				// Common combinations
				".flex-start": { display: "flex", justifyContent: "flex-start", alignItems: "center" },
				".flex-end": { display: "flex", justifyContent: "flex-end", alignItems: "center" },
				".flex-center": { display: "flex", justifyContent: "center", alignItems: "center" },
				".flex-between": { display: "flex", justifyContent: "space-between", alignItems: "center" },
				".flex-around": { display: "flex", justifyContent: "space-around", alignItems: "center" },
				// Keep only advanced, non-native column combos
				".col-center": { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
				".col-start": { display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center" },
				".col-end": { display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center" },
				".col-between": { display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center" },
				".col-around": { display: "flex", flexDirection: "column", justifyContent: "space-around", alignItems: "center" },
				".col-evenly": { display: "flex", flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" },
				".col-left": { display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center" },
				".col-right": { display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center" },
				".col-top": { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start" },
				".col-top-left": { display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start" },

				".col-top-right": { display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "flex-start" },
				".col-bottom-left": { display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-end" },
				".col-bottom-right": { display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "flex-end" },
				".col-stretch": { display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "center" },

				// Keep grid and absolute position utilities
				".grid-center": { display: "grid", placeItems: "center" },
				".grid-start": { display: "grid", placeItems: "start" },
				".grid-end": { display: "grid", placeItems: "end" },
				".absolute-center": { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
				".absolute-x": { position: "absolute", left: "50%", transform: "translateX(-50%)" },
				".absolute-y": { position: "absolute", top: "50%", transform: "translateY(-50%)" },

				// Keep modern transitions
				".transition": { transition: ".4s all ease-in-out" },
				".transition-smooth": { transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" },
				".transition-bounce": { transition: "all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)" },
			};

			// Components (Container & Button) remain the same
			const components = {
				".container": {
					width: "100%",
					maxWidth: "100%",
					marginLeft: "auto",
					marginRight: "auto",
					paddingLeft: "1rem",
					paddingRight: "1rem",
					"@screen sm": { maxWidth: "94vw" },
					"@screen md": { maxWidth: "92vw" },
					"@screen lg": { maxWidth: "90vw" },
					"@screen xl": { maxWidth: calcVP(1630) },
					"@screen 2xl": { maxWidth: calcVP(1440) },
				},

				".btn": {
					display: "inline-flex",
					justifyContent: "center",
					alignItems: "center",
					position: "relative",
					cursor: "pointer",
					transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
					overflow: "hidden",
					textDecoration: "none",
					"&:disabled": {
						opacity: "0.5",
						cursor: "not-allowed",
					},
				},

			};

			addUtilities(flexUtilities);
			addComponents(components);
			addUtilities(shadowColorUtilities);
		}),

		// Unit conversion variants (Remains the same as it's the core of your dynamic system)
		plugin(({ addVariant, e }) => {
			addVariant("hover-fine", "@media (hover: hover) and (pointer: fine) { & }");

			// CLAMP VARIANT (The most powerful utility for fluid sizing)
			addVariant("clamp", ({ container, separator }) => {
				container.walkRules((rule) => {
					rule.selector = `.${e(`clamp${separator}`)}${rule.selector.slice(1)}`

					rule.walkDecls((decl) => {
						// Handle arbitrary values with range syntax: w-[16-32]
						if (decl.value.includes("[") && decl.value.includes("-") && decl.value.includes("]")) {
							decl.value = decl.value.replace(
								/\[(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)\]/g,
								(match, min, max) => {
									const minSize = parseFloat(min)
									const maxSize = parseFloat(max)
									// Use BASE_VIEWPORT_WIDTH (1920) for the vw calculation
									const preferred = `calc(${maxSize} / ${BASE_VIEWPORT_WIDTH} * 100vw)`
									const maxValueRem = `calc(${maxSize} / ${ROOT_FONT_SIZE}rem)` // Max using rem
									return `clamp(${minSize}px, ${preferred}, ${maxValueRem})`
								}
							)
						}
						// Handle single pixel values: w-[16px]
						else if (decl.value.includes("px")) {
							decl.value = decl.value.replace(
								/(-?\d+(?:\.\d+)?)px/g,
								(match, pxValue) => {
									const size = parseFloat(pxValue)
									const preferred = `calc(${size} / ${BASE_VIEWPORT_WIDTH} * 100vw)`
									const maxValueRem = `calc(${size} / ${ROOT_FONT_SIZE}rem)`
									// Clamp using px as min, vw as preferred, rem as max
									return `clamp(${size}px, ${preferred}, ${maxValueRem})`
								}
							)
						}
						// Handle rem values: w-[1rem]
						else if (decl.value.includes("rem") && !decl.value.includes("calc(")) {
							decl.value = decl.value.replace(
								/(-?\d+(?:\.\d+)?)rem/g,
								(match, remValue) => {
									const size = parseFloat(remValue) * ROOT_FONT_SIZE // Convert rem back to px (e.g., 1.5rem * 19.2 = 28.8px)
									const min = Math.round(size * 0.75) // Provide a simple minimum px fallback (75%)
									const preferred = `calc(${size} / ${BASE_VIEWPORT_WIDTH} * 100vw)`
									const maxValueRem = `${remValue}rem`
									return `clamp(${min}px, ${preferred}, ${maxValueRem})`
								}
							)
						}
					})
				})
			})

			// REM VARIANT (For forcing rem conversion on non-clamped values)
			addVariant("rem", ({ container, separator }) => {
				container.walkRules((rule) => {
					rule.selector = `.${e(
						`rem${separator}`
					)}${rule.selector.slice(1)}`
					rule.walkDecls((decl) => {
						if (decl.value.includes("clamp(")) {
							// If the value already uses clamp, simplify it to the max rem value
							decl.value = decl.value.replace(
								/clamp\((.*?),\s*(.*?)\s*,.*?\)/,
								(_, min, calc) => {
									// Extract the rem value from the clamp max argument (which often contains calc)
									const maxRem = calc.match(/(\d+(?:\.\d+)?rem)/g);
									return maxRem ? maxRem[0] : calc.trim() // Fallback to calc if rem not found
								}
							)
						} else if (decl.value.includes("px")) {
							// Convert the pixel number to rem
							decl.value = decl.value.replace(
								/(-?\d+(\.\d+)?)px/g,
								(match, p1) => {
									// Handle letter-spacing separately as it only accepts unitless numbers in px values
									if (decl.prop === "letter-spacing") {
										return `${parseFloat(p1) / ROOT_FONT_SIZE}rem`;
									}
									return `${parseFloat(p1) / ROOT_FONT_SIZE}rem`
								}
							)
						}
					})
				})
			})
			addVariant("ratio", ({ container, separator }) => {
				container.walkRules((rule) => {
					rule.selector = `.${e(
						`ratio${separator}`
					)}${rule.selector.slice(1)}`;
					rule.walkDecls((decl) => {
						const ratioValues = decl.value.split(" ");
						if (ratioValues.length === 2) {
							const num1 = parseInt(ratioValues[0]);
							const num2 = parseInt(ratioValues[1]);
							if (!isNaN(num1) && !isNaN(num2) && num2 !== 0) {
								const percentage = `${(num1 / num2) * 100}%`;
								decl.value = `${percentage}`;
							}
						}
					});
				});
			});

			// Removed `ratio` variant
		}),
	],
};