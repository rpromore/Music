function round(n,dec) {
	n = parseFloat(n);
	if(!isNaN(n)){
		if(!dec) var dec= 0;
		var factor= Math.pow(10,dec);
		return Math.floor(n*factor+((n*factor*10)%10>=5?1:0))/factor;
	}else{
		return n;
	}
}
function toMinutes(s) {
	var minutes = Math.floor(s/60);
	if( minutes.toString().length == 1 )
		minutes = '0'+minutes;
	else if( minutes.toString() == "NaN" )
		minutes = "00";
	var seconds = round(s - minutes * 60, 0);
	if( seconds.toString().length == 1 )
		seconds = '0'+seconds;
	else if( seconds.toString() == "NaN" )
		seconds = "00";
	return minutes+':'+seconds;
}
Array.prototype.swap = function(n1, n2) {
	if( isNaN(n1) )
		n1 = 0;
	if( isNaN(n2) )
		n2 = 0;
    var t = this[n1];
    this[n1] = this[n2];
    this[n2] = t;
    return this;
};
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};
Array.prototype.insert = function(index, obj) {
	this.splice(index, 0, obj);
};
Music.player = {
	handler: null,
	type: null,
	options: {
		shuffle: false,
		repeat: 0, // 0 - false, 1 - song, 2 - playlist
		view_type: "wall",
		keys: {
			next: 78,
			prev: 80,
			toggle: 32,
			video: 86,
			info: 73,
			volumeUp: 88,
			volumeDown: 90
		}
	},
	queue: [],
	played: [],
	index: null,
	lastIndex: null,
	add: function(x){
		this.queue.push(x);
	},
	toggleShuffle: function(){
		Music.player.options.shuffle ? Music.player.options.shuffle = false : Music.player.options.shuffle = true;
	},
	toggleRepeat: function(){
		Music.player.options.repeat == 0 ? Music.player.options.repeat = 1 : Music.player.options.repeat == 1 ? Music.player.options.repeat = 2 : Music.player.options.repeat = 0;
	},
	next: function(){
		if( this.played.length == 0 ) {
			this.played.push($(this.queue).get(this.index));
			this.queue.remove(this.index);
		}
		if( this.options.shuffle )
			this.index = Math.floor(Math.random()*this.queue.length);
		$(this.queue).get(this.index).trigger("click");
			
		
	},
	prev: function(){
		this.queue.insert(this.index, this.played.pop());
		$(this.played).get(-1).trigger("click");
	},
	play: function(){
		this.played.push($(this.queue).get(this.index));
		this.queue.remove(this.index);
		
		if( this.handler != null ) {
			if( this.type == "youtube" )
				this.handler.playVideo();
			else if( this.type == "soundcloud" )
				this.handler.api_play();
		}
	},
	pause: function(){
		
	},
	stop: function(){
		
	},
	setVolume: function(x){
		
	},
	getVolume: function(){
		
	},
	seek: function(x) {
		
	},
	seekPercent: function(x) {
		
	},
	load: function(url) {
		
	},
	getDuration: function() {
		
	},
	getTimeElapsed: function() {
		
	},
	buffering: function(x) {
		
	},
	onReady: function(playerId){
		// Astrobeats.player.stop();
		Music.player.handler = playerId;
		Music.player.play();
	}
};

Music.player.parameters = { allowscriptaccess: "always", wmode: "transparent" };
Music.player.attributes = { id: "player", name: "theplayer", wmode: "transparent" };
Music.player.flashvars = { enable_api: true, object_id: "scPlayer", url: "http://soundcloud.com/forss/flickermood" };

function onYouTubePlayerReady(playerId) {
	var p = document.getElementById("player");
	// p.addEventListener("onStateChange", "onytStateChange");
	Music.player.onReady(p);
}
/*
var buffer_timer = null;
function onytStateChange(newState) {
	clearInterval(buffer_timer);
	var p = document.getElementById("player");
	buffer_timer = setInterval(function(){
		var n = (p.getVideoBytesLoaded()/p.getVideoBytesTotal())*100;
		Music.player.buffering(n);
	}, 1000);
	
	if( p.getVideoBytesLoaded() == p.getVideoBytesTotal() || newState == 0 || newState == -1 )
		clearInterval(buffer_timer);
}
soundcloud.addEventListener("onPlayerReady", function(scPlayer, data) {
	Music.player.type = "soundcloud";
	Music.player.onReady(scPlayer);
});
soundcloud.addEventListener('onMediaBuffering', function(player, data) {
	clearInterval(buffer_timer);
	Music.player.buffering(data.percent);
});
*/

function embed(type, url, index) {
	Music.player.handler = null;
	Music.player.type = null;
	if( Music.player.index == null )
		Music.player.index = index;
	switch( type ) {
		case "youtube":
			Music.player.url = url;
			Music.player.type = "youtube";
			swfobject.embedSWF("http://www.youtube.com/v/"+url+"?controls=0&enablejsapi=1&playerapiid=ytplayer&version=3&wmode=transparent", "player", "425", "256", "8", null, null, Music.player.parameters, Music.player.attributes);
			break;
		case "soundcloud":
			Music.player.url = url;
			Music.player.flashvars.url = url;
			Music.player.type = "soundcloud";
			swfobject.embedSWF("http://player.soundcloud.com/player.swf", "player", "425", "80", "9.0.0","expressInstall.swf", Music.player.flashvars, Music.player.parameters, Music.player.attributes);
			break;
	}
}

$(document).keydown(function(e){
	if( $("input[type=text]:focus").length <= 0 ) {
		var k = (e.keyCode ? e.keyCode : e.which);
		var r = true;
		$.each(Music.player.options.keys, function(key, v) {
			if( v == k ) {
				switch(key) {
					case "next":
						Music.player.next();
						break;
					case "prev":
						Music.player.prev();
						break;
					case "toggle":
						status == "playing" ? Music.player.pause() : Music.player.play();
						break;
					case "volumeUp":
						Music.player.setVolume(Music.player.getVolume()+1);
						break;
					case "volumeDown":
						Music.player.setVolume(Music.player.getVolume()-1);
						break;
				}
				r = false;
			}
		});
		e.stopPropagation();
		return r;
	}
});
