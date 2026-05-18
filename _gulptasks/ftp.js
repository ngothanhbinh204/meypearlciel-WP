var gulp = require("gulp");
var pluginError = require("plugin-error");
var ftp = require("vinyl-ftp");

const HOST = "kugil-vinal.webcanhcam.vn";
const USER = "previewcanhcam_kugil-vinal";
const PASSWORD = "N#5gICpf11o733Ck";

export const deployCSS = () => {
	var conn = ftp.create({ 
		host: HOST,
		user: USER,
		password: PASSWORD,
		parallel: 10,
		log: function (message) {
			pluginError("deployCSS", message);
		},
	});

	var globs = ["dist/css/*.css"];

	// using base = '.' will transfer everything to /public_html correctly
	// turn off buffering in gulp.src for best performance

	return gulp
		.src(globs, { base: "./dist/css", buffer: false })
		.pipe(conn.newerOrDifferentSize("/public_html/wp-content/themes/CanhCamTheme/styles")) // only upload newer files
		.pipe(conn.dest("/public_html/wp-content/themes/CanhCamTheme/styles"));
};

export const deployJS = () => {
	var conn = ftp.create({
		host: HOST,
		user: USER,
		password: PASSWORD,
		parallel: 10,
		log: function (message) {
			pluginError("deployJS", message);
		},
	});

	var globs = ["dist/js/*.js"];

	// using base = '.' will transfer everything to /public_html correctly
	// turn off buffering in gulp.src for best performance

	return gulp
		.src(globs, { base: "./dist/js", buffer: false })
		.pipe(conn.newerOrDifferentSize("/public_html/wp-content/themes/CanhCamTheme/scripts")) // only upload newer files
		.pipe(conn.dest("/public_html/wp-content/themes/CanhCamTheme/scripts"));
};



module.exports = { deployCSS, deployJS };
