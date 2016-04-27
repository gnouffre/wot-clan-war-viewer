<?php

include('settings.php');
error_reporting(E_ERROR | E_PARSE);

header('Content-Type: text/html; charset=UTF-8');
// R?cup?ration des param?tres
$typeselection = '';
if (isset($_POST['typeselection'])) {
    $typeselection = $_POST['typeselection'];
}


if ((isset($typeselection) &&  $typeselection > '')) {

// recuperation des saison pour retrouver la construction a faire et controler :
$fichierextraction = "seasondata.json";
$fichierjson = fopen($fichierextraction, 'a+');
$infosrefresh = fread($fichierjson, filesize($fichierextraction));
$listeseason = json_decode($infosrefresh, true);
fclose($fichierjson);

if(isset($listeseason[$typeselection]) && $listeseason[$typeselection]['build'] == false && $listeseason[$typeselection]['status'] == "ACTIVE") {

// recuperation de la partie de la carte déja construite
$fichierextraction = 'map/' .$typeselection .".geojson";
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
for ($i = 1; $i < 151; $i++) {
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
$fichierextraction = 'map/' .$typeselection .".geojson";
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
$listeseason[$typeselection]['build'] = true;
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
$parametretransmis = "invalide map : " .$typeselection. " map already build : " .$listeseason[$typeselection]['build'] . '  or no active map' .$listeseason[$typeselection]['status'];
echo ($parametretransmis);

}
} 
else {
$parametretransmis = "parametre nom saison manquant : " .$typeselection;
echo ($parametretransmis);
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


function get_coordonate($province_id) {


$pageidp = "https://cwxstatic-eu.wargaming.net/v25/provinces_geojson/" . $province_id . ".json";
    $data2 = get_page($pageidp);
    $data2 = json_decode($data2, true);	
	$geom = $data2['geom'];
return $geom ;


	
}

?>