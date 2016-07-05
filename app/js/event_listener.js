/**
 * Custom event listener service
 * @param {string} event - the event that callback should be triggered
 * @param {function} callback - the callback method
 * @returns {number} The listener id
 */
function addEventListener(event, callback) {
	if(typeof event !== 'string') {
		throw "event must be a string; " + event + " given";
	}

	if(typeof callback !== 'function') {
		throw "callback must be a function";
	}

	if(!main.dispatchEvents[event]) {
		main.dispatchEvents[event] = [];
	}

	if(main.dev) {
		console.log("Event listener for event \"" + event + "\" added", callback);
	}

	return main.dispatchEvents[event].push(callback);
}

/**
 * Remove an event listener
 * @param {string} event - the event to unsubscribe from
 * @param {number} id - the id of the listener
 */
function removeEventListener(event, id) {
	if(typeof event !== 'string') {
		throw "event must be a string; " + event + " given";
	}

	if(typeof id !== 'number') {
		throw "id must be a number; " + id + " given";
	}

	if(!main.dispatchEvents[event]) {
		throw "unknown event";
	}

	var listener = main.dispatchEvents[event][id -1];
	if(!listener) {
		throw "unknown listener";
	}

	if(main.dev) {
		console.log("Event listener for event \"" + event + "\" removed", listener);
	}

	delete main.dispatchEvents[event][id -1];
}

/**
 * Trigger a custom event
 * @param {string} event - the name of the event that should be triggered
 * @param {object} object - the parameter for the listener
 */
function triggerEvent(event, object) {
	if(main.dispatchEvents[event]) {
		main.dispatchEvents[event].forEach(function(item) {
			item(object);
		});
	}
}

/**
 * Empty object to save event listener functions in.
 * @type {object}
 */
main.dispatchEvents = {};