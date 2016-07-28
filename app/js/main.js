/**
 * @file Maps4News Interactive Map
 * @copyright Maps4News 2016
 *
 * M4nInteractive 2.0.5-2
 */
var M4nInteractive = (function(options, container, callback) {
	"use strict";
	var main = this;

	"<!= options !>";

	"<!= external_apis !>";

	"<!= setup !>";

	"<!= api !>";

	"<!= map !>";

	"<!= classes/*.js !>";

	"<!= events !>";

	"<!= globals !>";

	"<!= helpers !>";

	/**
	 * The object that will be returned when the map is made.
	 * Write-protected
	 * @type {object}
	 */
	var returnObject = {};
	Object.defineProperties(returnObject, {
		api: {
			value: main.api,
			writable: false
		},
		addEventListener: {
			value: addEventListener,
			writable: false
		},
		removeEventListener: {
			value: removeEventListener,
			writable: false
		}
	});

	if(main.dev) {
		returnObject.object = function() { return main; };
	}
	return returnObject;
});
