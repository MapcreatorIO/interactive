/*
 Factory class for Marker Cluster
 (c) 2012-2013, Robbert Klaver
*/
L.MarkerClusterGroup.Custom = L.MarkerClusterGroup.extend({
  options: {
    showCoverageOnHover: true,
      maxClusterRadius: 150,
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
    }
  }
});

L.markerClusterGroup.Custom = function() {
    return new L.MarkerClusterGroup.Custom();
}

