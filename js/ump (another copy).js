var error = function(x) {
	console.log("UMP: "+x);
	return false;
};
var UMPClass = {
	current: null,
	played: [],
	queued: [],
	options: {
		shuffle: false,
		avoid_played: true, // when shuffle is true, if this option is true songs that have already been played will be avoided
		repeat: 0 // 0 - no repeat, 1 - repeat once, 2 - repeat all
	},
	services: {
		"reddit": {
			name: "Reddit",
			parse: function(data) {
				nodes = [];
				$.each(data.data.children, function(k, v){
					if( v["data"]["domain"] == "youtube.com" || v["data"]["domain"] == "youtu.be" ) {
						var add = {
							options: {
								"data-provider": "youtube.com",
								"data-service": "reddit",
								"data-url": v["data"]["url"].replace(/^[^v]+v.(.{11}).*/,"$1"),
								"data-title": v["data"]["title"],
								html: '<h2>'+v["data"]["title"]+'</h2>'
							},
							handler: UMPClass.handlers["youtube"]
						};
						UMPClass.nodes.add(add);
					}
				});
			}
		}
	},
	handlers: {
		"youtube": {
			handle: null,
			status: "paused",
			embed: function(o, callback){
				var t = this;
				swfobject.embedSWF("http://www.youtube.com/v/"+o.options["data-url"]+"?controls=0&enablejsapi=1&playerapiid=ytplayer&version=3&wmode=transparent", "player", "425", "256", "8", null, null, { allowscriptaccess: "always", wmode: "transparent" }, { id: "player", name: "theplayer", wmode: "transparent" });
				window.onYouTubePlayerReady = function(p){
					t.handle = document.getElementById("player");
					UMPClass.current = o;
					// buffer
					var buffer = setInterval(function(){
						t.buffered = t.handle.getVideoBytesLoaded() / t.handle.getVideoBytesTotal();
						t.buffering(t.buffered);
						if( t.buffered >= t.handle.getVideoBytesTotal() )
							clearInterval(buffer);
					}, 1000);
					var play = setInterval(function(){
						t.played = t.handle.getCurrentTime() / t.handle.getDuration();
						t.playing(t.played);
						if( t.played >= t.handle.getDuration() )
							clearInterval(play);
					}, 1000);
					callback.call(this, t);
				};
			},
			play: function(){
				this.handle.playVideo();
			},
			pause: function(){
				this.handle.pauseVideo();
			},
			seekToSeconds: function(x){
				this.handle.seekTo(x);
			},
			seekToPercent: function(x){
				if( x >= 0 && x <= 100 )
					this.handle.seekTo(x*this.handle.getDuration());
			},
			next: function(callback){
				if( UMPClass.options.shuffle ) {
					var c = UMPClass.nodes.nodes[Math.floor(Math.random()*UMPClass.nodes.nodes.length)];
					if( UMPClass.options.avoid_played )
						while( c.status == "played" )
							c = UMPClass.nodes.nodes[Math.floor(Math.random()*UMPClass.nodes.nodes.length)];
					UMPClass.current = c;
				}
				else
					UMPClass.current = UMPClass.current.next;
				callback.call(this, UMPClass.current);
			},
			prev: function(callback){
				UMPClass.current = UMPClass.current.prev;
				callback.call(this, UMPClass.current);
			},
			buffered: 0,
			played: 0
		}
	},
	nodes: {
		add: function(n) {
			if( typeof $(this.nodes).get(-1) != "undefined" ) {
				n.prev = $(this.nodes).get(-1);
				n.prev.next = n;
				n.next = null;
			}
			else {
				n.prev = null;
				n.next = null;
			}
			n.status = "unplayed";
			this.nodes.push(n);
		},
		nodes: []
	}
};
var UMP = function(obj, callback) {
	if( typeof obj != "object" )
		error("Parameter must be of type object.");
	if( typeof callback != "function" )
		error("Callback must be a function.");
	
	$.each(obj, function(key, value) {
		if( !(key in UMPClass.services) )
			error("Types key '"+key+"' doesn't exist.");
		else {
			called = false;
			$.each(value, function(k, v) {
				$.getJSON(v, (function(thisi) {
					return function(data) {
						 UMPClass.services[key].parse(data);
						 if( UMPClass.current == null )
							UMPClass.current = UMPClass.nodes.nodes[0];
						//if( !called ) {
							callback.call(this, UMPClass.nodes.nodes, UMPClass.current.handler);
							called = true;
						//}
					};
				}(v)));
			});
		}
	});
};
