/*
Array.prototype.insert = function(object, index) {
	this.splice(index, 0, object);
};
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};
*/
Array.prototype.shuffle = function(){
	for( var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x );
	return this;
}
// following 3 functions obtained from http://www.sitepoint.com/forums/showthread.php?318819-Unique-ID-in-Javascript
function getRandomNumber(range) {
	return Math.floor(Math.random() * range);
}
function getRandomChar() {
	var chars = "0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ";
	return chars.substr(getRandomNumber(62), 1);
}
function randomID(size) {
	var str = "";
	for(var i = 0; i < size; i++) {
		str += getRandomChar();
	}
	return str;
}
var ump = {
	queued: [],
	original_queued: [],
	position: -1,
	handle: null,
	options: {
		shuffle: true,
		repeat: 0 // 0 - none, 1 - song, 2 - playlist
	},
	repeat: function(n){
		if( n < 0 || n > 2 )
			return false;
		else
			this.options.repeat = n;
	},
	shuffle: function(on){
		if( typeof on == "undefined" )
			on = false;
			
		if( this.original_queued.length == 0 )
			this.original_queued = this.queued;
		
		if( !on ) {
			this.queued = this.original_queued;
			x = 0;
			this.options.shuffle = false;
		}
		else {
			this.queued = this.queued.shuffle();
			// switch first track and selected track so shuffling starts at beginning of playlist
			var temp = this.queued[0];
			this.queued[0] = this.queued[this.position];
			this.queued[this.position] = temp;
			x = 0;
			this.options.shuffle = true;
		}
		for( var i in ump.queued ) {
			ump.queued[i].index = x++;
		}
	},
	services: {
		"soundcloud": {
			name: "SoundCloud",
			active: false
		},
		"reddit": {
			name: "Reddit",
			active: true,
			parse: function(data) {
				$.each(data.data.children, function(k, v){
					if( (v["data"]["domain"] == "youtube.com" || v["data"]["domain"] == "youtu.be") && v["data"]["is_self"] == false ) {
						var add = {
							options: {
								"class": "reddit "+v["data"]["subreddit"],
								"data-provider": "youtube.com",
								"data-service": "reddit",
								"data-url": v["data"]["url"].replace(/^[^v]+v.(.{11}).*/,"$1"),
								"data-title": v["data"]["title"],
								"data-uid": randomID(11),
								"data-thumb": v["data"]["media"] ? v["data"]["media"]["oembed"]["thumbnail_url"] : ""
							},
							index: ump.queued.length
						};
						// artist & song & genre info
						var title = v.data.title;
									
						/*
						var genres = title.match(/\s?\[.*\]\s?/);
						if( genres ) {
							genres = genres[0].split(/[,\/]+/);
							for( var genre in genres ) {
								console.log(typeof genres[genre]);
								console.log(genres[genre]);
								// genres[x] = genres[x].replace(/^[\[\s]+|[\]\s]+$/g, "");
							}
						}
						*/
						//add.options["data-genres"] = genres;
						
						title = title.replace(/((\[.*\])*|(\(.*\))*)?=(\w\s)*/gi, "");
						
						artist = title.match(/(\w|\s|\.|\,|\=|\+\w\-\w\?\'\")*\s?\-/gi);
						if( artist ) {
							artist = artist[0].replace(/\s?-/, "");
							add.options["data-artist"] = artist;
						}
						
						song = title.match(/\-\s?\'?\"?(\w|\s)*\'?\"?/gi);
						if( song ) {
							song = song[0].replace(/\-\s?/, "");
							add.options["data-song"] = song;
						}
						
						// comments
						var perm = v["data"]["permalink"];
						add.comments = [];
						var url = "http://reddit.com"+perm+".json?jsonp=?&callback=?";
						$.getJSON(url, function(data){
							var results = data[1];
							$.each(results["data"]["children"], function(l, w){
								add.comments.push(w["data"]["body_html"]);
							});
						});
							
						$.extend(add, ump.handlers["youtube"]);
						ump.queued.push(add);
					}
				});
			}
		}
	},
	handlers: {
		handle: null,
		buffer_timer: null,
		play_timer: null,
		"ump": {
			prev: function(){				
				if( ump.options.repeat == 2 && ump.position-1 >= 0 )
					return ump.queued[ump.position-1];
				else if( ump.options.repeat == 2 && ump.position-1 < 0 )
					return ump.queued[ump.queued.length-1];
				else if( ump.options.repeat == 0 && ump.position-1 >= 0 )
					return ump.queued[ump.position-1];
				else if( ump.options.repeat == 0 && ump.position-1 < ump.queued.length )
					return ump.queued[-1];
				else
					return ump.queued[ump.position];
			},
			next: function(){
				if( ump.options.repeat == 2 && ump.position+1 < ump.queued.length )
					return ump.queued[ump.position+1];
				else if( ump.options.repeat == 2 && ump.position+1 >= ump.queued.length )
					return ump.queued[0];
				else if( ump.options.repeat == 0 && ump.position+1 < ump.queued.length )
					return ump.queued[ump.position+1];
				else if( ump.options.repeat == 0 && ump.position+1 >= ump.queued.length )
					return ump.queued[ump.queued.length];
				else
					return ump.queued[ump.position];
			}
		},
		"youtube": {
			play: function(){
					if( ump.position != this.index || (ump.position == this.index && ump.options.repeat == 1) ) {
						clearInterval(ump.handlers.buffer_timer);
						clearInterval(ump.handlers.play_timer);
						
						var t = this;
						ump.handle = this;
						
						swfobject.embedSWF("http://www.youtube.com/v/"+t.options["data-url"]+"?controls=0&enablejsapi=1&playerapiid=ytplayer&version=3&wmode=transparent", "player", "425", "256", "8", null, null, { allowscriptaccess: "always", wmode: "transparent" }, { id: "player", name: "theplayer", wmode: "transparent" });
						window.onYouTubePlayerReady = function(p){
							ump.handlers.handle = document.getElementById("player");
							// buffer
							ump.handlers.buffer_timer = setInterval(function(){
								t.buffered = ump.handlers.handle.getVideoBytesLoaded() / ump.handlers.handle.getVideoBytesTotal();
								UMP.buffering(t.buffered);
								if( t.buffered >= ump.handlers.handle.getVideoBytesTotal() )
									clearInterval(ump.handlers.buffer_timer);
							}, 1000);
							ump.handlers.play_timer = setInterval(function(){
								t.played = ump.handlers.handle.getCurrentTime() / ump.handlers.handle.getDuration();
								UMP.playing(t.played, ump.handlers.handle.getCurrentTime());
								if( t.played >= 1 ) {
									clearInterval(ump.handlers.play_timer);
									t.next();
								}
							}, 1000);
							ump.handlers.handle.playVideo();
							UMP.played(t);
							console.log("Playing");
							console.log(t);
						};
						ump.position = t.index;
					}
					else {
						ump.handlers.handle.playVideo();
						UMP.played(this);
					}
			},
			pause: function(){
				ump.handlers.handle.pauseVideo();
				UMP.paused();
			},
			prev: function(){
				var p = ump.handlers.ump.prev();
				p.play();
				return p;
			},
			next: function(){
				var p = ump.handlers.ump.next();
				p.play();
				return p;
			},
			setVolume: function(x){
				ump.handlers.handle.setVolume(x);
			},
			getVolume: function(){
				return ump.handlers.handle.getVolume();
			},
			seekTo: function(x){
				ump.handlers.handle.seekTo(x);
			},
			getDuration: function(){
				return ump.handlers.handle.getDuration();
			},
			getTimeElapsed: function(){
				return ump.handlers.handle.getCurrentTime();
			}
		}
	}
};


UMP = function(data, callback) {
	var defs = [];
	$.each(data, function(s, u){
		if( typeof ump.services[s] == "undefined" )
			$.error("UMP: Service doesn't exist.");
		else {
			$.each(u, function(k, v){
				defs.push(
					$.getJSON(v, function(data){
						ump.services[s].parse(data);
					})
				);
			});
		}
	});
	$.when.apply(null, defs).then(function(data){
		ump.handlers.handle = $("#player");
		callback.call(this, ump.queued);
	});
	return ump;
};
