$(document).ready(function(){
	
	var toTime = function(x){
		var m = Math.floor(x/60);
		var s = Math.ceil(x%60);
		if( m >= 60 )
			m = 0;
		if( s >= 60 )
			s = 0;
		if( s < 10 )
			s = "0"+s;
		return m+":"+s;
	}
	
	// Basic stuff first	
	$("#right").tabs();
	
	var last_volume = 100;
	$("#volume-high, #volume-low").click(function(){
		last_volume = $("#volumeslide").slider("value");
		$("#volumeslide").slider("value", 0);
	});
	$("#volume-mute").click(function(){
		$("#volumeslide").slider("value", last_volume);
	});
	
	// Load music
	
	var urls = {
		"reddit": ["http://reddit.com/r/listentothis.json?jsonp=?&callback=?"]
	};
	var u = UMP(urls, function(data){
		$.each(data, function(k, v) {
			v.options.class = "item "+v.options["data-service"];
			v.options.html = '<a href="#">' + v.options["data-title"] + '</a>';
			$item = $("<li>", v.options)
				.mouseenter(function(){
					$(this).find(".desc").stop().animate({ left: 0 }, {duration: 400, easing: "easeOutExpo"});
				})
				.mouseleave(function(){
					$(this).find(".desc").stop().animate({ left: "100%" }, {duration: 700, easing: "easeOutBounce"});
				})
				.click(function(){					
					v.play();					
					return false;
				});
			
			$("#middle .content ul").append($item);
		});
	});
	UMP.buffering = function(x){
		$("#seek #buffered").width($("#seek").width()*x);
	};
	UMP.playing = function(width, time){
		$("#timeplayed").html(toTime(time));
		$("#seek #played").width($("#seek").width()*width);
	};
	UMP.played = function(x){
		$("#media-info #comments").html("");
		/*
		$.each(x.comments, function(k, v){
			$("#media-info").find("#comments").append($(v).html());
		});
		*/

		if( x.options["data-artist"] ) {
			// search lastfm for artist info
			$.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist="+x.options["data-artist"]+"&api_key=b25b959554ed76058ac220b7b2e0a026&format=json", function(data){
				console.log(data);

				if( !data.error ) {
					// artist info template
					dhtml = '<h2><a href="'+data.artist.url+'" target="_blank">'+data.artist.name+'</a></h2>';
					dhtml += '<img src="'+data.artist.image[3]["#text"]+'" />';
					dhtml += '<p>'+data.artist.bio.summary+'</p>';
					$("#artist-info").html(dhtml);
				}
				else
					$("#artist-info").html("<p>No artist information found.</p>");
			});
		}
		else {
			$("#artist-info").html("No artist information found.");
		}

		$("#totaltime").html(toTime(x.getDuration()));
		x.setVolume(last_volume);
		$("[data-uid="+x.options["data-uid"]+"]").addClass("active").siblings().removeClass("active");
		var p = $("[data-uid="+x.options["data-uid"]+"]").position();
		if( p.top < $("#content").scrollTop() || p.top > $("#content").scrollTop() + $(window).height() )
			$("#content").scrollTop($("[data-uid="+x.options["data-uid"]+"]").offset().top-($(window).height()/2));
		$("#pause").show();
		$("#play").hide();
	};
	UMP.paused = function(){
		$("#play").show();
		$("#pause").hide();
	};
	
	$("#play").click(function(){
		u.handle.play();
	});
	$("#pause").click(function(){
		u.handle.pause();
	});
	$("#prev").click(function(){
		var p = u.handle.prev();
		$("#seek #buffered").width(0);
		$("#seek #played").width(0);
	});
	$("#next").click(function(){
		var n = u.handle.next();
		$("#seek #buffered").width(0);
		$("#seek #played").width(0);
	});
	$("#seek").click(function(e){
		u.handle.seekTo(e.offsetX/$(this).width()*u.handle.getDuration());
	});

	$("#shuffle").click(function(){
		if( $(this).hasClass("active") ) {
			$(this).removeClass("active");
			u.shuffle(false);
		}
		else {
			$(this).addClass("active");
			u.shuffle(true);
		}
	});
	$("#repeat").click(function(){
		$(this).hide();
		$("#norepeat").show();
		u.repeat(0);
	});
	$("#repeatone").click(function(){
		$(this).hide();
		$("#repeat").show();
		u.repeat(2);
	});
	$("#norepeat").click(function(){
		$(this).hide();
		$("#repeatone").show();
		u.repeat(1);
	});
	
	$("#volumeslide").slider({
		value: 100,
		range: "min",
		slide: function(e, ui){
			var v = ui.value;
			u.handlers.handle.setVolume(v);
			if( v == 0 ) {
				$("#volume-mute").show();
				$("#volume-low").hide();
				$("#volume-high").hide();
			}
			else if( v > 0 && v <= 40 ) {
				$("#volume-mute").hide();
				$("#volume-low").show();
				$("#volume-high").hide();
			}
			else {
				$("#volume-mute").hide();
				$("#volume-low").hide();
				$("#volume-high").show();
			}
			$("#volumeslide #volume").width(v);
			if( v != 0 )
				last_volume = v;
		},
		change: function(e, ui){
			var v = ui.value;
			u.handlers.handle.setVolume(v);
			if( v == 0 ) {
				$("#volume-mute").show();
				$("#volume-low").hide();
				$("#volume-high").hide();
			}
			else if( v > 0 && v <= 40 ) {
				$("#volume-mute").hide();
				$("#volume-low").show();
				$("#volume-high").hide();
			}
			else {
				$("#volume-mute").hide();
				$("#volume-low").hide();
				$("#volume-high").show();
			}
			$("#volumeslide #volume").width(v);
			if( v != 0 )
				last_volume = v;
		}
	});

	/*
	
	var services = [];
	$.each(u.services, function(k,v){
		services.push(k);
	});
	services.sort();

	$.each(services, function(k, v){
		v = u.services[v];
		$i = '<input type="checkbox" value="'+v.name.toLowerCase()+'" id="'+v.name+'" data-active="'+v.active+'"><label for="'+v.name+'">'+v.name+'</label>';
		$("#left .content #services").append($i);
	});
	
	$("#left #services input").button({ 
		icons: { primary: "ui-icon-close" }
	}).click(function(){
		if( this.checked ) {
			$("#middle .content ul").find('.'+$(this).attr("value")).show();
			$(this).button("option", "icons", { primary: "ui-icon-check" } );
		}
		else {
			$("#middle .content ul").find('.'+$(this).attr("value")).hide();
			$(this).button("option", "icons", { primary: "ui-icon-close" } );
		}
	});
	
	$("#left #services input").each(function(k,v){
		if( $(this).attr("data-active") == "true" ) {
			$(this).next("label").addClass("ui-state-active").attr("aria-pressed", "true");
			$(this).button("option", "icons", { primary: "ui-icon-check" } );
		}
	});
	*/
});
