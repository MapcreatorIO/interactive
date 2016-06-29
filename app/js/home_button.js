/**

 **/
function createHomeButton(control_container) {

	var home_container = helpers.createElement('div', 'm4n-home-container');
	var home_button = helpers.createElement('div', ['m4n-control-button'], {
		'click': function() {
			main.api.reset();
		}
	});

	home_container.appendChild(home_button);

	control_container.appendChild(home_container);
	control_container.appendChild(helpers.createElement('div', 'm4n-control-separator'));
}
