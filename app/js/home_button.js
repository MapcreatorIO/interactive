/**

 **/
function createHomeButton() {

	var home_container = helpers.createElement('div', 'm4n-home-container');
	var home_button = helpers.createElement('div', ['m4n-control-button'], {
		'click': function() {
			main.api.reset();
		}
	});

	home_container.appendChild(home_button);
	home_container.appendChild(helpers.createElement('div', 'm4n-control-separator'));

	main.controlContainer.appendChild(home_container);
}
