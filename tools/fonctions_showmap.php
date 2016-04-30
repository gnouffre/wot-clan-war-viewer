<?php
header('Content-Type: text/html; charset=UTF-8');
 header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization, X-Request-With');
    header('Access-Control-Allow-Credentials: true');
include('settings.php');

$nbpassage = 0;
spl_autoload_register(function($class)
{
    $file = __DIR__.'/lib/'.strtr($class, '\\', '/').'.php';
    if (file_exists($file)) {
        require $file;
        return true;
    }
});


/*
 *  Script PHP qui traite les requ�tes AJAX envoy�es par le client 
 * */

// R�cup�ration des param�tres
$typeselection = '';
if (isset($_POST['typeselection'])) {
    $typeselection = $_POST['typeselection'];
}
$feature = '';
if (isset($_POST['feature'])) {
    $feature = $_POST['feature'];
}
$clanid = '';
if (isset($_POST['clanid'])) {
    $clanid = $_POST['clanid'];
}



// Traitements

if ((isset($typeselection) && $typeselection == "CLANLIST" )) {
  
$fichierextraction = "annuaireClan.json";
$fichierjson = fopen($fichierextraction, 'a+');
$infosrefresh = fread($fichierjson, filesize($fichierextraction));
$listeclan = json_decode($infosrefresh, true);
uasort($listeclan, function ($a, $b){
  return ($b["id"]-$a["id"]);
});
        $parametretransmis = json_encode($listeclan);

} elseif ((isset($typeselection) && $typeselection == "LOADSAVE" )) {
  
$fichierextraction = "../extract/".$_POST['clanid'];
$fichierjson = fopen($fichierextraction, 'r+');
$infosrefresh = fread($fichierjson, filesize($fichierextraction));
fclose($fichierjson);

        $parametretransmis = $infosrefresh;
} elseif ((isset($typeselection) && $typeselection == "REFRESHCLANONSAVE" )) {
  
$clanid =   json_decode($clanid, true);
// annuaire clan
$derniereextract = "annuaireClan.json";
$fichierclan = fopen($derniereextract, 'a+');
$contents = fread($fichierclan, filesize($derniereextract));
$annuaireclan = json_decode($contents, true);
fclose($fichierclan);


				//clan a créer ------------------------------------		
				$numclan = 0;
				// les clans ne sont pas trouvé dans le cas event il faut passer par la methode officielle
				//nb passage a 10 ne passe pas sur le serveur avec 2 appel API (soit 20 appel API)
				// 7 non plus
				$arraylisteclanssurcarte = array_keys($clanid);
				while ($numclan < count($clanid ) && $nbpassage < 5 ) {
					$ind = 0;
					$listeclanAPI = '';
					for ($ind = 0; $ind < 10 && $numclan <= count($clanid) ; $ind++) {
					
					$listeclanAPI = $listeclanAPI .$clanid[$arraylisteclanssurcarte[$numclan]] .',' ; 
					$numclan ++;
					};
					$nbpassage ++;
					$pageidc3 = "https://api.worldoftanks.eu/wgn/clans/info/?application_id=" .$cluster ."&fields=description%2C%20members_count%2C%20created_at %2C%20accepts_join_requests%2C%20clan_id%2C%20color%2C%20tag%20%2C%20emblems.x32%2C%20name%2C%20is_clan_disbanded%2C%20&clan_id=" . $listeclanAPI  ;
					$data3 = get_page($pageidc3);
					$data3 = json_decode($data3, true);
					$pageidc4 = "https://api.worldoftanks.eu/wot/globalmap/claninfo/?application_id=".$cluster."&clan_id=" . $listeclanAPI  ;
					$data4 = get_page($pageidc4);
					$data4 = json_decode($data4, true);
					$datecreationclan = new DateTime();

					
			   $datejour = new DateTime();
			   $madate = date_format($datejour, 'Y_m_d');

			   $clanlist = array_keys($data3['data']);
foreach ($clanlist as $clannew) {
				if ($data3["data"][$clannew]["is_clan_disbanded"] == false) { 
               $clanl = $data3["data"][$clannew]["clan_id"]; 
			   $members_count = $data3["data"][$clannew]["members_count"]; 
			   $created_at = date("Y-m-d", $data3["data"][$clannew]["created_at"]); 
			   $accepts_join_requests = $data3["data"][$clannew]["accepts_join_requests"]; 
			   $color = $data3["data"][$clannew]["color"]; 
			   $tag = $data3["data"][$clannew]["tag"]; 
			   $emblems = $data3["data"][$clannew]["emblems"]["x32"]["portal"]; 
			   $name = $data3["data"][$clannew]["name"]; 
			   
			   $ratingselo_6 = $data4["data"][$clannew]["ratings"]["elo_6"]; 
			   $ratingselo_8 = $data4["data"][$clannew]["ratings"]["elo_8"]; 
			   $ratingselo_10 = $data4["data"][$clannew]["ratings"]["elo_10"]; 
			   $battles = $data4["data"][$clannew]["statistics"]["battles"]; 
			   $battles_10_level = $data4["data"][$clannew]["statistics"]["battles_10_level"]; 
			   $battles_6_level = $data4["data"][$clannew]["statistics"]["battles_6_level"]; 
			   $battles_8_level = $data4["data"][$clannew]["statistics"]["battles_8_level"]; 
			   $captures = $data4["data"][$clannew]["statistics"]["captures"]; 
			   $losses = $data4["data"][$clannew]["statistics"]["losses"]; 
			   $provinces_count = $data4["data"][$clannew]["statistics"]["provinces_count"]; 
			   $wins = $data4["data"][$clannew]["statistics"]["wins"]; 
			   $wins_10_level = $data4["data"][$clannew]["statistics"]["wins_10_level"]; 
			   $wins_6_level = $data4["data"][$clannew]["statistics"]["wins_6_level"]; 
			   $wins_8_level = $data4["data"][$clannew]["statistics"]["wins_8_level"]; 
			   
			   $description = $data3["data"][$clannew]["description"]; 
				$langage = detect_lang($description);
				$annuaireclan[$clanl]['language'] = $langage;
				
				$clan_a_creer = array(
				'id' => $clanl,
				'tag' => $tag,
				'color' => $color,
				'emblem_url' => $emblems,
				'language' => $langage,
				'name' => $name ,
				'elo_rating_6' => $ratingselo_6,
				'elo_rating_8' => $ratingselo_8 ,
				'elo_rating_10' => $ratingselo_10 ,
				'fine_level' => 0 ,
				'members_count' => $members_count,
				'created_at' => $created_at,
				'accepts_join_requests' => $accepts_join_requests,
				'battles' => $battles,
				'battles_10_level' => $battles_10_level,
				'battles_6_level' => $battles_6_level ,
				'battles_8_level' => $battles_8_level,
				'captures' => $captures,
				'losses' => $losses,
				'provinces_count' => $provinces_count,
				'wins' => $wins,
				'wins_10_level' => $wins_10_level,
				'wins_6_level' => $wins_6_level ,
				'wins_8_level' => $wins_8_level,
				'$daterefresh' => $madate 
				
				);
			$annuaireclan[$clanl] = $clan_a_creer;
				
			   };
			   };
			   

				};

// mise a jour du fichier
$fichierextraction = "annuaireClan.json";
$fichierclan = fopen($fichierextraction, 'w+');
if (flock($fichierclan, LOCK_EX)) {
rewind($fichierclan);
fputs($fichierclan, json_encode($annuaireclan));
fflush($fichierclan);
flock($fichierclan, LOCK_UN);
};
fclose($fichierclan);

        $parametretransmis = "ok";
}  elseif ((isset($typeselection) && $typeselection == "ALLSAVE" )) {
  
$files = array_slice(scandir('../extract/'),2);
$i = 0;
foreach ($files as $file) {

$nomfichier = str_replace(".json", "", basename('../extract/'.$file));
if ($nomfichier == 'extraction') {
$date2 =  date("Y_m_d H:i:s.", filectime('../extract/'.$file));
$dateshow = (date("Y_m_d", filectime('../extract/'.$file)) . " Online");
} else {
$date2 = str_replace("extraction", "", $nomfichier);
$dateshow = $date2 ;
}
$date =  date("d/m/Y H:i:s.", filectime('../extract/'.$file));
$infos [$i] = array( "fichier" => $file, "date" => $date2, "dateshow" => $dateshow );
$i++;
}
//rsort ($infos);
 usort($infos, 'date_compare');
//array_multisort($datefile, SORT_ASC, $infos);
 

        $parametretransmis = json_encode($infos);
}  elseif (isset($typeselection) && $typeselection == "NAMELASTSAVE" ) {
  
$fichierextraction = "extraction.json";
$parametretransmis = $fichierextraction;
} elseif (isset($typeselection) && $typeselection == "DATELASTSAVE" ) {
  
$fichierextraction = "extraction.json";
$date =  filemtime('../extract/'.$fichierextraction);
$parametretransmis = $date;
} elseif (isset($typeselection) && $typeselection == "SEASONDATA" ) {
  
$fichierextraction = "seasondata.json";
$fichierjson = fopen($fichierextraction, 'a+');
$infosrefresh = fread($fichierjson, filesize($fichierextraction));
$listeseason = json_decode($infosrefresh, true);

$pageidc = "https://api.worldoftanks.eu/wot/globalmap/seasons/?application_id=" . $cluster;
$data = get_page($pageidc);
$data = json_decode($data, true);


if ($data['status'] == 'ok') {
$seasonlist = array_keys($data['data']);
foreach ($seasonlist as $season) {

$listeseason[$data['data'][$season]["season_id"]]["season_id"] =  $data['data'][$season]["season_id"];
$listeseason[$data['data'][$season]["season_id"]]["season_name"] =  $data['data'][$season]["season_name"];
$listeseason[$data['data'][$season]["season_id"]]["start"] =  $data['data'][$season]["start"];
$listeseason[$data['data'][$season]["season_id"]]["end"] =  $data['data'][$season]["end"];
$listeseason[$data['data'][$season]["season_id"]]["status"] =  $data['data'][$season]["status"];
if ($listeseason[$data['data'][$season]["season_id"]]["build"] != true) {
$listeseason[$data['data'][$season]["season_id"]]["build"] = false;
} 
}
}
if (flock($fichierjson, LOCK_EX)) {
ftruncate($fichierjson, 0);
rewind($fichierjson);
fputs($fichierjson, json_encode($listeseason));
fflush($fichierjson);
flock($fichierjson, LOCK_UN);
};
fclose($fichierjson);
$parametretransmis = json_encode($listeseason);

} elseif (isset($typeselection) && $typeselection == "BATTLETURNINFO" && isset($clanid)) {
$listturn = [];
$pagenumber = 0;
$provinceid = $clanid;
$pageidc = "https://eu.wargaming.net/globalmap/game_api/tournament_info?alias=".$provinceid."&round=". $pagenumber;
$data = get_page($pageidc);
$data = json_decode($data, true);
$listturn[$data['round_number']] = $data;
while (isset($data['next_round'])) {
$pagenumber = $data['next_round'];
$pageidc = "https://eu.wargaming.net/globalmap/game_api/tournament_info?alias=".$provinceid."&round=". $pagenumber;
$data = get_page($pageidc);
$data = json_decode($data, true);
$listturn[$data['round_number']] = $data;
}

$parametretransmis = json_encode($listturn);
} else {
    $parametretransmis = "error" . $typeselection . $clanid;
}


