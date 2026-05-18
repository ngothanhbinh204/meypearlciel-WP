import { src, dest } from "gulp";
const sass = require("gulp-sass")(require("node-sass"));
import concat from "gulp-concat";
import cssnano from "cssnano";
import plumber from "gulp-plumber";
import sourcemaps from "gulp-sourcemaps";
var postcss = require("gulp-postcss");
import cssSort from "css-declaration-sorter";
import notify from "gulp-notify";

import autoprefixer from "autoprefixer";
// Get base file form node module
export const prodSass = () => {
	const tailwindcss = require("tailwindcss");

	return src(
		[
			"src/core/tailwind/import.sass",
			"src/core/tailwind/preflight.sass",
			"src/core/tailwind/*.sass",
			"src/core/tailwind/elements/*.sass",
			"src/core/mixin.sass",
			"src/core/utility/*.sass",
			"src/components/**/*.sass",
			"src/components/**/**/*.sass",
			"src/components/**/**/**/*.sass",
			"src/components/**/**/**/**/*.sass",
			"src/components/**/**/**/**/**/*.sass",
			"src/components/**/**/**/**/**/**/*.sass",
			"src/components/**/**/**/**/**/**/**/*.sass",
			"src/modules/**/*.sass",
			"src/modules/**/**/*.sass",
			"src/modules/**/**/**/*.sass",
			"src/modules/**/**/**/**/*.sass",
			"src/modules/**/**/**/**/**/*.sass",
			"src/modules/**/**/**/**/**/**/*.sass",
			"src/modules/**/**/**/**/**/**/**/*.sass",
		],
		{
			allowEmpty: true,
		}
	)
		.pipe(sourcemaps.init())
		.pipe(concat("main.min.sass"))
		.pipe(
			plumber({
				errorHandler: notify.onError("Error: <%= error.message %>"),
			})
		)
		.pipe(sass().on("error", sass.logError))

		.pipe(
			postcss([
				tailwindcss("./tailwind.config.js"),
				autoprefixer(),
				cssnano(),
				cssSort({
					order: "concentric-css",
				}),
			])
		)
		.pipe(sourcemaps.write("."))
		.pipe(dest("dist/css"));
};

export const tailwindSass = () => {
	const tailwindcss = require("tailwindcss");
	return src(
		[
			"src/core/mixin.sass",
			"src/core/tailwind/import.sass",
			"src/core/tailwind/preflight.sass",
			"src/core/tailwind/*.sass",
			"src/core/tailwind/elements/*.sass",
			"src/core/utility/*.sass",
		],
		{
			allowEmpty: true,
		}
	)
		.pipe(sourcemaps.init())
		.pipe(concat("tailwind.min.sass"))
		.pipe(
			plumber({
				errorHandler: notify.onError("Error: <%= error.message %>"),
			})
		)
		.pipe(sass().on("error", sass.logError))
		.pipe(postcss([tailwindcss("./tailwind.config.js"), autoprefixer()]))
		.pipe(sourcemaps.write("."))
		.pipe(dest("dist/css"))
		.pipe(dest("styles"));
};


export const devSass = () => {
	const tailwindcss = require("tailwindcss");

	return src(
		[
			"src/core/mixin.sass",
			"src/components/**/*.sass",
			"src/modules/**/*.sass"
		],
		{ allowEmpty: true }
	)
		.pipe(sourcemaps.init())
		.pipe(concat("main.min.sass"))
		.pipe(
			plumber({
				errorHandler: notify.onError("Error: <%= error.message %>"),
			})
		)
		.pipe(sass().on("error", sass.logError))
		.pipe(postcss([tailwindcss("./tailwind.config.js"), autoprefixer()]))
		.pipe(sourcemaps.write("."))
		.pipe(dest("dist/css"))
		.pipe(dest("styles"));
};


module.exports = { prodSass, devSass, tailwindSass };
