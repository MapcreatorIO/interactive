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

	this.position = {
		left: Math.min.apply(null, this.shape.map(function(item) { return item.x })) - 10,
		top: Math.min.apply(null, this.shape.map(function(item) { return item.y })) - 10
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