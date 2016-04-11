if(main.interact == "smart") {
	var overlay = helpers.createElement("div", "timeout-overlay", {
		"click": function() {
			hideOverlay();
		},
		"touchstart": function(e) {
			main.globals.dragPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
			main.globals.clickStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
		},
		"touchmove": function(e) {
			main.globals.dragPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
		},
		"touchend": function() {
			if(helpers.validateTouchMoveClickMargin(main.globals.clickStart, main.globals.dragPosition)) {
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