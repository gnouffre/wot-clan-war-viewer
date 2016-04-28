<?php

include('settings.php');


header('Content-Type: text/html; charset=UTF-8');



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
$fichierjson = fopen($fichierextraction, 'a+');
$infosrefresh = fread($fichierjson, filesize($fichierextraction));
fclose($fichierjson);

        $parametretransmis = $infosrefresh;
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
}  elseif (isset($typeselection) && $typeselection == "LASTSAVE" ) {
  
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
?>