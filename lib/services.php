<?php
error_reporting(E_ALL ^ E_NOTICE);
define("MAXLIMIT", 50);
define("LIMIT", 10);

/**
* Works on URLs like:
* http://www.youtube.com/watch?v=0bt9xBuGWgw
* http://youtu.be/0bt9xBuGWgw
*
* outputs just the video id
**/
// source: http://forrst.com/posts/Simple_Youtube_video_ID_parser-Ykw
function YTvid($videourl) {
    $longurl = preg_match("#(?<=v=)[a-zA-Z0-9-]+(?=&)|(?<=[0-9]\/)[^&\n]+|(?<=v=)[^&\n]+#", $videourl, $ytid );

    if( !$longurl ) {
        $ytpath = parse_url($videourl);
        if( $ytpath['host'] == 'youtu.be' )
            $ytid = ltrim( $ytpath['path'],'/');
    }
    return $longurl ? $ytid[0] : $ytid;
}

interface Service {	
	/**
	 * @return Array
	 */
	public function getItems($start, $length);
}

class Services implements Service {
	protected static $services = array();
	
	public function getServices() {
		return Services::$services;
	}
	public function addService($arr) {
		Services::$services = array_merge(Services::$services, $arr);
	}
	public function getSortingMethods(){
		
	}
	public function getItems($start, $length) {
		
	}
}

class Youtube extends Services {
	private $items = array();
	function video_search($q) {
		$results = json_decode(file_get_contents("http://gdata.youtube.com/feeds/api/videos?q=" . urlencode($q) . "&alt=json&max-results=" . MAXLIMIT), true);
		foreach( $results["feed"]["entry"] AS $k => $v ) {
			$arr["title"] = $v['title']['$t'];
			$arr["description"] = $v['content']['$t'];
			$arr["provider"] = "youtube.com";
			$arr["service"] = "youtube.com";
			$arr["image"] = $v['media$group']['media$thumbnail'][0]['url'];
			if( $arr["image"] != "" )
				$arr["output"] = '<div class="thumb"><img src="' . $arr["image"] . '" /></div><div class="desc"><h2>' . $arr["title"] . '</h2>' . $arr["description"] . '</div>';
			else
				$arr["output"] = '<div class="desc2"><h2>' . $arr["title"] . '</h2>' . $arr["description"] . '</div>';
			
			$arr["url"] = str_replace('/', '', strrchr($v['id']['$t'], '/'));
			
			$arr["playable"] = true;
			$this->items[] = $arr;
		}
	}
	function getItems($start = 0, $length = LIMIT) {
		$items = array_slice($this->items, $start, $length);
		return $items;
	}
}

class Reddit extends Services {
	protected $subreddits = array("listentothis");
	
	public function __construct($page = 0) {
		parent::addService(array("Reddit" => array()));
	}
	public function loadItemFromId($id) {
		
	}
	public function loadItemFromArray($i) {
		$allowed_providers = array("youtube.com", "youtu.be", "soundcloud.com");
		$arr["provider"] = $i["data"]["domain"];
		if( in_array($arr["provider"], $allowed_providers) ) {
			$arr["title"] = $i["data"]["title"];
			$arr["service"] = "reddit";
			
			$arr["image"] = $i["data"]["media"]["oembed"]["thumbnail_url"];
			if( $arr["image"] != "" )
				$arr["output"] = '<a href="#"><img class="thumbnail" src="' . $arr["image"] . '" /><div class="desc"><h5>' . $arr["title"] . '</h5></div></a>';
			else
				$arr["output"] = '<a href="#"><div class="desc2"><h5>' . $arr["title"] . '</h5></div></a>';
			
			$str = trim(preg_replace("/(\(.*\)|\[.*\])/", "", $i["data"]["title"]));
			preg_match("/(.*) \- (.*)/", $str, $matches);
			
			$arr["artist"] = !empty($matches[1]) ? $matches[1] : "";
			$arr["song"] = !empty($matches[2]) ? $matches[2] : "";
			$arr["playable"] = true;
			$arr["uid"] = $i["data"]["id"];
			
			if( $arr["provider"] == "youtube.com" || $arr["provider"] == "youtu.be" )
				$arr["url"] = YTvid($i["data"]["url"]);
			else
				$arr["url"] = $i["data"]["url"];
			
			return $arr;
		}
		else
			return false;
	}
	public function getItems($start = 0, $length = LIMIT) {
		$subreddits = implode("+", $this->subreddits);
		// caching here
		$items = json_decode(file_get_contents("http://reddit.com/r/$subreddits.json?limit=" . MAXLIMIT), true);
		$items = $items["data"]["children"];
		$ret = array();
		// foreach( $items AS $k => $i ) {
		for( $y = $start; $y < $start+$length; $y++ ) {
			$i = $items[$y];
			$r = $this->loadItemFromArray($i);
			if( !empty($r) )
				$ret[] = $r;
		}
		return $ret;
	}
}

?>
