/**
 * The tile class
 * @class
 * @param {object} tile - The tile object from json
 */
var Tile = function(tile) {
	this._type = "tile";

	this.image = new Image();
	this.state = 0;

	this.loadingStates = {
		initial: 0,
		loading: 1,
		loaded: 2,
		error: 3
	};

	if(tile !== false) {
		for(var property in tile) {
			if(tile.hasOwnProperty(property)) {
				this[property] = tile[property];
			}
		}
	}
};

/**
 * Download the tile
 */
Tile.prototype.load = function() {
	var tile = this;

	tile.image.src = main.url + tile.url;
	tile.state = 1;
	tile.image.onload = function() {
		tile.state = 2;
		main.object.levels.getLevel(tile.level).checkLoaded();
	};
	tile.image.onerror = function() {
		tile.state = 3;
		main.object.levels.getLevel(tile.level).checkLoaded();
	};
};

/**
 * Draw the tile on screen
 */
Tile.prototype.draw = function() {
	var tile = this;

	/**
	 * Draw a tile on screen
	 */
	var show = function() {
		var left = tile.position.left + main.globals.offset.get().x;
		var top = tile.position.top + main.globals.offset.get().y;

		if(tile.isVisible(left, top, tile.size.width, tile.size.height)) {
			main.object.context.drawImage(tile.image, left, top, tile.size.width, tile.size.height);
		}
	};

	/**
	 * Draw an "x" when a tile is unable to load
	 */
	var error = function() {
		var offset = main.globals.offset.get();

		main.object.context.lineWidth = 8;
		main.object.context.lineCap = "round";
		main.object.context.beginPath();
		main.object.context.moveTo(10 + tile.position.left + offset.x,
			10 + tile.position.top + offset.y);
		main.object.context.lineTo(-10 + tile.position.left + tile.size.width + offset.x,
			-10 + tile.position.top + tile.size.height + offset.y);
		main.object.context.stroke();

		main.object.context.beginPath();
		main.object.context.moveTo(10 + tile.position.left + offset.x,
			-10 + tile.position.top + tile.size.height + offset.y);
		main.object.context.lineTo(-10 + tile.position.left + tile.size.width + offset.x,
			10 + tile.position.top + offset.y);
		main.object.context.stroke();
		tile.state = 3;
	};

	switch(tile.state) {
		case tile.loadingStates.initial:
			tile.load();
			break;
		case tile.loadingStates.loading:
			break;
		case tile.loadingStates.loaded:
			show();
			break;
		case tile.loadingStates.error:
			error();
			break;
	}
};

/**
 * Check if the tile will be visible on screen if drawn
 * @param {number} x - The x position of the tile
 * @param {number} y - The y position of the tile
 * @param {number} w - The width of the tile
 * @param {number} h - The height of the tile
 * @returns {boolean} If the tile is visible
 */
Tile.prototype.isVisible = function(x, y, w, h) {
	return (x < main.object.canvas.width && x + w > 0 && y < main.object.canvas.height && y + h > 0);
};