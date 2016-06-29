/**
 * Create the zoom controls
 */
function createZoomControls() {
	// Zoom controls
	var zoom_container = helpers.createElement('div', 'm4n-zoom-container');
	var zoom_control_in = helpers.createElement('div', 'm4n-control-button', {
		'click': function() {
			if(!zoom_control_in.classList.contains('disabled')) {
				main.api.zoom.in();
			}
		}
	});
	var zoom_control_out = helpers.createElement('div', 'm4n-control-button', {
		'click': function() {
			if(!zoom_control_out.classList.contains('disabled')) {
				main.api.zoom.out();
			}
		}
	});

	addEventListener("level_changed", function() {
		var currentLevel = main.object.levels.getCurrent();

		zoom_control_out.classList.remove('disabled');
		zoom_control_in.classList.remove('disabled');

		if(currentLevel.level == main.object.levels.getHighest().level) {
			zoom_control_out.classList.add('disabled');
		} else if(currentLevel.level == main.object.levels.getLowest().level) {
			zoom_control_in.classList.add('disabled');
		}
	});

	zoom_container.appendChild(zoom_control_in);
	zoom_container.appendChild(zoom_control_out);
	zoom_container.appendChild(helpers.createElement('div', 'm4n-control-separator'));

	main.controlContainer.appendChild(zoom_container);
}