// Envoi du retour (on renvoi le tableau $retour encod� en JSON)
header('Content-type: application/json');
echo ($parametretransmis);


function date_compare($a, $b)
{

   // $t1 = DateTime::createFromFormat("d/m/Y H:i:s.",$a['datetri']);
   // $t2 = DateTime::createFromFormat("d/m/Y H:i:s.",$b['datetri']);
//	if ($t1 == $t2) {
 //   return 0;
 // }

  //return $t1 > $t2 ? -1 : 1;
 	if ($a['date'] == $b['date']) {
    return 0;
  }

  return $a['date'] > $b['date'] ? -1 : 1;
     
} 
// fonction permettant de récuperer le fichier
function get_page($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_HEADER, 0);
//curl_setopt ($ch, CURLOPT_HTTPHEADER, array('Accept-Language: ru_ru,ru'));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPGET, true);	
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $data = curl_exec($ch);
    curl_close($ch);
    return $data;
}

function detect_lang($string) {
$l = new TextLanguageDetect\TextLanguageDetect;

    $len = $l->utf8strlen($string);
    if ($len < 20) { // this value picked somewhat arbitrarily
        return "";
    }

    $result = $l->detectConfidence($string);

    if ($result == null) {
        return "";
    } else {
        return $result['language'];
    }


unset($l);
}
?>