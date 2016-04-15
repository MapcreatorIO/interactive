/**
 * The user interaction events
 * @type {object}
 */
var events = {

	/**
	 * When the canvas is clicked
	 * @param {object} e - The event object
	 */
	mouseDown: function(e) {
		e.preventDefault();
		if(main.object.levels.getCurrent().isOn(e.layerX, e.layerY)) {
			helpers.doubleTap();
			main.globals.clickStart = { x: e.pageX, y: e.pageY };
			main.globals.dragPosition = { x: e.pageX, y: e.pageY };
			if(e.which === 1) {
				main.globals.isDown = true;
				main.object.canvas.classList.add('grabbing');
			}
		}
	},

	/**
	 * When the user starts touching the canvas
	 * @param {object} e - The event object
	 */
	touchStart: function(e) {
		e.preventDefault();
		if(main.object.levels.getCurrent().isOn(e.touches[0].clientX, e.touches[0].clientY)) {
			helpers.doubleTap();
			main.globals.isDown = true;
			main.globals.dragPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
			main.globals.clickStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
		}

		// Pinch to zoom
		if(e.touches.length == 2) {
			main.globals.isScaling = true;
			// main.object.context.save();
			main.globals.startDistance = Math.sqrt(
				(e.touches[0].pageX - e.touches[1].pageX) * (e.touches[0].pageX - e.touches[1].pageX) +
				(e.touches[0].pageY - e.touches[1].pageY) * (e.touches[0].pageY - e.touches[1].pageY));
		}

		// Android zoom
		if(e.touches.length == 1 && main.globals.doubleTap === true) {
			main.globals.isScaling = true;
			// main.object.context.save();
			main.globals.startDistance = 1;

			main.globals.lastPos = {
				x: (main.globals.clickStart.x + e.touches[0].pageX) / 2,
				y: (main.globals.clickStart.y + e.touches[0].pageY) / 2
			};
		}
	},

	/**
	 * When the user lifts the mouse
	 * @param e - The event object
	 */
	mouseUp: function(e) {
		e.preventDefault();
		if(e.target.id == main.canvas) {
			helpers.setInteractTime();
			main.globals.isDown = false;
			main.object.canvas.classList.remove('grabbing');
			if(e.pageX == main.globals.clickStart.x && e.pageY == main.globals.clickStart.y) {
				var point = main.object.levels.getCurrent().points.hitAPoint(e.layerX, e.layerY);
				if(point !== null && e.which === 1) {
					main.object.popups.get(point.number).show();
				} else {
					if(main.globals.doubleTap === true) {
						events.dblclick(e);
						main.globals.doubleTap = null;
					} else {
						main.object.popups.hideAll();
					}
				}
			}
		}
	},

	/**
	 * When the user lifts his/her finger
	 * @param e - The event object
	 */
	touchEnd: function(e) {
		e.preventDefault();
		main.globals.isDown = false;
		if(e.target.id == main.canvas) {
			helpers.setInteractTime();
			if(helpers.validateTouchMoveClickMargin(main.globals.clickStart, main.globals.dragPosition) && !main.globals.isScaling) {
				var point = main.object.levels.getCurrent().points
					.hitAPoint(main.globals.dragPosition.x, main.globals.dragPosition.y);
				if(point !== null) {
					main.object.popups.get(point.number).show();
				} else {
					if(main.globals.doubleTap === true) {
						events.dbltap(e);
						main.globals.doubleTap = null;
					} else {
						main.object.popups.hideAll();
					}
				}
			} else {
				if(main.globals.doubleTap === true) {
					main.globals.doubleTap = null;
				}
			}
		}
		if(main.globals.isScaling) {
			var differrence = main.globals.new_distance - main.globals.startDistance;
			var steps = Math.round( Math.abs(differrence) / 100 );

			var currentLevel = main.object.levels.getCurrent();
			var newLevel = main.object.levels.getLevel(currentLevel.level + function() {
					if(differrence > 0) { return steps; }
					else { return -steps; }
				}());

			while(newLevel === null) {
				steps--;
				newLevel = main.object.levels.getLevel(newLevel);
			}

			if(steps > 0) {
				var levels = [currentLevel, newLevel];
				var pinchCentre = {x: main.globals.lastPos.x, y: main.globals.lastPos.y};

				main.globals.offset.changeTo(
					pinchCentre.x - (levels[1].size.width / levels[0].size.width) * (pinchCentre.x - main.globals.offset.get().x),
					pinchCentre.y - (levels[1].size.height / levels[0].size.height) * (pinchCentre.y - main.globals.offset.get().y)
				);
				main.object.levels.change(newLevel.level);


				main.globals.startDistance = 0;
				main.globals.isScaling = false;
			}
			main.object.context.setTransform(1, 0, 0, 1, 0, 0);
			main.object.levels.getCurrent().draw();
		}
	},

	/**
	 * When the user moves the mouse
	 * @param e - The event object
	 */
	mouseMove: function(e) {
		var currentLevel = main.object.levels.getCurrent();
		if(main.globals.isDown && helpers.isInteracting()) {
			helpers.setInteractTime();
			e.preventDefault();

			main.object.canvas.classList.add('grabbing');

			main.globals.offset.changeBy(
				e.pageX - main.globals.dragPosition.x,
				e.pageY - main.globals.dragPosition.y
			);
			main.globals.dragPosition = { x: e.pageX, y: e.pageY };

			currentLevel.draw();
		} else if(e.target.id == main.canvas) {
			var point = currentLevel.points.hitAPoint(e.layerX, e.layerY);

			if(point !== null) {
				main.object.canvas.classList.add('pointing');
			} else {
				main.object.canvas.classList.remove('pointing');
			}

			if(main.object.settings.eventType == "mouseenter") {
				if(point !== null) {
					main.object.popups.get(point.number).show();
				} else {
					main.object.popups.hideAll();
				}
			}
		}
	},

	/**
	 * When the user moves his/her finger
	 * @param e - The event object
	 */
	touchMove: function(e) { // TODO not preventdefault when interacting
		if(main.globals.isDown && helpers.isInteracting()) {
			e.preventDefault();

			helpers.setInteractTime();

			var fingers = e.touches;
			var currentLevel = main.object.levels.getCurrent();

			if(fingers.length === 1) {
				var finger = fingers[0];
				var new_offset = {
					x: main.globals.offset.get().x + finger.clientX - main.globals.dragPosition.x,
					y: main.globals.offset.get().y + finger.clientY - main.globals.dragPosition.y
				};
				if(new_offset.x !== main.globals.offset.get().x && new_offset.y !== main.globals.offset.get().y) {
					if(main.globals.doubleTap === true && main.globals.isScaling) { // if the user has double tapped and is holding down his/her finger
						main.globals.new_distance = Math.sqrt(
							(main.globals.clickStart.x - fingers[0].pageX) * (main.globals.clickStart.x - fingers[0].pageX) +
							(main.globals.clickStart.y - fingers[0].pageY) * (main.globals.clickStart.y - fingers[0].pageY)
						);

						var gPz = helpers.gesturePinchZoom(e) / 40;
						if(gPz < 1 && gPz > -1) {
							main.globals.distance = gPz;
							helpers.zoom(gPz);
						}
					} else { // Drag the map
						main.globals.offset.changeTo(new_offset.x, new_offset.y);
						currentLevel.draw();
					}
					main.globals.dragPosition = { x: finger.clientX, y: finger.clientY };
				}
			} else if(fingers.length === 2) {
				if(main.globals.isScaling === true) {
					// Todo: improve delta calculation
					main.globals.new_distance = Math.sqrt(
						(fingers[0].pageX - fingers[1].pageX) * (fingers[0].pageX - fingers[1].pageX) +
						(fingers[0].pageY - fingers[1].pageY) * (fingers[0].pageY - fingers[1].pageY)
					);
					main.globals.lastPos = {
						x: (fingers[0].pageX + fingers[1].pageX) / 2,
						y: (fingers[0].pageY + fingers[1].pageY) / 2
					};

					var gPz = helpers.gesturePinchZoom(e) / 40;
					if(gPz < 1 && gPz > -1) {
						main.globals.distance = gPz;
						helpers.zoom(gPz);
					}
				}
			}
		}
	},

	/**
	 * When the user scrolls
	 * @param e - The event object
	 */
	mouseWheel: function(e) {
		var willScroll = (function() {
			switch(main.interact) {
				case "scroll":
					return !e.ctrlKey;
				case "smart":
					return helpers.isInteracting();
				default:
					return e.ctrlKey;
			}
		})();

		if(e.target.id == main.canvas && willScroll) {
			helpers.setInteractTime();
			clearTimeout(main.globals.scroll.timeout);
			e.preventDefault();

			// TODO improve
			main.globals.scroll.value += (function() {
				var w = e.wheelDelta, d = e.detail;
				if(d) {
					return w ? (w / d / 40 * d > 0 ? 1 : -1) : (-d / 3);
				}
				return w / 120;
			})();

			var direction = main.globals.scroll.value > 1 ? 1 : main.globals.scroll.value < -1 ? -1 : 0;
			if(direction !== 0) {
				main.globals.scroll.value = 0;
				var levels = main.object.levels.getLevels([main.object.levels.current, main.object.levels.current + direction]);

				if(levels[1] !== null) {
					main.globals.offset.changeTo(
						e.layerX - (levels[1].size.width / levels[0].size.width) * (e.layerX - main.globals.offset.get().x),
						e.layerY - (levels[1].size.height / levels[0].size.height) * (e.layerY - main.globals.offset.get().y)
					);
					main.object.levels.change(levels[0].level + direction);
				}
			}
		}
	},

	/**
	 * When the user double clicks
	 * @param e - The event object
	 */
	dblclick: function(e) {
		if(
			e.target.id == main.canvas
			&& main.object.levels.getCurrent().isOn(e.layerX, e.layerY)
			&& helpers.isInteracting()
		) {
			helpers.setInteractTime();
			var currentLevel = main.object.levels.getCurrent();
			var newLevel = main.object.levels.getLevel(currentLevel.level + function() {
					return e.which == 1 ? 1 : -1;
				}());

			if(newLevel !== null) {
				main.globals.offset.changeTo(
					e.layerX - (newLevel.size.width / currentLevel.size.width) * (e.layerX - main.globals.offset.get().x),
					e.layerY - (newLevel.size.height / currentLevel.size.height) * (e.layerY - main.globals.offset.get().y)
				);
				main.object.levels.change(newLevel.level);
			}
		}
	},

	/**
	 * When the user double taps
	 * @param e - The event object
	 */
	dbltap: function(e) {
		if(e.target.id == main.canvas && main.object.levels.isOn(main.globals.dragPosition.x, main.globals.dragPosition.y)) {
			helpers.setInteractTime();
			var levels = main.object.levels.getLevels([main.object.levels.current, main.object.levels.current + 1]);
			if(levels[1] !== null) {
				main.globals.offset.changeTo(
					main.globals.dragPosition.x - (levels[1].size.width / levels[0].size.width) * (main.globals.dragPosition.x - main.globals.offset.get().x),
					main.globals.dragPosition.y - (levels[1].size.height / levels[0].size.height) * (main.globals.dragPosition.y - main.globals.offset.get().y)
				);
				main.object.levels.change(main.object.levels.current + 1);
			}
		}
	},

	/**
	 * When the user triggers the context menu (right click)
	 * @param e - The event object
	 */
	contextMenu: function(e) {
		e.preventDefault();
	},

	/**
	 * When the document gets resized
	 */
	resize: function() {
		var fullscreen = document.webkitFullscreenElement || document.msFullscreenElement || document.mozFullScreenElement;
		if(fullscreen) {
			if([fullscreen.id.indexOf("-youtube"), fullscreen.id.indexOf("-video")].indexOf(-1) > -1) {
				main.globals.videoFullscreen.value = true;
				main.globals.videoFullscreen.noEvents = 0;
			}
		}

		if(!main.globals.videoFullscreen.value && (new Date().getTime() - main.globals.videoFullscreen.date > 3000 || main.globals.videoFullscreen.noEvents > 1)) {
			var currentLevel = main.object.levels.getCurrent();
			var current = { w: main.object.canvas.width, h: main.object.canvas.height };

			main.object.canvas.height = main.object.container.clientHeight;
			main.object.canvas.width = main.object.container.clientWidth;

			main.globals.offset.changeBy(
				-((current.w - main.object.canvas.width) / 2),
				-((current.h - main.object.canvas.height) / 2)
			);
			currentLevel.draw();
		}

		if(!fullscreen) {
			main.globals.videoFullscreen = { value: false, date: new Date().getTime(), noEvents: main.globals.videoFullscreen.noEvents+1 };
		}
	}
};