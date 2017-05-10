/**
 * @file Maps4News Interactive Map
 * @copyright Maps4News 2017
 *
 * M4nInteractive 3.0.0 alpha
 */

var M4nInteractive = (function( customOptions ) {
  var _map;
  var _defaultOption = {
    // Custom options
    startEnabled: false
  };
  var _options = L.extend(_defaultOption, customOptions);
  var _features = [];
  var _handlers = [];

  var _enabled = _options.startEnabled;
  // Self invoking init
  (function () {
    _loadJob({
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
  // });
  }) ();
  function enable() {
    _enabled = true;
    _toggleHandlers();
  }
  function disable() {
    _enabled = false;
    _toggleHandlers();
  }
  
  function enabled() {
    return _enabled;
  }

  function _loadExternalScripts( callback ) {
    var script = document.createElement('script');
    script.onreadystatechange = function() {
      if (script.readyState == 'loaded') {
        callback.done();
      }
    };
    script.src = 'leaflet-src.js';
    document.body.appendChild(script);
  }
  function _loadJob( result ) {
    var request = new XMLHttpRequest();
    request.open("GET", "//" +_options.json_id +"/map.json", true);
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
    var tL = L.tileLayer('//'+ _options.tile_id+'/{z}_{x}_{y}.png', {
      attribution: '<a target="_blank" href="https://maps4news.com">Maps4News &copy;</a>',
      maxNativeZoom: p.zoom.max,
      minZoom: p.zoom.min,
      // maxBounds: - ; // Bounds are focussed around Features
    })

    var bounds = L.latLngBounds( 
      [p.boundingBox.downLeft.lat, p.boundingBox.downLeft.lon], 
      [p.boundingBox.upRight.lat, p.boundingBox.upRight.lon]
    );

    var center = bounds.getCenter();  

    // Construct map & events //
    _map = L.map( _options.container, {
        center: center,
        layers: tL,
        zoom: 10
      })
      .on('mousedown', function(e) {
          enable();
      })
      .on('contextmenu', function(e) {
          disable();
      }
      // .setMaxBounds ( bounds )
    );

    // Mobile Map Settings //
    if(L.Browser.mobile) {
      _map.zoomControl.setPosition( 'bottomright' );
      _map.attributionControl.setPosition( 'topright' );
    }
    
    _addControllers();
    _addHandlers();

    _toggleHandlers();
    
  }
  function _createFeatures( geojson ) {
    // Cluster to which our features will be added
    var markerCluster = L.markerClusterGroup.Custom().addTo( _map );
    
    // geoJSON feature group
    var geoJSON = L.geoJSON.Custom( geojson ).addTo(markerCluster);
    
    // Reset boundries around features
    _map.fitBounds( markerCluster.getBounds() );
    
    // Little bit of extra room
    _map.setMaxBounds ( markerCluster.getBounds().pad( Math.sqrt(2) / 2) );
  }

  function _addHandlers() {
    _handlers.push( _map.mapStatus, _map.touchZoom, _map.scrollWheelZoom, _map.dragging, _map.scrollZoom, _map.tap );
  }
  function _addControllers() {
    // Map enabled/disabled status widget
    _map.mapStatus = L.control.MapStatus();
    _map.addControl( _map.mapStatus );
  }

  function _toggleHandlers() {
    // Toggle all handlers & update map status controller
    for (var i = _handlers.length - 1; i >= 0; i--) {
      if(_handlers[i]) {
        // console.log(_enabled, _handlers[i].enabled() );
        _enabled ? _handlers[i].enable() : _handlers[i].disable();
      }
    }
  }
  return {
    enable,
    disable,
    enabled,
  };
});

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











