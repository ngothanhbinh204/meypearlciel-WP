import { src, dest } from "gulp";
import { readFileSync } from "graceful-fs";

export const copyImage = () => {
	return src("./src/img/**/**.{svg,png,jpg,speg,gif,jpge,webp,PNG,JPGE,JPG,SVG,GIF,SPEG,mp4}")
		.pipe(
			dest("dist/img")
		)
		.pipe(
			dest("img")
		);
};

export const copyFonts = () => {
	let glob = JSON.parse(readFileSync("config.json"));
	return src(glob.font, {
		allowEmpty: true,
	})
		.pipe(dest("fonts"))
		.pipe(dest("dist/fonts"));
};

module.exports = {
	copyFonts,
	copyImage,
};
