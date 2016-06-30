/**
 * The popups class
 * @class
 * @param {Popup[]} popups - A list of popups
 */
var Popups = function(popups) {
	this._type = "popups";

	if(popups !== false) {
		for(var property in popups) {
			if(popups.hasOwnProperty(property)) {
				this[property] = popups[property];
			}
		}
	}
};

/**
 * Popups api object
 */
Popups.prototype.getApiObject = function() {
	var popups = [];

	this.list.forEach(function(item) {
		popups.push(item.getApiObject());
	});

	return popups;
};

/**
 * Get a specific popup
 *
 * @param {number} number - The number of the popup
 * @returns {Popup|null} The requested popup
 */
Popups.prototype.get = function(number) {
	for(var i = 0; i < this.list.length; i++) {
		if(this.list[i].number == number) {
			return this.list[i];
		}
	}
	return null;
};

/**
 * Get all popups
 *
 * @returns {Popup[]}
 */
Popups.prototype.getAll = function() {
	return this.list;
};

/**
 * Get the first popup
 *
 * @returns {Popup}
 */
Popups.prototype.getFirst = function() {
	return this.list[0];
};

/**
 * Get the last popup
 *
 * @returns {Popup}
 */
Popups.prototype.getLast = function() {
	return this.list[this.list.length -1];
};

/**
 * Generate html for the popups
 */
Popups.prototype.generateHTML = function() {
	this.list.forEach(function(element) {
		element.generateHTML();
	});
};

/**
 * Hide all popups
 */
Popups.prototype.hideAll = function(force) {
	this.list.forEach(function(element) {
		element.hide(force);
	});
};

/**
 * Get the current popup
 * @returns {Popup|null} the current popup
 */
Popups.prototype.getCurrent = function() {
	for(var i = 0; i < this.list.length; i++) {
		if(this.list[i].on_screen) {
			return this.list[i];
		}
	}
	return null;
};