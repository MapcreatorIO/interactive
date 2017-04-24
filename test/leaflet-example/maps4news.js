/**
 * @file Maps4News Interactive Map
 * @copyright Maps4News 2017
 *
 * M4nInteractive 3.0.0 alpha
 */
var M4nInteractive = (function( options ) {
  var _map;
  var _options = {
    // All map options here
    // Exend base props with new default props
  };
  var _enabled = false;
  var _features = [];
  // Self invoking init
  (function () {    
    _loadJob( options, {
      done: function( data ) {
        _createMap( data.properties );
        _createFeatures( data.features );
      },
      fail: function(e){
        // Create Error Dialog
        // Load default map
        console.log( 'Failed initializing your Maps4News map. Please contact us about this issue.' ); 
      }
    });
  }) ();
  function enable() {
    _toggleHandlers( true );
  }
  function disable() {
    _toggleHandlers( false  );
  }
  function enabled() {
    return _enabled;
  }

  function _loadJob( options, result ) {
    var request = new XMLHttpRequest();
    request.open("GET", "/" +options.job_id +".json", true);
    request.onload = function (e) {
      if (request.readyState === 4) {
        if (request.status === 200) {
          result.done( JSON.parse ( request.responseText ) );
        } else {
          result.fail(e);
        }
      }
    };
    request.onerror = function (e) {
      result.fail(e);
    };
    request.send(null);
  }

  function _createMap( properties ) {
    var p = properties;
    var tL = L.tileLayer('https://'+ options.cdn_id+'.cloudfront.net/tiles/{z}_{x}_{y}.png', {
      attribution: '<a target="_blank" href="https://maps4news.com">Maps4News &copy;</a>',
      maxNativeZoom: p.zoom.max,
      minZoom: p.zoom.min,
      // maxBounds: - ; // Bounds are focussed around Features
    });

    // Construct map & events //
    var center = L.latLngBounds( 
      [p.boundingBox.downLeft.lat, p.boundingBox.downLeft.lon], 
      [p.boundingBox.upRight.lat, p.boundingBox.upRight.lon] ).getCenter();
    _map = L.map( options.container, {
        center: center,
        layers: tL
      })
      .on('mousedown', function(e) {
        if(! enabled() ) {
          enable();
        }
      })
      .on('contextmenu', function(e) {
        if( enabled() ) {
          disable();
        }
      }
    );
    // Mobile Map Settings //
    if(L.Browser.mobile) {
      _map.zoomControl.setPosition( 'bottomright' );
      _map.attributionControl.setPosition( 'topright' );
    }
    
    _addControllers();
    _toggleHandlers( false  );
    
  }
  function _createFeatures( geojson ) {
    // Base marker layer
    var markerCluster = L.markerClusterGroup({
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
    }).addTo(_map);

    // Build GEOJSON data
    var gJ = L.geoJSON( geojson, {
      onEachFeature: function(feature, layer) {
        _features.push(layer)
        if( feature.properties.html ) {
          var popupContent = feature.properties.html;
          layer.bindPopup(popupContent);
        }
      },
      pointToLayer: function (feature, latlng) {
        if( feature.properties.svg ) {
          // Custom icon from data
          var svgString = feature.properties.svg;
          var svgURL = "data:image/svg+xml;base64," + btoa(svgString);
          var svgIcon = L.icon({
            iconUrl: svgURL,
            iconSize: [40, 60],
            iconAnchor: [20, 30],
          });
          return L.marker(latlng, {
            icon: svgIcon
          });
        } else {
          return L.marker(latlng);
          // Default icon
          // var svgIcon = 
        }
      }
    }).addTo(markerCluster);
    
    // Reset boundries around features
    _map.fitBounds( markerCluster.getBounds() );
    _map.setMaxBounds ( markerCluster.getBounds().pad( Math.sqrt(2) / 2) ); // Little bit of extra room
  }
  function _addControllers() {
    _map.mapStatus = new L.Control.MapStatus();
    _map.addControl( _map.mapStatus );
  }
  function _toggleHandlers( enabled ) {
    // Toggle all handlers & update map status controller
    var handlers = [_map.mapStatus, _map.touchZoom, _map.scrollWheelZoom, _map.dragging, _map.scrollZoom, _map.tap];
    for (var i = handlers.length - 1; i >= 0; i--) {
      if(handlers[i]) {
        enabled ? handlers[i].enable() : handlers[i].disable();
      }
    }
    _enabled = enabled;
  }
  return {
    enable,
    disable,
    enabled,
  };
});

L.Control.MapStatus = L.Control.extend({
  options: {
    position: 'bottomleft',
    icon: L.Browser.mobile ? 'touch' : 'desktop'
  },
  onAdd: function (map) {
    this._div = L.DomUtil.create('div', 'touch-info');
    return this._div;
  },
  enable: function() {
    var action = L.Browser.mobile ? 'Hold' : 'Right click';
    this._div.innerHTML = '<i class="touch-info-icon '+this.options.icon+'-enabled"></i>'+action+' to deactivate';
    this._enabled = true;
    return this;
  },
  disable: function() {
    var action = L.Browser.mobile ? 'Tap' : 'Click';
    this._div.innerHTML = '<i class="touch-info-icon '+this.options.icon+'-disabled"></i>'+action+' to activate';
    this._enabled = false;
    return this;
  },
  enabled: function() {
    return this._enabled;
  }
});

// L.control.mapstatus = function () {
//   return new L.Control.MapStatus();
// };
var Job = (function(name) {
    // var _name = name;
    
    function report() {
        console.log(name);
    }
    // function report() {
    //  console.log(_name);
    // }
    return {
        report
    }
});

















































