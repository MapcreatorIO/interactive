/**
 * The popup class
 * @class
 * @param {object} popup - The json popup object
 */
var Popup = function(popup) {
	this._type = "popup";

	this.on_screen = false;

	if(popup !== false) {
		for(var property in popup) {
			if(popup.hasOwnProperty(property)) {
				this[property] = popup[property];
			}
		}
	}
	this.html_id = main.canvas + '-popup-' + this.number;
	this.video_id = main.html_id + '-video';
};

/**
 * Get the api object for a popup
 *
 * @returns {object} The popup api object
 */
Popup.prototype.getApiObject = function() {
	return {
		number: this.number,
		title: this.title,
		info: this.info,
		show: function(center) {
			this.show(center);
		}.bind(this),
		toggle: function(center, force) {
			this.toggle(center, force);
		}.bind(this),
		hide: function(force) {
			this.hide(force);
		}.bind(this)
	};
};

/**
 * Show a popup
 *
 * @param {boolean} [center=false] - the the map when showing the popup
 */
Popup.prototype.show = function(center) {
	if(!this.on_screen) {
		// Hide all other popups (including sidebars)
		main.object.popups.hideAll(true);

		// Get the clicked point
		var point = main.object.levels.getCurrent().points.get(this.number);

		// Center the map
		if(center) {
			helpers.moveTo(point.position.left + (point.size.width / 2), point.position.top + (point.size.height / 2));
		}

		var wasShown;
		if(main.isMobile) {
			wasShown = this.onShowMobile(point);
		} else {
			wasShown = this.onShowDesktop(point);
		}

		if(wasShown) {
			this.startVideo();
			this.on_screen = true;
			triggerEvent("popup_shown", this.getApiObject());
		}
	}
};

/**
 * Basic popup mobile show function
 *
 * The popup style specific show method
 * To be overwritten by popup specific function
 *
 * @param {Element} point
 * @returns {boolean} - If the popup has been shown
 */
Popup.prototype.onShowMobile = function(point) {
	// Overwrite with popup specific code
	return this.onShowDesktop(point);
};

/**
 * Basic popup desktop show function
 *
 * The popup style specific show method
 * To be overwritten by popup specific function
 *
 * @param {Element} point
 * @returns {boolean} - if the popup has be shown on mobile
 */
Popup.prototype.onShowDesktop = function(point) {
	// Overwrite with popup specific code
	return false;
};

/**
 * Hide a popup
 *
 * @param {boolean} [force=false] - force hiding the popup
 * @returns {boolean} - if the popup has been hidden
 */
Popup.prototype.hide = function(force) {
	if(this.on_screen) {
		if(this.onHide(force)) {
			this.stopVideo();
			this.on_screen = false;
			triggerEvent("popup_hidden", this.getApiObject());
		}
	}
};

/**
 * Basic popup hiding
 *
 * The popup style specific hide method
 * To be overwritten by popup specific function
 *
 * @param {boolean} [force=false] - force hiding the popup
 * @returns {boolean}
 */
Popup.prototype.onHide = function(force) {
	// Overwrite with popup specific method
	return false;
};

/**
 * Toggle a popup
 *
 * @param {boolean} [center=false] - center the map
 * @param {boolean} [force=false] - force hiding the popup
 */
Popup.prototype.toggle = function(center, force) {
	if(this.on_screen) {
		this.hide(force || false);
	} else {
		this.show(center || false);
	}
};

/**
 * Stop the playing video
 */
Popup.prototype.stopVideo = function() {
	switch(this.media_type) {
		case "youtube":
			if(
				this.youtube && [
					YT.PlayerState.PLAYING,
					YT.PlayerState.BUFFERING
				].indexOf(this.youtube.getPlayerState()) !== -1
			) {
				this.youtube.pauseVideo();
			}
			break;
		case "video":
			document.getElementById(this.video_id).pause();
			break;
	}
};

