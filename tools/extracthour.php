
     
<?php

include('settings.php');
$nbpassage = 0;
header('Content-type: text/html; charset=utf-8', true);
spl_autoload_register(function($class)
{
    $file = __DIR__.'/lib/'.strtr($class, '\\', '/').'.php';
    if (file_exists($file)) {
        require $file;
        return true;
    }
});
 
// use TextLanguageDetect;




// sauvegarde journée

$heureducron = date("G");
$minuteducron = date("i");
echo 'heure du cron' .$heureducron;
if ($heureducron == 3 )
{

$date = new DateTime();

date_sub($date, date_interval_create_from_date_string('1 days'));
$madate = date_format($date, 'Y_m_d');
 echo $madate;
// lecture du dernier fichier
$fichierextraction = "../extract/extraction.json";
$fichierjson = fopen($fichierextraction, 'a+');
$infosrefresh = fread($fichierjson, filesize($fichierextraction));
fclose($fichierjson);
echo "recup du fichier " . "../extract/extraction.json";

// copie de la sauvegarde
$fichierextraction2 = "../extract/extraction".$madate. ".json";
$fichierjson2 = fopen($fichierextraction2, 'x+');
ftruncate($fichierjson2,0);
fputs($fichierjson2, $infosrefresh);
fclose($fichierjson2);
echo "copie : " . "../extract/extraction".$madate. ".json";
echo "contenu : " . $infosrefresh;

buildmap(150);

}
elseif($heureducron != 3 && $heureducron != 2 && $heureducron != 1) {


// sauvegarde horaire

$fichierextraction = "../extract/extraction.json";


$infoamettre = get_info2($cluster);

$fichierjson = fopen($fichierextraction, 'w');
fputs($fichierjson, $infoamettre);
fclose($fichierjson);
buildmap(50);

} elseif($heureducron == 2 || $heureducron == 1 ) {
//refresh de la carte a faire
buildmap(150);
}

  


;


