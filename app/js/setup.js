/**
 * Download the JSON file
 */
if(main.inlineObject) {
	if(typeof main.json !== "string") {
		main.json = JSON.stringify(main.json);
	}
	setTimeout(function() {
		initializeM4n(main.json);
	}, 0); // I'm lovin' it.
} else {
	var request = new XMLHttpRequest();
	request.open('GET', main.json, true);
	request.onreadystatechange = function() {
		if(request.readyState == 4 && request.status == 200) {
			initializeM4n(request.responseText);
		} else if([0, 200].indexOf(request.status) == -1) {
			console.error("Something went wrong!", request);
		}
	};
	request.send();
}

/**
 * Initialize the map
 * Parse the JSON file, create HTML elements,
 * Enable YouTube and event listeners
 */
function initializeM4n(mapJson) {
	createHtmlElements();

	main.object = revive(mapJson);

	main.controlContainer = helpers.createElement('div', 'm4n-control-container');
	main.controlContainer.style.zIndex = main.object.canvas.style.zIndex + 1;

	if(main.object.levels.count() > 1 && main.zoomControls) {
		main.api.controls.add([
			{
				text: '+',
				click: main.api.zoom.in,
				disabled: {
					event: 'level_changed',
					callback: function() {
						return main.object.levels.current == main.object.levels.getLowest().level;
					}
				}
			},
			{
				text: "\u2013",
				click: main.api.zoom.out,
				disabled: {
					event: 'level_changed',
					callback: function() {
						return main.object.levels.current == main.object.levels.getHighest().level;
					}
				}
			}
		]);
	}

	if(main.homeButton) {
		main.api.controls.add({
			text: "\u2302",
			click: main.api.reset
		});
	}

	container.appendChild(main.controlContainer);

	if(!container.hasPredefinedHeight) {
		var level = main.object.levels.getCurrent();
		main.object.canvas.height = container.clientWidth * (level.size.height / level.size.width);
	}

	for(var api in externalAPIs) {
		if(externalAPIs.hasOwnProperty(api)) {
			externalAPIs[api].checkIfNeeded();
		}
	}

	enableEventListeners();

	main.object.popups.generateHTML();
	main.api.reset();

	if(typeof callback === 'function') {
		callback(returnObject);
	}

	main.endTime = new Date().getTime();
	if(main.dev) {
		console.info("It took " + (main.endTime - main.startTime) + "ms to start up");
	}
}

/**
 * Activate the event listeners
 */
function enableEventListeners() {
	main.object.canvas.addEventListener('mousedown', events.mouseDown);
	main.object.canvas.addEventListener('touchstart', events.touchStart);

	document.addEventListener('mouseup', events.mouseUp);
	document.addEventListener('touchend', events.touchEnd);

	document.addEventListener('mousemove', events.mouseMove);
	document.addEventListener('touchmove', events.touchMove);

	main.object.canvas.addEventListener('mousewheel', events.mouseWheel);
	main.object.canvas.addEventListener('DOMMouseScroll', events.mouseWheel);

	main.object.canvas.addEventListener('contextmenu', events.contextMenu);

	window.addEventListener('resize', events.resize);
	window.addEventListener('orientationchange', events.resize);
}

/**
 * Keep track of the canvas' transform
 * @param {object} ctx - the context
 */
function trackTransforms(ctx) {
	var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
	var xform = svg.createSVGMatrix();
	ctx.getTransform = function() { return xform; };

	var savedTransforms = [];
	var save = ctx.save;
	ctx.save = function() {
		savedTransforms.push(xform.translate(0, 0));
		return save.call(ctx);
	};

	var restore = ctx.restore;
	ctx.restore = function() {
		xform = savedTransforms.pop();
		return restore.call(ctx);
	};

	var scale = ctx.scale;
	ctx.scale = function(sx, sy) {
		xform = xform.scaleNonUniform(sx, sy);
		return scale.call(ctx, sx, sy);
	};

	var rotate = ctx.rotate;
	ctx.rotate = function(radians) {
		xform = xform.rotate(radians * 180 / Math.PI);
		return rotate.call(ctx, radians);
	};

	var translate = ctx.translate;
	ctx.translate = function(dx, dy) {
		xform = xform.translate(dx, dy);
		return translate.call(ctx, dx, dy);
	};

	var transform = ctx.transform;
	ctx.transform = function(a, b, c, d, e, f) {
		var m2 = svg.createSVGMatrix();
		m2.a = a;
		m2.b = b;
		m2.c = c;
		m2.d = d;
		m2.e = e;
		m2.f = f;
		xform = xform.multiply(m2);
		return transform.call(ctx, a, b, c, d, e, f);
	};

	var setTransform = ctx.setTransform;
	ctx.setTransform = function(a, b, c, d, e, f) {
		xform.a = a;
		xform.b = b;
		xform.c = c;
		xform.d = d;
		xform.e = e;
		xform.f = f;
		return setTransform.call(ctx, a, b, c, d, e, f);
	};

	var pt = svg.createSVGPoint();
	ctx.transformedPoint = function(x, y) {
		pt.x = x;
		pt.y = y;
		return pt.matrixTransform(xform.inverse());
	};
}

/**
 * Will build the map object from a json file
 * @param {string} string_json - The json string in which the map is defined
 */
function revive(string_json) {
	var classes = {
		levels: Levels, level: Level, tiles: Tiles, tile: Tile,
		points: Points, point: Point, popup: Popup, popups: Popups
	};
	var json = JSON.parse(string_json, function(key, value) {
		if(value !== null) {
			if(key === "") {
				return new Map(value);
			}
			if(value !== null) {
				if(!value._type) {
					return value;
				} else {
					if(classes[value._type]) {
						return new classes[value._type](value);
					} else {
						console.error("Unknown class type in save: " + value._type);
						return null;
					}
				}
			}
		}
	});

	/**
	 * A Hack to add the level to every tile
	 * TODO find a better way to do this
	 */
	json.levels.list.forEach(function(level) {
		level.tiles.list.forEach(function(tile) {
			tile.level = level.level;
		});
	});
	return json;
}

/**
 * Create the necessary html elements
 */
function createHtmlElements() {
	// Disable margin inside the iframe body
	if(main.isIframe) {
		document.body.style.margin = "0";
	}

	// Load css
	if(document.getElementById("m4n-style") === null) {
		var style = document.createElement("link");
		style.id = "m4n-style";
		style.rel = "stylesheet";
		style.type = "text/css";
		style.href = (function() {
			switch(options.environment) {
				case 'development':
					return location.href.split("/").slice(0, -1).join("/") + '/style.css';
				case 'local':
					return options.path + 'style.css';
				default:
					return '//' + options.environment + '.maps4news.com/ia/' + main.version.map + '/style.css';
			}
		})();
		document.head.appendChild(style);
	}

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

	"<!= smart_overlay !>";

	container.id = main.canvas + '-container';
	container.classList.add("m4n-container");
	container.style.height = "100%";
	container.style.width = "100%";
	container.hasPredefinedHeight = container.clientHeight !== 0;

	var popupContainer = document.createElement("div");
	popupContainer.id = main.canvas + "-popup-container";

	container.appendChild(popupContainer);
	container.appendChild(canvas);

	canvas.height = container.clientHeight;
	canvas.width = container.clientWidth;
}

"<!= event_listener !>";