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
  var _features = [];
  var _handlers = [];
  var _options = [];
  var _enabled = _options.startEnabled;

  var _job;

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

  function _init() {
    var properties = _job.getProperties();
    var features = _job.getFeatures();
    var tL = L.tileLayer('//'+ _options.cdn_id+'/{z}/{x}/{y}.png', {
      attribution: '<a target="_blank" href="https://maps4news.com">Maps4News &copy;</a>',
      maxNativeZoom: properties.zoom.max,
      minZoom: properties.zoom.min,
      // maxBounds: - ; // Bounds are focussed around Features
    })
    var bounds = L.latLngBounds( 
      [properties.boundingBox.downLeft.lat, properties.boundingBox.downLeft.lon], 
      [properties.boundingBox.upRight.lat, properties.boundingBox.upRight.lon]
    );
    var center = bounds.getCenter();  

    // Construct map & events //
    _map = L.map( _options.container, {
        center: center,
        layers: tL,
        zoom: 10
      })
      .setMaxBounds ( bounds )
      .on('mousedown', function(e) {
          enable();
      })
      .on('contextmenu', function(e) {
          disable();
      }
    );

    // Mobile Map Settings //
    if(L.Browser.mobile) {
      _map.zoomControl.setPosition( 'bottomright' );
      _map.attributionControl.setPosition( 'topright' );
    }
    
    _addControllers();
    _addHandlers();
  
    _toggleHandlers();
    
    if(features) {
      _addFeatures( features );
    }
  }
  function _addFeatures( features ) {
    // Cluster to which our features will be added
    var markerCluster = L.markerClusterGroup.Custom().addTo( _map );
    
    // geoJSON feature group
    var geoJSON = L.geoJSON.Custom( features ).addTo( markerCluster );
    
    // Reset boundries around features
    _map.fitBounds( markerCluster.getBounds() );
    
    // Little bit of extra room
    _map.setMaxBounds ( markerCluster.getBounds().pad( Math.sqrt(2) / 2) );
  }

  function _addControllers() {
    // Map enabled/disabled status widget
    _map.mapStatus = L.control.MapStatus();

    _map.addControl( _map.mapStatus );
  }

  function _addHandlers() {
    _handlers.push( _map.mapStatus, _map.touchZoom, _map.scrollWheelZoom, _map.dragging, _map.scrollZoom, _map.tap );
  }

  function _toggleHandlers() {
    // Toggle all handlers & update map status controller
    for (var i = _handlers.length - 1; i >= 0; i--) {
      if(_handlers[i]) {
        _enabled ? _handlers[i].enable() : _handlers[i].disable();
      }
    }
  }

  // Initialization magic
  (function () {
    // importScript("maps4news.js", {
    //   done: function () {
    //     console.log("You read this alert because the script has been loaded.");
    //     initialize();
    //   }
    // });
    _options = L.extend(_defaultOption, customOptions);

    _job = new Job( _options.json_id, {
      loaded: function() {
        _init();
      }
    });
  })();

  return {
    enable,
    disable,
    enabled
  };
});

var Job = (function( path, callback ) {
  var _data = [];

  (function () {
    function loadFailed(e){
        // No fail callback given, fallback to default failed message
        if( callback.fail === undefined){
          console.log( 'Failed initializing your Maps4News map. Please contact us about this issue.' ); 
        } else {
          callback.fail();
        }
    }

    var request = new XMLHttpRequest();
    request.open("GET", "//" +path +"/map.json", true);
    request.onload = function (e) {
      if (request.readyState === 4) {
        if (request.status === 200) {
          _data = JSON.parse ( request.responseText );
          callback.loaded();
        } else {
          loadFailed(e);
        }
      }
    };
    request.onerror = function (e) {
      loadFailed(e);
    };
    request.send(null);
  })();

  function getFeatures() {
    return _data.features;
  }
  function getProperties(){
    return _data.properties;
  }
  return {
    getFeatures,
    getProperties
  }
});

var importScript = (function (head) {

  function loadError (oError) {
    throw new URIError("The script " + oError.target.src + " is not accessible.");
  }
  
  return function (sSrc, callback) {
    var script = document.createElement("script");
    script.type = "text\/javascript";
    if (callback) {
      script.onerror = loadError;
      script.onload = callback.done;
    }
    head.appendChild(script);
    script.src = sSrc;
  }

})(document.head || document.getElementsByTagName("head")[0]);