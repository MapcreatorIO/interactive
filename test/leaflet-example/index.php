<?php
$file_path = $_GET["id"];
?>
<!DOCTYPE html>
<html>
<head>
	<title>Focus Map - Maps4News</title>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="shortcut icon" type="image/x-icon" href="docs/images/favicon.ico" />
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.0.3/dist/leaflet.css" />
	<!-- <script src="https://unpkg.com/leaflet@1.0.3/dist/leaflet.js"></script> -->
	<!-- <script src="https://unpkg.com/leaflet.markercluster@1.0.4/dist/leaflet.markercluster.js"></script> -->

	<!-- src -->
	<script src="L/leaflet-src.js"></script>
	<script src="L/MarkerCluster.js"></script>
	<script src="L/MarkerCluster.Custom.js"></script>
	<script src="L/control/MapStatus.js"></script>
	<script src="L/GeoJSON.Custom.js"></script> -->
	<script src="maps4news.js"></script>
	<link rel="stylesheet" href="maps4news.css" />
	<!-- min -->
	<!-- <script src="maps4news-min.js"></script> -->
	<!--  -->
</head>
<body>b
<div class="mapcontainer" id="map"></div>
<script type="text/javascript">
	var map = M4nInteractive({
		container: "map", 
		// json_id: "d3hvhuzn2iw70p.cloudfront.net/<?=$file_path;?>",
		// cdn_id: "d3hvhuzn2iw70p.cloudfront.net/<?=$file_path;?>",
		json_id: "s3-eu-west-1.amazonaws.com/m4n-focus/0348d8b64c9bf03c67f7df44ae9c1877dde084c6",
		cdn_id: "s3-eu-west-1.amazonaws.com/m4n-focus/0348d8b64c9bf03c67f7df44ae9c1877dde084c6",
		// json_id: "slippy.local.maps4news.com/",
		acces_key: "special token",
		startEnabled: false
	});
	</script>
</body>
</html>
