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
		if(main.object.levels.getCurrent().isOn(e.offsetX, e.offsetY)) {
			helpers.doubleTap();
			main.globals.clickStart = { x: e.offsetX, y: e.offsetY };
			main.globals.dragPosition = { x: e.offsetX, y: e.offsetY };
			if(e.which === 1) {
				helpers.startDrawing();
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
		var offset = helpers.setMobileOffset(e);

		if(main.object.levels.getCurrent().isOn(offset[0].x, offset[0].y)) {
			helpers.startDrawing();
			helpers.doubleTap();
			main.globals.isDown = true;
			main.globals.dragPosition = { x: offset[0].x, y: offset[0].y };
			main.globals.clickStart = { x: offset[0].x, y: offset[0].y };

			// Pinch to zoom
			if(e.touches.length == 2) {
				main.globals.isScaling = true;
				main.globals.startDistance = Math.sqrt(
					(offset[0].x - offset[1].x) * (offset[0].x - offset[1].x) +
					(offset[0].y - offset[1].y) * (offset[0].y - offset[1].y)
				);
			}
		}
	},

	/**
	 * When the user lifts the mouse
	 * @param e - The event object
	 */
	mouseUp: function(e) {
		if(helpers.isInteracting() && !helpers.clickedInCanvas(e.target) && !main.globals.isDown) {
			helpers.showTimeoutOverlay();
		} else if(main.globals.isDown) {
			e.preventDefault();
			main.globals.isDown = false;
			main.object.canvas.classList.remove('grabbing');
			if(helpers.clickedInCanvas(e.target)) {
				if(e.offsetX == main.globals.clickStart.x && e.offsetY == main.globals.clickStart.y) {
					var point = main.object.levels.getCurrent().points.hitAPoint(e.offsetX, e.offsetY);
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
		}
	},

	/**
	 * When the user lifts his/her finger
	 * @param e - The event object
	 */
	touchEnd: function(e) {
		if(helpers.isInteracting() && !helpers.clickedInCanvas(e.target) && !main.globals.isDown) {
			helpers.showTimeoutOverlay();
		} else if(main.globals.isDown) {
			e.preventDefault();
			main.globals.isDown = false;

			if(helpers.clickedInCanvas(e.target)) {
				if(helpers.validateTouchMoveClickMargin(main.globals.clickStart, main.globals.dragPosition) && !main.globals.isScaling) {
					var point = main.object.levels.getCurrent().points.hitAPoint(main.globals.dragPosition.x, main.globals.dragPosition.y, 10);
					if(point !== null && !main.globals.isScaling) {
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
				var difference = main.globals.newDistance - main.globals.startDistance;
				var steps = Math.round(Math.abs(difference) / 100);

				var currentLevel = main.object.levels.getCurrent();
				var newLevel = main.object.levels.getLevel(currentLevel.level + function() {
							return (difference > 0) ? steps : -steps;
						}()) || currentLevel;

				if(steps > 0) {
					var pinchCentre = main.globals.lastPos;

					main.globals.offset.changeTo(
						pinchCentre.x - (newLevel.size.width / currentLevel.size.width) * (pinchCentre.x - main.globals.offset.get().x),
						pinchCentre.y - (newLevel.size.height / currentLevel.size.height) * (pinchCentre.y - main.globals.offset.get().y)
					);
					main.object.levels.change(newLevel.level);

					main.globals.startDistance = 0;
					main.globals.isScaling = false;
				}
				main.object.context.setTransform(1, 0, 0, 1, 0, 0);
			}
		}
	},

	/**
	 * When the user moves the mouse
	 * @param e - The event object
	 */
	mouseMove: function(e) {
		var currentLevel = main.object.levels.getCurrent();
		if(main.globals.isDown && helpers.isInteracting()) {
			e.preventDefault();

			main.object.popups.hideAll();

			main.object.canvas.classList.remove('pointing');
			main.object.canvas.classList.add('grabbing');

			main.globals.offset.changeBy(
				e.offsetX - main.globals.dragPosition.x,
				e.offsetY - main.globals.dragPosition.y
			);
			main.globals.dragPosition = { x: e.offsetX, y: e.offsetY };
		} else if(helpers.clickedInCanvas(e.target)) {
			var point = currentLevel.points.hitAPoint(e.offsetX, e.offsetY);

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
	touchMove: function(e) {
		var offset = helpers.setMobileOffset(e);

		if(main.globals.isDown && helpers.isInteracting()) {
			e.preventDefault();

			var currentLevel = main.object.levels.getCurrent();

			var gPz;
			if(event.touches.length === 1) {
				var new_offset = {
					x: main.globals.offset.get().x + offset[0].x - main.globals.dragPosition.x,
					y: main.globals.offset.get().y + offset[0].y - main.globals.dragPosition.y
				};

				if(
					new_offset.x !== main.globals.offset.get().x &&
					new_offset.y !== main.globals.offset.get().y
				) {
					// if the user has double tapped and is holding down his/her finger
					if(main.globals.doubleTap === true && main.globals.isScaling) {
						main.globals.newDistance = Math.sqrt(
							(main.globals.clickStart.x - offset[0].x) * (main.globals.clickStart.x - offset[0].x) +
							(main.globals.clickStart.y - offset[0].y) * (main.globals.clickStart.y - offset[0].y)
						);

						gPz = helpers.gesturePinchZoom(e) / 40;
						if(gPz < 1 && gPz > -1) {
							main.globals.distance = gPz;
							helpers.zoom(gPz);
						}
					} else { // Drag the map
						main.object.popups.hideAll();
						main.globals.offset.changeTo(new_offset.x, new_offset.y);
					}
					main.globals.dragPosition = { x: offset[0].x, y: offset[0].y };
				}
			} else if(event.touches.length === 2) {
				if(main.globals.isScaling === true) {
					// Todo: improve delta calculation
					var newDistance = Math.sqrt(
						(offset[0].x - offset[1].x) * (offset[0].x - offset[1].x) +
						(offset[0].y - offset[1].y) * (offset[0].y - offset[1].y)
					);

					var pinching = newDistance < main.globals.newDistance;

					main.globals.newDistance = newDistance;
					main.globals.lastPos = {
						x: (offset[0].x + offset[1].x) / 2,
						y: (offset[0].y + offset[1].y) / 2
					};

					if(!(
							(currentLevel.level == main.object.levels.getLowest().level && !pinching) ||
							(currentLevel.level == main.object.levels.getHighest().level && pinching)
						)) {
						main.object.popups.hideAll();
						gPz = helpers.gesturePinchZoom(e) / 40;
					}
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

		if(helpers.clickedInCanvas(e.target) && willScroll) {
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
						e.offsetX - (levels[1].size.width / levels[0].size.width) * (e.offsetX - main.globals.offset.get().x),
						e.offsetY - (levels[1].size.height / levels[0].size.height) * (e.offsetY - main.globals.offset.get().y)
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
			helpers.clickedInCanvas(e.target) &&
			main.object.levels.getCurrent().isOn(e.offsetX, e.offsetY) &&
			helpers.isInteracting()
		) {
			var currentLevel = main.object.levels.getCurrent();
			var newLevel = main.object.levels.getLevel(currentLevel.level + function() {
					return e.which == 1 ? 1 : -1;
				}());

			if(newLevel !== null) {
				main.globals.offset.changeTo(
					e.offsetX - (newLevel.size.width / currentLevel.size.width) * (e.offsetX - main.globals.offset.get().x),
					e.offsetY - (newLevel.size.height / currentLevel.size.height) * (e.offsetY - main.globals.offset.get().y)
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
		if(
			helpers.clickedInCanvas(e.target) &&
			main.object.levels.getCurrent().isOn(main.globals.dragPosition.x, main.globals.dragPosition.y) &&
			helpers.isInteracting()
		) {
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
		var fullscreen =
			document.fullscreenElement || document.webkitFullscreenElement ||
			document.msFullscreenElement || document.mozFullScreenElement;
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
			main.object.popups.hideAll();
			currentLevel.draw();
		}

		if(!fullscreen) {
			main.globals.videoFullscreen = {
				value: false,
				date: new Date().getTime(),
				noEvents: main.globals.videoFullscreen.noEvents + 1
			};
		}
	}
};