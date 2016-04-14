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
	this.image.src = main.url + this.url;
	this.state = 1;
	this.image.onload = function() {
		this.state = 2;
		main.object.levels.getLevel(this.level).checkLoaded();
	}.bind(this);
	this.image.onerror = function() {
		this.state = 3;
		main.object.levels.getLevel(this.level).checkLoaded();
	}.bind(this);
};

/**
 * Draw the tile on screen
 */
Tile.prototype.draw = function() {
	/**
	 * Draw a tile on screen
	 */
	var show = function() {
		var left = this.position.left + main.globals.offset.get().x;
		var top = this.position.top + main.globals.offset.get().y;

		if(this.isVisible(left, top, this.size.width, this.size.height)) {
			main.object.context.drawImage(this.image, left, top, this.size.width, this.size.height);
		}
	}.bind(this);

	/**
	 * Draw an "x" when a tile is unable to load
	 */
	var error = function() {
		var offset = main.globals.offset.get();

		main.object.context.lineWidth = 8;
		main.object.context.lineCap = "round";
		main.object.context.beginPath();
		main.object.context.moveTo(10 + this.position.left + offset.x,
			10 + this.position.top + offset.y);
		main.object.context.lineTo(-10 + this.position.left + this.size.width + offset.x,
			-10 + this.position.top + this.size.height + offset.y);
		main.object.context.stroke();

		main.object.context.beginPath();
		main.object.context.moveTo(10 + this.position.left + offset.x,
			-10 + this.position.top + this.size.height + offset.y);
		main.object.context.lineTo(-10 + this.position.left + this.size.width + offset.x,
			10 + this.position.top + offset.y);
		main.object.context.stroke();
		this.state = 3;
	}.bind(this);

	switch(this.state) {
		case this.loadingStates.initial:
			this.load();
			break;
		case this.loadingStates.loading:
			break;
		case this.loadingStates.loaded:
			show();
			break;
		case this.loadingStates.error:
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