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
		if(center === true) {
			helpers.moveTo(point.position.left + (point.size.width / 2), point.position.top + (point.size.height / 2));
		} else {
			var object = { x: 0, y: 0 };

			var location = point.location();
			if(location.location.x !== "center" || location.location.y !== "center") {
				if(location.left < 5) {
					object.x = 5 - location.left;
				} else if(location.right < 5) {
					object.x = -(5 - location.right);
				}

				if(location.top < 5) {
					object.y = 5 - location.top;
				} else if(location.bottom < 5) {
					object.y = -(5 - location.bottom);
				}

				if(object.x !== 0 || object.y !== 0) {
					helpers.moveBy(object.x, object.y);
				}
			}
		}

		var wasShown = (function() {
			if(main.isMobile) {
				return this.onShowMobile(point);
			} else {
				return this.onShowDesktop(point);
			}
		}.bind(this))();

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
	return false;
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
		this.hide(force);
	} else {
		this.show(center);
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
	var info = typeof this.info !== "undefined" ? this.info : null;

	var popup = document.createElement("div");
	popup.id = this.html_id;

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

	var triangle = helpers.createElement("div", "m4n-popover-triangle");

	popup.appendChild(triangle);
	popup.appendChild(title_html);
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

	this.onShowMobile = function() {
		popup.style.display = "block";
		popup.style.left = (main.object.canvas.clientWidth / 2) - (popup.clientWidth / 2) - main.object.canvas.getBoundingClientRect().left + "px";
		popup.style.top = (main.object.canvas.clientHeight / 2) - (popup.clientHeight / 2) - main.object.canvas.getBoundingClientRect().top + "px";

		return true;
	};

	this.onShowDesktop = function(point) {
		popup.style.display = "block";
		var heightTriangle = 16.97056274847714; // 24 = width of a triangle plus the border

		var left = Math.max(0.15, Math.min(0.85, ((point.position.left + main.globals.offset.get().x) / main.object.canvas.clientWidth))),
			top = Math.max(0.05, Math.min(0.85, ((point.position.top + main.globals.offset.get().y) / main.object.canvas.clientHeight))),

			triangle = popup.getElementsByClassName("m4n-popover-triangle")[0],
			fits = {
				nextTo: (
					(main.globals.offset.get().x + point.position.left + (popup.clientWidth * left) + (point.size.width / 2)) < main.object.canvas.clientWidth &&
					(main.globals.offset.get().x + point.position.left - (popup.clientWidth * left) + (point.size.width / 2)) > 0
				),
				above: (main.globals.offset.get().y + point.position.top - heightTriangle) > popup.clientHeight,
				beneath: (main.object.canvas.clientHeight - (main.globals.offset.get().y + point.position.top + point.size.height + heightTriangle)) > popup.clientHeight,
				left: (main.globals.offset.get().x + point.position.left - heightTriangle) > popup.clientWidth,
				right: (main.object.canvas.clientWidth - (main.globals.offset.get().x + point.position.left + point.size.width + heightTriangle)) > popup.clientWidth
			};

		var showAbove = function() {
			triangle.classList.add("bottom");
			popup.style.top = main.globals.offset.get().y + point.position.top - popup.clientHeight - heightTriangle + 'px';
			popup.style.left = main.globals.offset.get().x + point.position.left + (point.size.width / 2) - (popup.clientWidth * left) + 'px';
			triangle.style.left = (left * 100) + "%";
		};

		var showBeneath = function() {
			triangle.classList.add("top");
			popup.style.top = main.globals.offset.get().y + point.position.top + point.size.height + heightTriangle + 'px';
			popup.style.left = main.globals.offset.get().x + point.position.left + (point.size.width / 2) - (popup.clientWidth * left) + 'px';
			triangle.style.left = (left * 100) + "%";
		};

		var showLeft = function() {
			triangle.classList.add("right");
			popup.style.top = (main.globals.offset.get().y + point.position.top + (point.size.height / 2) - (popup.clientHeight * top) - 10) + 'px';
			popup.style.left = main.globals.offset.get().x + point.position.left - popup.clientWidth - heightTriangle + 'px';
			triangle.style.top = (top * 100) + "%";
		};

		var showRight = function() {
			triangle.classList.add("left");
			popup.style.top = (main.globals.offset.get().y + point.position.top + (point.size.height / 2) - (popup.clientHeight * top) - 10) + 'px';
			popup.style.left = main.globals.offset.get().x + point.position.left + point.size.width + heightTriangle + 'px';
			triangle.style.top = (top * 100) + "%";
		};

		// TODO redo if statements; redo
		if((fits.above || !fits.beneath) && fits.nextTo) {
			showAbove();
		} else if(fits.nextTo) {
			showBeneath();
		} else if(fits.left) {
			showLeft();
		} else if(fits.right) {
			showRight();
		} else {
			showAbove();
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

	var info_container = document.createElement("div");
	info_container.appendChild(title_html);
	info_container.appendChild(media_html);
	info_container.appendChild(info_html);

	var cell = document.createElement("div");
	var aligner = document.createElement("div");

	var close_button = helpers.createElement("span", "close_overlay", {
		"click": function() { this.hide(); }.bind(this),
		"touchend": function() { this.hide(); }.bind(this)
	});

	aligner.appendChild(info_container);
	cell.appendChild(aligner);

	popup.appendChild(cell);
	popup.appendChild(close_button);

	this.onHide = function() {
		popup.style.display = "none";
		return true;
	};

	this.onShowDesktop = this.onShowMobile = function() {
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

	var sidebar = helpers.createElement("div", "m4n-sidebar");
	var header = helpers.createElement("div", "m4n-sidebar-header");
	var close = helpers.createElement("div", "m4n-sidebar-close", {
		"click": function() { this.hide(true); }.bind(this),
		"touchend": function() { this.hide(true); }.bind(this)
	});

	header.appendChild(close);
	header.appendChild(title_html);

	var content = helpers.createElement("div", "m4n-sidebar-content");
	content.appendChild(media_html);
	content.appendChild(info_html);

	var footer = helpers.createElement("div", "m4n-sidebar-footer");
	var pagination = helpers.createElement("ul", "m4n-pagination");

	var previous = helpers.createElement("li", null, {
		"click": function() {
			this.hide(true);
			var new_popup;
			if(this.number != main.object.popups.getFirst().number) {
				new_popup = main.api.popup(self.number -1);
			} else {
				new_popup = main.api.popup(main.object.popups.getLast().number);
			}
			if(new_popup !== null) {
				new_popup.show(true);
			}
		}.bind(this)
	});

	var next = helpers.createElement("li", null, {
		"click": function() {
			this.hide(true);
			var new_popup;
			if(this.number != main.object.popups.getLast().number) {
				new_popup = main.api.popup(self.number + 1);
			} else {
				new_popup = main.api.popup(main.object.popups.getFirst().number);
			}
			if(new_popup !== null) {
				new_popup.show(true);
			}
		}.bind(this)
	});

	var clear = document.createElement("div");
	clear.style.clear = "both";

	pagination.appendChild(previous);
	pagination.appendChild(next);

	footer.appendChild(pagination);
	footer.appendChild(clear);

	sidebar.appendChild(header);
	sidebar.appendChild(content);
	sidebar.appendChild(footer);

	popup.appendChild(sidebar);

	this.onHide = function(force) {
		if(force === true) {
			popup.style.display = "none";
			return true;
		}
		return false;
	};

	this.onShowDesktop = this.onShowMobile = function() {
		popup.style.removeProperty("display");
		return true;
	};

	return popup;
};