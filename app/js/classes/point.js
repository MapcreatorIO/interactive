/**
 * The point class
 * @class
 * @param {object} point - The json point object
 */
var Point = function(point) {
	this._type = "point";

	if(point !== false) {
		for(var property in point) {
			if(point.hasOwnProperty(property)) {
				this[property] = point[property];
			}
		}
	}
	// TODO refactor to support all formats
	this.position = {
		left: Math.min.apply(null, this.shape.map(function(item) { return item.x })) - 5,
		top: Math.min.apply(null, this.shape.map(function(item) { return item.y })) - 5
	};
	this.size = {
		width: Math.max.apply(null, this.shape.map(function(item) { return item.x })) - this.position.left + 10,
		height: Math.max.apply(null, this.shape.map(function(item) { return item.y })) - this.position.top + 10
	};
};

/**
 * Draw a border around a point
 */
Point.prototype.draw = function() {
	main.object.context.strokeRect(
		this.position.left + main.globals.offset.get().x,
		this.position.top + main.globals.offset.get().y,
		this.size.width,
		this.size.height
	);
};

/**
 * Check if the user clicked on a specific point
 * @param {number} x - The x value from the user
 * @param {number} y - The y value from the user
 * @returns {boolean} Did the user click on a point?
 */
Point.prototype.isOn = function(x, y) {
	return (
		x > this.position.left + main.globals.offset.get().x &&
		x < this.position.left + this.size.width + main.globals.offset.get().x &&
		y > this.position.top + main.globals.offset.get().y &&
		y < this.position.top + this.size.height + main.globals.offset.get().y
	);
};

/**
 * Get info about the current position of a point
 * @returns {object}
 */
Point.prototype.location = function() {
	var object = {
		left: this.position.left + main.globals.offset.get().x,
		top: this.position.top + main.globals.offset.get().y,
		right: -(this.position.left + main.globals.offset.get().x - main.object.canvas.clientWidth + this.size.width),
		bottom: -(this.position.top + main.globals.offset.get().y - main.object.canvas.clientHeight + this.size.height)
	};

	object.location = {
		x: (function() {
			if(object.left < 5) {
				return "left";
			} else if(object.right < 5) {
				return "right";
			}
			return "center";
		})(),
		y: (function() {
			if(object.top < 5) {
				return "above";
			} else if(object.bottom < 5) {
				return "beneath";
			}
			return "center";
		})()
	};

	return object;
};