/**
 * Start the video inside the popup
 */
Popup.prototype.startVideo = function() {
	try { // TODO fix youtube check
		switch(this.media_type) {
			case "youtube":
				if(
					this.youtube && [
						YT.PlayerState.UNSTARTED,
						YT.PlayerState.PAUSED,
						YT.PlayerState.CUED,
						YT.PlayerState.BUFFERING
					].indexOf(this.youtube.getPlayerState()) !== -1
				) {
					this.youtube.playVideo();
				}
				break;
			case "video":
				document.getElementById(this.video_id).play();
				break;
		}
	} catch(e) {
		console.warn("YouTube wasn't ready, yet!", e);
	}
};

/**
 * Generate the html for a popup
 */
Popup.prototype.generateHTML = function() {
	var title = typeof this.title !== "undefined" ? this.title : "";
	var media = typeof this.media !== "undefined" ? this.media : null;
	var info = typeof this.info !== "undefined" ? this.info : "";

	var popup = document.createElement("div");
	popup.id = this.html_id;
	popup.style.zIndex = main.object.canvas.style.zIndex + 2;

	var title_html = helpers.createElement("div", "m4n-title");
	title_html.innerHTML = title;

	var info_html = helpers.createElement("div", "m4n-info");
	info_html.innerHTML = info;

	var media_html = helpers.createElement("div", "m4n-media");

	switch(this.media_type) {
		case "":
		case "none":
		case null:
		case undefined:
			break;
		case "image":
			var media_image = document.createElement("img");
			media_image.alt = this.id;
			media_image.src = media;
			media_html.appendChild(media_image);
			break;
		case "youtube":
			var media_youtube = document.createElement("iframe");
			media_youtube.src = "https://www.youtube.com/embed/" + this.media + "?modestbranding=1&autohide=1&controls=2&enablejsapi=1&showinfo=0";
			media_youtube.id = this.html_id + "-youtube";
			media_youtube.frameBorder = 0;
			media_youtube.allowFullscreen = 1;
			media_html.appendChild(media_youtube);
			break;
		case "video":
			var media_video = helpers.createElement("video", "m4n-video");
			media_video.src = this.media;
			media_video.loop = true;
			media_video.controls = true;
			media_video.id = this.video_id;
			media_html.appendChild(media_video);
			break;
		default:
			throw this.media_type + " is an invalid media type";
	}

	switch(main.object.settings.placement) {
		case "overlay":
			popup = this.generateOverlay(popup, title_html, info_html, media_html);
			break;
		case "sidebar":
			popup = this.generateSidebar(popup, title_html, info_html, media_html);
			break;
		default:
			popup = this.generatePopover(popup, title_html, info_html, media_html);
	}
	main.object.popupContainer.appendChild(popup);

	this.onHide(true);
};

/**
 * Generate a Popover style popup
 *
 * @param {Element} popup
 * @param {Element} title_html
 * @param {Element} info_html
 * @param {Element} media_html
 * @returns {Element} the popup
 */
