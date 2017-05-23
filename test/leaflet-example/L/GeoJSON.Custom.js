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
        var anchorRegEx = /mol_svganchor="([^"]*)/g;
        var viewBoxRegEx = /viewBox="([^"]*)/g;
        var viewBox = viewBoxRegEx.exec(svgString)[1].split(' ');
        var width = Math.round(Number(viewBox[0]) *100 ) / 100 + Math.round(Number(viewBox[2]) *100 ) / 100;
        var height = Math.round(Number(viewBox[1]) *100 ) / 100 + Math.round(Number(viewBox[3]) *100 ) / 100;
        var anchor = anchorRegEx.exec(svgString)[1].split(' ' );
        var relativeX;
        var relativeY;

        var size = [40, 60];
        // Calculate the relative x and y anchor position
        anchor = [Math.round(Number( anchor[0] )*100 ) / 100, Math.round(Number( anchor[1] )*100 ) / 100 ];
        relativeX = anchor[0] / width;
        relativeY = anchor[1] / height;
        anchor = [size[0] * relativeX, size[1] * relativeY ];

        var svgURL = "data:image/svg+xml;base64," + btoa(svgString);
        var svgIcon = L.icon({
          iconUrl: svgURL,
          iconSize: size || [40, 60],
          iconAnchor: anchor || [20, 60],
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



