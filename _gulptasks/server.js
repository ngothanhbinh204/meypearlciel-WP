import {
	watch,
	series,
	parallel
} from "gulp";
import bSync from "browser-sync";
import jsCore from "./core-js";
import devJS from "./script";
import pugTask from "./html";
import cssCore from "./core-css";
import {
	copyImage 
} from "./copy";
import {
	cleanImage
} from "./clean";
import {
	devSass, tailwindSass
} from "./sassComp.js";


export const server = () => {
	bSync.init({
		notify: true,
		server: {
			baseDir: "dist"
		},
		port: 8000
	});
	watch(["src/js/*.js"], series(devJS));
	watch(["src/**/**.pug"], series(pugTask));
	watch(
		[
			"tailwind.config.js",
			"src/core/*.sass",
			"src/core/**/*.sass",
			"src/core/**/**/*.sass",

		], parallel(tailwindSass)); 
	watch(
		[
			"src/components/**/*.sass",
			"src/modules/**/*.sass"

		], parallel(devSass));
	watch(
		[
			"src/pages/*.pug",
			"src/*.pug",
			"src/components/**/*.pug",
			"src/modules/**/*.pug",
		], parallel(tailwindSass));
	watch(
		["src/img/**/**.{svg,png,jpg,speg,gif,mp4,webp}"],
		series(cleanImage, copyImage)
	);
	watch(
		["src/plugins/**/*.css", "src/plugins/**/*.js", "config.json"],
		parallel(jsCore, cssCore)
	);

	watch(["dist"]).on("change", bSync.reload);
	watch(["src/tailwind"]).on("change", bSync.reload);
};

module.exports = server;
