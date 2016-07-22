/**
 * Do initial setup
 */
(function(options) {
	main.startTime = new Date().getTime();

	if(!options.path) {
		throw 'M4nInteractive Parameter \'path\' is missing';
	}
	if(!container) {
		throw 'M4nInteractive: No container was given';
	}

	main.interact = options.interact || "scroll";
	main.environment = options.environment || "online";
	main.zoomControls = typeof options.zoomControls !== 'undefined' ? options.zoomControls : true;
	main.homeButton = typeof options.homeButton !== 'undefined' ? options.homeButton : true;
	main.hotspotMargin = parseInt(options.hotspotMargin) || 10;

	main.version = { map: '2.0', code: '2.0.5' };

	main.dev = (function() {
		if(typeof options.debug !== 'undefined') {
			return !!options.debug;
		}
		return main.environment === 'development';
	})();

	main.inlineObject = main.dev && typeof options.object !== 'undefined';
	main.isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	main.isIframe = window.location !== window.parent.location;

	main.canvas = "m4n-" + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); // Unique ID for canvas

	main.url = main.json = '';
	switch(main.environment) {
		case 'development':
			main.url = location.href.split("/").slice(0, -1).join("/") + '/output/' + options.path + '/';
			main.json = main.inlineObject ? options.object : main.url + 'map.json';
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