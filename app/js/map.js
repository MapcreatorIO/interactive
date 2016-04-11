/**
 * The interactive base structure
 * @class
 * @param {object} value
 */
var Map = function(value) {
	this._type = "map";

	this.container = document.getElementById(main.canvas + "-container");

	this.canvas = document.getElementById(main.canvas);

	this.context = this.canvas.getContext("2d");

	trackTransforms(this.context);

	this.popupContainer = document.getElementById(main.canvas + "-popup-container");

	for(var key in value) {
		if(value.hasOwnProperty(key)) {
			this[key] = value[key];
		}
	}
};