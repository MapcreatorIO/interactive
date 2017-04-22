/**
 * @file Maps4News Interactive Map
 * @copyright Maps4News 2017
 *
 * M4nInteractive 3.0.0 alpha
 */
var M4nInteractive = (function( options ) {
  // waveTo: function( name ) {
  //  console.log('Hi' + name );
  // };
  var _map;
  var _mapStatus;
  
  _init();
  
  function _init () {
    _loadJob( options, {
      done: function( data ) {
        _createMap( data.properties );
        _createFeatures( data.features ); 
        // var j = new Job("job 1");
        // console.log ( j.report() );
      },
      fail: function(e){
        // Create Error Dialog
        // Load default map
        console.log( 'Failed initializing your Maps4News map. Please contact us about this issue.' ); 
      }
    });
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
    var tL = L.tileLayer('https://'+options.location+'.cloudfront.net/tiles/{z}_{x}_{y}.png', {
      attribution: '<a target="_blank" href="https://maps4news.com">Maps4News &copy;</a>',
      maxNativeZoom: properties.maxZoom,
      minZoom: properties.minZoom,
      // maxBounds: - ; // Bounds are focussed around Features
    });

    // Construct map & events //
    var center = L.latLngBounds( p.bottomLeft, p.topRight ).getCenter();
    _map = L.map( options.container, {
        center: center,
        layers: tL
      })
      .on('mousedown', function(e) {
        if( !_mapStatus.isEnabled() ) {
          _mapStatus.enable();
        }
      })
      .on('contextmenu', function(e) {
        if( _mapStatus.isEnabled() ) {
          _mapStatus.disable();
        }
      }
    );

    // Mobile Map Settings //
    if(L.Browser.mobile) {
      _map.zoomControl.setPosition( 'bottomright' );
      _map.attributionControl.setPosition( 'topright' );
    }
    _addControllers();

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
    // Shows map status
    _mapStatus = L.control( {
      position: 'bottomleft',
    });
    _mapStatus.onAdd = function ( map ) {
      this._div = L.DomUtil.create('div', 'touch-info');
      return this._div;
    };
    _mapStatus.enable = function() {
      var action = L.Browser.mobile ? 'Hold' : 'Right click';
      this.enabled = true;
      this._div.innerHTML = '<i class="touch-info-icon enabled"></i>'+action+' to deactivate';
      _toggleHandlers();
      return this;
    }
    _mapStatus.disable = function() {
      var action = L.Browser.mobile ? 'Tap' : 'Click';
      this.enabled = false;
      this._div.innerHTML = '<i class="touch-info-icon disabled"></i>'+action+' to activate';
      _toggleHandlers();
      // if(_map.touchZoom) { _map.touchZoom.disable() };
      // if(_map.scrollWheelZoom) { _map.scrollWheelZoom.disable() };
      // if(_map.dragging) { _map.dragging.disable() };
      // if(_map.scrollZoom) { _map.scrollZoom.disable() };
      // if(_map.tap) { _map.tap.disable() };
      return this;
    }
    _mapStatus.isEnabled = function() {
      return this.enabled;
    }
    _mapStatus.addTo( _map ).disable();
  }
  function _toggleHandlers() {
    var handlers = [_map.touchZoom, _map.scrollWheelZoom, _map.dragging, _map.scrollZoom, _map.tap];

    for (var i = handlers.length - 1; i >= 0; i--) {
      if(handlers[i]) {

        handlers[i].enabled() ? handlers[i].disable() : handlers[i].enable();
        // debugger;
      }
    }
  }
  // function _disableMap() {

  // }
  function getMap() {
    return _map;
  }
  return {
    
    getMap
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



































































































































































































