Popup.prototype.generatePopover = function(popup, title_html, info_html, media_html) {
	popup.classList.add("m4n-popover");

	popup.appendChild(helpers.createElement("div", "m4n-popover-triangle"));
	popup.appendChild(helpers.createElement("div", "m4n-popover-header", null, [
		helpers.createElement("div", "m4n-popover-close", {
			"click": this.hide.bind(this),
			"touchend": this.hide.bind(this)
		}),
		title_html
	]));
	popup.appendChild(media_html);
	popup.appendChild(info_html);

	this.onHide = function() {
		popup.style.display = "none";

		var triangle = popup.getElementsByClassName("m4n-popover-triangle")[0];
		triangle.classList.remove("top", "bottom", "right", "left");
		triangle.style.left = null;
		triangle.style.top = null;

		return true;
	};

	this.onShowDesktop = function(point) {
		popup.style.display = "block";

		// Triangle
		var triangle = popup.getElementsByClassName("m4n-popover-triangle")[0];
		var heightTriangle = Math.sqrt(triangle.clientHeight * triangle.clientHeight + triangle.clientWidth * triangle.clientWidth);

		// Bounding Client Rect of the canvas
		var boundingRect = main.object.canvas.getBoundingClientRect();

		// Position for triangle
		var top = Math.max(0.05, Math.min(0.85, ((point.position.top + main.globals.offset.get().y) / main.object.canvas.clientHeight)));
		var left = Math.max(0.15, Math.min(0.85, ((point.position.left + main.globals.offset.get().x) / main.object.canvas.clientWidth)));

		// Formulas for where the popup fits
		var sides = {
			above: main.globals.offset.get().y + point.position.top - heightTriangle,
			beneath: boundingRect.height - (main.globals.offset.get().y + point.position.top + point.size.height) - heightTriangle,
			left: main.globals.offset.get().x + point.position.left - heightTriangle,
			right: boundingRect.width - (main.globals.offset.get().x + point.position.left + point.size.width) - heightTriangle
		};

		// Booleans for where the popup fits
		var fitsOnCanvas = {
			above: sides.above > popup.clientHeight,
			beneath: sides.beneath > popup.clientHeight,
			left: sides.left > popup.clientWidth,
			right: sides.right > popup.clientWidth
		};

		var fitsOnScreen = {
			above: (sides.above + boundingRect.top) > popup.clientHeight,
			beneath: (sides.beneath + (window.innerHeight - boundingRect.height - boundingRect.top)) > popup.clientHeight,
			left: (sides.left + boundingRect.left) > popup.clientWidth,
			right: (sides.right + (window.innerWidth - boundingRect.width - boundingRect.left)) > popup.clientWidth
		};

		var show = {
			above: function() {
				triangle.classList.add("bottom");
				popup.style.top = main.globals.offset.get().y + point.position.top - popup.clientHeight - (heightTriangle / 2) + main.hotspotMargin + 'px';
				popup.style.left = main.globals.offset.get().x + point.position.left + (point.size.width / 2) - (popup.clientWidth * left) + 'px';
				triangle.style.left = (left * 100) + "%";
			},
			beneath: function() {
				triangle.classList.add("top");
				popup.style.top = main.globals.offset.get().y + point.position.top + point.size.height + (heightTriangle / 2) - main.hotspotMargin + 'px';
				popup.style.left = main.globals.offset.get().x + point.position.left + (point.size.width / 2) - (popup.clientWidth * left) + 'px';
				triangle.style.left = (left * 100) + "%";
			},
			left: function() {
				triangle.classList.add("right");
				popup.style.top = (main.globals.offset.get().y + point.position.top + (point.size.height / 2) - (popup.clientHeight * top) - 10) + 'px';
				popup.style.left = main.globals.offset.get().x + point.position.left - popup.clientWidth - (heightTriangle / 2) + main.hotspotMargin + 'px';
				triangle.style.top = (top * 100) + "%";
			},
			right: function() {
				triangle.classList.add("left");
				popup.style.top = (main.globals.offset.get().y + point.position.top + (point.size.height / 2) - (popup.clientHeight * top) - 10) + 'px';
				popup.style.left = main.globals.offset.get().x + point.position.left + point.size.width + (heightTriangle / 2) - main.hotspotMargin + 'px';
				triangle.style.top = (top * 100) + "%";
			}
		};

		var lowest = (function() {
			var object = null;
			for(var side in sides) {
				if(sides.hasOwnProperty(side) && (object == null || object.value > sides[side])) {
					object = { key: side, value: sides[side] }
				}
			}

			return object;
		})();

		// Placement logic
		if(lowest.value < 0) {
			if(lowest.key == "above") {
				show.beneath();
			} else if(lowest.key == "beneath") {
				show.above();
			} else if(lowest.key == "left") {
				show.right();
			} else if(lowest.key == "right") {
				show.left();
			}
		} else if(fitsOnCanvas.above && fitsOnScreen.above) {
			show.above();
		} else if(fitsOnCanvas.beneath && fitsOnScreen.beneath) {
			show.beneath();
		} else {

			if(fitsOnCanvas.left && fitsOnScreen.left) {
				show.left();
			} else if(fitsOnCanvas.right && fitsOnScreen.right) {
				show.right();
			} else {
				// TODO move map to fit popup
				show.above();
			}

		}

		return true;
	};

	return popup;
};

