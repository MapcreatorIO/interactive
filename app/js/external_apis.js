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
				if(item.media_type === "youtube") {
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
			if(typeof YT == 'undefined') {
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
			if(main.object !== null && typeof YT !== 'undefined') {
				main.object.popups.list.forEach(function(item) {
					if(item.media_type === "youtube") {
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