/**
 * The tiles class
 * @class
 * @param {Tile[]} tiles - A list of tiles
 */
var Tiles = function(tiles) {
	this._type = "tiles";

	if(tiles !== false) {
		for(var property in tiles) {
			if(tiles.hasOwnProperty(property)) {
				this[property] = tiles[property];
			}
		}
	}
};

/**
 * Draws every tile on screen
 */
Tiles.prototype.draw = function() {
	this.list.forEach(function(element) {
		element.draw();
	});
};

/**
 * Downloads every tile
 */
Tiles.prototype.load = function() {
	this.list.forEach(function(element) {
		if(element.state === element.loadingStates.initial) {
			element.load();
		}
	});
};

/**
 * Get the number of tiles on this level
 *
 * @returns {number} the number of tiles
 */
Tiles.prototype.count = function() {
	return this.list.length;
};

/**
 * Get all tiles
 *
 * @returns {Tile[]} all tile objects
 */
Tiles.prototype.getAll = function() {
	return this.list;
};

/**
 * Get a specific tile
 *
 * @param {number} index - the index for the popup
 * @returns {Tile} the specific tile
 */
Tiles.prototype.get = function(index) {
	return this.list[index];
};