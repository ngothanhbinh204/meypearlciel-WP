import { watch, series, parallel } from "gulp";
import bSync from "browser-sync";
import jsCore from "./core-js";
import devJS from "./script";
import pugTask from "./html";
import cssCore from "./core-css";
import { copyImage } from "./copy";
import { cleanImage } from "./clean";
import { devSass ,tailwindSass } from "./sassComp.js";
import { deployCSS, deployJS  } from "./ftp";

export const server = () => {
	bSync.init({
		notify: true,
		server: {
			baseDir: "dist",
		},
		port: 8000,
	});

	watch(["src/js/*.js"], series(devJS,deployJS));
	watch(["src/**/**.pug"], series(pugTask));
	watch(
		[
			"src/components/**/*.sass",
			"src/modules/**/*.sass"
		],
		parallel(devSass, deployCSS)
	);
	watch(
		[
			"tailwind.config.js",
			"src/core/*.sass",
			"src/core/**/*.sass",
			"src/core/**/**/*.sass",
		],
		parallel(tailwindSass, deployCSS)
	);
	watch(
		[
			"src/pages/*.pug",
			"src/*.pug",
			"src/components/**/*.pug",
			"src/modules/**/*.pug",
		], parallel(tailwindSass, deployCSS));
	watch(
		["src/img/**/**.{svg,png,jpg,speg,gif,mp4}"],
		series(cleanImage, copyImage)
	);
	watch(
		["src/plugins/**/**.css", "src/plugins/**/**.js", "config.json"],
		parallel(jsCore, cssCore)
	);

	watch(["dist"]).on("change", bSync.reload);
	watch(["src/tailwind"]).on("change", bSync.reload);
};

module.exports = server;
