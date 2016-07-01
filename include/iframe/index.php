<?php

if (!isset($_GET['path'])) {
	echo "No path given for the map!"; die;
} else {
	$path = htmlentities($_GET['path']);
}

if(isset($_GET['style'])) {
	$style = htmlentities($_GET['style']);
}

$id = isset($_GET['id']) ? htmlentities($_GET['id']) : "m4n-" . str_shuffle("withlovefrommaps4news");

$env = isset($_GET['env']) ? htmlentities($_GET['env']) : "online";

?>
<html>
	<head>
		<style type="text/css">
			html, body {
				padding: 0; margin: 0; height: 100%; width: 100%;
			}
		</style>
		<?php if(isset($style)): ?>
			<link href="<?=$style;?>" type="text/css" rel="stylesheet" id="m4n-style-custom"/>
		<?php endif; ?>
	</head>
	<body>
		<div>
			<div id="<?=$id;?>">
				<script src="https://<?=$env;?>.maps4news.com/ia/2.0/m4n.js" type="text/javascript"></script>
				<script type="text/javascript">
					var map = new M4nInteractive({
							"path": "<?=$path;?>",
							"environment": "<?=$env;?>"
						}, document.getElementById("<?=$id;?>"));
				</script>
			</div>
		</div>
	</body>
</html>
