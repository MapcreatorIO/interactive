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
		left: Math.min.apply(null, this.shape.map(function(item) { return item.x })),
		top: Math.min.apply(null, this.shape.map(function(item) { return item.y }))
	};
	this.size = {
		width: Math.max.apply(null, this.shape.map(function(item) { return item.x })) - this.position.left,
		height: Math.max.apply(null, this.shape.map(function(item) { return item.y })) - this.position.top
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
 * @param {number} [r] - The radius for a touch
 * @returns {boolean} Did the user click on a point?
 */
Point.prototype.isOn = function(x, y, r) {
	var circle = {
		x: x,
		y: y,
		r: r || 1
	};
	var rect = {
		x: this.position.left + main.globals.offset.get().x,
		y: this.position.top + main.globals.offset.get().y,
		w: this.size.width,
		h: this.size.height
	};

	var distX = Math.abs(circle.x - rect.x - rect.w / 2);
	var distY = Math.abs(circle.y - rect.y - rect.h / 2);

	if(distX > (rect.w / 2 + circle.r)) { return false; }
	if(distY > (rect.h / 2 + circle.r)) { return false; }

	if(distX <= (rect.w / 2)) { return true; }
	if(distY <= (rect.h / 2)) { return true; }

	var dx = distX - rect.w / 2;
	var dy = distY - rect.h / 2;

	return (dx * dx + dy * dy <= (circle.r * circle.r));
};