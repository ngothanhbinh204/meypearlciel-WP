import { src, dest } from "gulp";
import plumber from "gulp-plumber";
import terser from "gulp-terser";
const rollup = require("gulp-better-rollup");
const babel = require("rollup-plugin-babel");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
import rename from "gulp-rename";
import concat from "gulp-concat";
import sourcemap from "gulp-sourcemaps";

export const devJS = () => {
	return src(["src/js/main.js"])
		.pipe(plumber())
		.pipe(sourcemap.init())
		.pipe(rollup({ plugins: [babel(), resolve(), commonjs()] }, "iife"))
		.pipe(concat("main.min.js"))
		.pipe(sourcemap.write("."))
		.pipe(dest("dist/js"))
		.pipe(dest("scripts"));
};
export const prodJs = () => {
	return src(["src/js/main.js"])
		.pipe(plumber())
		.pipe(sourcemap.init())
		.pipe(rollup({ plugins: [babel(), resolve(), commonjs()] }, "iife"))
		.pipe(terser())
		.pipe(concat("main.min.js"))
		.pipe(sourcemap.write("."))
		.pipe(dest("dist/js"));
};

module.exports.default = devJS;
module.exports.prodJs = prodJs;
