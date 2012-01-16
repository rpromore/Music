var error = function(x) {
	console.log("UMP: "+x);
	return false;
};
var UMPClass = {
	current: null,
	options: {
		shuffle: false,
		repeat: 0 // 0 - no repeat, 1 - repeat once, 2 - repeat all
	},
	services: {
		add: function(obj) {
			if( typeof obj != "object" )
				error("Adding object to services must be of type 'object'.");
			else
				$.extend(this.services, obj);
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
								handler: UMPClass.handlers.handlers["youtube"]
							};
							UMPClass.nodes.add(add);
						}
					});
				}
			}
		}
	},
	handlers: {
		add: function(obj) {
			if( typeof obj != "object" )
				error("Adding object to handlers must be of type 'object'.");
			else
				$.extend(this.handlers, obj);
		},
		handlers: {
			"youtube": {
				handle: null,
				status: "paused",
				embed: function(url, callback){
					var t = this;
					swfobject.embedSWF("http://www.youtube.com/v/"+url+"?controls=0&enablejsapi=1&playerapiid=ytplayer&version=3&wmode=transparent", "player", "425", "256", "8", null, null, { allowscriptaccess: "always", wmode: "transparent" }, { id: "player", name: "theplayer", wmode: "transparent" });
					window.onYouTubePlayerReady = function(p){
						t.handle = document.getElementById("player");
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
					this.onplay();
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
		}
	},
	nodes: {
		add: function(n) {
			this.nodes.push(n);
			t = $(this.nodes).get(-1);
			if( typeof $(this.nodes).get(-2) != "undefined" ) {
				t.prev = $(this.nodes).get(-2);
				t.prev.next = t;
				t.next = null;
			}
			else {
				t.prev = null;
				t.next = null;
			}
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
		if( !(key in UMPClass.services.services) )
			error("Types key '"+key+"' doesn't exist.");
		else {
			called = false;
			$.each(value, function(k, v) {
				$.getJSON(v, (function(thisi) {
					return function(data) {
						 UMPClass.services.services[key].parse(data);
						 if( UMPClass.current == null )
							UMPClass.current = UMPClass.nodes.nodes[0];
						 if( !called ) {
							callback.call(this, UMPClass.nodes.nodes, UMPClass.current.handler);
							called = true;
						}
					};
				}(value)));
			});
		}
	});
};
