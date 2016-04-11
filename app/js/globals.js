main.globals = {
    // Keep track of the cursor; if it's down (clicked)
    isDown: false,
    // If the user is scaling
    isScaling: false,
    // The location of the initial click
    clickStart: { x: 0, y: 0 },
    // The location of the last move event
    dragPosition: { x: 0, y: 0 },
    // The offset of the map on screen
    mapOffset: { x: 0, y: 0 },
    // If the user has double tapped or clicked
    doubleTap: null,
    // If a video prompted the fullscreen and when
    videoFullscreen: { value: false, date: null, noEvents: 2 },
    //
    scroll: { value: 0, timeout: null },
    //
    startDistance: 0,
    //
    scaleFactor: 1.1,
    //
    lastPos: { x: 0, y: 0 },
    //
    interact: { isInteracting: false, timer: null },

    // mapOffset helper functions
    offset: {
        changeBy: function (x, y) {
            main.globals.mapOffset.x += x;
            main.globals.mapOffset.y += y;
        },
        changeTo: function (x, y) {
            main.globals.mapOffset = {x: x, y: y};
        },
        get: function () {
            return main.globals.mapOffset;
        }
    }
};