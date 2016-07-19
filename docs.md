# API Documentation Interactive 2.0
Interactive Map

Copyright © 2016 MapCreator

Found a bug?, report it on our [repo](https://github.com/MapOnline/interactive)

## Table of contents
* [Introduction](#introduction)
* [Setup](#setup)
* [The Map Object](#the-map-object)
	* [API](#api)
		* [popup](#popup)
		* [popups](#popups)
		* [level](#level)
		* [levels](#levels)
		* [controls](#controls)
	* [addEventListener](#addeventlistener)
	* [removeEventListener](#removeeventlistener)
* [Events](#events)
	* [The Events](#the-events)
* [Misc](#misc)
	* [Iframe](#iframe)
	* [Style Overwriting](#style-overwriting)

## Introduction
This document will explain the Maps4News Interactive Map from basic setup to more advanced API features. Most of the features mentioned in the documentation will only be available in the inline variant of the map.


## Setup
Here we’ll talk a bit about the boilerplate code that the tool will provide.

Example

```html
<div id="m4n-map">
	<script src="https://www.path.to/m4n.js"></script>
	<script>
		var map = new M4nInteractive({
			path: "path/to/map",
			environment: "online",
			interact: "controls"
		}, document.getElementById("m4n-map"), function(map) {
			// Todo API code
		});
	</script>
</div>
```

First we have a div tag which will act as a container for the canvas and other various HTML elements that the script will generate. Next is the script tag that will download the m4n.js file, and lastly, the script tag that will hold the JavaScript code which will be used to initialize the map.

The M4nInteractive class accepts the following parameters:

1. A JSON object with the settings for the map.
  - __path__. The id that was generated with the map render job.
     -  If your environment is *download* then this path should be the absolute path to the folder where the map.json file and images from the map are in.
  - __environment__. (optional; default "online") The specific environment of your map.

  | Environment | Description |
  |-------------|-------------|
  | online      | The default environment of a map. |
  | beta        | For maps generated with the M4N beta tool. |
  | bleeding    | For maps generated with the M4N bleeding tool. |
  | local       | This should be used when a user wants to self-host their map. |
  | development | Used by M4N employees during development. (will enable debugging mode) |
  - __interact__. (optional; default "scroll") The way interaction with the map works.

  | Name     | Description |
  | -------- | ----------- |
  | scroll   | allow scrolling the map to zoom it in or out (holding ctrl will __disable__ scroll zooming) |
  | controls | use the on-screen controls and the mouse buttons to zoom in or out (holding ctrl will __enable__ scroll zooming) |
  | smart    | an overlay will be placed over the map when the user is not interacting with the map and disables the events to the map (the overaly will reappear when the user clicks outside the map) |

  - __zoomControls__. (optional; default true) Enable or disable the zoom controls for maps with more than 1 level.

  - __homeButton__. (optional; default true) Enable or disable the home button

  - __debug__. (not recommended) true or false, this allows the map object to be returned from the browser's console.
  - __object__. (only in development mode) Add your map object inline for debugging without a webserver.

2. The div container node (in this case the `div` with id `m4n-map`).
3. The callback (optional), this will be called after the map has finished initializing. Best used for subscribing to custom events. The callback function has 1 parameter, the map object, as described below.

## The Map Object
The final object that will be returned to your variable will have a couple of properties.

```js
{
	/**
	 * The API object as described below
	 */
	api: {},
	/**
	 * Method to subscribe to an event.
	 * @param {String} event - One of the events as described below
	 * @param {Function} callback - Your callback method
	 * @returns {Number} - The listener id
	 */
	addEventListener: function(event, callback),
	/**
	 * Method to unsubscribe from an event
	 * @param {String} event - One of the events as described below
	 * @param {Number} listenerId - the id returned from addEventListener
	 */
	removeEventListener: function(event, listenerId)
}
```

### API
In the API you will find a number of functions which can be used to interact with the map.

```js
{
	/**
	 * Will return a popup api object
	 * @param {Number} i - The number of the popup
	 * @returns {Popup|null} - The requested popup object
	 */
	popup: function(i) {},
	/**
	 * Will return all popups
	 * @returns {Popup[]} - All popup objects in an array
	 */
	popups: function() {},
	/**
	 * Will return a level api object
	 * @returns {Level|null} - The requested level object
	 */
	level: function(i) {},
	/**
	 * Will return all levels
	 * @returns {Level[]} - All level objects in an array
	 */
	levels: function() {},
	/**
	 * Reset the map back to the default starting position
	 */
	reset: function() {},
	/**
	 * Will refit the canvas inside its container
	 */
	refit: function() {},
	/**
	 * Zoom namespace
	 */
	zoom: {
		/**
		 * Change to a specific level
		 * @param {Number} level - The level number
		 */
		to: function(level) {},
		/**
		 * Zoom in 1 level
		 */
		in: function() {},
		/**
		 * Zoom out 1 level
		 */
		out: function() {}
	},
	/**
	 * Move namespace
	 */
	move: {
		/**
		 * Move the map (40 * factor)px to the left (x + 40 * factor)
		 * @param {Number} [factor=1]
		 */
		left: function(factor) {},
		/**
		 * Move the map (40 * factor)px to the right (x - 40 * factor)
		 * @param {Number} [factor=1]
		 */
		right: function(factor) {},
		/**
		 * Move the map (40 * factor)px up (y + 40 * factor)
		 * @param {Number} [factor=1]
		 */
		up: function(factor) {},
		/**
		 * Move the map (40 * factor)px down (y - 40 * factor)
		 * @param {Number} [factor=1]
		 */
		down: function(factor) {}
	},

	controls: {
		/**
		 * Array of controls to add
		 * @param {Array|Object} buttons - The button or array of buttons to add
		 */
		add: function(buttons) {}
	}
}
```

#### popup
The API `popup` function will return a specific popup, its structure is as follows.

```js
{
	/**
	 * The number of the popup
	 */
	number: 1,
	/**
	 * The title of the popup
	 */
	title: "Title",
	/**
	 * The body text of the popup
	 * Without the media (image, video, etc).
	 * Can contain HTML tags
	 */
	info: "Body Text",
	/**
	 * Show the popup
	 * @param {Boolean} [center=false] - Center the map to the popup
	 */
	show: function(center) {},
	/**
	 * Toggle the popup
	 * @param {Boolean} [center=false] - Center the map to the popup when it's shown
	 * @param {Boolean} [force=false] - Force hiding the popup when it's hidden
	 */
	toggle: function(center, force) {},
	/**
	 * Hide the popup
	 * @param {Boolean} [force=false] - Force hiding the popup
	 */
	hide: function(force) {}
}
```

#### popups
The API `popups` function will return an array of all `popup` objects as described above.

#### level
The API `level` function will return a specific level, its structure is as follows.

```js
{
	/**
	 * The number of the level
	 * Can be negative
	 */
	level: 0,
	/**
	 * If the level has been loaded
	 */
	isLoaded: true,
	/**
	 * Changes the map to this level
	 */
	changeTo: function() {},
	/**
	 * Triggers a load for the level
	 */
	load: function() {}
}
```

#### levels
The API `levels` function will return an array of all `level` objects as described above as well as the highest, lowest and the current level.

```js
{
	/**
	 * The current level
	 */
	current: 0,
	/**
	 * The highest level
	 */
	highest: -2,
	/**
	 * The lowest level
	 */
	lowest: 2,
	/**
	 * All level objects as described above
	 */
	levels: []
}
```

#### controls
The API `controls` namespace has one method: `add`, this method can be used to add clusters of icons to the control container.

The `add` method accepts a single object or an array of objects with the following properties.

```js
[
	{
		/**
		 * The text for the button, css compatible.
		 */
		text: '1',
		/**
		 * The method called when the button is clicked.
		 */
		click: function() {},
		/**
		 * Optional object for disabling the button
		 */
		disabled: {
			// The event that triggers a disable re-evaluate
			event: 'level_changed',
			// @returns {Boolean} - If the button should be disabled or not
			callback: function() {}
		}
	},
	{
		text: '\2605', // ★
		click: function() {
			console.log('★');
		},
		disabled: {
			event: 'level_changed',
			callback: function() {
				// Disable the button is the level is 0
				return mapi.api.levels().current == 0;
			}
		}
	}
]
```
Each array of objects will form a cluster onderneath the zoom and or home controls.

##### example

```js
var levels = [];
map.api.levels().levels.forEach(function(level) {
	levels.push({
		'text': level.level,
		'click': level.changeTo,
		'disabled': {
			'event': 'level_changed',
			'callback': function() {
				return map.api.levels().current == level.level;
			}
		}
	});
});
map.api.controls.add(levels);
```
The code in the example will add a cluster of all levels to the control container, the button for the current level will be disabled and when a button is clicked the map will change to that level.

### addEventListener
The `addEventListener` method is used to add an eventListener to an event.

```js
/**
 * @param {Level} level - The level that has been drawn
 */
var logEventId = map.addEventListener("level_drawn", function(level) {
	console.log(level.level);
});
```
The `addEventListener` will return the listener id (event specific) that can be used to unsubscribe from the event.
###removeEventListener
The `removeEventListener` method is used to remove a listener from an event.

```js
map.removeEventListener("level_drawn", logEventId);
```

## Events
Since it’s possible to have multiple maps run on one page we have implemented our own event listener service to avoid conflicts with other instances of M4nInteractive.

### The Events
`“level_loaded”`

This event will be called when all tiles (images) of a level have been downloaded.
One argument will be passed to the listener, the `level` object of the level that has been loaded.

--------

`“level_drawn”`

This event will be called when a level has been drawn on the canvas.
One argument will be passed to the listener, the `level` object of the level that has been drawn.

Note: this will be called on every move made by the user and/or API.

-------

`“level_changed”`

This event will be called when the currently displayed level has changed.
One argument will be passed to the listener, the `level` object of the level that the map has changed to.

-------

`“popup_shown”`

This event will be called when a popup has been displayed on screen.
One argument will be passed to the listener, the `popup` object of the popup that has been shown.

-------

`“popup_hidden”`

This event will be called when a popup has been hidden.
One argument will be passed to the listener, the `popup` object of the popup that has been hidden.

## Misc

### Iframe
It's also possible to generate an iframe version of the map via the Maps4News tool. The iframe version allows less customization over the inline version though.

```html
<iframe width='800' height='600' allowfullscreen='allowfullscreen' src='https://online.maps4news.com/ia/2.0/iframe/?path=path/to/map&env=online&id=m4n-map&style=//domain.com/style.css'></iframe>
```
Customization of the iframe map is done via the get variables in the url. There are a total of 4 parameters that can be added to the url.

1. __path__. Same as the inline version.
2. __env__. (optional; default "online") Same as the environment for the inline version (note that you should also change the subdomain).
  - The download environment is not available for iframe maps, if you wish to host your own iframe map you should create your own HTML document with an inline map inside, as described above.
3. __id__. (optional) A specific id for the container.
4. __style__. (optional) The absolute path to your custom css.

The iframe map does not allow eventListeners due to limitations with DOM.


### Style Overwriting
The Interactive Map adds its own `style.css` file to your page head. If you wish to overwrite certain styles used in the map, you can add a `link` tag to your head with the id `m4n-style-custom`. The map will look for this id when setting up its HTML elements and will remove and re-add this tag so that the styles defined in your css file will have priority over the ones in our main `style.css` file.

```html
<link id="m4n-style-custom" href="path/to/style.css" type="text/css" rel="stylesheet"/>
```

***
This document is property of Maps4News © 2016
