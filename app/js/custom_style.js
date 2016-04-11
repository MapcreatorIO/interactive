// Reload custom css file
var customStyle = document.getElementById("m4n-style-custom");
if(customStyle !== null) {
	var newCustomStyle = document.createElement("link");
	newCustomStyle.id = "m4n-style-custom";
	newCustomStyle.rel = "stylesheet";
	newCustomStyle.type = "text/css";
	newCustomStyle.href = customStyle.href;

	document.head.removeChild(customStyle);
	document.head.appendChild(newCustomStyle);
}

// Create the canvas
var canvas = document.getElementById(main.canvas);
if(canvas !== null) {
	if(canvas.classList.contains("m4n-canvas")) {
		throw "Map already initialized for " + main.canvas;
	} else {
		main.canvas = main.canvas + "-" + Math.random().toString(36).substring(7);
		canvas = helpers.createElement("canvas", "m4n-canvas");
		canvas.id = main.canvas;
	}
} else {
	canvas = helpers.createElement("canvas", "m4n-canvas");
	canvas.id = main.canvas;
}