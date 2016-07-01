/**
 * Helpers methods
 * @type {object}
 */
var helpers = {

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
		main.globals.doubleTap =
			main.globals.doubleTap !== null && new Date().getTime() - main.globals.doubleTap <= 250 ?
				true : new Date().getTime();
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
	 * @param {string|string[]} classes - the classes for the element
	 * @param {Object|null} [events] - the event listeners
	 * @returns {Element} the new element
	 */
	createElement: function(tag, classes, events) {
		var element = document.createElement(tag);

		if(classes !== null) {
			element.classList.add(classes);
		}

		for(var event in events) {
			if(events.hasOwnProperty(event)) {
				element.addEventListener(event, events[event]);
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
		main.timeoutOverlay.style.display = "block";
		main.globals.interact.isInteracting = false;
	},

	/**
	 * Hide the timeout overlay
	 */
	hideTimeoutOverlay: function() {
		main.timeoutOverlay.style.display = "none";
		main.globals.interact.isInteracting = true;
	},

	/**
	 * Checks if the finger moved with a margin of 2 pixels
	 * @param {object} a
	 * @param {object} b
	 * @returns {boolean}
	 */
	validateTouchMoveClickMargin: function(a, b) {
		return(
			(a.x > b.x -2 && a.x < b.x +2) &&
			(a.y > b.y -2 && a.y < b.y +2)
		);
	},

	/**
	 *
	 */
	clickedInCanvas: function(target) {
		while (target = target.parentElement) {
			if (target.classList.contains('m4n-container')) { return true }
		}
		return false;
	}
};