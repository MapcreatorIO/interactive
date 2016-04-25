/**
 * The levels class
 * @class
 * @param {Level[]} levels - A list of level objects
 */
var Levels = function(levels) {
	this._type = "levels";
	this.current = 0;

	if(levels !== false) {
		for(var property in levels) {
			if(levels.hasOwnProperty(property)) {
				this[property] = levels[property];
			}
		}
	}
};

/**
 * Get the ideal level for the current canvas size
 * @returns {Level} The level number
 */
Levels.prototype.getIdealLevel = function() {
	var level = this.getLevel(0);

	this.getAllExcept(0).forEach(function(item) {
		if(level !== null) {
			var difference, prev_difference;
			if(main.object.canvas.clientWidth >= main.object.canvas.clientHeight) { // If wider
				difference = Math.abs(main.object.canvas.width - item.requested_area.size.width);
				prev_difference = Math.abs(main.object.canvas.width - level.requested_area.size.width);
			} else { // If higher
				difference = Math.abs(main.object.canvas.height - item.requested_area.size.height);
				prev_difference = Math.abs(main.object.canvas.height - level.requested_area.size.height);
			}

			if(difference < prev_difference) {
				level = item;
			}
		} else {
			level = item;
		}
	});
	return level;
};

/**
 * The levels api object
 *
 * @returns {object}
 */
Levels.prototype.getApiObject = function() {
	var levels = [];

	this.list.forEach(function(item) {
		levels.push(item.getApiObject());
	});

	return {
		current: this.current,
		highest: this.getHighest().level,
		lowest: this.getLowest().level,
		levels: levels
	};
};

/**
 * Change the current map
 * @param {number} level - The level to change to
 */
Levels.prototype.setCurrent = function(level) {
	if(this.current !== level) {
		this.current = level;
	}
};

/**
 * Get a specific level
 * @param {number} level - The level to return
 * @returns {Level|null} the requested level object or null if it wasn't found
 */
Levels.prototype.getLevel = function(level) {
	for(var i = 0; i < main.object.levels.list.length; i++) {
		if(main.object.levels.list[i].level == level) {
			return main.object.levels.list[i];
		}
	}
	return null;
};

/**
 * Returns the requested level objects
 * @param {number[]} rLevels - The levels you want to get
 * @returns {Level[]} Array of level objects
 */
Levels.prototype.getLevels = function(rLevels) {
	var levels = [];

	for(var i = 0; i < rLevels.length; i++) {
		levels.push(this.getLevel(rLevels[i]));
	}
	return levels;
};

/**
 * Get all levels except the given ones
 * @param {number|Array} numbers - the number not to return
 */
Levels.prototype.getAllExcept = function(numbers) {
	if(typeof numbers == "number") {
		numbers = [numbers];
	}

	var levels = [];
	this.list.forEach(function(item) {
		if(numbers.indexOf(item.level) === -1) {
			levels.push(item);
		}
	});
	return levels;
};

/**
 * Get the current level
 * @returns {Level} The current level object
 */
Levels.prototype.getCurrent = function() {
	return this.getLevel(this.current);
};

/**
 * Get the highest level (lowest number)
 * @returns {Level} Level object
 */
Levels.prototype.getHighest = function() {
	var level = this.getCurrent();

	this.list.forEach(function(item) {
		if(item.level < level.level) {
			level = item;
		}
	});
	return level;
};

/**
 * Get the lowest level (highest number)
 * @returns {Level} Level object
 */
Levels.prototype.getLowest = function() {
	var level = this.getCurrent();

	this.list.forEach(function(item) {
		if(item.level > level.level) {
			level = item;
		}
	});
	return level;
};

/**
 * Change the level and draw it
 * @param {number} level - The level to change to
 */
Levels.prototype.change = function(level) {
	var levels = this.getLevels([level, level + 1, level - 1]);
	if(levels[0] !== null) {
		var changeTo = function(level) {
			window.requestAnimationFrame(function() {
				level.draw();
				triggerEvent("level_changed", level.getApiObject());
			});
		};

		if(!levels[0].is_loaded) {
			levels[0].load();
			var eventId = addEventListener("level_loaded", function(e) {
				if(e.level == level) {
					changeTo(levels[0]); // TODO draw safety check
					removeEventListener("level_loaded", eventId);
				}
			});
		} else {
			changeTo(levels[0]);
		}

		if(levels[1] !== null) {
			levels[1].load();
		}
		if(levels[2] !== null) {
			levels[2].load();
		}
	}
};

/**
 * Get the number of levels
 * @returns {number} The number of levels in the map
 */
Levels.prototype.count = function() {
	return this.list.length;
};