/*
 Factory class for GeoJSON
 (c) 2012-2013, Robbert Klaver
*/
L.GeoJSON.Custom = L.GeoJSON.extend({
  options: {
    onEachFeature: function(feature, layer) {
      // _features.push(layer)
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
  }
});

L.geoJSON.Custom = function( geojson ) {
  return new L.GeoJSON.Custom( geojson );
}



