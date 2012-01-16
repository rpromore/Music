<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">

<head>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
	<link rel="dns-prefetch" href="http://reddit.com">
	<meta name="author" content="Robert Romore" />
	<link type="text/css" href="http://addyosmani.github.com/jquery-ui-bootstrap/css/custom-theme/jquery-ui-1.8.16.custom.css" rel="stylesheet" />
    <link href="http://addyosmani.github.com/jquery-ui-bootstrap/bootstrap/bootstrap.css" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="css/style.css" />
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js"></script>
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js"></script>
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.16/jquery-ui.min.js"></script>
    <script type="text/javascript" src="https://raw.github.com/syntacticx/routesjs/master/jquery.routes.min.js"></script>
    
    <script type="text/javascript" src="js/soundcloud.player.api.js"></script>
    <script type="text/javascript" src="js/jstorage.js"></script>
    
    <script type="text/javascript" src="js/ump.js"></script>
    <script type="text/javascript" src="js/music.js"></script>
	<title>Music</title>
</head>
<body>
<div id="container">
	<div id="left">
		<div class="header">
			
		</div>
		<div class="content">
			<div id="services"></div>
		</div>
	</div>
	<div id="middle">
		<div class="header">
			<ul>
				<li id="prev">7</li>
				<li id="play">1</li>
				<li id="pause">2</li>
				<li id="next">8</li>
				<div id="timeplayed">0:00</div>
				<div id="seek">
					<div id="indic"></div>
					<div id="buffered"></div>
					<div id="played"></div>
				</div>
				<div id="totaltime">0:00</div>
				<li id="shuffle">&</li>
				<li id="norepeat">*</li>
				<li id="repeatone" class="active">(</li>
				<li id="repeat" class="active">*</li>
				<div id="volume">
					<li id="volume-mute">@</li>
					<li id="volume-low">#</li>
					<li id="volume-high">$</li>
					<div id="volumeslide"></div>
				</div>
			</ul>
		</div>
		<div class="content">
			<ul class="list"></ul>
		</div>
	</div>
	<div id="right">
		<div class="header">
			<ul>
				<li><a href="#media-info">Media</a></li>
				<li><a href="#artist-info">Artist</a></li>
			</ul>
		</div>
		<div class="content">
			<div id="media-info">
				<div id="player"></div>
				<div id="comments">
					<p>To begin playing, click one of the items to the left.</p>
				</div>
			</div>
			<div id="artist-info"></div>
		</div>
	</div>
</div>

</body>
</html>
