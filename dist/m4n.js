/**
 * @file Maps4News Interactive Map
 * @copyright Maps4News 2016
 *
 * M4nInteractive 2.0.4
 */
var M4nInteractive = (function(options, container, callback) {
    "use strict";
    var main = this;

    /**
     * Do initial setup
     */
    (function(options) {
        main.startTime = new Date().getTime();

        if (!options.path) throw 'M4nInteractive Parameter \'path\' is missing';
        if (!container) throw 'M4nInteractive: No container was given';

        main.interact = options.interact || "scroll";
        main.environment = options.environment || "online";

        main.version = {
            map: '2.0',
            code: '2.0.4'
        }; // TODO Add version to json for verification

        main.dev = main.environment == 'development' || (options.debug && options.debug == "true");

        main.isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        main.isIframe = window.location !== window.parent.location;

        main.canvas = "m4n-" + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); // Unique ID for canvas

        main.url = main.json = '';
        switch (main.environment) {
            case 'development':
                main.url = location.href.split("/").slice(0, -1).join("/") + '/output/' + options.path + '/';
                main.json = main.url + 'map.json';
                break;
            case 'local':
                main.url = options.path.replace(/\/$/, '') + '/'; // Path to images
                main.json = main.url + 'map.json';
                break;
            default:
                main.url = 'https://' + main.environment + ".maps4news.com/output/" + options.path + '/';
                main.json = 'https://' + main.environment + ".maps4news.com/ia/" + main.version.map + "/?id=" + encodeURIComponent(options.path);
                break;
        }
    })(options);

    /**
     * A Collection of external APIs used and methods to initialize them
     */
    var externalAPIs = {
        youtube: {
            /**
             * Check if an api is needed
             */
            checkIfNeeded: function() {
                var needed = false;
                main.object.popups.list.forEach(function(item) {
                    if (item.media_type === "youtube") {
                        needed = true;
                        externalAPIs.youtube.download();
                        return false;
                    }
                });
                return needed;
            },
            /**
             * Download the YouTube API script
             */
            download: function() {
                if (typeof YT == 'undefined') {
                    var youtube = document.createElement('script');
                    youtube.src = "//www.youtube.com/player_api";
                    var script_tag = document.getElementsByTagName('script')[0];
                    script_tag.parentNode.insertBefore(youtube, script_tag);
                }
            },
            /**
             * Enable youtube control on the popups
             */
            enable: function() {
                if (main.object !== null && typeof YT !== 'undefined') {
                    main.object.popups.list.forEach(function(item) {
                        if (item.media_type === "youtube") {
                            item.youtube = new YT.Player(item.html_id + '-youtube');
                        }
                    });
                }
            }
        }
    };

    document.addEventListener("onYouTubeIframeAPIReady", externalAPIs.youtube.enable, false);

    /**
     * Fire a youtube api ready event
     * "onYouTubeIframeAPIReady" is a core function from the youtube api
     */
    window.onYouTubeIframeAPIReady = function() {
        document.dispatchEvent(new CustomEvent("onYouTubeIframeAPIReady", null));
    };

    /**
     * Download the JSON file
     */
    var request = new XMLHttpRequest();
    request.open('GET', main.json, true);
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            initializeM4n(request.responseText);
        } else if (request.status !== 200) {
            console.error("Something went wrong!", request);
        }
    };
    request.send();

    /**
     * Initialize the map
     * Parse the JSON file, create HTML elements,
     * Enable YouTube and event listeners
     */
    function initializeM4n(mapJson) {
        createHtmlElements();

        main.object = revive(mapJson);

        if (main.object.levels.count() > 1) {
            createZoomControls();
        }

        if (!container.hasPredefinedHeight) {
            var level = main.object.levels.getCurrent();
            main.object.canvas.height = container.clientWidth * (level.size.height / level.size.width);
        }

        for (var api in externalAPIs) {
            if (externalAPIs.hasOwnProperty(api)) {
                externalAPIs[api].checkIfNeeded();
            }
        }

        enableEventListeners();

        main.object.popups.generateHTML();
        main.api.reset();

        if (typeof callback === 'function') callback(returnObject);

        main.endTime = new Date().getTime();
        if (main.dev) {
            console.info("It took " + (main.endTime - main.startTime) + "ms to start up");
        }
    }

    /**
     * Activate the event listeners
     */
    function enableEventListeners() {
        main.object.canvas.addEventListener('mousedown', events.mouseDown);
        main.object.canvas.addEventListener('touchstart', events.touchStart);

        document.addEventListener('mouseup', events.mouseUp);
        document.addEventListener('touchend', events.touchEnd);

        document.addEventListener('mousemove', events.mouseMove);
        document.addEventListener('touchmove', events.touchMove);

        main.object.canvas.addEventListener('mousewheel', events.mouseWheel);
        main.object.canvas.addEventListener('DOMMouseScroll', events.mouseWheel);

        main.object.canvas.addEventListener('contextmenu', events.contextMenu);

        window.addEventListener('resize', events.resize);
        window.addEventListener('orientationchange', events.resize);
    }

    /**
     * Keep track of the canvas' transform
     * @param {object} ctx - the context
     */
    function trackTransforms(ctx) {
        var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        var xform = svg.createSVGMatrix();
        ctx.getTransform = function() {
            return xform;
        };

        var savedTransforms = [];
        var save = ctx.save;
        ctx.save = function() {
            savedTransforms.push(xform.translate(0, 0));
            return save.call(ctx);
        };

        var restore = ctx.restore;
        ctx.restore = function() {
            xform = savedTransforms.pop();
            return restore.call(ctx);
        };

        var scale = ctx.scale;
        ctx.scale = function(sx, sy) {
            xform = xform.scaleNonUniform(sx, sy);
            return scale.call(ctx, sx, sy);
        };

        var rotate = ctx.rotate;
        ctx.rotate = function(radians) {
            xform = xform.rotate(radians * 180 / Math.PI);
            return rotate.call(ctx, radians);
        };

        var translate = ctx.translate;
        ctx.translate = function(dx, dy) {
            xform = xform.translate(dx, dy);
            return translate.call(ctx, dx, dy);
        };

        var transform = ctx.transform;
        ctx.transform = function(a, b, c, d, e, f) {
            var m2 = svg.createSVGMatrix();
            m2.a = a;
            m2.b = b;
            m2.c = c;
            m2.d = d;
            m2.e = e;
            m2.f = f;
            xform = xform.multiply(m2);
            return transform.call(ctx, a, b, c, d, e, f);
        };

        var setTransform = ctx.setTransform;
        ctx.setTransform = function(a, b, c, d, e, f) {
            xform.a = a;
            xform.b = b;
            xform.c = c;
            xform.d = d;
            xform.e = e;
            xform.f = f;
            return setTransform.call(ctx, a, b, c, d, e, f);
        };

        var pt = svg.createSVGPoint();
        ctx.transformedPoint = function(x, y) {
            pt.x = x;
            pt.y = y;
            return pt.matrixTransform(xform.inverse());
        };
    }

    /**
     * Will build the map object from a json file
     * @param {string} string_json - The json string in which the map is defined
     */
    function revive(string_json) {
        var classes = {
            levels: Levels,
            level: Level,
            tiles: Tiles,
            tile: Tile,
            points: Points,
            point: Point,
            popup: Popup,
            popups: Popups
        };
        var json = JSON.parse(string_json, function(key, value) {
            if (value !== null) {
                if (key === "") {
                    return new Map(value);
                }
                if (value !== null) {
                    if (!value._type) {
                        return value;
                    } else {
                        if (classes[value._type]) {
                            return new classes[value._type](value);
                        } else {
                            console.error("Unknown class type in save: " + value._type);
                            return null;
                        }
                    }
                }
            }
        });

        /**
         * A Hack to add the level to every tile
         * TODO find a better way to do this
         */
        json.levels.list.forEach(function(level) {
            level.tiles.list.forEach(function(tile) {
                tile.level = level.level;
            });
        });
        return json;
    }

    /**
     * Create the necessary html elements
     */
    function createHtmlElements() {
        // Disable margin inside the iframe body
        if (main.isIframe) {
            document.body.style.margin = "0";
        }

        // Load css
        if (document.getElementById("m4n-style") === null) {
            var style = document.createElement("link");
            style.id = "m4n-style";
            style.rel = "stylesheet";
            style.type = "text/css";
            style.href = (function() {
                switch (options.environment) {
                    case 'development':
                        return location.href.split("/").slice(0, -1).join("/") + '/style.css';
                    case 'local':
                        return options.path + 'style.css';
                    default:
                        return '//' + options.environment + '.maps4news.com/ia/' + main.version.map + '/style.css';
                }
            })();
            document.head.appendChild(style);
        }

        // Reload custom css file
        var customStyle = document.getElementById("m4n-style-custom");
        if (customStyle !== null) {
            var newCustomStyle = document.createElement("link");
            newCustomStyle.id = "m4n-style-custom";
            newCustomStyle.rel = "stylesheet";
            newCustomStyle.type = "text/css";
            newCustomStyle.href = customStyle.href;

            document.head.removeChild(customStyle);
            document.head.appendChild(newCustomStyle);
        }

        // Create the canvas
        var canvas = document.getElementById(main.canvas);
        if (canvas !== null) {
            if (canvas.classList.contains("m4n-canvas")) {
                throw "Map already initialized for " + main.canvas;
            } else {
                main.canvas = main.canvas + "-" + Math.random().toString(36).substring(7);
                canvas = helpers.createElement("canvas", "m4n-canvas");
                canvas.id = main.canvas;
            }
        } else {
            canvas = helpers.createElement("canvas", "m4n-canvas");
            canvas.id = main.canvas;
        }

        if (main.interact == "smart") {
            var overlay = helpers.createElement("div", "timeout-overlay", {
                "click": function() {
                    hideOverlay();
                },
                "touchstart": function(e) {
                    main.globals.dragPosition = {
                        x: e.touches[0].clientX,
                        y: e.touches[0].clientY
                    };
                    main.globals.clickStart = {
                        x: e.touches[0].clientX,
                        y: e.touches[0].clientY
                    };
                },
                "touchmove": function(e) {
                    main.globals.dragPosition = {
                        x: e.touches[0].clientX,
                        y: e.touches[0].clientY
                    };
                },
                "touchend": function() {
                    if (helpers.validateTouchMoveClickMargin(main.globals.clickStart, main.globals.dragPosition)) {
                        hideOverlay();
                    }
                }
            });

            var hideOverlay = function() {
                overlay.style.display = "none";
                helpers.setInteractTime();
            };

            overlay.style.display = "block";
            main.timeoutOverlay = overlay;
            container.appendChild(overlay);
        }

        container.id = main.canvas + '-container';
        container.classList.add("m4n-container");
        container.style.height = "100%";
        container.style.width = "100%";
        container.hasPredefinedHeight = container.clientHeight !== 0;

        var popupContainer = document.createElement("div");
        popupContainer.id = main.canvas + "-popup-container";

        container.appendChild(popupContainer);
        container.appendChild(canvas);

        canvas.height = container.clientHeight;
        canvas.width = container.clientWidth;
    }

    /**
     * Create the zoom controls
     */
    function createZoomControls() {
        // Zoom controls
        var zoom_container = helpers.createElement('div', 'm4n-zoom-container');
        var zoom_control_in = helpers.createElement('div', 'm4n-zoom-button', {
            'click': function() {
                if (!zoom_control_in.classList.contains('disabled')) {
                    main.api.zoom.in();
                }
            }
        });
        var zoom_control_out = helpers.createElement('div', 'm4n-zoom-button', {
            'click': function() {
                if (!zoom_control_out.classList.contains('disabled')) {
                    main.api.zoom.out();
                }
            }
        });

        addEventListener("level_changed", function() {
            var currentLevel = main.object.levels.getCurrent();

            zoom_control_out.classList.remove('disabled');
            zoom_control_in.classList.remove('disabled');

            if (currentLevel.level == main.object.levels.getHighest().level) {
                zoom_control_out.classList.add('disabled');
            } else if (currentLevel.level == main.object.levels.getLowest().level) {
                zoom_control_in.classList.add('disabled');
            }
        });

        zoom_container.style.zIndex = main.object.canvas.style.zIndex + 1;

        zoom_container.appendChild(zoom_control_in);
        zoom_container.appendChild(zoom_control_out);

        container.appendChild(zoom_container);
    }

    /**
     * Custom event listener service
     * @param {string} event - the event that callback should be triggered
     * @param {function} callback - the callback method
     * @returns {number} The listener id
     */
    function addEventListener(event, callback) {
        if (typeof event !== 'string') {
            throw "event must be a string; " + event + " given";
        }
        if (typeof callback !== 'function') {
            throw "callback must be a function";
        }

        if (!main.dispatchEvents[event]) {
            main.dispatchEvents[event] = [];
        }

        if (main.dev) {
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
        if (typeof event !== 'string') {
            throw "event must be a string; " + event + " given";
        }
        if (typeof id !== 'number') {
            throw "id must be a number; " + id + " given";
        }

        if (!main.dispatchEvents[event]) {
            throw "unknown event";
        }
        if (!main.dispatchEvents[event][id - 1]) {
            throw "unknown listener";
        }

        if (main.dev) {
            console.log("Event listener for event \"" + event + "\" removed", main.dispatchEvents[event][id - 1]);
        }

        delete main.dispatchEvents[event][id - 1];
    }

    /**
     * Trigger a custom event
     * @param {string} event - the name of the event that should be triggered
     * @param {object} object - the parameter for the callback function
     */
    function triggerEvent(event, object) {
        if (main.dispatchEvents[event]) {
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

    /**
     * The interactive api
     * @type {object}
     */
    main.api = {

        /**
         * Get a specific popup object
         * @param {number} i - number of the popup
         * @returns {object|null} The popup api object
         */
        popup: function(i) {
            var popup = main.object.popups.get(i);
            if (popup === null) {
                throw "Popup " + i + " not found";
            }
            return popup.getApiObject();
        },

        /**
         * Get all popups
         * @returns {object} The popups api object
         */
        popups: function() {
            return main.object.popups.getApiObject();
        },

        /**
         * Get a specific level object
         * @param {number} i - The number of the level
         * @returns {object|null} The level api object
         */
        level: function(i) {
            var level = main.object.levels.getLevel(i);
            return level.getApiObject() || null;
        },

        /**
         * Get all levels
         *
         * @returns {object} The levels api object
         */
        levels: function() {
            return main.object.levels.getApiObject();
        },

        /**
         * Resets the map to its initial state
         */
        reset: function() {
            var current = main.object.levels.getIdealLevel();

            main.globals.offset.changeTo(-((current.size.width / 2) - (main.object.canvas.width / 2)), -((current.size.height / 2) - (main.object.canvas.height / 2)));

            main.object.levels.change(current.level);
        },

        /**
         * Try to refit the canvas inside the container
         */
        refit: function() {
            events.resize();
        },

        /**
         * Zoom functions
         */
        zoom: {

            /**
             * Zoom to a specific level
             * @param {number} value - number of the level
             */
            to: function(value) {
                value = typeof value === 'number' ? value : 0;
                var offset = {
                    x: main.object.canvas.clientWidth / 2,
                    y: main.object.canvas.clientHeight / 2
                };
                var levels = main.object.levels.getLevels([main.object.levels.current, value]);
                if (levels[1] !== null) {
                    main.globals.offset.changeTo(
                        offset.x - (levels[1].size.width / levels[0].size.width) *
                        (offset.x - main.globals.offset.get().x),
                        offset.y - (levels[1].size.height / levels[0].size.height) *
                        (offset.y - main.globals.offset.get().y)
                    );
                    main.object.levels.change(levels[1].level);
                }
            },

            /**
             * Zoom in 1 level
             */
            in : function() {
                this.to(main.object.levels.current + 1);
            },

            /**
             * Zoom out 1 level
             */
            out: function() {
                this.to(main.object.levels.current - 1);
            }
        },

        /**
         * Move functions
         */
        move: {

            /**
             * Move the map (40px * factor) to the left
             * @param {number} factor
             */
            left: function(factor) {
                var level = main.object.levels.getCurrent();
                main.globals.offset.changeBy(-40 * (factor || 1), 0);
                level.draw();
            },

            /**
             * Move the map (40px * factor) to the right
             * @param {number} factor
             */
            right: function(factor) {
                var level = main.object.levels.getCurrent();
                main.globals.offset.changeBy(40 * (factor || 1), 0);
                level.draw();
            },

            /**
             * Move the map (40px * factor) up
             * @param {number} factor
             */
            up: function(factor) {
                var level = main.object.levels.getCurrent();
                main.globals.offset.changeBy(0, -40 * (factor || 1));
                level.draw();
            },

            /**
             * Move the map (40px * factor) down
             * @param {number} factor
             */
            down: function(factor) {
                var level = main.object.levels.getCurrent();
                main.globals.offset.changeBy(0, 40 * (factor || 1));
                level.draw();
            }
        }
    };

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

        for (var key in value) {
            if (value.hasOwnProperty(key)) {
                this[key] = value[key];
            }
        }
    };

    /**
     * The level class
     * @class
     * @param {object} level - The level json object
     */
    var Level = function(level) {
        this._type = "level";

        this.is_loaded = false;
        this.tiles = {};

        if (level !== false) {
            for (var property in level) {
                if (level.hasOwnProperty(property)) {
                    this[property] = level[property];
                }
            }
        }
    };

    /**
     *
     *
     * @returns {object}
     */
    Level.prototype.getApiObject = function() {
        return {
            level: this.level,
            isLoaded: this.is_loaded,
            changeTo: function() {
                main.object.levels.change(this.level);
            }.bind(this),
            load: function() {
                this.load();
            }.bind(this)
        };
    };

    /**
     * Check if all tiles have been loaded
     */
    Level.prototype.checkLoaded = function() {
        var loadedTiles = 0;

        this.tiles.list.forEach(function(tile) {
            if (tile.state > 1) {
                loadedTiles++;
            }
        });

        if (loadedTiles === this.tiles.list.length) {
            this.is_loaded = true;
            triggerEvent("level_loaded", this.getApiObject());
        }
    };

    /**
     * Draws a level on screen
     */
    Level.prototype.draw = function() {
        main.object.popups.hideAll();

        main.object.context.clearRect(0, 0, main.object.canvas.width, main.object.canvas.height);

        main.globals.offset.changeTo(
            this.getBounds(true, main.globals.offset.get().x),
            this.getBounds(false, main.globals.offset.get().y)
        );

        this.tiles.draw();

        main.object.levels.setCurrent(this.level);
        triggerEvent("level_drawn", this.getApiObject());
    };

    /**
     *  Load tiles in the background
     */
    Level.prototype.load = function() {
        if (!this.is_loaded) {
            this.tiles.load();
        }
    };

    /**
     * Checks if the cursor is on the map (when there's whitespace in the canvas)
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @returns {boolean} Is the cursor on the map?
     */
    Level.prototype.isOn = function(x, y) {
        return (
            x > main.globals.offset.get().x &&
            x < this.size.width + main.globals.offset.get().x &&
            y > main.globals.offset.get().y &&
            y < this.size.height + main.globals.offset.get().y
        );
    };

    /**
     * Checks if the user will drag the map of the side of the canvas and prevents this
     * @param {boolean} forXAxis - If the call to this method is intended for use with the x axis
     * @param {number} movement - The new location the user dragged the map to
     * @returns {number} The corrected new location for the map
     */
    Level.prototype.getBounds = function(forXAxis, movement) {
        var offset = forXAxis ?
            main.object.canvas.clientWidth - this.size.width :
            main.object.canvas.clientHeight - this.size.height;
        return Math.max(Math.min(offset, 0), Math.min(Math.max(offset, 0), movement));
    };
    /**
     * The levels class
     * @class
     * @param {Level[]} levels - A list of level objects
     */
    var Levels = function(levels) {
        this._type = "levels";
        this.current = 0;

        if (levels !== false) {
            for (var property in levels) {
                if (levels.hasOwnProperty(property)) {
                    this[property] = levels[property];
                }
            }
        }
    };

    /**
     * Get the ideal level for the current canvas size
     * @returns {number} The level number
     */
    Levels.prototype.getIdealLevel = function() {
        var level = this.getLevel(0);

        this.getAllExcept(0).forEach(function(item) {
            if (level != null) {
                var difference, prev_difference;
                if (main.object.canvas.clientWidth >= main.object.canvas.clientHeight) { // If wider
                    difference = Math.abs(main.object.canvas.width - item.requested_area.size.width);
                    prev_difference = Math.abs(main.object.canvas.width - level.requested_area.size.width);
                } else { // If higher
                    difference = Math.abs(main.object.canvas.height - item.requested_area.size.height);
                    prev_difference = Math.abs(main.object.canvas.height - level.requested_area.size.height);
                }

                if (difference < prev_difference) {
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
            levels: levels
        };
    };

    /**
     * Change the current map
     * @param {number} level - The level to change to
     */
    Levels.prototype.setCurrent = function(level) {
        if (this.current !== level) {
            this.current = level;
        }
    };

    /**
     * Get a specific level
     * @param {number} level - The level to return
     * @returns {Level|null} the requested level object or null if it wasn't found
     */
    Levels.prototype.getLevel = function(level) {
        for (var i = 0; i < main.object.levels.list.length; i++) {
            if (main.object.levels.list[i].level == level) {
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

        for (var i = 0; i < rLevels.length; i++) {
            levels.push(this.getLevel(rLevels[i]));
        }
        return levels;
    };

    /**
     * Get all levels except the given ones
     * @param {number|Array} numbers - the number not to return
     */
    Levels.prototype.getAllExcept = function(numbers) {
        if (typeof numbers == "number") {
            numbers = [numbers];
        }

        var levels = [];
        this.list.forEach(function(item) {
            if (numbers.indexOf(item.level) === -1) {
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
            if (item.level < level.level) {
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
            if (item.level > level.level) {
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
        if (levels[0] !== null) {
            var changeTo = function(level) {
                window.requestAnimationFrame(function() {
                    level.draw();
                    triggerEvent("level_changed", level.getApiObject());
                });
            };

            if (!levels[0].is_loaded) {
                levels[0].load();
                var eventId = addEventListener("level_loaded", function(e) {
                    if (e.level == level) {
                        changeTo(levels[0]); // TODO draw safety check
                        removeEventListener("level_loaded", eventId);
                    }
                });
            } else {
                changeTo(levels[0]);
            }

            if (levels[1] !== null) {
                levels[1].load();
            }
            if (levels[2] !== null) {
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
    /**
     * The point class
     * @class
     * @param {object} point - The json point object
     */
    var Point = function(point) {
        this._type = "point";

        if (point !== false) {
            for (var property in point) {
                if (point.hasOwnProperty(property)) {
                    this[property] = point[property];
                }
            }
        }
        // TODO refactor to support all formats
        this.position = {
            left: Math.min(this.shape[0].x, this.shape[1].x, this.shape[2].x, this.shape[3].x),
            top: Math.min(this.shape[0].y, this.shape[1].y, this.shape[2].y, this.shape[3].y)
        };
        this.size = {
            width: Math.max(this.shape[0].x, this.shape[1].x, this.shape[2].x, this.shape[3].x) - this.position.left,
            height: Math.max(this.shape[0].y, this.shape[1].y, this.shape[2].y, this.shape[3].y) - this.position.top
        };
    };

    /**
     * Draw a border around a point
     */
    Point.prototype.draw = function() {
        main.object.context.strokeRect(
            this.position.left + main.globals.offset.get().x,
            this.position.top + main.globals.offset.get().y,
            this.size.width,
            this.size.height
        );
    };

    /**
     * Check if the user clicked on a specific point
     * @param {number} x - The x value from the user
     * @param {number} y - The y value from the user
     * @returns {boolean} Did the user click on a point?
     */
    Point.prototype.isOn = function(x, y) {
        return (
            x > this.position.left + main.globals.offset.get().x &&
            x < this.position.left + this.size.width + main.globals.offset.get().x &&
            y > this.position.top + main.globals.offset.get().y &&
            y < this.position.top + this.size.height + main.globals.offset.get().y
        );
    };

    /**
     * Get info about the current position of a point
     * @returns {object}
     */
    Point.prototype.location = function() {
        var object = {
            left: this.position.left + main.globals.offset.get().x,
            top: this.position.top + main.globals.offset.get().y,
            right: -(this.position.left + main.globals.offset.get().x - main.object.canvas.clientWidth + this.size.width),
            bottom: -(this.position.top + main.globals.offset.get().y - main.object.canvas.clientHeight + this.size.height)
        };

        object.location = {
            x: (function() {
                if (object.left < 5) {
                    return "left";
                } else if (object.right < 5) {
                    return "right";
                }
                return "center";
            })(),
            y: (function() {
                if (object.top < 5) {
                    return "above";
                } else if (object.bottom < 5) {
                    return "beneath";
                }
                return "center";
            })()
        };

        return object;
    };
    /**
     * The points class
     * @class
     * @param {Point[]} points - A list of point classes
     */
    var Points = function(points) {
        this._type = "points";

        if (points !== false) {
            for (var property in points) {
                if (points.hasOwnProperty(property)) {
                    this[property] = points[property];
                }
            }
        }
    };

    /**
     * Draws a border around the points on screen
     */
    Points.prototype.draw = function() {
        this.list.forEach(function(element) {
            element.draw();
        });
    };

    /**
     * Returns the point a user clicked on
     * @param {number} x - The x value from the user
     * @param {number} y - The y value from the user
     * @returns {Point|null} The point the user clicked on
     */
    Points.prototype.hitAPoint = function(x, y) {
        var point = null;

        this.list.forEach(function(item) {
            if (item.isOn(x, y)) {
                point = item;
                return false;
            }
        });
        return point;
    };

    /**
     * Get a specific point
     * @param {number} number - The number of a point
     * @returns {Point|null} The requested point
     */
    Points.prototype.get = function(number) {
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i].number == number) {
                return this.list[i];
            }
        }
        return null;
    };
    /**
     * The popup class
     * @class
     * @param {object} popup - The json popup object
     */
    var Popup = function(popup) {
        this._type = "popup";

        this.on_screen = false;

        if (popup !== false) {
            for (var property in popup) {
                if (popup.hasOwnProperty(property)) {
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
        if (!this.on_screen) {
            // Hide all other popups (including sidebars)
            main.object.popups.hideAll(true);

            // Get the clicked point
            var point = main.object.levels.getCurrent().points.get(this.number);

            // Center the map
            if (center === true) {
                helpers.moveTo(point.position.left + (point.size.width / 2), point.position.top + (point.size.height / 2));
            } else {
                var object = {
                    x: 0,
                    y: 0
                };

                var location = point.location();
                if (location.location.x !== "center" || location.location.y !== "center") {
                    if (location.left < 5) {
                        object.x = 5 - location.left;
                    } else if (location.right < 5) {
                        object.x = -(5 - location.right);
                    }

                    if (location.top < 5) {
                        object.y = 5 - location.top;
                    } else if (location.bottom < 5) {
                        object.y = -(5 - location.bottom);
                    }

                    if (object.x !== 0 || object.y !== 0) {
                        helpers.moveBy(object.x, object.y);
                    }
                }
            }

            var wasShown = (function() {
                if (main.isMobile) {
                    return this.onShowMobile(point);
                } else {
                    return this.onShowDesktop(point);
                }
            }.bind(this))();

            if (wasShown) {
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
        if (this.on_screen) {
            if (this.onHide(force)) {
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
        if (this.on_screen) {
            this.hide(force);
        } else {
            this.show(center);
        }
    };

    /**
     * Stop the playing video
     */
    Popup.prototype.stopVideo = function() {
        switch (this.media_type) {
            case "youtube":
                if (
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
            switch (this.media_type) {
                case "youtube":
                    if (
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
        } catch (e) {
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

        switch (this.media_type) {
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

        switch (main.object.settings.placement) {
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
            if ((fits.above || !fits.beneath) && fits.nextTo) {
                showAbove();
            } else if (fits.nextTo) {
                showBeneath();
            } else if (fits.left) {
                showLeft();
            } else if (fits.right) {
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
            "click": function() {
                this.hide();
            }.bind(this),
            "touchend": function() {
                this.hide();
            }.bind(this)
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
            "click": function() {
                this.hide(true);
            }.bind(this),
            "touchend": function() {
                this.hide(true);
            }.bind(this)
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
                if (this.number != main.object.popups.getFirst().number) {
                    new_popup = main.api.popup(self.number - 1);
                } else {
                    new_popup = main.api.popup(main.object.popups.getLast().number);
                }
                if (new_popup !== null) {
                    new_popup.show(true);
                }
            }.bind(this)
        });

        var next = helpers.createElement("li", null, {
            "click": function() {
                this.hide(true);
                var new_popup;
                if (this.number != main.object.popups.getLast().number) {
                    new_popup = main.api.popup(self.number + 1);
                } else {
                    new_popup = main.api.popup(main.object.popups.getFirst().number);
                }
                if (new_popup !== null) {
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
            if (force === true) {
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
    /**
     * The popups class
     * @class
     * @param {Popup[]} popups - A list of popups
     */
    var Popups = function(popups) {
        this._type = "popups";

        if (popups !== false) {
            for (var property in popups) {
                if (popups.hasOwnProperty(property)) {
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
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i].number == number) {
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
        return this.list[this.list.length - 1];
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
        var current = null;
        this.getAll().forEach(function(item) {
            if (item.on_screen) {
                current = item;
                return false;
            }
        });
        return current;
    };
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

        if (tile !== false) {
            for (var property in tile) {
                if (tile.hasOwnProperty(property)) {
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

            if (this.isVisible(left, top, this.size.width, this.size.height)) {
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
            main.object.context.lineTo(-10 + this.position.left + this.size.width + offset.x, -10 + this.position.top + this.size.height + offset.y);
            main.object.context.stroke();

            main.object.context.beginPath();
            main.object.context.moveTo(10 + this.position.left + offset.x, -10 + this.position.top + this.size.height + offset.y);
            main.object.context.lineTo(-10 + this.position.left + this.size.width + offset.x,
                10 + this.position.top + offset.y);
            main.object.context.stroke();
            this.state = 3;
        }.bind(this);

        switch (this.state) {
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
    /**
     * The tiles class
     * @class
     * @param {Tile[]} tiles - A list of tiles
     */
    var Tiles = function(tiles) {
        this._type = "tiles";

        if (tiles !== false) {
            for (var property in tiles) {
                if (tiles.hasOwnProperty(property)) {
                    this[property] = tiles[property];
                }
            }
        }
    };

    /**
     * Draws every tile on screen
     */
    Tiles.prototype.draw = function() {
        this.list.forEach(function(element) {
            element.draw();
        });
    };

    /**
     * Downloads every tile
     */
    Tiles.prototype.load = function() {
        this.list.forEach(function(element) {
            if (element.state === element.loadingStates.initial) {
                element.load();
            }
        });
    };

    /**
     * Get the number of tiles on this level
     *
     * @returns {number} the number of tiles
     */
    Tiles.prototype.count = function() {
        return this.list.length;
    };

    /**
     * Get all tiles
     *
     * @returns {Tile[]} all tile objects
     */
    Tiles.prototype.getAll = function() {
        return this.list;
    };

    /**
     * Get a specific tile
     *
     * @param {number} index - the index for the popup
     * @returns {Tile} the specific tile
     */
    Tiles.prototype.get = function(index) {
        return this.list[index];
    };

    /**
     * The user interaction events
     * @type {object}
     */
    var events = {

        /**
         * When the canvas is clicked
         * @param {object} e - The event object
         */
        mouseDown: function(e) {
            e.preventDefault();
            if (main.object.levels.getCurrent().isOn(e.layerX, e.layerY)) {
                helpers.doubleTap();
                main.globals.clickStart = {
                    x: e.pageX,
                    y: e.pageY
                };
                main.globals.dragPosition = {
                    x: e.pageX,
                    y: e.pageY
                };
                if (e.which === 1) {
                    main.globals.isDown = true;
                }
            }
        },

        /**
         * When the user starts touching the canvas
         * @param {object} e - The event object
         */
        touchStart: function(e) {
            e.preventDefault();
            if (main.object.levels.getCurrent().isOn(e.touches[0].clientX, e.touches[0].clientY)) {
                helpers.doubleTap();
                main.globals.isDown = true;
                main.globals.dragPosition = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };
                main.globals.clickStart = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };
            }

            // Pinch to zoom
            if (e.touches.length == 2) {
                main.globals.isScaling = true;
                // main.object.context.save();
                main.globals.startDistance = Math.sqrt(
                    (e.touches[0].pageX - e.touches[1].pageX) * (e.touches[0].pageX - e.touches[1].pageX) +
                    (e.touches[0].pageY - e.touches[1].pageY) * (e.touches[0].pageY - e.touches[1].pageY));
            }

            // Android zoom
            if (e.touches.length == 1 && main.globals.doubleTap === true) {
                main.globals.isScaling = true;
                // main.object.context.save();
                main.globals.startDistance = 1;

                main.globals.lastPos = {
                    x: (main.globals.clickStart.x + e.touches[0].pageX) / 2,
                    y: (main.globals.clickStart.y + e.touches[0].pageY) / 2
                };
            }
        },

        /**
         * When the user lifts the mouse
         * @param e - The event object
         */
        mouseUp: function(e) {
            e.preventDefault();
            if (e.target.id == main.canvas) {
                helpers.setInteractTime();
                main.globals.isDown = false;
                if (e.pageX == main.globals.clickStart.x && e.pageY == main.globals.clickStart.y) {
                    var point = main.object.levels.getCurrent().points.hitAPoint(e.layerX, e.layerY);
                    if (point !== null && e.which === 1) {
                        main.object.canvas.style.cursor = "pointer";
                        main.object.popups.get(point.number).show();
                    } else {
                        if (main.globals.doubleTap === true) {
                            events.dblclick(e);
                            main.globals.doubleTap = null;
                        } else {
                            main.object.canvas.style.cursor = "auto";
                            main.object.popups.hideAll();
                        }
                    }
                }
            }
        },

        /**
         * When the user lifts his/her finger
         * @param e - The event object
         */
        touchEnd: function(e) {
            e.preventDefault();
            main.globals.isDown = false;
            if (e.target.id == main.canvas) {
                helpers.setInteractTime();
                if (helpers.validateTouchMoveClickMargin(main.globals.clickStart, main.globals.dragPosition) && !main.globals.isScaling) {
                    var point = main.object.levels.getCurrent().points
                        .hitAPoint(main.globals.dragPosition.x, main.globals.dragPosition.y);
                    if (point !== null) {
                        main.object.popups.get(point.number).show();
                    } else {
                        if (main.globals.doubleTap === true) {
                            events.dbltap(e);
                            main.globals.doubleTap = null;
                        } else {
                            main.object.popups.hideAll();
                        }
                    }
                } else {
                    if (main.globals.doubleTap === true) {
                        main.globals.doubleTap = null;
                    }
                }
            }
            if (main.globals.isScaling) {
                var differrence = main.globals.new_distance - main.globals.startDistance;
                var steps = Math.round(Math.abs(differrence) / 100);

                var currentLevel = main.object.levels.getCurrent();
                var newLevel = main.object.levels.getLevel(currentLevel.level + function() {
                    if (differrence > 0) {
                        return steps;
                    } else {
                        return -steps;
                    }
                }());

                while (newLevel === null) {
                    steps--;
                    newLevel = main.object.levels.getLevel(newLevel);
                }

                if (steps > 0) {
                    var levels = [currentLevel, newLevel];
                    var pinchCentre = {
                        x: main.globals.lastPos.x,
                        y: main.globals.lastPos.y
                    };

                    main.globals.offset.changeTo(
                        pinchCentre.x - (levels[1].size.width / levels[0].size.width) * (pinchCentre.x - main.globals.offset.get().x),
                        pinchCentre.y - (levels[1].size.height / levels[0].size.height) * (pinchCentre.y - main.globals.offset.get().y)
                    );
                    main.object.levels.change(newLevel.level);


                    main.globals.startDistance = 0;
                    main.globals.isScaling = false;
                }
                main.object.context.setTransform(1, 0, 0, 1, 0, 0);
                main.object.levels.getCurrent().draw();
            }
        },

        /**
         * When the user moves the mouse
         * @param e - The event object
         */
        mouseMove: function(e) {
            var currentLevel = main.object.levels.getCurrent();
            if (main.globals.isDown && helpers.isInteracting()) {
                helpers.setInteractTime();
                e.preventDefault();

                main.object.canvas.style.cursor = "all-scroll";

                main.globals.offset.changeBy(
                    e.pageX - main.globals.dragPosition.x,
                    e.pageY - main.globals.dragPosition.y
                );
                main.globals.dragPosition = {
                    x: e.pageX,
                    y: e.pageY
                };

                currentLevel.draw();
            } else if (e.target.id == main.canvas) {
                var point = currentLevel.points.hitAPoint(e.layerX, e.layerY);

                main.object.canvas.style.cursor = (point !== null ? "pointer" : "auto");

                if (main.object.settings.eventType == "mouseenter") {
                    if (point !== null) {
                        main.object.popups.get(point.number).show();
                    } else {
                        main.object.popups.hideAll();
                    }
                }
            }
        },

        /**
         * When the user moves his/her finger
         * @param e - The event object
         */
        touchMove: function(e) { // TODO not preventdefault when interacting
            if (main.globals.isDown && helpers.isInteracting()) {
                e.preventDefault();

                helpers.setInteractTime();

                var fingers = e.touches;
                var currentLevel = main.object.levels.getCurrent();

                if (fingers.length === 1) {
                    var finger = fingers[0];
                    var new_offset = {
                        x: main.globals.offset.get().x + finger.clientX - main.globals.dragPosition.x,
                        y: main.globals.offset.get().y + finger.clientY - main.globals.dragPosition.y
                    };
                    if (new_offset.x !== main.globals.offset.get().x && new_offset.y !== main.globals.offset.get().y) {
                        if (main.globals.doubleTap === true && main.globals.isScaling) { // if the user has double tapped and is holding down his/her finger
                            main.globals.new_distance = Math.sqrt(
                                (main.globals.clickStart.x - fingers[0].pageX) * (main.globals.clickStart.x - fingers[0].pageX) +
                                (main.globals.clickStart.y - fingers[0].pageY) * (main.globals.clickStart.y - fingers[0].pageY)
                            );

                            var gPz = helpers.gesturePinchZoom(e) / 40;
                            if (gPz < 1 && gPz > -1) {
                                main.globals.distance = gPz;
                                helpers.zoom(gPz);
                            }
                        } else { // Drag the map
                            main.globals.offset.changeTo(new_offset.x, new_offset.y);
                            currentLevel.draw();
                        }
                        main.globals.dragPosition = {
                            x: finger.clientX,
                            y: finger.clientY
                        };
                    }
                } else if (fingers.length === 2) {
                    if (main.globals.isScaling === true) {
                        // Todo: improve delta calculation
                        main.globals.new_distance = Math.sqrt(
                            (fingers[0].pageX - fingers[1].pageX) * (fingers[0].pageX - fingers[1].pageX) +
                            (fingers[0].pageY - fingers[1].pageY) * (fingers[0].pageY - fingers[1].pageY)
                        );
                        main.globals.lastPos = {
                            x: (fingers[0].pageX + fingers[1].pageX) / 2,
                            y: (fingers[0].pageY + fingers[1].pageY) / 2
                        };

                        var gPz = helpers.gesturePinchZoom(e) / 40;
                        if (gPz < 1 && gPz > -1) {
                            main.globals.distance = gPz;
                            helpers.zoom(gPz);
                        }
                    }
                }
            }
        },

        /**
         * When the user scrolls
         * @param e - The event object
         */
        mouseWheel: function(e) {
            var willScroll = (function() {
                switch (main.interact) {
                    case "scroll":
                        return !e.ctrlKey;
                    case "smart":
                        return helpers.isInteracting();
                    default:
                        return e.ctrlKey;
                }
            })();

            if (e.target.id == main.canvas && willScroll) {
                helpers.setInteractTime();
                clearTimeout(main.globals.scroll.timeout);
                e.preventDefault();

                // TODO improve
                main.globals.scroll.value += (function() {
                    var w = e.wheelDelta,
                        d = e.detail;
                    if (d) {
                        if (w) {
                            return w / d / 40 * d > 0 ? 1 : -1;
                        } else {
                            return -d / 3;
                        }
                    }
                    return w / 120;
                })();

                var direction = main.globals.scroll.value > 1 ? 1 : main.globals.scroll.value < -1 ? -1 : 0;
                if (direction !== 0) {
                    main.globals.scroll.value = 0;
                    var levels = main.object.levels.getLevels([main.object.levels.current, main.object.levels.current + direction]);

                    if (levels[1] !== null) {
                        main.globals.offset.changeTo(
                            e.layerX - (levels[1].size.width / levels[0].size.width) * (e.layerX - main.globals.offset.get().x),
                            e.layerY - (levels[1].size.height / levels[0].size.height) * (e.layerY - main.globals.offset.get().y)
                        );
                        main.object.levels.change(levels[0].level + direction);
                    }
                }
            }
        },

        /**
         * When the user double clicks
         * @param e - The event object
         */
        dblclick: function(e) {
            if (
                e.target.id == main.canvas && main.object.levels.getCurrent().isOn(e.layerX, e.layerY) && helpers.isInteracting()
            ) {
                helpers.setInteractTime();
                var currentLevel = main.object.levels.getCurrent();
                var newLevel = main.object.levels.getLevel(currentLevel.level + function() {
                    return e.which == 1 ? 1 : -1;
                }());

                if (newLevel !== null) {
                    main.globals.offset.changeTo(
                        e.layerX - (newLevel.size.width / currentLevel.size.width) * (e.layerX - main.globals.offset.get().x),
                        e.layerY - (newLevel.size.height / currentLevel.size.height) * (e.layerY - main.globals.offset.get().y)
                    );
                    main.object.levels.change(newLevel.level);
                }
            }
        },

        /**
         * When the user double taps
         * @param e - The event object
         */
        dbltap: function(e) {
            if (e.target.id == main.canvas && main.object.levels.isOn(main.globals.dragPosition.x, main.globals.dragPosition.y)) {
                helpers.setInteractTime();
                var levels = main.object.levels.getLevels([main.object.levels.current, main.object.levels.current + 1]);
                if (levels[1] !== null) {
                    main.globals.offset.changeTo(
                        main.globals.dragPosition.x - (levels[1].size.width / levels[0].size.width) * (main.globals.dragPosition.x - main.globals.offset.get().x),
                        main.globals.dragPosition.y - (levels[1].size.height / levels[0].size.height) * (main.globals.dragPosition.y - main.globals.offset.get().y)
                    );
                    main.object.levels.change(main.object.levels.current + 1);
                }
            }
        },

        /**
         * When the user triggers the context menu (right click)
         * @param e - The event object
         */
        contextMenu: function(e) {
            e.preventDefault();
        },

        /**
         * When the document gets resized
         */
        resize: function() {
            var fullscreen = document.webkitFullscreenElement || document.msFullscreenElement || document.mozFullScreenElement;
            if (fullscreen) {
                if ([fullscreen.id.indexOf("-youtube"), fullscreen.id.indexOf("-video")].indexOf(-1) > -1) {
                    main.globals.videoFullscreen.value = true;
                    main.globals.videoFullscreen.noEvents = 0;
                }
            }

            if (!main.globals.videoFullscreen.value && (new Date().getTime() - main.globals.videoFullscreen.date > 3000 || main.globals.videoFullscreen.noEvents > 1)) {
                var currentLevel = main.object.levels.getCurrent();
                var current = {
                    w: main.object.canvas.width,
                    h: main.object.canvas.height
                };

                main.object.canvas.height = main.object.container.clientHeight;
                main.object.canvas.width = main.object.container.clientWidth;

                main.globals.offset.changeBy(-((current.w - main.object.canvas.width) / 2), -((current.h - main.object.canvas.height) / 2));
                currentLevel.draw();
            }

            if (!fullscreen) {
                main.globals.videoFullscreen = {
                    value: false,
                    date: new Date().getTime(),
                    noEvents: main.globals.videoFullscreen.noEvents + 1
                };
            }
        }
    };

    main.globals = {
        // Keep track of the cursor; if it's down (clicked)
        isDown: false,
        // If the user is scaling
        isScaling: false,
        // The location of the initial click
        clickStart: {
            x: 0,
            y: 0
        },
        // The location of the last move event
        dragPosition: {
            x: 0,
            y: 0
        },
        // The offset of the map on screen
        mapOffset: {
            x: 0,
            y: 0
        },
        // If the user has double tapped or clicked
        doubleTap: null,
        // If a video prompted the fullscreen and when
        videoFullscreen: {
            value: false,
            date: null,
            noEvents: 2
        },
        //
        scroll: {
            value: 0,
            timeout: null
        },
        //
        startDistance: 0,
        //
        scaleFactor: 1.1,
        //
        lastPos: {
            x: 0,
            y: 0
        },
        //
        interact: {
            isInteracting: false,
            timer: null
        },

        // mapOffset helper functions
        offset: {
            changeBy: function(x, y) {
                main.globals.mapOffset.x += x;
                main.globals.mapOffset.y += y;
            },
            changeTo: function(x, y) {
                main.globals.mapOffset = {
                    x: x,
                    y: y
                };
            },
            get: function() {
                return main.globals.mapOffset;
            }
        }
    };

    /**
     * Helpers methods
     * @type {object}
     */
    var helpers = {

        /**
         * Moves the canvas to a specific location
         * @param {number} x - the x value (map offset)
         * @param {number} y - the y value (map offset)
         */
        moveTo: function(x, y) {
            main.globals.offset.changeTo(-(x - (main.object.canvas.clientWidth / 2)), -(y - (main.object.canvas.clientHeight / 2)));

            main.object.levels.getCurrent().draw();
        },

        /**
         * Moves the canvas by a specific number of pixels
         * @param {number} x - the x value (map offset)
         * @param {number} y - the y value (map offset)
         */
        moveBy: function(x, y) {
            main.globals.offset.changeBy(x, y);
            main.object.levels.getCurrent().draw();
        },

        /**
         * Help set value of double (tap|click)
         */
        doubleTap: function() {
            main.globals.doubleTap =
                main.globals.doubleTap !== null && new Date().getTime() - main.globals.doubleTap <= 250 ?
                true : new Date().getTime();
        },

        /**
         * Returns the distance between two numbers
         * @param {object} event - the event object
         * @returns {number|boolean} Distance between the fingers
         */
        gesturePinchZoom: function(event) {
            var zoom = false;

            if (event.targetTouches.length >= 2) {
                var p1 = event.targetTouches[0];
                var p2 = event.targetTouches[1];
                var zoomScale = Math.sqrt(Math.pow(p2.pageX - p1.pageX, 2) + Math.pow(p2.pageY - p1.pageY, 2)); // Euclidean distance

                if (this.lastZoomScale) {
                    zoom = zoomScale - this.lastZoomScale;
                }
                this.lastZoomScale = zoomScale;
            }
            return zoom;
        },

        /**
         * Zooms the map
         * @param {object} distance - distance between the fingers
         */
        zoom: function(distance) {
            var pt = main.object.context.transformedPoint(main.globals.lastPos.x, main.globals.lastPos.y);
            main.object.context.translate(pt.x, pt.y);
            var factor = Math.pow(main.globals.scaleFactor, distance);
            main.object.context.scale(factor, factor);
            main.object.context.translate(-pt.x, -pt.y);
            main.object.levels.getCurrent().draw();
        },

        /**
         * Create an html element
         * @param {string} tag - the tag of the element
         * @param {string|string[]} classes - the classes for the element
         * @param {Object|null} [events] - the event listeners
         * @returns {Element} the new element
         */
        createElement: function(tag, classes, events) {
            var element = document.createElement(tag);

            if (classes !== null) {
                element.classList.add(classes);
            }

            for (var event in events) {
                if (events.hasOwnProperty(event)) {
                    element.addEventListener(event, events[event]);
                }
            }
            return element;
        },

        /**
         * Set the interact time
         *
         * @param {number} [listenerId]
         */
        setInteractTime: function(listenerId) {
            if (main.interact === "smart") {
                var setNotInteracting = function() {
                    if (!main.globals.isDown) {
                        var popup = main.object.popups.getCurrent();
                        if (popup === null) {
                            main.globals.interact.isInteracting = false;
                            helpers.showTimeoutOverlay();
                            if (listenerId !== undefined) {
                                removeEventListener("popup_hidden", listenerId);
                            }
                        } else {
                            var eventId = addEventListener("popup_hidden", function() {
                                helpers.setInteractTime(eventId);
                                removeEventListener("popup_hidden", eventId);
                            });
                        }
                    } else {
                        if (main.dev) {
                            console.log("Finger or mouse is down");
                        }
                    }
                };

                clearTimeout(main.globals.interact.timer);
                main.globals.interact = {
                    isInteracting: true,
                    timer: setTimeout(setNotInteracting, 3000)
                };
            }
        },

        /**
         * If the user has interacted with the map in the last 3 seconds
         */
        isInteracting: function() {
            return main.interact != "smart" || main.globals.interact.isInteracting;
        },

        /**
         * Show the timeout overlay
         */
        showTimeoutOverlay: function() {
            main.timeoutOverlay.style.display = "block";
        },

        /**
         * Checks if the finger moved with a margin of 2 pixels
         * @param {object} a
         * @param {object} b
         * @returns {boolean}
         */
        validateTouchMoveClickMargin: function(a, b) {
            return (
                (a.x > b.x - 2 && a.x < b.x + 2) &&
                (a.y > b.y - 2 && a.y < b.y + 2)
            );
        }
    };

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

    if (main.dev) {
        returnObject.object = function() {
            return main;
        };
    }
    return returnObject;
});