function get_info2($cluster) {

// nom de la saison active

$season_id = 'europemap';	
$pageidc = "https://api.worldoftanks.eu/wot/globalmap/seasons/?application_id=" . $cluster . '&status=ACTIVE';
$data = get_page($pageidc);
$data = json_decode($data, true);
echo 'season_id' .$data['data'][0]['season_id'];
if ($data['status'] == 'ok' && $data['data'][0]['status'] == 'ACTIVE' ) {
$season_id = $data['data'][0]['season_id'];
}



  
// annuaire clan
$derniereextract = "annuaireClan.json";
$fichierclan = fopen($derniereextract, 'a+');
$contents = fread($fichierclan, filesize($derniereextract));
$annuaireclan = json_decode($contents, true);
fclose($fichierclan);



			// deuxieme partie : liste front 	
	$pageidc3 = "https://api.worldoftanks.eu/wot/globalmap/fronts/?application_id=" . $cluster;
$data3 = get_page($pageidc3);
$data3 = json_decode($data3, true);
$frontlist = array_keys($data3['data']);

$listeclanssurcarte = [];
$listeclanssurcartep2 = [];

foreach ($frontlist as $front) {		
$frontid =  $data3['data'][$front]['front_id']	;		
		// troisieme partie : liste provinces
echo 'NEW FRONTLIST --------->'.$data3['data'][$front]['front_id'];	
$k = 0;

$j= 0;
$data2['status'] = 'ok';
$data2['meta']['count'] = 100;
while ($data2['status'] == 'ok' and $data2['meta']['count'] > 0) {
$j++;
$pageidc2 = "https://api.worldoftanks.eu/wot/globalmap/provinces/?application_id=" . $cluster . "&language=en&front_id=" .$frontid . "&page_no=" . $j ;
$data2page = get_page($pageidc2);
$data2 = json_decode($data2page, true);
echo $data2['status'];
if ($data2['status'] == 'error') {
echo $data2page;
}
echo '</br>NEW LOT PROVINCE --------->'."&page_no=" . $j .'</br>';
$provincelist = array_keys($data2['data']);

foreach ($provincelist as $province) {

$provinceencours = $data2['data'][$province]['province_id'];
               $parametresprovince[$provinceencours]['arena_name'] = $data2['data'][$province]['arena_name'];
			   $parametresprovince[$provinceencours]['province_name'] = $data2['data'][$province]['province_name'];
			   $parametresprovince[$provinceencours]['province_id'] = $data2['data'][$province]['province_id'];
			   $parametresprovince[$provinceencours]['front_name'] = $data2['data'][$province]['front_name'];
			   $parametresprovince[$provinceencours]['prime_time'] = $data2['data'][$province]['prime_time'];
			   $parametresprovince[$provinceencours]['server'] = $data2['data'][$province]['server'];
			   $parametresprovince[$provinceencours]['status'] = $data2['data'][$province]['status'];
			   $parametresprovince[$provinceencours]['daily_revenue'] = $data2['data'][$province]['daily_revenue'];
			   $parametresprovince[$provinceencours]['revenue_level'] = $data2['data'][$province]['revenue_level'];
			   $parametresprovince[$provinceencours]['owner_clan_id'] = $data2['data'][$province]['owner_clan_id'];
			   $parametresprovince[$provinceencours]['landing_type'] = $data2['data'][$province]['landing_type'];
			   $parametresprovince[$provinceencours]['uri'] = $data2['data'][$province]['uri'];
			   
			   $parametresprovince[$provinceencours]['active_battles'] = count($data2['data'][$province]['active_battles']);
			   $parametresprovince[$provinceencours]['attackers'] = count($data2['data'][$province]['attackers']);
			   $parametresprovince[$provinceencours]['competitors'] = count($data2['data'][$province]['competitors']);
			   if ($data2['data'][$province]['pillage'] > "") {
			   $parametresprovince[$provinceencours]['pillage'] = true;
			   } else {
			   $parametresprovince[$provinceencours]['pillage'] = false;			   
			   };
			   
			   $datejour = new DateTime();
			   date_sub($datejour, date_interval_create_from_date_string('1 days'));
               $madate = date_format($datejour, 'Y_m_d');


			   if (!isset ($annuaireclan[$data2['data'][$province]['owner_clan_id']]) ) {
			   $listeclanssurcarte[$data2['data'][$province]['owner_clan_id']] = $data2['data'][$province]['owner_clan_id'];
                $k++;
				}
				else {
			   $listeclanssurcartep2[$data2['data'][$province]['owner_clan_id']] = array( "data" => $data2['data'][$province]['owner_clan_id'], "date" => $annuaireclan[$data2['data'][$province]['owner_clan_id']]['$daterefresh']);
                $k++;
				}
				}
		
				
				}
				$parametresfront[$data3['data'][$front]['front_id']] = $data3['data'][$front];
				}
				$parametrescomplet = array(
				'front' => $parametresfront,
				'provinces' => $parametresprovince,
				'clan' => $parametresclan,
				'season_id' => $season_id);
				
				
				
				//clan a créer ------------------------------------		
				$numclan = 0;
				// les clans ne sont pas trouvé dans le cas event il faut passer par la methode officielle
				//nb passage a 10 ne passe pas sur le serveur avec 2 appel API (soit 20 appel API)
				// 7 non plus
				$arraylisteclanssurcarte = array_keys($listeclanssurcarte);
				while ($numclan < count($listeclanssurcarte ) && $nbpassage < 5 ) {
					$ind = 0;
					$listeclanAPI = '';
					for ($ind = 0; $ind < 10 && $numclan <= count($listeclanssurcarte) ; $ind++) {
					
					$listeclanAPI = $listeclanAPI .$listeclanssurcarte[$arraylisteclanssurcarte[$numclan]] .',' ; 
					$numclan ++;
					};
					$nbpassage ++;
					$pageidc3 = "https://api.worldoftanks.eu/wgn/clans/info/?application_id=" .$cluster ."&fields=description%2C%20members_count%2C%20created_at %2C%20accepts_join_requests%2C%20clan_id%2C%20color%2C%20tag%20%2C%20emblems.x32%2C%20name%2C%20&clan_id=" . $listeclanAPI  ;
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
				//clan a mettre a jour p2 ------------------------------------		
								$numclan = 0;
				// les clans ne sont pas trouvé dans le cas event il faut passer par la methode officielle
				//nb passage a 10 ne passe pas sur le serveur avec 2 appel API (soit 20 appel API)
				// 7 non plus
				usort($listeclanssurcartep2, 'date_compare');
				$arraylisteclanssurcarte = array_keys($listeclanssurcartep2);
					
				while ($numclan < count($arraylisteclanssurcarte ) && $nbpassage < 5 ) {
					$ind = 0;
					$listeclanAPI = '';
					for ($ind = 0; $ind < 10 && $numclan <= count($arraylisteclanssurcarte) ; $ind++) {
					
					$listeclanAPI = $listeclanAPI .$listeclanssurcartep2[$arraylisteclanssurcarte[$numclan]]['data'] .',' ; 
					$numclan ++;
					};
					$nbpassage ++;
					$pageidc3 = "https://api.worldoftanks.eu/wgn/clans/info/?application_id=" .$cluster ."&fields=description%2C%20members_count%2C%20created_at %2C%20accepts_join_requests%2C%20clan_id%2C%20color%2C%20tag%20%2C%20emblems.x32%2C%20name%2C%20&clan_id=" . $listeclanAPI  ;
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


		
        $parametretransmis = (json_encode( $parametrescomplet));
		return $parametretransmis ;
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

function date_compare($a, $b)
{

    $t1 = DateTime::createFromFormat("Y_m_d",$a['date']);
    $t2 = DateTime::createFromFormat("Y_m_d",$b['date']);
	if ($t1 == $t2) {
    return 0;
  }

  return $t1 < $t2 ? -1 : 1;
    
} 
function get_coordonate($province_id) {


$pageidp = "https://cwxstatic-eu.wargaming.net/v25/provinces_geojson/" . $province_id . ".json";
    $data4 = get_page($pageidp);
    $data4dat = json_decode($data4, true);	
	$geom = $data4dat['geom'];
return $geom ;


	
}

function buildmap($numberprov) {


// recuperation des saison pour retrouver la construction a faire et controler :
$fichierextraction = "seasondata.json";
$fichierjson = fopen($fichierextraction, 'a+');
$infosrefresh = fread($fichierjson, filesize($fichierextraction));
$listeseason = json_decode($infosrefresh, true);
fclose($fichierjson);
$listeseasonarray = array_keys($listeseason);
foreach ($listeseasonarray as $season) {

if(isset($listeseason[$season]) && $listeseason[$season]['build'] == false && $listeseason[$season]['status'] == "ACTIVE") {

// recuperation de la partie de la carte déja construite
$fichierextraction = 'map/' .$season .".geojson";
$mapgeojson = fopen($fichierextraction, 'a+');
$mapbuild = fread($mapgeojson, filesize($fichierextraction));
$mapbuildjson = json_decode($mapbuild, true);

if (filesize($fichierextraction) == 0) { 
$features = [];
$dernierProv = 0;
$dernierProvPosition = -1;
rewind($mapgeojson);
$mapbuildjson  = array(
				'type' => 'FeatureCollection',
				'features' => $features);
fputs($mapgeojson, json_encode($structure));
}
else {
$features = $mapbuildjson['features'];
$dernierProv = count($features) ;
$dernierProvPosition = $dernierProv - 1 ;
}
fclose($mapgeojson);

// recuperation de la derniere save pour avoir toutes provinces.
$fichierextraction = "../extract/extraction.json";
$fichierjson = fopen($fichierextraction, 'a+');
$infosrefresh = fread($fichierjson, filesize($fichierextraction));
$listeprovince = json_decode($infosrefresh, true);
fclose($fichierjson);
$arraylisteprov = array_values($listeprovince['provinces']);
$nombreprovtot = count($arraylisteprov);
for ($i = 1; $i < $numberprov; $i++) {
    if ($dernierProv < $nombreprovtot) {
	$dernierProv ++;
	$dernierProvPosition ++;
	$prov = $arraylisteprov[$dernierProvPosition]['province_id'];
	$uri = $arraylisteprov[$dernierProvPosition]['uri'];
	// recuperation des coordonnées
	
	
	$provincebuild  = array(
				'type' => 'Feature',
				'geometry' => get_coordonate($prov),
				'properties' =>  array(
					'province_id' => $prov,
					'linkurl' => $uri)
				);
	array_push($mapbuildjson['features'], $provincebuild) ;			
				
	}
}
// mise a jour du fichier
$fichierextraction = 'map/' .$season .".geojson";
$mapgeojson = fopen($fichierextraction, 'w+');
if (flock($mapgeojson, LOCK_EX)) {
rewind($mapgeojson);
fputs($mapgeojson, json_encode($mapbuildjson));
fflush($mapgeojson);
flock($mapgeojson, LOCK_UN);
};
fclose($mapgeojson);

if ($dernierProv < $nombreprovtot) {
$parametretransmis = " Build ok but not finished, (Last province build number " .$dernierProv. " total " . $nombreprovtot .")" ;
echo ($dernierProv / $nombreprovtot) * 100;



}
else {
$parametretransmis = " Build finished !" ;
$fichierextraction = "seasondata.json";
$fichierjson = fopen($fichierextraction, 'a+');
$infosrefresh = fread($fichierjson, filesize($fichierextraction));
$listeseason = json_decode($infosrefresh, true);
$listeseason[$season]['build'] = true;
if (flock($fichierjson, LOCK_EX)) {
rewind($fichierjson);
ftruncate($fichierjson, 0);
fputs($fichierjson, json_encode($listeseason));
fflush($fichierjson);
flock($fichierjson, LOCK_UN);
};
fclose($fichierjson);


echo 100;

}
}  
else {
$parametretransmis = "invalide map : " .$season. " map already build : " .$listeseason[$season]['build'] . '  or no active map' .$listeseason[$season]['status'];
echo ($parametretransmis);

}
}


}
?>