/**
 * Generate a Overlay style popup
 *
 * @param {Element} popup
 * @param {Element} title_html
 * @param {Element} info_html
 * @param {Element} media_html
 * @returns {Element} the popup
 */
Popup.prototype.generateOverlay = function(popup, title_html, info_html, media_html) {
	popup.classList.add("m4n-overlay");

	// Content
	popup.appendChild(helpers.createElement("div", null, null, [
		helpers.createElement("div", null, null, [
			helpers.createElement("div", null, null, [title_html, media_html, info_html])
		])
	]));
	// Close button
	popup.appendChild(helpers.createElement("span", "close-overlay", {
		"click": this.hide.bind(this),
		"touchend": this.hide.bind(this)
	}));

	this.onHide = function() {
		popup.style.display = "none";
		return true;
	};

	this.onShowDesktop = function() {
		popup.style.display = "block";
		popup.style.left = main.object.canvas.clientLeft + "px";
		popup.style.top = main.object.canvas.clientTop + "px";
		popup.style.width = main.object.canvas.clientWidth + "px";
		popup.style.height = main.object.canvas.clientHeight + "px";

		return true;
	};

	return popup;
};

/**
 * Generate a Popover style popup
 *
 * @param {Element} popup
 * @param {Element} title_html
 * @param {Element} info_html
 * @param {Element} media_html
 * @returns {Element} the popup
 */
Popup.prototype.generateSidebar = function(popup, title_html, info_html, media_html) {

	popup.classList.add("m4n-sidebar-container");

	var sidebar = helpers.createElement("div", "m4n-sidebar", null, [
		// Header
		helpers.createElement("div", "m4n-sidebar-header", null, [
			// Close button
			helpers.createElement("div", "m4n-sidebar-close", {
				"click": function() { this.hide(true); }.bind(this),
				"touchend": function() { this.hide(true); }.bind(this)
			}),
			// Title
			title_html
		]),
		// Content
		helpers.createElement("div", "m4n-sidebar-content", null, [media_html, info_html]),
		// Footer
		helpers.createElement("div", "m4n-sidebar-footer", null, [
			// Pagination
			helpers.createElement("ul", "m4n-pagination", null, [
				// Previous
				helpers.createElement("li", null, {
					"click": function() {
						this.hide(true);
						var new_popup;
						if(this.number != main.object.popups.getFirst().number) {
							new_popup = main.api.popup(this.number - 1);
						} else {
							new_popup = main.api.popup(main.object.popups.getLast().number);
						}
						if(!!new_popup) { new_popup.show(true); }
					}.bind(this)
				}),
				// Next
				helpers.createElement("li", null, {
					"click": function() {
						this.hide(true);
						var new_popup;
						if(this.number != main.object.popups.getLast().number) {
							new_popup = main.api.popup(this.number + 1);
						} else {
							new_popup = main.api.popup(main.object.popups.getFirst().number);
						}
						if(!!new_popup) { new_popup.show(true); }
					}.bind(this)
				})
			])
		])
	]);

	popup.appendChild(sidebar);

	this.onHide = function(force) {
		if(force === true) {
			popup.style.display = "none";
			return true;
		}
		return false;
	};

	this.onShowDesktop = function() {
		popup.style.removeProperty("display");
		return true;
	};

	return popup;
};