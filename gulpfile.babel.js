import { series, parallel } from "gulp";

// Import tasks
import server from "./_gulptasks/server";
import pugTask from "./_gulptasks/html";
import jsCore from "./_gulptasks/core-js";

import cssCore from "./_gulptasks/core-css";
import { cleanDist } from "./_gulptasks/clean";
import { devJS, prodJs } from "./_gulptasks/script";
import { copyFonts, copyImage } from "./_gulptasks/copy";
import { prodSass, devSass ,tailwindSass} from "./_gulptasks/sassComp";
import deploy from "./_gulptasks/deploy";

exports.default = series(
	cleanDist,
	parallel(copyImage, copyFonts),
	parallel(jsCore, cssCore),
	tailwindSass,
	devSass,
	devJS,
	pugTask,
	server
);

exports.prod = series(
	cleanDist,
	parallel(copyImage, copyFonts),
	parallel(jsCore, cssCore),
	prodSass,
	prodJs,
	pugTask
);


exports.sync = series(
	cleanDist,
	parallel(copyImage, copyFonts),
	parallel(jsCore, cssCore),
	tailwindSass,
	devSass,
	devJS,
	pugTask,
	deploy,
);
