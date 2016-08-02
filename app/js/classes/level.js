/**
 * The level class
 * @class
 * @param {object} level - The level json object
 */
var Level = function(level) {
	this._type = "level";

	this.is_loaded = false;
	this.tiles = {};

	if(level !== false) {
		for(var property in level) {
			if(level.hasOwnProperty(property)) {
				this[property] = level[property];
			}
		}
	}
};

/**
 *
 *
 * @returns {object}
 */
Level.prototype.getApiObject = function() {
	return {
		level: this.level,
		isLoaded: this.is_loaded,
		changeTo: function() {
			main.object.levels.change(this.level);
		}.bind(this),
		load: function() {
			this.load();
		}.bind(this)
	};
};

/**
 * Check if all tiles have been loaded
 */
Level.prototype.checkLoaded = function() {
	var loadedTiles = 0;

	this.tiles.list.forEach(function(tile) {
		if(tile.state > 1) {
			loadedTiles++;
		}
	});

	if(loadedTiles === this.tiles.list.length) {
		this.is_loaded = true;
		triggerEvent("level_loaded", this.getApiObject());
	}
};

/**
 * Draws a level on screen
 */
Level.prototype.draw = function() {
	main.object.context.save();
	main.object.context.setTransform(1, 0, 0, 1, 0, 0);

	main.object.context.clearRect(0, 0, main.object.canvas.width, main.object.canvas.height);

	main.object.context.restore();

	main.globals.offset.changeTo(
		this.getBounds(true, main.globals.offset.get().x),
		this.getBounds(false, main.globals.offset.get().y)
	);

	this.tiles.draw();

	if(main.dev) {
		this.points.draw();
	}

	main.object.levels.setCurrent(this.level);
	triggerEvent("level_drawn", this.getApiObject());
};

/**
 *  Load tiles in the background
 */
Level.prototype.load = function() {
	if(!this.is_loaded) {
		this.tiles.load();
	}
};

/**
 * Checks if the cursor is on the map (when there's whitespace in the canvas)
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 * @returns {boolean} Is the cursor on the map?
 */
Level.prototype.isOn = function(x, y) {
	var offset = main.globals.offset.get();

	return (
		x > offset.x &&
		x < this.size.width + offset.x &&
		y > offset.y &&
		y < this.size.height + offset.y
	);
};

/**
 * Checks if the user will drag the map of the side of the canvas and prevents this
 * @param {boolean} forXAxis - If the call to this method is intended for use with the x axis
 * @param {number} movement - The new location the user dragged the map to
 * @returns {number} The corrected new location for the map
 */
Level.prototype.getBounds = function(forXAxis, movement) {
	var offset = forXAxis ?
	main.object.canvas.clientWidth - this.size.width :
	main.object.canvas.clientHeight - this.size.height;
	return Math.max(Math.min(offset, 0), Math.min(Math.max(offset, 0), movement));
};