/**
 * Helpers methods
 * @type {object}
 */
var helpers = {

	/**
	 * Start the drawing of the map 60FPS
	 */
	startDrawing: function() {
		requestAnimationFrame(function() {
			main.object.levels.getCurrent().draw();
			if(main.globals.isDown) {
				helpers.startDrawing();
			}
		});
	},

	/**
	 * Moves the canvas to a specific location
	 * @param {number} x - the x value (map offset)
	 * @param {number} y - the y value (map offset)
	 */
	moveTo: function(x, y) {
		main.globals.offset.changeTo(
			-(x - (main.object.canvas.clientWidth / 2)),
			-(y - (main.object.canvas.clientHeight / 2))
		);

		main.object.levels.getCurrent().draw();
	},

	/**
	 * Moves the canvas by a specific number of pixels
	 * @param {number} x - the x value (map offset)
	 * @param {number} y - the y value (map offset)
	 */
	moveBy: function(x, y) {
		main.globals.offset.changeBy(x, y);
		main.object.levels.getCurrent().draw();
	},

	/**
	 * Help set value of double (tap|click)
	 */
	doubleTap: function() {
		if(main.globals.doubleTap !== null && new Date().getTime() - main.globals.doubleTap <= 250) {
			main.globals.doubleTap = true;
		} else {
			main.globals.doubleTap = new Date().getTime();
		}
	},

	/**
	 * Returns the distance between two numbers
	 * @param {object} event - the event object
	 * @returns {number|boolean} Distance between the fingers
	 */
	gesturePinchZoom: function(event) {
		var zoom = false;

		if(event.targetTouches.length >= 2) {
			var p1 = event.targetTouches[0];
			var p2 = event.targetTouches[1];
			var zoomScale = Math.sqrt(Math.pow(p2.pageX - p1.pageX, 2) + Math.pow(p2.pageY - p1.pageY, 2)); // Euclidean distance

			if(this.lastZoomScale) {
				zoom = zoomScale - this.lastZoomScale;
			}
			this.lastZoomScale = zoomScale;
		}
		return zoom;
	},

	/**
	 * Zooms the map
	 * @param {object} distance - distance between the fingers
	 */
	zoom: function(distance) {
		var pt = main.object.context.transformedPoint(main.globals.lastPos.x, main.globals.lastPos.y);
		main.object.context.translate(pt.x, pt.y);
		var factor = Math.pow(main.globals.scaleFactor, distance);
		main.object.context.scale(factor, factor);
		main.object.context.translate(-pt.x, -pt.y);
		main.object.levels.getCurrent().draw();
	},

	/**
	 * Create an html element
	 * @param {string} tag - the tag of the element
	 * @param {string|Array} [classes] - the classes for the element
	 * @param {Object|null} [events] - the event listeners
	 * @param {Array} [children] - array of child elements
	 * @returns {Element} the new element
	 */
	createElement: function(tag, classes, events, children) {
		var element = document.createElement(tag);

		if(!!classes) {
			if(!Array.isArray(classes)) {
				classes = [classes];
			}

			classes.forEach(function(item) {
				element.classList.add(item);
			});
		}

		if(!!events) {
			for(var event in events) {
				if(events.hasOwnProperty(event)) {
					element.addEventListener(event, events[event]);
				}
			}
		}

		if(!!children) {
			for(var child in children) {
				if(children.hasOwnProperty(child)) {
					element.appendChild(children[child]);
				}
			}
		}

		return element;
	},

	/**
	 * If the user has interacted with the map in the last 3 seconds
	 */
	isInteracting: function() {
		return main.interact != "smart" || main.globals.interact.isInteracting;
	},

	/**
	 * Show the timeout overlay
	 */
	showTimeoutOverlay: function() {
		if(main.environment === 'smart') {
			main.timeoutOverlay.style.display = "block";
			main.globals.interact.isInteracting = false;
		}
	},

	/**
	 * Hide the timeout overlay
	 */
	hideTimeoutOverlay: function() {
		if(main.environment === 'smart') {
			main.timeoutOverlay.style.display = "none";
			main.globals.interact.isInteracting = true;
		}
	},

	/**
	 * Checks if the finger moved with a margin of 2 pixels
	 * @param {object} a
	 * @param {object} b
	 * @returns {boolean} if the click was within the margin
	 */
	validateTouchMoveClickMargin: function(a, b) {
		return (
			(a.x > b.x - 2 && a.x < b.x + 2) &&
			(a.y > b.y - 2 && a.y < b.y + 2)
		);
	},

	/**
	 * Checks if the clicked object is a sibling of m4n-container
	 * @returns {boolean} if one of the parents is the m4n-container
	 */
	clickedInCanvas: function(target) {
		while(target = target.parentElement) {
			if(target.classList.contains('m4n-container')) {
				return true;
			}
		}
		return false;
	},

	/**
	 * Calculates the offset(X/Y) for TouchEvents
	 * @param event - The event object
	 */
	setMobileOffset: function(event) {
		var offset = {};
		var boundingRect = event.target.getBoundingClientRect();

		for(var touch in event.touches) {
			if(event.touches.hasOwnProperty(touch)) {
				offset[touch] = {
					x: event.touches[touch].clientX - boundingRect.left,
					y: event.touches[touch].clientY - boundingRect.top
				};
			}
		}

		return offset;
	}
};