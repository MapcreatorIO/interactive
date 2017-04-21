/**
 * @file Maps4News Interactive Map
 * @copyright Maps4News 2016
 *
 * M4nInteractive 2.0.6
 */
var M4nInteractive = (function() {
	var _map;
	var _touchInfo;
	
	function init() {
		_createMap();
		loadData();
		addTouchInfo();
	}
	function _createMap() {
		_map = L.map('mapContainer', {}).setView([ 35.215233, -80.838953 ], 12);
		var southWest = new L.LatLng(34.9021, -81.2636); 
		var northEast = new L.LatLng(35.514, -80.3947); 
		var restrictBounds = new L.LatLngBounds(southWest, northEast); 
		var tL = L.tileLayer('https://d3vdg4r0bnfb5l.cloudfront.net/tiles/{z}_{x}_{y}.png', {
		    attribution: '<a target="_blank" href="https://maps4news.com">Maps4News &copy;</a>',
		    maxNativeZoom: 15,
		    minZoom: 12,
		}).addTo(_map);
		_map.setMaxBounds ( restrictBounds );
		_map.on('mousedown', function(e) {
			if( !_touchInfo.isEnabled() ) {
				_touchInfo.enable();
			}
		});
		_map.on('contextmenu', function(e) {
			if( _touchInfo.isEnabled() ) {
				_touchInfo.disable();
			}
		});
		_map.zoomControl.setPosition('bottomright');
		_map.attributionControl.setPosition('topright');
		
	}
	function loadData() {
		var markers = L.markerClusterGroup({
			showCoverageOnHover: false,
			maxClusterRadius: 50,
			iconCreateFunction: function (cluster) {
				var childCount = cluster.getChildCount();
				var c = ' marker-cluster-';
				var s = 0;
				if (childCount < 10) {
					c += 'small';
					s = 30;
				} else if (childCount < 15) {
					c += 'medium';
					s = 35;
				} else {
					c += 'large';
					s = 40;
				}
				return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(s,s) });
			},
		});
		var gJ = L.geoJSON([charlotte], {
			style: function (feature) {
				return feature.properties && feature.properties.style;
			},
			onEachFeature: function(feature, layer) {
				var popupContent = "<p>" +feature.properties['NAME'] + "</p>";
				popupContent += "<p>" +feature.properties['DESCRIPTION'] + "</p>";
				layer.bindPopup(popupContent);
			},
			pointToLayer: function (feature, latlng) {
				var svgString = feature.properties.SVG;
				var svgURL = "data:image/svg+xml;base64," + btoa(svgString);
				var pinIcon = L.icon({
	        		iconUrl: svgURL,
	        		iconSize: [40, 60],
	        		iconAnchor: [20, 30],
	        	});     
			    return L.marker(latlng, {
			    	icon: pinIcon
			    });
			}
		}).addTo(markers);
		markers.addTo(_map);
	}
	function addTouchInfo() {
		_touchInfo = L.control({position: 'bottomleft'});
		_touchInfo.onAdd = function (map) {
			this._div = L.DomUtil.create('div', 'touch-info');
		    return this._div;
		};
		_touchInfo.enable = function() {
			var action = L.Browser.mobile ? 'Hold' : 'Right click';
			this._touchActive = true;
			this._div.innerHTML = '<i class="touch-info-icon enabled"></i>'+action+' to deactivate';

			_map.touchZoom.enable();
			_map.dragging.enable();
			if(_map.scrollZoom) { _map.scrollWheelZoom.enable() };
			if(_map.tap) { _map.tap.enable() };
			return this;
		}
		_touchInfo.disable = function() {
			var action = L.Browser.mobile ? 'Tap' : 'Click';
			this._touchActive = false;
			this._div.innerHTML = '<i class="touch-info-icon disabled"></i>'+action+' to activate';
			
			_map.touchZoom.disable();
			_map.scrollWheelZoom.disable();
			_map.dragging.disable();
			if(_map.scrollZoom) { _map.scrollZoom.disable() };
			if(_map.tap) { _map.tap.disable() };
			return this;
		}
		_touchInfo.isEnabled = function() {
			return this._touchActive;
		}
		_touchInfo.addTo(_map).disable();
	}
  return {
  	init: init,
  	loadData: loadData,
  	addTouchInfo,
  };
})();

























