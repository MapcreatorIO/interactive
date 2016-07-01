if(main.interact == "smart") {
	main.timeoutOverlay = helpers.createElement("div", "m4n-timeout-overlay", {
		"click": helpers.hideTimeoutOverlay,
		"touchstart": function(e) {
			main.globals.dragPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
			main.globals.clickStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
		},
		"touchmove": function(e) {
			main.globals.dragPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
		},
		"touchend": function() {
			if(helpers.validateTouchMoveClickMargin(main.globals.clickStart, main.globals.dragPosition)) {
				helpers.hideTimeoutOverlay();
			}
		}
	});

	container.appendChild(main.timeoutOverlay);
}