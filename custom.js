
// FOR DEBUG PURPOSE
//window.onerror = function (msg, url, line) {
//           alert("An error is detected, try to reload the page or make a synchronization with WG (Message : " + msg  +"url : " + url + "Line number : " + line + ")"  );
//        };

// WAITING until site was ready.
var preloader = $('#preloader');
//$('#preloaderPage').show();

// GLOBAL VARIABLE
var languages = ["afrikaans", "arabic", "basque", "belarusian", "bulgarian", "catalan", "croatian", "czech", "danish", "dutch", "english", "esperanto", "estonian", "faroese", "finnish", "french", "galician", "german", "greek", "hebrew", "hindi", "hungarian", "icelandic", "indonesian", "irish", "italian", "japanese", "khmer", "korean", "latvian", "lithuanian", "luxembourgish", "malay", "mongolian", "norwegian", "persian", "polish", "portuguese", "romanian", "russian", "serbian", "slovak", "slovene", "spanish", "swedish", "turkish", "ukrainian", "vietnamese", "wargaming"];
//var listclanunknow = new Array;
var clanTable;
var oTable;
var seasonTable;
var maptobuildprogress = 0;
var flagdir = "tools/flags/"
var cartecomplete;
var clanselected = "";
var fullscreen = false;
var layers;
var vector;
var varlayersource;
var chargedgeojson;

// Creating datatable, they are charged after the loading data from php, in order season, clan, province.
showLogSeason();
showLogClan();
showLogTab9('#tabs-9tab');

// Prepare BUTTON CONTROL on map : image / kml
// -------------------------------------------
// Button image : Blob/canvas export dont work due to CORS problems, just an alert....
window.app = {};
var app = window.app;
app.pdf = function () {
	var button = document.createElement('button');
	button.innerHTML = '<img src="tools/images/pdf_icon.png" />';
	button.title = 'Save Image : plz do right click on map';
	var fonctionexport = function () {
		alert('Right click on map and make save image.');
	};
	button.addEventListener('click', fonctionexport, false);
	var element = document.createElement('div');
	element.className = 'pdfbutton ol-control';
	element.appendChild(button);
	ol.control.Control.call(this, {
		element : element
	});
};
// BUTTON EXPORT KML : prepare data to format KML, then blob it in a file for download.
app.google = function () {
	var button = document.createElement('button');
	button.innerHTML = '<img src="tools/images/Google_Maps_Icon.png" />';
	button.title = 'Export format Google Earth';
	var fonctionexportgoogle = function () {
		var kmlFormat = new ol.format.KML();
		var kmllayer = new String('');
		var layers = map.getLayers();
		var features = new Array;
		layers.forEach(function (layer) {
			if (layer.get('idbase') == 'TileWMS') {
				// on ne fait rien
			}
			if (layer.get('idbase') == 'wargaming' || layer.get('idbase') == 'batailles' || layer.get('idbase') == 'texte') {
				var varlayersource = layer.getSource();
				features = $.merge(features, varlayersource.getFeatures());
			}
			if (layer.get('idbase') == 'icone' || layer.get('idbase') == 'texte2' || layer.get('idbase') == 'texte3') {
				var varlayersource = layer.getSource();
				features = $.merge(features, varlayersource.getFeatures());
			}
		});
		kmllayer = kmlFormat.writeFeatures(features, {
				featureProjection : 'EPSG:3857'
			});
		xmlDoc = $.parseXML(kmllayer);
		xml = $(xmlDoc);
		xml.find("scale").each(function () {
			var $this = $(this);
			$this.prop({
				textContent : 1
			});
		});
		xml.find("Icon").each(function () {
			var $this = $(this);
			$this.children().each(function () {
				var $this = $(this);
				if ($this.prop("nodeName") != 'href') {
					$this.remove();
				}
			});
		});
		var xmlString = (new XMLSerializer()).serializeToString(xmlDoc);
		var blob = new Blob([xmlString], {
				type : "text/xml;charset=utf-8"
			});
		saveAs(blob, "WOTclanwar.kml");
	};
	button.addEventListener('click', fonctionexportgoogle, false);
	var element = document.createElement('div');
	element.className = 'googlebutton ol-control';
	element.appendChild(button);
	ol.control.Control.call(this, {
		element : element
	});
};
ol.inherits(app.pdf, ol.control.Control);
ol.inherits(app.google, ol.control.Control);

// OPEN LAYER MAP PREPARE
var map = new ol.Map({
		RendererType : 'canvas',
		controls : ol.control.defaults().extend([
				new app.pdf(),
				new app.google(),
				varFullscreen = new ol.control.FullScreen()
			]),
		layers : [
			new ol.layer.Tile({
				idbase : "TileWMS",
				title : 'Global Imagery',
				source : new ol.source.TileWMS({
					url : 'http://demo.opengeo.org/geoserver/wms',
					params : {
						LAYERS : 'ne:NE1_HR_LC_SR_W_DR',
						VERSION : '1.1.1'
					}
				})
			})
		],
		target : 'map',
		view :
		new ol.View({
			center : [0, 0],
			zoom : 3,
			minZoom : 3,
			maxZoom : 8
		})
	});

// LOADING Data 
var seasondata;
var annuaireclan;
var listesaveresult;
var listturnbattles;
var dernieresave = 'extraction.json';
// prepare database from Loki 
 db_data = new loki('data.json', { env: 'BROWSER'})
	
 db_map = new loki('map.json', { env: 'BROWSER'});
 db_save = new loki('save.json', { env: 'BROWSER'});
// var datedernieresave;
// affichageclanproperty("SEASONDATA", " ", true);
// affichageclanproperty("CLANLIST", " ", true);
// affichageclanproperty("ALLSAVE", " ", true);
 var urlwebapp = "https://script.google.com/macros/s/AKfycbxJmYTHBXM-_urMpk94iXv06jgCOjhGi7mljc39GYfhIZzq9Yo/exec?typeSelection=SEASONLIST";
	$.getJSON(urlwebapp, function(data) {
	seasondata = data; 
	if (!db_data.getCollection("SEASONLIST")) {
			var seasonColl = db_data.addCollection('SEASONLIST', { unique: ['season_id']});
			var arrseasondata = Object.keys(seasondata).map(function(k) { return seasondata[k] });
			seasonColl.insert(arrseasondata);
			} else {
			var seasonColl = db_data.getCollection('SEASONLIST');
			};
	loadLogSeason();
	});

	var urlwebapp = "https://script.google.com/macros/s/AKfycbxJmYTHBXM-_urMpk94iXv06jgCOjhGi7mljc39GYfhIZzq9Yo/exec?typeSelection=CLANLIST";
	$.getJSON(urlwebapp, function(data) {
	annuaireclan = data;  
	if (!db_data.getCollection("CLANLIST")) {
			var clanColl = db_data.addCollection('CLANLIST', { unique: ['id']});
			var arrannuaireclan = Object.keys(annuaireclan).map(function(k) { return annuaireclan[k] });
			clanColl.insert(arrannuaireclan);
			} else {
			var clanColl = db_data.getCollection('CLANLIST');
			};
	loadLogClan();
	});

	var urlwebapp = "https://script.google.com/macros/s/AKfycbxJmYTHBXM-_urMpk94iXv06jgCOjhGi7mljc39GYfhIZzq9Yo/exec?typeSelection=ALLSAVE";
	$.getJSON(urlwebapp, function(data) {
	listesaveresult = data; 
	if (!db_data.getCollection("ALLSAVE")) {
			var saveColl = db_data.addCollection('ALLSAVE', { unique: ['fichier']});
			saveColl.insert(listesaveresult);
			} else {
			var saveColl = db_data.getCollection('ALLSAVE');
			};
	chargerlalistesave();
	//chargerlasave('extraction.json');
	});	
	
	var urlwebapp = "https://script.google.com/macros/s/AKfycbxJmYTHBXM-_urMpk94iXv06jgCOjhGi7mljc39GYfhIZzq9Yo/exec?typeSelection=LOADSAVE&save="+ "extraction.json";
	$.getJSON(urlwebapp, function(data) { 
		var listeinfosColl = db_save.addCollection("extraction.json");
		listeinfosColl.insert(data);
		listeinfos = listeinfosColl.chain( ).data()[0];
		layers = map.getLayers().getArray();
		vector = getLayerwarg(layers, "wargaming");
		chargedgeojson = listeinfos['season_id'];
		map.removeLayer(vector);
		var masource = new ol.source.Vector({
			format: new ol.format.GeoJSON()
			});	
			var urlwebapp = "https://script.google.com/macros/s/AKfycbxJmYTHBXM-_urMpk94iXv06jgCOjhGi7mljc39GYfhIZzq9Yo/exec?typeSelection=MAP&seasonid=" + chargedgeojson;
			$.getJSON(urlwebapp, function(data) { 
			var listemapColl = db_map.addCollection(chargedgeojson);
			listemapColl.insert(data);
			var mamap = listemapColl.chain( ).data()[0];
			datastring =  JSON.stringify(mamap);
			var geojsonFormat = new ol.format.GeoJSON();
			var features = geojsonFormat.readFeatures(datastring,
			{featureProjection: 'EPSG:3857'});
			masource.addFeatures(features);
							cartecomplete = new ol.layer.Vector({
						idbase : "wargaming",
						source : masource
						
					});
				map.addLayer(cartecomplete);
				layers = map.getLayers().getArray();
				vector = getLayerwarg(layers, "wargaming");
				varlayersource = vector.getSource();
				ModeAffichage("Clan");
				
			}) 
		}) 
// affichageclanproperty("NAMELASTSAVE", " ", true);
// affichageclanproperty("DATELASTSAVE", " ", true);

$(document).ajaxError(function (event, xhr, settings) {
	// if the HOST limit the cpu or error on page request
	alert("my HOST refuse the REQUEST due to limit, reload plz (message from server =" + xhr.status + ")")
	//throw new Error(xhr.responseText)
});

/* $(document).ajaxSuccess(function (event, xhr, settings) {
	if (settings.data.includes("SEASONDATA")) {
		seasondata = JSON.parse(xhr.responseText);
		loadLogSeason();
	}
	if (settings.data.includes("CLANLIST")) {
		annuaireclan = JSON.parse(xhr.responseText);
		loadLogClan();
	}
	if (settings.data.includes("ALLSAVE")) {
		listesaveresult = JSON.parse(xhr.responseText);
		if ($("#choixSave").val() === null) {
			$("#choixSave").val('extraction.json').change();
			chargerlasave('extraction.json');
		}
		//ordered desc by php
		chargerlalistesave();
	}
	if (settings.data.includes("NAMELASTSAVE")) {
		dernieresavestr = $.extend( true, {}, xhr);
		dernieresave = dernieresavestr.responseText;
		// On page load, we use the most recent save.
		// does not work, push to ajax stop with condition...

	}
	if (settings.data.includes("DATELASTSAVE")) {
		datedernieresavestr = $.extend( true, {}, xhr);
		datedernieresave = datedernieresavestr.responseText;
	}
	if (settings.data.includes("BATTLETURNINFO")) {
		listturnbattles = JSON.parse(xhr.responseText);;
	}
}); */

// when all AJAX are stopped or started.
$(document).ajaxStop(function () {
	// Creating datatable, they are charged after the loading data from php
	// season and clan are loaded at start only, province is loaded when a save is loaded only.
	// really poor code , maybe better to do
	// due to ajax async, i can try to put lastsave while select save was empty, so the select is void on first load of page
	//$('#preloaderPage').hide();
});

/* $(document).ajaxStart(function () {
	$('#preloaderPage').show();
}) */;

// ----------------------EVENT ------------------------>>
// change save selection
$("#choixSave").change(function () {
	chargerlasave($(this).val());
})

// click et double click sur la carte
var selectEuropa = new ol.style.Style({
		stroke : new ol.style.Stroke({
			color : '#ff0000',
			width : 6
		}),
		zIndex : 1
	});
// mouse move sur la carte
var selectEuropa2 = new ol.style.Style({
		stroke : new ol.style.Stroke({
			color : '#ff0000',
			width : 2
		}),
		zIndex : 1
	});

// create trigger for map interaction on pointer and select (pointer is not activated), select is used to change style of selected province.
var selectInteraction = new ol.interaction.Select({
		layers : function (layer) {
			return layer.get('idbase') == 'wargaming';
		}
	});
var mouseInteraction = new ol.interaction.Pointer({
		layers : function (layer) {
			return layer.get('idbase') == 'wargaming';
		}
	});
map.getInteractions().extend([selectInteraction]);

// Overlay prepare need to be used when MAP is fullscreen.	Not used yet but to finish
var featureOverlay = new ol.layer.Vector({
		map : map,
		source : new ol.source.Vector({
			useSpatialIndex : false // optional, might improve performance
		}),
		style : selectEuropa2,
		updateWhileAnimating : true, // optional, for instant visual feedback
		updateWhileInteracting : true // optional, for instant visual feedback
	});

// click on map
var keyclik = map.on('click', function (evt) {
		$("html").addClass("wait");
		setTimeout(function () {

			var pixel = evt.pixel;
			var provcoord = evt.coordinate;
			displayFeature(pixel, provcoord);
			// if is not fullscreen
			if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
				$('#provinceInfo').modal('show');
				$("html").removeClass("wait");
			} else {
				// il faut passer en mode overlay pour afficher la fenetre
				var popup = new ol.Overlay({
						element : document.getElementById('provinceInfo')
					});
				popup.setPosition(provcoord);
				map.addOverlay(popup);
				$('#provinceInfo').modal('show');
				$("html").removeClass("wait");
			};
		}, 100);
	});
	
	

	


map.getView().on('propertychange', function (e) {
	// when the view of map change , for exemple change of zoom level
	// we need to compute the image scale
	switch (e.key) {
	case 'resolution':
		var layers = map.getLayers().getArray();
		var vector1 = getLayerwarg(layers, "icone");
		var vector2 = getLayerwarg(layers, "tournoi");
		var vector3 = getLayerwarg(layers, "encheres");
		var vector = [vector1, vector2, vector3];
		$.each(vector, function (index, vector) {
			if (vector) {
				var mesfeatures = vector.getSource().getFeatures();
				var filtrefeatures = $.grep(mesfeatures, function (n, i) {
						return (n.getProperties().ceciestunicone == true);
					});
				$.each(filtrefeatures, function (index, province) {
					var scale = getScaleZoom();
					province.getStyle().getImage().setScale(scale);
				});
			};
		});
		break;
	}
});

// button Fullscreen linked to the fullscreen function on map
$("#inputFullscreen").click(function () {
	$('.ol-full-screen-false').click();
});

// button resync Clan
// $("#clanunknow").click(function () {
	// setTimeout(function () {
		// $('#preloadersync').show();
		// affichageclanproperty("REFRESHCLANONSAVE", JSON.stringify(listclanunknow), false);
		// affichageclanproperty("CLANLIST", " ", false);
		// $('#preloadersync').hide();
		// chargerlasave($("#choixSave").val());
	// }, 100);

// });
// button sync/ reload to reload last save, or build a new save.
// the choice depend of timing (no build if last has less than 5 min or next automatic save scheduled in 5 min)
$("#reactualisation").click(function () {
	$("#choixSave").val('extraction.json').change();
});

// clik on MAnager Filter button => new window to show
$(function () {
	$("#Manage_filters").click(function () {
		$('#filterlist').modal('show')
	});
});

// ---------------------END -EVENT ------------------------>>


// ----------------------FUNCTIONS ------------------------>>

function chargerlalistesave() {
	$.each(listesaveresult, function (save) {
		$('#choixSave')
		.append($("<option></option>")
			.attr("value", listesaveresult[save].fichier)
			.text(listesaveresult[save].dateshow));
	});
};

function chargerlasave(save) {
	// when page is loaded this function was called with parameter lastsave, unless this method was called
	// when a new date is selected by user.
	// until LOAD is not finished we show the preloader
	setTimeout(function () {

		if (save == dernieresave) {
			$('#ModeAffichage option[value="Batailles"]').removeAttr('disabled');
			$('#ModeAffichage option[value="Batailles2"]').removeAttr('disabled');
		} else {
			if ($('#ModeAffichage').val() == "Batailles" || $('#ModeAffichage').val() == "Batailles2") {
				$('#ModeAffichage').val("Clan");
			};
			$('#ModeAffichage option[value="Batailles"]').attr("disabled", "disabled");
			$('#ModeAffichage option[value="Batailles2"]').attr("disabled", "disabled");
		}
		if (save) {
			if (!db_save.getCollection(save)) {
						var urlwebapp = "https://script.google.com/macros/s/AKfycbxJmYTHBXM-_urMpk94iXv06jgCOjhGi7mljc39GYfhIZzq9Yo/exec?typeSelection=LOADSAVE&save="+ save;
						$.getJSON(urlwebapp, function(data) { 
						var listeinfosColl = db_save.addCollection(save);
						listeinfosColl.insert(data);
						listeinfos = listeinfosColl.chain( ).data()[0];
						chargerlasave2(listeinfos);
						}) 
						}
						else {
						listeinfosColl = db_save.getCollection(save);
						listeinfos = listeinfosColl.chain( ).data()[0];
						chargerlasave2(listeinfos);
						};
			 }
					console.log('fin de chargerlasave', new Date());
		}, 100);
	};
function chargerlasave2(listeinfos) {		


			layers = map.getLayers().getArray();
			vector = getLayerwarg(layers, "wargaming");
			// optimization : reload geojson map only if change
			if (chargedgeojson != listeinfos['season_id']) {
				chargedgeojson = listeinfos['season_id'];
				map.removeLayer(vector);
				var masource = new ol.source.Vector({
				format: new ol.format.GeoJSON()
				});	

			if (!db_map.getCollection(chargedgeojson)) {
			var urlwebapp = "https://script.google.com/macros/s/AKfycbxJmYTHBXM-_urMpk94iXv06jgCOjhGi7mljc39GYfhIZzq9Yo/exec?typeSelection=MAP&seasonid=" + chargedgeojson;
			$.getJSON(urlwebapp, function(data) { 
			var listemapColl = db_map.addCollection(chargedgeojson);
			listemapColl.insert(data);
			var mamap = listemapColl.chain( ).data()[0];
			datastring =  JSON.stringify(mamap);
			var geojsonFormat = new ol.format.GeoJSON();
			var features = geojsonFormat.readFeatures(datastring,
			{featureProjection: 'EPSG:3857'});
			masource.addFeatures(features);
			chargerlasave3(masource);
			}) 
			}
			else {
			listemapColl = db_map.getCollection(chargedgeojson);
			var mamap = listemapColl.chain( ).data()[0];
			datastring =  JSON.stringify(mamap);
			var geojsonFormat = new ol.format.GeoJSON();
			var features = geojsonFormat.readFeatures(datastring,
			{featureProjection: 'EPSG:3857'});
			masource.addFeatures(features);
			chargerlasave3(masource);
			};

				
			} else {
			    
				vector = getLayerwarg(layers, "wargaming");
				varlayersource = vector.getSource();
				chargerlalog();
				console.log('fin de  charger log sans changement de carte', new Date());
				//Filterprovinceonmap();
				console.log('debut de filteron province sans changement de carte', new Date());
				var modAff = $('#ModeAffichage').val();
				ModeAffichage(modAff);
				console.log('fin de Mode affichage', new Date());
				
			};
		};
function chargerlasave3(masource) {
				cartecomplete = new ol.layer.Vector({
						idbase : "wargaming",
						source : masource
						
					});
				map.addLayer(cartecomplete);
				layers = map.getLayers().getArray();
				vector = getLayerwarg(layers, "wargaming");
				varlayersource = vector.getSource();
				var listenerchangelayer = varlayersource.once('change', function (e) {
						if (varlayersource.getState() === 'ready') {
							// carte chargée
							map.unByKey(listenerchangelayer);
							chargerlalog();
							Filterprovinceonmap();
							var modAff = $('#ModeAffichage').val();
							ModeAffichage(modAff);

							try {
								vector2 = getLayerwarg(layers, "TileWMS");
								extentWARN = varlayersource.getExtent();
								center2Layers = ol.extent.getCenter(extentWARN);
								//alert(center2Layers);
							} catch (e) {
								alert(e.message);
							}
							map.getView().setCenter(center2Layers);
						};
					});
					

			varlayersource.changed();
}

function ModeAffichage(mode) {
	// this function analyse which display mode was choosen ,then
	// call the function needed.
	setTimeout(function () {
		//preloader.show();
		switch (mode) {
		case 'Clan':
			effacericone();
			effacerbatailles();
			affichageclancolor();
			afficherlesicones();
			break;
		case 'Front':
			effacericone();
			effacerbatailles();
			affichagefront();
			break;
		case 'Horaire':
			effacericone();
			effacerbatailles();
			affichagehoraires();
			break;
		case 'Revenu':
			effacericone();
			effacerbatailles();
			affichagerevenu();
			break;
		case 'Infrastructure':
			effacericone();
			effacerbatailles();
			affichagelevel();
			break;
		case 'Batailles':
			effacericone();
			effacerbatailles();
			affichageclancolor();
			affichagebatailles();
			break;
		case 'Langage':
			effacericone();
			effacerbatailles();
			affichagelangagecolor();
			break;
		case 'Province':
			effacericone();
			effacerbatailles();
			affichageProvince();
			break;
		case 'ClanELO6':
			effacericone();
			effacerbatailles();
			affichageclanELO('elo_rating_6');
			break;
		case 'ClanELO8':
			effacericone();
			effacerbatailles();
			affichageclanELO('elo_rating_8');
			break;
		case 'ClanELO10':
			effacericone();
			effacerbatailles();
			affichageclanELO('elo_rating_10');
			break;
		case 'ClanELOF':
			effacericone();
			effacerbatailles();
			affichageclanELO('fine_level');
			break;
		case 'Batailles2':
			effacericone();
			effacerbatailles();
			affichageclanbattles();
			break;
		case 'accepts_join_requests':
			effacericone();
			effacerbatailles();
			affichageaccepts_join_requests();
			break;
		case 'battles':
			effacericone();
			effacerbatailles();
			affichagestat('battles');
			break;
		case 'battles_6_level':
			effacericone();
			effacerbatailles();
			affichagestat('battles_6_level');
			break;
		case 'battles_8_level':
			effacericone();
			effacerbatailles();
			affichagestat('battles_8_level');
			break;
		case 'battles_10_level':
			effacericone();
			effacerbatailles();
			affichagestat('battles_10_level');
			break;
		case 'battles_6_percent':
			effacericone();
			effacerbatailles();
			affichagestat('battles_6_percent');
			break;
		case 'battles_8_percent':
			effacericone();
			effacerbatailles();
			affichagestat('battles_8_percent');
			break;
		case 'battles_10_percent':
			effacericone();
			effacerbatailles();
			affichagestat('battles_10_percent');
			break;
		case 'members_count':
			effacericone();
			effacerbatailles();
			affichagestat('members_count');
			break;
		case 'wins':
			effacericone();
			effacerbatailles();
			affichagestat('wins');
			break;
		case 'winspercent':
			effacericone();
			effacerbatailles();
			affichagestat('winspercent');
			break;
		case 'losses':
			effacericone();
			effacerbatailles();
			affichagestat('losses');
			break;
		case 'lossespercent':
			effacericone();
			effacerbatailles();
			affichagestat('lossespercent');
			break;
		case 'wins_6_level':
			effacericone();
			effacerbatailles();
			affichagestat('wins_6_level');
			break;
		case 'wins_8_level':
			effacericone();
			effacerbatailles();
			affichagestat('wins_8_level');
			break;
		case 'wins_10_level':
			effacericone();
			effacerbatailles();
			affichagestat('wins_10_level');
			break;
		case 'provinces_count':
			effacericone();
			effacerbatailles();
			affichagestat('provinces_count');
			break;
		default:
			break;
		};
		//preloader.hide();
	}, 100);

};

function affichageclancolor() {
	// DISPLAY mode CLAN : search color choosen by clan and put it on the map
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource();
	var layerfeatures = new ol.source.Vector();
	layerfeatures.addFeatures(varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures()

		var layer = new ol.layer.Vector({
			idbase : "wargaming",
			source : layerfeatures
		});
	map.addLayer(layer);

	// recherche des infos

	var stylecache = new Array;
	// boucle sur les fronts //
	var clancolor;
	var color;
	$.each(listeinfos['provinces'], function (index, province) {

		var provinceatraiter = listeinfos['provinces'][index];
		var couleurhexa = '#000000';
		if (provinceatraiter['owner_clan_id'] !== null) {
			var leclantrouve = provinceatraiter['owner_clan_id'];
			if (annuaireclan[leclantrouve]) {
				couleurhexa = annuaireclan[leclantrouve].color;
				clancolor = hexToRgb1(couleurhexa);
				color = [clancolor[0], clancolor[1], clancolor[2], 0.8];
			} else {
				couleurhexa = '#000000';
				clancolor = hexToRgb1(couleurhexa);
				color = [clancolor[0], clancolor[1], clancolor[2], 1];
			}
		} else {
			couleurhexa = '#F8F8FF';
			clancolor = hexToRgb1(couleurhexa);
			color = [clancolor[0], clancolor[1], clancolor[2], 0.1];
		}
		if (!stylecache[couleurhexa]) {
			stylecache[couleurhexa] = new ol.style.Style({
					fill : new ol.style.Fill({
						color : color
					}),
					stroke : new ol.style.Stroke({
						color : '#FFFFFF',
						width : 1
					})
				});

		};

		var result3 = $.grep(features, function (e) {
				return e.getProperties().province_id == provinceatraiter['province_id']
			});

		if (result3[0]) {
			result3[0].setStyle(stylecache[couleurhexa]);
		};
	});

};

function affichageclanELO(ELO) {
	// old method for display ELO... maybe can be rewrite by the new method Stat more simple and efficient...
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource();
	var layerfeatures = new ol.source.Vector();
	layerfeatures.addFeatures(varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures()

		var layer = new ol.layer.Vector({
			idbase : "wargaming",
			source : layerfeatures
		});
	map.addLayer(layer);

	var layer2 = new ol.layer.Vector({
			idbase : "texte2",
			source : new ol.source.Vector({})
		});
	map.addLayer(layer2);
	var nouvellesource = layer2.getSource();

	var stylecache = new Array;
	var styleELO = new Array;
	var maxELO6 = 0;
	var maxELO8 = 0;
	var maxELO10 = 0;
	var maxELOF = 0;
	var minELO6 = 999999999;
	var minELO8 = 999999999;
	var minELO10 = 999999999;
	var minELOF = 999999999;
	$.each(listeinfos['provinces'], function (index, province) {
		if (listeinfos['provinces'][index]['owner_clan_id'] !== null && annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]) {
			var valELO6 = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['elo_rating_6'];
			var valELO8 = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['elo_rating_8'];
			var valELO10 = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['elo_rating_10'];
			var valELOF = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['fine_level'];
			if (valELO6 > maxELO6) {
				maxELO6 = valELO6;
			};
			if (valELO6 < minELO6) {
				minELO6 = valELO6;
			};
			if (valELO8 > maxELO8) {
				maxELO8 = valELO8;
			};
			if (valELO8 < minELO8) {
				minELO8 = valELO8;
			};
			if (valELO10 > maxELO10) {
				maxELO10 = valELO10;
			};
			if (valELO10 < minELO10) {
				minELO10 = valELO10;
			};
			if (valELOF > maxELOF) {
				maxELOF = valELOF;
			};
			if (valELOF < minELOF) {
				minELOF = valELOF;
			};
		};
	});
	var color1 = [255, 255, 255];
	var color2 = [0, 125, 0];
	var nbgradient = 20;
	var colorlist = generateGradient(color1, color2, nbgradient);

	var clancolor;
	var color;
	$.each(listeinfos['provinces'], function (index, province) {

		var provinceatraiter = listeinfos['provinces'][index];
		var couleurhexa = '#000000';
		if (provinceatraiter['owner_clan_id'] !== null) {
			var leclantrouve = provinceatraiter['owner_clan_id'];
			if (annuaireclan[leclantrouve]) {

				ponderation = 0;
				var elovalue = 0;
				switch (ELO) {
				case 'elo_rating_6':
					elovalue = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['elo_rating_6']
						ponderation = Math.ceil((elovalue - minELO6) * nbgradient / (maxELO6 - minELO6));
					break;
				case 'elo_rating_8':
					elovalue = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['elo_rating_8']
						ponderation = Math.ceil((elovalue - minELO8) * nbgradient / (maxELO8 - minELO8));
					break;
				case 'elo_rating_10':
					elovalue = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['elo_rating_10']
						ponderation = Math.ceil((elovalue - minELO10) * nbgradient / (maxELO10 - minELO10));
					break;
				case 'fine_level':
					elovalue = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['fine_level']
						ponderation = Math.ceil((elovalue - minELOF) * nbgradient / (maxELOF - minELOF));
					break;
				default:
					elovalue = 0;
					ponderation = 0;
					break;
				}
				if (ponderation > 19) {
					ponderation = 19;
				};
			} else {
				elovalue = 0;
				ponderation = 0;
			}
		} else {
			elovalue = 0;
			ponderation = 0;
		}
		if (isNaN(ponderation)) {
			elovalue = 0;
			ponderation = 0;
		};
		if (!stylecache[ponderation]) {
			stylecache[ponderation] = new ol.style.Style({
					fill : new ol.style.Fill({
						color : [colorlist[ponderation][0], colorlist[ponderation][1], colorlist[ponderation][2], 1]
					}),
					stroke : new ol.style.Stroke({
						color : '#FFFFFF',
						width : 1
					})
				});

		};
		if (!styleELO[elovalue]) {
			styleELO[elovalue] = new ol.style.Style({
					text : new ol.style.Text({
						text : elovalue.toString(),
						fill : new ol.style.Fill({
							color : '#000'
						}),
						stroke : new ol.style.Stroke({
							color : '#fff'
						})
					})
				});

		};

		var result3 = $.grep(features, function (e) {
				return e.getProperties().province_id == provinceatraiter['province_id']
			});

		if (result3[0]) {
			result3[0].setStyle(stylecache[ponderation]);
			var geometry = result3[0].getGeometry();
			var point = getCenterOf(geometry);
			newFeature = new ol.Feature({
					ceciestunicone : true,
					geometry : new ol.geom.Point(point)
				});

			newFeature.setStyle(styleELO[elovalue]);
			nouvellesource.addFeature(newFeature);
		};
	});

};

function affichageaccepts_join_requests() {
	// DISPLAY clan recruit : green if accepted, black if not.
	// get all province in a new layer, and delete old layer.
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource();
	var layerfeatures = new ol.source.Vector();
	layerfeatures.addFeatures(varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures()
		var layer = new ol.layer.Vector({
			idbase : "wargaming",
			source : layerfeatures
		});
	map.addLayer(layer);
	// new layer to put text (clan name)
	var layer2 = new ol.layer.Vector({
			idbase : "texte2",
			source : new ol.source.Vector({})
		});
	map.addLayer(layer2);
	var nouvellesource = layer2.getSource();

	var styleclan = new Array;
	styleaccept = new ol.style.Style({
			fill : new ol.style.Fill({
				color : [0, 125, 0, 1]
			}),
			stroke : new ol.style.Stroke({
				color : '#FFFFFF',
				width : 1
			})
		});
	styleacceptno = new ol.style.Style({
			fill : new ol.style.Fill({
				color : [0, 0, 0, 1]
			}),
			stroke : new ol.style.Stroke({
				color : '#FFFFFF',
				width : 1
			})
		});
	var accepts_join_requests;
	var nomclan;
	var emblem;
	// each province on map is read, then mapped with the clan to get back "join request property".
	$.each(listeinfos['provinces'], function (index, province) {
		var provinceatraiter = listeinfos['provinces'][index];
		var couleurhexa = '#000000';
		if (provinceatraiter['owner_clan_id'] !== null) {
			var leclantrouve = provinceatraiter['owner_clan_id'];
			if (annuaireclan[leclantrouve]) {
				tag = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['tag'];
				emblem = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['emblem_url'];
				accepts_join_requests = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['accepts_join_requests'];
			} else {
				accepts_join_requests = null;
			}
		} else {
			accepts_join_requests = null;
		}
		// create the name of clan in the text layer;
		if (!styleclan[tag]) {
			styleclan[tag] = new ol.style.Style({
					text : new ol.style.Text({
						text : tag.toString(),
						fill : new ol.style.Fill({
							color : '#fff'
						})
					})
				});
		};
		var result3 = $.grep(features, function (e) {
				return e.getProperties().province_id == provinceatraiter['province_id']
			});
		// use the green or black style : black is no clan (prov civilian), or clan refuse, Green unless
		if (result3[0]) {
			if (accepts_join_requests == true) {
				result3[0].setStyle(styleaccept);
			} else if (accepts_join_requests == false || accepts_join_requests == null) {
				result3[0].setStyle(styleacceptno);
			}
			if (accepts_join_requests != null) {
				var geometry = result3[0].getGeometry();
				var point = getCenterOf(geometry);
				newFeature = new ol.Feature({
						ceciestunicone : true,
						geometry : new ol.geom.Point(point)
					});
				newFeature.setStyle(styleclan[tag]);
				nouvellesource.addFeature(newFeature);
			};
		};
	});

};

function affichagestat(mode) {
	// DISPLAY stat, this is a generic method used to display all stat data on map.
	// create a new layer for color and remove old one, create a layer for text
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource();
	var layerfeatures = new ol.source.Vector();
	layerfeatures.addFeatures(varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures()
		var layer = new ol.layer.Vector({
			idbase : "wargaming",
			source : layerfeatures
		});
	map.addLayer(layer);
	var layer2 = new ol.layer.Vector({
			idbase : "texte2",
			source : new ol.source.Vector({})
		});
	map.addLayer(layer2);
	var nouvellesource = layer2.getSource();

	var stylecache = new Array;
	var styleValue = new Array;
	var maxvalue = 0;
	var minvalue = 999999999;
	// All province are read and we make junction with clan data
	$.each(listeinfos['provinces'], function (index, province) {
		if (listeinfos['provinces'][index]['owner_clan_id'] !== null && annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]) {
			// to Stock of the min and max value.
			// evaluate Display mode to get the value to use.
			switch (mode) {
			case 'battles':
				value = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles']
					break;
			case 'battles_6_level':
				value = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles_6_level']
					break;
			case 'battles_8_level':
				value = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles_8_level']
					break;
			case 'battles_10_level':
				value = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles_10_level']
					break;
			case 'battles_6_percent':
				value = parseInt(((annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles_6_level'] / annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles']) * 100));
				break;
			case 'battles_8_percent':
				value = parseInt(((annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles_6_level'] / annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles']) * 100));
				break;
			case 'battles_10_percent':
				value = parseInt(((annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles_6_level'] / annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles']) * 100));
				break;
			case 'members_count':
				value = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['members_count']
					break;
			case 'wins':
				value = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['wins']
					break;
			case 'winspercent':
				value = parseInt(((annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['wins'] / annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles']) * 100));
				break;
			case 'losses':
				value = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['losses']
					break;
			case 'lossespercent':
				value = parseInt(((annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['losses'] / annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles']) * 100));
				break;
			case 'provinces_count':
				value = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['provinces_count']
					break;
			case 'wins_6_level':
				value = parseInt(((annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['wins_6_level'] / annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles']) * 100));
				break;
			case 'wins_8_level':
				value = parseInt(((annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['wins_8_level'] / annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles']) * 100));
				break;
			case 'wins_10_level':
				value = parseInt(((annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['wins_10_level'] / annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles']) * 100));
				break;
			default:
				value = 0;
				break;
			}
			if (value > maxvalue) {
				maxvalue = value;
			};
			if (value < minvalue) {
				minvalue = value;
			};
		};
	});
	// gradient Green-White color.
	var color1 = [255, 255, 255];
	var color2 = [0, 125, 0];
	var nbgradient = 20;
	var colorlist = generateGradient(color1, color2, nbgradient);

	var clancolor;
	var color;
	// all province are read. then we get the right value in function of display mode,
	// we compute a value to be used for choosing color gradient
	$.each(listeinfos['provinces'], function (index, province) {
		var provinceatraiter = listeinfos['provinces'][index];
		var couleurhexa = '#000000';
		if (provinceatraiter['owner_clan_id'] !== null) {
			var leclantrouve = provinceatraiter['owner_clan_id'];
			if (annuaireclan[leclantrouve]) {
				ponderation = 0;
				var value = 0;
				var percent = 100;
				switch (mode) {
				case 'battles':
					value = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles'];
					ponderation = Math.ceil((value - minvalue) * nbgradient / (maxvalue - minvalue));
					break;
				case 'battles_6_level':
					value = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles_6_level'];
					ponderation = Math.ceil((value - minvalue) * nbgradient / (maxvalue - minvalue));
					break;
				case 'battles_8_level':
					value = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles_8_level'];
					ponderation = Math.ceil((value - minvalue) * nbgradient / (maxvalue - minvalue));
					break;
				case 'battles_10_level':
					value = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles_10_level'];
					ponderation = Math.ceil((value - minvalue) * nbgradient / (maxvalue - minvalue));
					break;
				case 'battles_6_percent':
					value = parseInt(((annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles_6_level'] / annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles']) * 100));
					ponderation = Math.ceil((value - minvalue) * nbgradient / (maxvalue - minvalue));
					break;
				case 'battles_8_percent':
					value = parseInt(((annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles_8_level'] / annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles']) * 100));
					ponderation = Math.ceil((value - minvalue) * nbgradient / (maxvalue - minvalue));
					break;
				case 'battles_10_percent':
					value = parseInt(((annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles_10_level'] / annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles']) * 100));
					ponderation = Math.ceil((value - minvalue) * nbgradient / (maxvalue - minvalue));
					break;
				case 'members_count':
					value = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['members_count'];
					ponderation = Math.ceil((value - minvalue) * nbgradient / (maxvalue - minvalue));
					break;
				case 'wins':
					value = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['wins'];
					ponderation = Math.ceil((value - minvalue) * nbgradient / (maxvalue - minvalue));
					break;
				case 'winspercent':
					value = parseInt(((annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['wins'] / annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles']) * 100));
					ponderation = Math.ceil((value - minvalue) * nbgradient / (maxvalue - minvalue));
					break;
				case 'losses':
					value = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['losses'];
					ponderation = Math.ceil((value - minvalue) * nbgradient / (maxvalue - minvalue));
					break;
				case 'lossespercent':
					value = parseInt(((annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['losses'] / annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles']) * 100));
					ponderation = Math.ceil((value - minvalue) * nbgradient / (maxvalue - minvalue));
					break;
				case 'provinces_count':
					value = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['provinces_count'];
					ponderation = Math.ceil((value - minvalue) * nbgradient / (maxvalue - minvalue));
					break;
				case 'wins_6_level':
					value = parseInt(((annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['wins_6_level'] / annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles']) * 100));
					ponderation = Math.ceil((value - minvalue) * nbgradient / (maxvalue - minvalue));

					break;
				case 'wins_8_level':
					value = parseInt(((annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['wins_8_level'] / annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles']) * 100));
					ponderation = Math.ceil((value - minvalue) * nbgradient / (maxvalue - minvalue));

					break;
				case 'wins_10_level':
					value = parseInt(((annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['wins_10_level'] / annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['battles']) * 100));
					ponderation = Math.ceil((value - minvalue) * nbgradient / (maxvalue - minvalue));
					break;
				default:
					value = 0;
					ponderation = 0;
					percent = 'NO';
					break;
				}
				if (ponderation > 19) {
					ponderation = 19;
				};
			} else {
				value = 0;
				ponderation = 0;
				percent = 'NO';
			}
		} else {
			value = 0;
			ponderation = 0;
			percent = 'NO';
		}
		if (isNaN(ponderation)) {
			value = 0;
			ponderation = 0;
			percent = 'NO';
		};
		// creation of new style color if this color was never created.
		if (!stylecache[ponderation]) {
			stylecache[ponderation] = new ol.style.Style({
					fill : new ol.style.Fill({
						color : [colorlist[ponderation][0], colorlist[ponderation][1], colorlist[ponderation][2], 1]
					}),
					stroke : new ol.style.Stroke({
						color : '#FFFFFF',
						width : 1
					})
				});

		};
		// creation of the style for Text stat.
		if (!styleValue[value]) {
			styleValue[value] = new ol.style.Style({
					text : new ol.style.Text({
						text : value.toString(),
						fill : new ol.style.Fill({
							color : '#000'
						})
					})
				});
		};
		var result3 = $.grep(features, function (e) {
				return e.getProperties().province_id == provinceatraiter['province_id']
			});

		// update map.
		if (result3[0]) {
			result3[0].setStyle(stylecache[ponderation]);
			var geometry = result3[0].getGeometry();
			var point = getCenterOf(geometry);
			newFeature = new ol.Feature({
					ceciestunicone : true,
					geometry : new ol.geom.Point(point)
				});

			newFeature.setStyle(styleValue[value]);
			nouvellesource.addFeature(newFeature);
		};
	});
};

function affichagelangagecolor() {
	// same as affichageclancolor
	// layer 1 for random color by language
	// layer 2 for the flag of the langage
	// icone must have the same name as language and be a png.
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource();
	var layerfeatures = new ol.source.Vector();
	layerfeatures.addFeatures(varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures()
		var layer = new ol.layer.Vector({
			idbase : "wargaming",
			source : layerfeatures
		});
	map.addLayer(layer);
	var layer2 = new ol.layer.Vector({
			idbase : "icone",
			source : new ol.source.Vector({})
		});
	map.addLayer(layer2);
	var nouvellesource = layer2.getSource();
	var stylecache = new Array;
	var stylecache2 = new Array;
	var numItems = clanTable.column(3).data().unique().length;
	var color1 = [255, 0, 0];
	var color2 = [0, 0, 255];
	var colorlist = generateGradient(color1, color2, numItems);
	var lastaffected = 0;
	var rows = oTable.$('tr', {
			"filter" : "applied"
		});
	var rows2 = clanTable.$('tr', {
			"filter" : "applied"
		});
	$.each(rows, function (row) {
		var datarowprov = rows[row].cells[0].textContent;
		var result3 = $.grep(Object.keys(listeinfos.provinces), function (e) {
				return listeinfos.provinces[e].province_name == datarowprov
			});
		var datarowprovid = result3[0];
		var result3 = $.grep(features, function (e) {
				return e.getProperties().province_id == datarowprovid
			});
		var result2 = $.grep(rows2, function (e) {
				return e.cells[0].textContent == rows[row].cells[1].textContent
			});
		var languageduclan = 'wargaming';
		if (typeof result2[0] != 'undefined') {
			languageduclan = result2[0].cells[2].textContent;
		}
		if (!stylecache[languageduclan]) {
			var newcolor = hexToRgb1(getRandomColor());
			var imgsrc;
			var langindex = languages.indexOf(languageduclan);
			if (langindex == -1) {
				imgsrc = flagdir + 'europeanunion.png'
			} else {
				imgsrc = flagdir + languageduclan + '.png'
			};
			stylecache[languageduclan] = new ol.style.Style({
					fill : new ol.style.Fill({
						color : [newcolor[0], newcolor[1], newcolor[2], 0.8]
					}),
					stroke : new ol.style.Stroke({
						color : '#FFFFFF',
						width : 1
					})
				});
			lastaffected = lastaffected + 1;

			stylecache2[languageduclan] = new ol.style.Style({
					image : new ol.style.Icon(({
							scale : getScaleZoom(),
							src : imgsrc,
							opacity : 0.8
						}))
				});
		};
		if (result3[0]) {
			result3[0].setStyle(stylecache[languageduclan]);

			var geometry = result3[0].getGeometry();
			var point = getCenterOf(geometry);
			newFeature = new ol.Feature({
					ceciestunicone : true,
					geometry : new ol.geom.Point(point)
				});
			newFeature.setStyle(stylecache2[languageduclan]);
			nouvellesource.addFeature(newFeature);
		};
	});
	map.render();
};

function affichagebatailles() {
	// same as affichageclancolor
	// province is colored by clan color
	// the counter of battles are CLUSTER (point agregation by zoom level)
	var featurestableau = new Array();
	var rows = oTable.$('tr', {
			"filter" : "applied"
		});
	$.each(rows, function (row) {
		var datarowprov = rows[row].cells[0].textContent;
		var result3 = $.grep(Object.keys(listeinfos.provinces), function (e) {
				return listeinfos.provinces[e].province_name == datarowprov
			});
		var datarowprovid = result3[0];
		var listeprovinceatraiter = cartecomplete.getSource().getFeatures();
		if (rows[row].cells[10].textContent > 0 || rows[row].cells[9].textContent > 0 || rows[row].cells[8].textContent > 0) {
			var result3 = $.grep(listeprovinceatraiter, function (e) {
					return e.getProperties().province_id == datarowprovid
				});
			var geometry = result3[0].getGeometry();
			var center = getCenterOf(geometry);

			var listevaleur = parseInt(rows[row].cells[10].textContent) + parseInt(rows[row].cells[9].textContent);
			for (pas = 0; pas < listevaleur; pas++) {
				var newFeature = new ol.Feature({
						geometry : new ol.geom.Point(center)
					});
				featurestableau.push(newFeature);
			};
		}
	});
	var source = new ol.source.Vector({
			features : featurestableau
		});
	var clusterSource = new ol.source.Cluster({
			distance : 20,
			source : source
		});
	var styleCache = {};
	var clusters = new ol.layer.Vector({
			idbase : "batailles",
			source : clusterSource,
			style : function (feature, resolution) {
				var size = feature.get('features').length;
				var style = styleCache[size];
				if (!style) {
					style = [new ol.style.Style({
							image : new ol.style.Circle({
								radius : 10,
								stroke : new ol.style.Stroke({
									color : '#fff'
								}),
								fill : new ol.style.Fill({
									color : '#3399CC'
								})
							}),
							text : new ol.style.Text({
								text : size.toString(),
								fill : new ol.style.Fill({
									color : '#fff'
								})
							})
						})];
					styleCache[size] = style;
				}
				return style;
			}
		});
	map.addLayer(clusters);
};

function affichagefront() {
	// same as affichageclancolor
	var vector = getLayerwarg(layers, "texte3");
	map.removeLayer(vector);
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource();
	var layerfeatures = new ol.source.Vector();
	layerfeatures.addFeatures(varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures()

		var layer = new ol.layer.Vector({
			idbase : "wargaming",
			source : layerfeatures
		});
	map.addLayer(layer);

	var layer2 = new ol.layer.Vector({
			idbase : "texte3",
			source : new ol.source.Vector({})
		});
	map.addLayer(layer2);
	var nouvellesource = layer2.getSource();

	// recherche des infos
	var sourcestylelist = new Array;
	var stylecache = new Array;
	var styleText = new Array;
	// boucle sur les fronts //
	var numItems = $("#tabs-9tab").DataTable().column(3).data().unique().length;
	var color1 = [255, 0, 0];
	var color2 = [0, 0, 255];
	var colorlist = generateGradient(color1, color2, numItems);
	var lastaffected = 0;
	$.each(listeinfos['provinces'], function (index, province) {
		// transform in front id to be usable as index tab
		var provinceatraiter = listeinfos['provinces'][index];
		var resultfront = $.grep(Object.keys(listeinfos['front']), function (e) {
				return listeinfos['front'][e].front_name == provinceatraiter['front_name']
			});
		if (resultfront[0]) {
			var lefronttrouve = listeinfos['front'][resultfront[0]].front_id;
		} else {
			var lefronttrouve = 'invalide';
		}
		if (!stylecache[lefronttrouve]) {

			stylecache[lefronttrouve] = new ol.style.Style({
					fill : new ol.style.Fill({
						color : [colorlist[lastaffected][0], colorlist[lastaffected][1], colorlist[lastaffected][2], 0.8]
					}),
					stroke : new ol.style.Stroke({
						color : '#FFFFFF',
						width : 1
					})
				});
			lastaffected = lastaffected + 1;
		};
		styleText[lefronttrouve] = new ol.style.Style({
				text : new ol.style.Text({
					text : provinceatraiter['front_name'],
					textAlign : "center",
					textBaseline : "Middle",
					font : 'bold 24px Arial, Verdana, Helvetica, sans-serif',
					fill : new ol.style.Fill({
						color : '#fff'
					}),
					stroke : new ol.style.Stroke({
						color : '#000'
					})
				})
			});

		// new vector build to be able to compute center of each front and place Text
		sourcestylelist[lefronttrouve] = new ol.source.Vector();

		var result3 = $.grep(features, function (e) {
				return e.getProperties().province_id == provinceatraiter['province_id']
			});
		if (result3[0]) {
			result3[0].setStyle(stylecache[lefronttrouve]);
			var geometry = result3[0].getGeometry();
			var center = getCenterOf(geometry);
			var newFeature = new ol.Feature({
					geometry : new ol.geom.Point(center)
				});
			sourcestylelist[lefronttrouve].addFeature(newFeature);
		};
	});
	// now each province are colored we will add for each style a text to display front information
	$.each(Object.keys(sourcestylelist), function (index, source) {
		extentWARN = sourcestylelist[source].getExtent();
		center2Layers = ol.extent.getCenter(extentWARN);
		if (isNaN(center2Layers[0]) == false && isNaN(center2Layers[1]) == false) {
			var newFeaturetext = new ol.Feature({
					geometry : new ol.geom.Point(center2Layers)
				});
			newFeaturetext.setStyle(styleText[source]);
			nouvellesource.addFeature(newFeaturetext);
			//alert(center2Layers);
		}
	});
};

function affichageclanbattles() {
	// same as affichageclancolor
	// layer 1 : is RED if battle is started or Green ELSE (maybe we can analyse date jour / prime time, to put BLACK if the battle is ended... to modify
	//           the color use intensity with the number of battles/ attacker / competitors
	// layer 2 : counter of battle in text
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource();
	var layerfeatures = new ol.source.Vector();
	layerfeatures.addFeatures(varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures();
	var layer = new ol.layer.Vector({
			idbase : "wargaming",
			source : layerfeatures
		});
	map.addLayer(layer);
	var layer2 = new ol.layer.Vector({
			idbase : "texte2",
			source : new ol.source.Vector({})
		});
	map.addLayer(layer2);
	var nouvellesource = layer2.getSource();
	var stylecache = new Array;
	var styleNumber = new Array;
	var scale = getScaleZoom();
	var rows = oTable.$('tr', {
			"filter" : "applied"
		});
	$.each(rows, function (row) {
		var datarowprov = rows[row].cells[0].textContent;
		var result3 = $.grep(Object.keys(listeinfos.provinces), function (e) {
				return listeinfos.provinces[e].province_name == datarowprov
			});
		var datarowprovid = result3[0];
		var listeprovinceatraiter = cartecomplete.getSource().getFeatures();
		var color1;
		var color2 = new Array;
		var nbtotal;
		var zoom = map.getView().getZoom();
		map.getView().setZoom(5);
		//gradient green
		var colorA = [255, 255, 255];
		var colorB = [0, 125, 0];
		var nbgradient = 11;
		var colorlistvert = generateGradient(colorA, colorB, nbgradient);
		//gradient red
		var colorA = [255, 255, 255];
		var colorB = [255, 0, 0];
		var nbgradient = 11;
		var colorlistrouge = generateGradient(colorA, colorB, nbgradient);
		// if started yellow text / red province
		if (rows[row].cells[5].textContent == "STARTED") {
			color1 = [255, 255, 0];
			color2 = colorlistrouge;
			nbtotal = parseInt(rows[row].cells[8].textContent) * 2;
		} else {
			// grey text / green province
			if (parseInt(rows[row].cells[10].textContent) > 0 || parseInt(rows[row].cells[8].textContent) > 0 || parseInt(rows[row].cells[9].textContent) > 0) {
				color1 = [224, 224, 224];
				color2 = colorlistvert;
				nbtotal = parseInt(rows[row].cells[10].textContent) + parseInt(rows[row].cells[9].textContent);
			} else {
				color1 = [255, 255, 255];
				color2 = colorlistvert;
				nbtotal = 0;
			}
		};
		// intensity
		var intensity;
		switch (true) {
		case (nbtotal == 0):
			intensity = 0;
			break;
		case (nbtotal > 0 && nbtotal <= 2):
			intensity = 4;
			break;
		case (nbtotal > 2 && nbtotal <= 4):
			intensity = 5;
			break;
		case (nbtotal > 4 && nbtotal <= 6):
			intensity = 6;
			break;
		case (nbtotal > 6 && nbtotal <= 8):
			intensity = 7;
			break;
		case (nbtotal > 8 && nbtotal <= 10):
			intensity = 8;
			break;
		case (nbtotal > 10 && nbtotal <= 14):
			intensity = 9;
			break;
		case (nbtotal > 14):
			intensity = 10;
			break;
		default:
			intensity = 0;
		};
		var result3 = $.grep(features, function (e) {
				return e.getProperties().province_id == datarowprovid
			});
		var newstyle = color2[intensity][0].toString() + color2[intensity][1].toString() + color2[intensity][2].toString() + nbtotal.toString();
		if (!stylecache[newstyle] && nbtotal > 0) {
			stylecache[newstyle] = new ol.style.Style({
					fill : new ol.style.Fill({
						color : [color2[intensity][0], color2[intensity][1], color2[intensity][2], 1]
					}),
					stroke : new ol.style.Stroke({
						color : '#FFFFFF',
						width : 1
					})
				});
		};
		if (!stylecache[newstyle] && nbtotal == 0) {
			stylecache[newstyle] = new ol.style.Style({
					fill : new ol.style.Fill({
						color : [0, 0, 0, 0.2]
					}),
					stroke : new ol.style.Stroke({
						color : '#FFFFFF',
						width : 0.3
					})
				});
		};
		if (!styleNumber[newstyle] && nbtotal > 0) {
			styleNumber[newstyle] = new ol.style.Style({
					image : new ol.style.Circle({
						radius : 10,
						snapToPixel : false,
						stroke : new ol.style.Stroke({
							color : '#fff'
						}),
						fill : new ol.style.Fill({
							color : [color1[0], color1[1], color1[2], 1]
						})
					}),
					text : new ol.style.Text({
						text : nbtotal.toString(),
						fill : new ol.style.Fill({
							color : '#000'
						}),
						stroke : new ol.style.Stroke({
							color : '#fff'
						})
					})
				});

		};
		if (!styleNumber[newstyle] && nbtotal == 0) {
			styleNumber[newstyle] = new ol.style.Style({
					stroke : new ol.style.Stroke({
						color : '#FFFFFF',
						width : 1
					})
				});
		};
		if (result3[0]) {
			if (nbtotal > 0) {
				var geometry = result3[0].getGeometry();
				var center = getCenterOf(geometry);
				var newFeature = new ol.Feature({
						ceciestunicone : true,
						geometry : new ol.geom.Point(center)
					});
				newFeature.setStyle(styleNumber[newstyle]);
				nouvellesource.addFeature(newFeature);
			};
			result3[0].setStyle(stylecache[newstyle]);
		};
		map.getView().setZoom(zoom);
	});
};

function affichageProvince() {
	// same as affichageclancolor :
	// layer is white with text = name province.
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource();
	var layerfeatures = new ol.source.Vector();
	layerfeatures.addFeatures(varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures();
	var styleText = new Array;
	var layer = new ol.layer.Vector({
			idbase : "wargaming",
			source : layerfeatures
		});
	map.addLayer(layer);
	var layer2 = new ol.layer.Vector({
			idbase : "texte2",
			source : new ol.source.Vector({})
		});
	map.addLayer(layer2);
	var nouvellesource = layer2.getSource();
	var stylecache = new ol.style.Style({
			fill : new ol.style.Fill({
				color : [255, 255, 255, 0.9],
			}),
			stroke : new ol.style.Stroke({
				color : [0, 0, 0, 0.3],
				width : 1
			})
		});
	$.each(listeinfos['provinces'], function (index, province) {
		var provinceatraiter = listeinfos['provinces'][index];
		var province_name = provinceatraiter['province_name'];
		if (!styleText[province_name]) {
			styleText[province_name] = new ol.style.Style({
					text : new ol.style.Text({
						text : province_name,
						fill : new ol.style.Fill({
							color : '#000'
						}),
						stroke : new ol.style.Stroke({
							color : '#fff'
						})
					})
				});
		};
		var result3 = $.grep(features, function (e) {
				return e.getProperties().province_id == provinceatraiter['province_id']
			});
		if (result3[0]) {
			result3[0].setStyle(stylecache);
			var geometry = result3[0].getGeometry();
			var point = getCenterOf(geometry);
			newFeature = new ol.Feature({
					ceciestunicone : true,
					geometry : new ol.geom.Point(point)
				});
			newFeature.setStyle(styleText[province_name]);
			nouvellesource.addFeature(newFeature);
		};
	});
};

function affichagehoraires() {
	// same as affichageclancolor : layer use random color for each distinct PRIME TIME
	var vector = getLayerwarg(layers, "texte3");
	map.removeLayer(vector);
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource();
	var layerfeatures = new ol.source.Vector();
	layerfeatures.addFeatures(varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures()
		var layer = new ol.layer.Vector({
			idbase : "wargaming",
			source : layerfeatures
		});
	map.addLayer(layer);
	var stylecache = new Array;
	var sourcestylelist = new Array;
	var styleText = new Array;
	var layer2 = new ol.layer.Vector({
			idbase : "texte3",
			source : new ol.source.Vector({})
		});
	map.addLayer(layer2);
	var nouvellesource = layer2.getSource();

	var numItems = $("#tabs-9tab").DataTable().column(4).data().unique().length;
	var color1 = [255, 0, 0];
	var color2 = [0, 0, 255];
	var colorlist = generateGradient(color1, color2, numItems);
	var lastaffected = 0;
	$.each(listeinfos['provinces'], function (index, province) {
		var provinceatraiter = listeinfos['provinces'][index];
		var resultfront = $.grep(Object.keys(listeinfos['front']), function (e) {
				return listeinfos['front'][e].front_name == provinceatraiter['front_name']
			});
		if (resultfront[0]) {
			var lefronttrouve = listeinfos['front'][resultfront[0]].front_id;
		} else {
			var lefronttrouve = 'invalide';
		}

		var leprimetimetrouve = provinceatraiter['prime_time'].substring(0, 3);
		var indicetab = leprimetimetrouve + lefronttrouve;

		if (!stylecache[leprimetimetrouve]) {
			stylecache[leprimetimetrouve] = new ol.style.Style({
					fill : new ol.style.Fill({
						color : [colorlist[lastaffected][0], colorlist[lastaffected][1], colorlist[lastaffected][2], 0.8]
					}),
					stroke : new ol.style.Stroke({
						color : '#FFFFFF',
						width : 1
					})
				});
			lastaffected = lastaffected + 1;
		};

		if (!styleText[indicetab]) {

			styleText[indicetab] = new ol.style.Style({
					text : new ol.style.Text({
						text : provinceatraiter['prime_time'],
						textAlign : "center",
						textBaseline : "Middle",
						font : 'bold 24px Arial, Verdana, Helvetica, sans-serif',
						fill : new ol.style.Fill({
							color : '#fff'
						}),
						stroke : new ol.style.Stroke({
							color : '#000'
						})
					})
				});
			// new vector build to be able to compute center of each front and place Text
			sourcestylelist[indicetab] = new ol.source.Vector();
		};
		var result3 = $.grep(features, function (e) {
				return e.getProperties().province_id == provinceatraiter['province_id']
			});
		if (result3[0]) {
			result3[0].setStyle(stylecache[leprimetimetrouve]);
			var geometry = result3[0].getGeometry();
			var center = getCenterOf(geometry);
			var newFeature = new ol.Feature({
					geometry : new ol.geom.Point(center)
				});
			sourcestylelist[indicetab].addFeature(newFeature);
		};
	});
	// now each province are colored we will add for each style a text to display front prime time information
	$.each(Object.keys(sourcestylelist), function (index, source) {
		extentWARN = sourcestylelist[source].getExtent();
		center2Layers = ol.extent.getCenter(extentWARN);
		if (isNaN(center2Layers[0]) == false && isNaN(center2Layers[1]) == false) {
			var newFeaturetext = new ol.Feature({
					geometry : new ol.geom.Point(center2Layers)
				});
			newFeaturetext.setStyle(styleText[source]);
			nouvellesource.addFeature(newFeaturetext);
			//alert(center2Layers);
		}
	});
};

function affichagerevenu() {
	// same as affichageclancolor : layer use random color for each gradient of revenu
	// another layer to display the revenu in text
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource();
	var layerfeatures = new ol.source.Vector();
	layerfeatures.addFeatures(varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures();
	var layer = new ol.layer.Vector({
			idbase : "wargaming",
			source : layerfeatures
		});
	map.addLayer(layer);
	var layer2 = new ol.layer.Vector({
			idbase : "texte2",
			source : new ol.source.Vector({})
		});
	map.addLayer(layer2);
	var nouvellesource = layer2.getSource();
	var maxrevenu = 0;
	$.each(listeinfos['provinces'], function (index, province) {
		var revenu = listeinfos['provinces'][index]['daily_revenue'];
		if (revenu > maxrevenu) {
			maxrevenu = revenu;
		};
	});
	var color1 = [255, 255, 255];
	var color2 = [0, 125, 0];
	var nbgradient = 40;
	var colorlist = generateGradient(color1, color2, nbgradient);
	var stylecache = new Array;
	var styleRevenu = new Array;
	$.each(listeinfos['provinces'], function (index, province) {
		var provinceatraiter = listeinfos['provinces'][index];
		var lefronttrouve = provinceatraiter['daily_revenue'];
		var ponderation = Math.ceil(provinceatraiter['daily_revenue'] * nbgradient / maxrevenu);
		var revenuprov = provinceatraiter['daily_revenue'].toString();
		if (ponderation > 39) {
			ponderation = 39;
		};
		if (!stylecache[ponderation]) {
			stylecache[ponderation] = new ol.style.Style({
					fill : new ol.style.Fill({
						color : [colorlist[ponderation][0], colorlist[ponderation][1], colorlist[ponderation][2], 0.8]
					}),
					stroke : new ol.style.Stroke({
						color : '#FFFFFF',
						width : 1
					})
				});
		};
		if (!styleRevenu[revenuprov]) {
			styleRevenu[revenuprov] = new ol.style.Style({
					text : new ol.style.Text({
						text : revenuprov,
						fill : new ol.style.Fill({
							color : '#000'
						}),
						stroke : new ol.style.Stroke({
							color : '#fff'
						})
					})
				});
		};
		var result3 = $.grep(features, function (e) {
				return e.getProperties().province_id == provinceatraiter['province_id']
			});
		if (result3[0]) {
			result3[0].setStyle(stylecache[ponderation]);
			var geometry = result3[0].getGeometry();
			var point = getCenterOf(geometry);
			newFeature = new ol.Feature({
					ceciestunicone : true,
					geometry : new ol.geom.Point(point)
				});
			newFeature.setStyle(styleRevenu[revenuprov]);
			nouvellesource.addFeature(newFeature);
		};
	});

};

function affichagelevel() {
	// same as affichageclancolor : layer use random color for each level of revenu
	// another layer to display the level in text
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource();
	var layerfeatures = new ol.source.Vector();
	layerfeatures.addFeatures(varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures();
	var layer = new ol.layer.Vector({
			idbase : "wargaming",
			source : layerfeatures
		});
	map.addLayer(layer);
	var maxrevenu = 0;
	$.each(listeinfos['provinces'], function (index, province) {
		var revenu = listeinfos['provinces'][index]['revenue_level'];
		if (revenu > maxrevenu) {
			maxrevenu = revenu;
		};
	});
	if (maxrevenu == 0) {
		maxrevenu = 1;
	};
	var color1 = [255, 255, 255];
	var color2 = [0, 125, 0];
	var nbgradient = 40;
	var colorlist = generateGradient(color1, color2, nbgradient);
	var stylecache = new Array;
	$.each(listeinfos['provinces'], function (index, province) {
		var provinceatraiter = listeinfos['provinces'][index];
		var lefronttrouve = provinceatraiter['revenue_level'];
		var ponderation = Math.ceil(provinceatraiter['revenue_level'] * nbgradient / maxrevenu);
		if (ponderation > 39) {
			ponderation = 39;
		};
		if (!stylecache[ponderation]) {
			stylecache[ponderation] = new ol.style.Style({

					text : new ol.style.Text({
						scale : 1.2,
						text : provinceatraiter['revenue_level'].toString(),
						fill : new ol.style.Fill({
							color : '#000'
						}),
						stroke : new ol.style.Stroke({
							color : '#fff'
						})
					}),
					fill : new ol.style.Fill({
						color : [colorlist[ponderation][0], colorlist[ponderation][1], colorlist[ponderation][2], 0.8]
					}),
					stroke : new ol.style.Stroke({
						color : '#FFFFFF',
						width : 1
					})
				});
		};
		var result3 = $.grep(features, function (e) {
				return e.getProperties().province_id == provinceatraiter['province_id']
			});
		if (result3[0]) {
			result3[0].setStyle(stylecache[ponderation]);
		};
	});
};

function afficherlesicones() {
	// display the CLAN ICON
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource();
	var layerfeatures = new ol.source.Vector();
	layerfeatures.addFeatures(varlayersource.getFeatures());
	var featuresas = layerfeatures.getFeatures()
		var layer = new ol.layer.Vector({
			idbase : "icone",
			source : new ol.source.Vector({})
		});
	map.addLayer(layer);
	var nouvellesource = layer.getSource();
	var stylecache = new Array;
	$.each(listeinfos['provinces'], function (index, province) {
		var provinceatraiter = listeinfos['provinces'][index];
		var couleurhexa = '#000000';
		if (provinceatraiter['owner_clan_id']) {
			var leclantrouve = provinceatraiter['owner_clan_id'];
			if (annuaireclan[leclantrouve] && leclantrouve !== null) {
				emblem = annuaireclan[leclantrouve].emblem_url;
			} else {
				emblem = 'vide';
			}
		} else {
			emblem = 'vide';
		}
		if (!stylecache[emblem]) {
			stylecache[emblem] = new ol.style.Style({
					image : new ol.style.Icon(({
							scale : getScaleZoom(),
							src : emblem,
							opacity : 0.8
						}))
				});
		};
		var result3 = $.grep(featuresas, function (e) {
				return e.getProperties().province_id == provinceatraiter['province_id']
			});
		if (result3[0] && emblem != 'vide') {
			var geometry = result3[0].getGeometry();
			var point = getCenterOf(geometry);
			newFeature = new ol.Feature({
					ceciestunicone : true,
					geometry : new ol.geom.Point(point)
				});
			newFeature.setStyle(stylecache[emblem]);
			nouvellesource.addFeature(newFeature);
			map.render();
		};
	});
};

function getCenterOf(geometry) {
	// factorized function to compute the Center of a province.

	switch (geometry.getType()) {
	case 'MultiPolygon':
		var poly = geometry.getPolygons().reduce(function (left, right) {
				return left.getArea() > right.getArea() ? left : right;
			});
		point = poly.getInteriorPoint().getCoordinates();
		break;
	case 'Polygon':
		point = geometry.getInteriorPoint().getCoordinates();
		break;
	default:
		point = geometry.getClosestPoint(coordinate);
	}
	return point;
};

function effacericone() {
	// remove layers 2
	var vector = getLayerwarg(layers, "icone");
	map.removeLayer(vector);
	var vector = getLayerwarg(layers, "texte2");
	map.removeLayer(vector);
	var vector = getLayerwarg(layers, "texte3");
	map.removeLayer(vector);
	var vector = getLayerwarg(layers, "texte");
	map.removeLayer(vector);
};

function effacerbatailles() {
	// remove layers 3
	var vector = getLayerwarg(layers, "batailles");
	map.removeLayer(vector);
};

/* function affichageclanproperty(entree, clanid, async) {
	// FUNCTION TO CALL ALL PHP METHOD NEEDED FOR THIS PAGE
	var resultatajax = "";

	$.ajax({
		type : 'POST',
		url : 'tools/fonctions_showmap.php',
		data : {
			typeselection : entree,
			clanid : clanid
		},
		success : function (result) {
			resultatajax = result;
		},
		dataType : 'text',
		async : async
	});
	return resultatajax;
}; */

function hexToRgb1(hex) {
	// transform a Hex color format to Rgb Format
	hex = hex.replace(/[^0-9A-F]/gi, '');
	var bigint = parseInt(hex, 16);
	var r = (bigint >> 16) & 255;
	var g = (bigint >> 8) & 255;
	var b = bigint & 255;
	var result = [r, g, b]
	return result;
};

function getRandomColor() {
	// create a random color
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function getLayerwarg(vector, id) {
	// when the map get multiple layers, and we search a particular one, use this fonction
	// with the idbase property.
	// if a new layer type is created dont forget to name "IDBASE"
	var layer;
	vector.forEach(function (lyr) {
		if (id == lyr.get('idbase')) {
			layer = lyr;
		}
	});
	return layer;
}

function generateGradient(colorA, colorB, steps) {
	// function to compute a list of color, with a gradient
	// the Step give the number of color to create.
	var result = [],
	rInterval,
	gInterval,
	bInterval;
	steps -= 1; // Reduce the steps by one because we're including the first item manually
	// Calculate the intervals for each color
	rStep = (Math.max(colorA[0], colorB[0]) - Math.min(colorA[0], colorB[0])) / steps;
	gStep = (Math.max(colorA[1], colorB[1]) - Math.min(colorA[1], colorB[1])) / steps;
	bStep = (Math.max(colorA[2], colorB[2]) - Math.min(colorA[2], colorB[2])) / steps;
	result.push((colorA));
	// Set the starting value as the first color value
	var rVal = colorA[0],
	gVal = colorA[1],
	bVal = colorA[2];
	// Loop over the steps-1 because we're includeing the last value manually to ensure it's accurate
	for (var i = 0; i < (steps - 1); i++) {
		// If the first value is lower than the last - increment up otherwise increment down
		rVal = (colorA[0] < colorB[0]) ? rVal + Math.round(rStep) : rVal - Math.round(rStep);
		gVal = (colorA[1] < colorB[1]) ? gVal + Math.round(gStep) : gVal - Math.round(gStep);
		bVal = (colorA[2] < colorB[2]) ? bVal + Math.round(bStep) : bVal - Math.round(bStep);
		result.push([rVal, gVal, bVal]);
	};
	result.push(colorB);
	return result;
};

function displayFeature(pixel, coord) {
	// when map is clicked, search what province is hit
	// then call methode to display info.
	var features = [];
	var vector = getLayerwarg(layers, "wargaming");
	map.forEachFeatureAtPixel(pixel, function (feature, layer) {

		if (layer == vector) {
			var idprov = feature.get('province_id');
			displayFeatureInfo(idprov);
		};
	});
};

function displayFeatureInfo(idprov) {
	// display info on province
	// called when a province was click on map or on Datatable
	var Contenulink;
	var lesliens;
	var linkprov = listeinfos['provinces'][idprov].uri;
	var listeinfoprov = listeinfos['provinces'][idprov];
	if (listeinfoprov['owner_clan_id'] === null) {
		var contenuclan = '<p> Civilian, no properties </p>';
	} else {
		var listeinfoclan = annuaireclan[listeinfoprov['owner_clan_id']];
		clanselected = listeinfoprov.owner_clan_id;
		lesliens = '<p> Map result ' + listeinfoclan.tag + ': <a href="http://eu.wargaming.net/clans/' + clanselected + '/globalmap#' + '">Link</a></p>' +
			'<p> History of ' + listeinfoclan.tag + ': <a href="https://eu.wargaming.net/globalmap/?utm_campaign=wgcc&utm_medium=link&utm_source=clan_profile_global_map_page#clanlog/' + listeinfos['provinces'][idprov].owner_clan_id + '">Link</a> </p>' +
			'<p> Clan Battles of ' + listeinfoclan.tag + ' : <a href="https://eu.wargaming.net/globalmap/?utm_campaign=wgcc&utm_medium=link&utm_source=clan_profile_global_map_page#battles/' + listeinfos['provinces'][idprov].owner_clan_id + '">Link</a></p>';
		var langindex = languages.indexOf(listeinfoclan.language);
		if (langindex == -1) {
			imglang = flagdir + 'europeanunion.png';
			langage = '<img src="' + imglang + '" style="width: 20px; height: 20px" />' + listeinfoclan.language;
		} else {
			imglang = flagdir + listeinfoclan.language + '.png';
			langage = '<img src="' + imglang + '" style="width: 20px; height: 20px" />' + listeinfoclan.language;
		};
		var contenuclan = '<div style="display: inline-block;"><div style="float: left; padding: 20px;">' +
			'<p> Tag      : ' + listeinfoclan.tag + ' </p>' +
			'<p> Name      : ' + listeinfoclan.name + ' </p>' +
			'<p> Color  : <b style="background-color: ' + listeinfoclan.color + '"> ' + listeinfoclan.color + '</b> </p>' +
			'<p> Emblem   : <img src="' + listeinfoclan.emblem_url + '" /> </p>' +
			'</div><div style="float: left; padding: 20px;">' +
			'<p> Language    : ' + langage + ' </p>' +
			'<p> Members : ' + listeinfoclan.members_count + ' </p>' +
			'<p><input type="button" onclick="Detailinfoclan(' + listeinfos['provinces'][idprov].owner_clan_id + ')" value="More Detail ' + listeinfoclan.tag + '"  class="btn btn-primary"  > </p>' +
			'<p> Last Sync : ' + listeinfoclan['$daterefresh'] + ' </p>' +
			'<p><input type="button" onclick="refreshclan(\'' + listeinfos['provinces'][idprov].owner_clan_id + '\', \'modalprov\')" value="Force Sync. ' + listeinfoclan.tag + '"  class="btn btn-info"  > </p>' +
			'</div></div>';
	};
	Contenulink = '<p> Goto ' + listeinfoprov['province_name'] + ' : <a href="https://eu.wargaming.net/globalmap/?utm_campaign=wot-portal&utm_medium=link&utm_source=main-menu' + linkprov + '">Link</a><p>' + lesliens +
		'<p> Clan portal of ' + listeinfoclan.tag + ' : <a href="http://eu.wargaming.net/clans/' + listeinfos['provinces'][idprov].owner_clan_id + '/">Link</a><p>';
	var contenuprovince = '<div style="display: inline-block;"><div style="float: left; padding: 20px;">' +
		'<p> Province : ' + listeinfoprov['province_name'] + ' </p>' +
		'<p> Front    : ' + listeinfoprov['front_name'] + ' </p>' +
		'<p> Arena    : ' + listeinfoprov['arena_name'] + ' </p>' +
		'<p> Prime Time  : ' + listeinfoprov['prime_time'] + ' </p>' +
		'<p> Server  : ' + listeinfoprov['server'] + ' </p>' +
		'<p> Status   : ' + listeinfoprov['status'] + ' </p>' +
		'<p> Revenue   : ' + listeinfoprov['daily_revenue'] + ' </p>' +
		'<p> Revenu Level   : ' + listeinfoprov['revenue_level'] + ' </p>' +
		'<p> Battles  : ' + listeinfoprov['active_battles'] + ' </p>' +
		'<p> Attackers   : ' + listeinfoprov['attackers'] + ' </p>' +
		'<p> Competitors   : ' + listeinfoprov['competitors'] + ' </p>' +
		'<p><input id="BattleButton" type="button" onclick="getInfoBattle(\'' + idprov + '\', \'' + listeinfoprov["province_name"] + '\')" value="Look Battle"  class="btn btn-info"  > </p>' +
		'<p> Tournament <a id="tournamentbutton" href="https://eu.wargaming.net/globalmap/#tournament/' + listeinfoprov['province_id'] + '">Link</a></p>' +
		'</div></div>';
	$('#InfoPpovID').text('Province selected : ' + listeinfoprov['province_name']);
	$('#Contenuprovince').html(contenuprovince);
	$('#Contenuclan').html(contenuclan);
	$('#Contenulink').html(Contenulink);
	if (listeinfoprov['active_battles'] == 0 && listeinfoprov['attackers'] == 0 && listeinfoprov['competitors'] == 0) {
		$('#tournamentbutton').attr('disabled', 'disabled');
		$('#BattleButton').attr('disabled', 'disabled');
	} else {
		$('#tournamentbutton').removeAttr("disabled");
		$('#BattleButton').removeAttr("disabled");
	};
};

function getInfoBattle(idprov, provname) {
	// call php function to get JSon of all turn battles, if battle dont start we have only one battle in json with competitors
	// else we got all turn with list of attackers.
	var contenuBattle;
	$("html").addClass("wait");
	setTimeout(function () {
	var urlwebapp = "https://script.google.com/macros/s/AKfycbxJmYTHBXM-_urMpk94iXv06jgCOjhGi7mljc39GYfhIZzq9Yo/exec?typeSelection=BATTLETURNINFO&provinceId=" + idprov;
	$.getJSON(urlwebapp, function(data) {
	listturnbattles = data; 
	//affichageclanproperty("BATTLETURNINFO", idprov, false);
	console.log(listturnbattles);
	$('#InfoBattlesID').html('Battle on : ' + provname + '<input id="clikprovClan" onclick="clikprovClan(\''+idprov+'\')" type="button" data-toggle="tooltip" title="Return prov detail" value="' +idprov+ '" class="btn btn-primary">');
	var turnnumber = Object.keys(listturnbattles).length;
	contenuBattleHtml = "<div class='col-sm-4 form-search' style='padding: 20px;'>" +
					"<h5>Turn " + listturnbattles[turnnumber]['round_number'] +" </h5>" +
					'<p> Owner : <img src="' + listturnbattles[turnnumber]['owner'].emblem_url + '" /> ' + listturnbattles[turnnumber]['owner']['tag'] + ' </p>' +
					'<p><input type="button" onclick="Detailinfoclan(' + listeinfos['provinces'][idprov].owner_clan_id + ')" value="More Detail ' + listturnbattles[turnnumber]['owner']['tag'] + '"  class="btn btn-primary"  > </p>' +
					'<p> round number : ' + listturnbattles[turnnumber]['round_number'] + ' </p>' +
					'<p> start time : ' + listturnbattles[turnnumber]['start_time'] + ' </p>' +
					'<p> SuperFinal : ' + listturnbattles[turnnumber]['is_superfinal'] + ' </p>' +
					'<p> Number battles : ' + listturnbattles[turnnumber]['battles'].length + ' </p>' +
					'<p> Number Attackers : ' + ((listturnbattles[turnnumber]['battles'].length) * 2) + ' </p>' +
					'<p> Number pretenders : ' + listturnbattles[turnnumber]['pretenders'].length + ' </p>' +
					'<p> Max Attackers : ' + listturnbattles[turnnumber]['size'] + ' </p>' +
					'<p> Arena : ' + listturnbattles[turnnumber]['arena_name'] + ' </p>' +
					'<p> province revenue : ' + listturnbattles[turnnumber]['province_revenue'] + ' </p>' +
					'<p> revenue level : ' + listturnbattles[turnnumber]['revenue_level'] + ' </p>' +
					'<p> Next round Start : ' + listturnbattles[turnnumber]['next_round_start_time'] + ' </p>' +
					'<a id="prevbattle" class="btn btn-info" data-toggle="tooltip" title="Previous round"><i class="fa fa-arrow-circle-left"></i></a>' +
					'<a id="nextbattle" class="btn btn-info" data-toggle="tooltip" title="Previous round"><i class="fa fa-arrow-circle-right"></i></a>' +
				    "</div>"+
					 "<div class='col-sm-8 form-search' style='padding: 20px;'>" +
					 "<h5 id='titretabbattlr'></h5>" +
					'<table id="tabs-battle" class="table table-striped table-bordered" width="100%"></table>'+
					"</div>"; 
	$('#BattleInfoContainer').html(contenuBattleHtml);
		if (listturnbattles[turnnumber]['round_number'] > 1) {
		$('#prevbattle').removeAttr("disabled");
		
	} else {
		$('#prevbattle').attr('disabled', 'disabled');
	};
	if (listturnbattles[turnnumber]['next_round'] !== null) {
		$('#nextbattle').removeAttr("disabled");
		
	} else {
		$('#nextbattle').attr('disabled', 'disabled');
	};
	
	if (listturnbattles[turnnumber]['pretenders'].length > 0) {
	$('#titretabbattlr').html('Competitors');
	competitorTable = $('#tabs-battle').DataTable({
				// bJQueryUI: true,
				scrollY : 400,
				scrollX : true,
				//scroller:       true,
				paging : false,
				scrollCollapse : true,
				colReorder : true,
				deferRender : false,
				paginate : true,
				autoFill : true,
				processing : true,
				serverSide : false,
				//bAutoWidth : true,
				order : [[1, "asc"]],
				sDom : '<r>t<fi>',
				columns : [{
						title : "Id",
						data : "id",
						visible : false,
					}, {
						title : "Clan",
						data : "clan"
					}, {
						title : "Color",
						data : "color"
					}, {
						title : "Language",
						data : "language"
					}, {
						title : "Name",
						data : "name"
					}, {
						title : "elo_rating_6",
						data : "elo_rating_6"
					}, {
						title : "elo_rating_8",
						data : "elo_rating_8"
					}, {
						title : "elo_rating_10",
						data : "elo_rating_10"
					}, {
						title : "arena_battles_count",
						data : "arena_battles_count"
					}, {
						title : "arena_wins_percent",
						data : "arena_wins_percent"
					},{
						title : "fine_level",
						data : "fine_level"
					}
				]
			});
			
			var tabevent = [];
		$.each(listturnbattles[turnnumber]['pretenders'], function (clan) {
		    var result3 = $.grep(Object.keys(annuaireclan), function (e) {
			return e == listturnbattles[turnnumber]['pretenders'][clan]['id']
		});
	        if (!result3[0]) {
			imglang = flagdir + 'europeanunion.png';
			langagename = "?";
			} else {
			langagename = annuaireclan[listturnbattles[turnnumber]['pretenders'][clan]['id']].language;
			var langindex = languages.indexOf(langagename);
			if (langindex == -1) {
				imglang = flagdir + 'europeanunion.png'
			} else {
				imglang = flagdir + langagename + '.png'
			}
			};

			tabevent.push({
				'id' : listturnbattles[turnnumber]['pretenders'][clan].id,
				'clan' : '<img src="' + listturnbattles[turnnumber]['pretenders'][clan].emblem_url + '" style="width: 20px; height: 20px" />' + listturnbattles[turnnumber]['pretenders'][clan].tag,
				'color' : '<button type="button" style="background-color:' + listturnbattles[turnnumber]['pretenders'][clan].color + '" disabled>' + listturnbattles[turnnumber]['pretenders'][clan].color + '</button>',
				'language' : '<img src="' + imglang + '" style="width: 20px; height: 20px" />' + langagename,
				'name' : listturnbattles[turnnumber]['pretenders'][clan].name,
				'elo_rating_6' : listturnbattles[turnnumber]['pretenders'][clan].elo_rating_6,
				'elo_rating_8' : listturnbattles[turnnumber]['pretenders'][clan].elo_rating_8,
				'elo_rating_10' : listturnbattles[turnnumber]['pretenders'][clan].elo_rating_10,
				
				'arena_battles_count' : listturnbattles[turnnumber]['pretenders'][clan].arena_battles_count,
				'arena_wins_percent' : listturnbattles[turnnumber]['pretenders'][clan].arena_wins_percent,
				'fine_level' : listturnbattles[turnnumber]['pretenders'][clan].fine_level
			});
		});
		competitorTable.rows.add(tabevent);
		competitorTable.draw();	
		competitorTable.columns.adjust();
	
	} else if (listturnbattles[turnnumber]['battles'].length) {
	
	}
	
	if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {				
				$('#provinceInfo').modal('hide');
				$('#BattleInfo').modal('show');
				$("html").removeClass("wait");
			} else {
				// il faut passer en mode overlay pour afficher la fenetre
				var popup = new ol.Overlay({
						element : document.getElementById('BattleInfo')
					});
				popup.setPosition(map.getView().getCenter());
				map.addOverlay(popup);		
				$('#provinceInfo').modal('hide');
				$('#BattleInfo').modal('show');
				$("html").removeClass("wait");
			};
			});
					}, 100);
	
};

	// click on detail prov
	function clikprovClan(idprov) {
		$("html").addClass("wait");
		setTimeout(function () {

			displayFeatureInfo(idprov);
			// if is not fullscreen
			if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
				$('#BattleInfo').modal('hide');
				$('#provinceInfo').modal('show');
				$("html").removeClass("wait");
			} else {
				// il faut passer en mode overlay pour afficher la fenetre
				var popup = new ol.Overlay({
						element : document.getElementById('provinceInfo')
					});
				popup.setPosition(map.getView().getCenter());
				map.addOverlay(popup);
				$('#BattleInfo').modal('hide');
				$('#provinceInfo').modal('show');
				$("html").removeClass("wait");
				
			};
		}, 100);
	};

function getScaleZoom() {
	// function to rewrite, we need to keep icon stable
	// even if level zoom change=> second method with resolution to finish
	var scalezoom = new Array();
	scalezoom[3] = 0.2;
	scalezoom[4] = 0.4;
	scalezoom[5] = 0.8;
	scalezoom[6] = 1;
	scalezoom[7] = 2;
	scalezoom[8] = 3;
	//var resolution = map.getView().getResolution();
	//featureExtent = ol.proj.transformExtent(dufeature.getGeometry().getExtent(), 'EPSG3857', 'EPSG4326'); // get extent and transform to epsg4326
	//extentFactor = ((featureExtent[2] - featureExtent[0]) * 1000)  / resolution,  //divide the width of the feature by the resolution, so the text lies always within the polyon width-bounds
	//scale = extentFactor *  1; //multiply by arbitrary scaling factor to get a usefull font-size
	//console.log('new scale', scale, extentFactor, 'resolution', resolution, "feature width", featureExtent[2] - featureExtent[0] );
	var monzoom = map.getView().getZoom();
	var zoomopt = Math.round(monzoom);
	var scale = scalezoom[zoomopt];
	return scale
};

function showLogTab9(idlog) {
	// function to prepare province table with filters
	// + event on this Table :
	//   *** if the table change (cause a new save was loaded or filters were used
	//   =>we synchronize Clan Data
	//   => we redraw the map with the data on table
	$(document).ready(function () {
		// table prepare
		oTable = $(idlog).DataTable({
				// bJQueryUI: true,
				scrollY : 400,
				scrollX : true,
				//scroller:       true,
				paging : false,
				scrollCollapse : true,
				colReorder : true,
				deferRender : false,
				paginate : true,
				autoFill : true,
				processing : true,
				serverSide : false,
				bAutoWidth : true,
				sDom : '<r>t<fi>',
				columns : [{
						title : "Province",
						data : "province_name"
					}, {
						title : "Owner",
						data : "owner_clan_id"
					}, {
						title : "Clan color",
						data : "clancolor",
						"bVisible" : false
					}, {
						title : "Front",
						data : "front_name"
					}, {
						title : "Prime time",
						data : "prime_time"
					}, {
						title : "Landing type",
						data : "landing_type"
					}, {
						title : "Server",
						data : "server",
						"bVisible" : false
					}, {
						title : "Status",
						data : "status"
					}, {
						title : "Revenue",
						data : "daily_revenue"
					}, {
						title : "Province Level",
						data : "revenue_level"
					}, {
						title : "Battles",
						data : "active_battles"
					}, {
						title : "Attackers",
						data : "attackers"
					}, {
						title : "Competitors",
						data : "competitors"
					}, {
						title : "Arena",
						data : "arena_name"
					}, {
						title : "Language",
						data : "langage",
						"bVisible" : false
					}, {
						title : "Pillage",
						data : "pillage",
						"bVisible" : false
					}, {
						title : "ClanELO6",
						data : "ClanELO6",
						"bVisible" : false
					}, {
						title : "ClanELO8",
						data : "ClanELO8",
						"bVisible" : false
					}, {
						title : "ClanELO10",
						data : "ClanELO10",
						"bVisible" : false
					}, {
						title : "accepts_join_requests",
						data : "accepts_join_requests",
						"bVisible" : false
					}, {
						title : "members_count",
						data : "members_count",
						"bVisible" : false
					}, {
						title : "battles",
						data : "battles",
						"bVisible" : false
					}, {
						title : "battles_6_level",
						data : "battles_6_level",
						"bVisible" : false
					}, {
						title : "battles_8_level",
						data : "battles_8_level",
						"bVisible" : false
					}, {
						title : "battles_10_level",
						data : "battles_10_level",
						"bVisible" : false
					}, {
						title : "wins",
						data : "wins",
						"bVisible" : false
					}, {
						title : "wins_6_level",
						data : "wins_6_level",
						"bVisible" : false
					}, {
						title : "wins_8_level",
						data : "wins_8_level",
						"bVisible" : false
					}, {
						title : "wins_10_level",
						data : "wins_10_level",
						"bVisible" : false
					}, {
						title : "losses",
						data : "losses",
						"bVisible" : false
					}, {
						title : "provinces_count",
						data : "provinces_count",
						"bVisible" : false
					}, {
						title : "captures",
						data : "captures",
						"bVisible" : false
					}
				]
			});
		var columnheader = oTable.columns().header();
		var titlecolumns = $.map(columnheader, function (node) {
				return node.textContent;
			});
		// table change detected : sync data clan and redraw map
		oTable.on('search.dt', function () {
			Filterprovinceonmap();
			$(document).ready(function () {
				yadcf.exResetAllFilters(clanTable);
				var rows = $('#tabs-9tab').dataTable().$('tr', {
						"filter" : "applied"
					});
				var filteredclan = $.unique(rows);
				var filteredclantag = $.map(filteredclan, function (node) {
						var Textclan = node.cells[1].textContent;
						return Textclan;
					});
				yadcf.exFilterColumn(clanTable, [[1, filteredclantag]]);
				var rows2 = clanTable.$('tr', {
						"filter" : "applied"
					});
				$('#presult').text('Result => Province Found : ' + rows.length + ' / Clan Found : ' + rows2.length);
				if (rows.length == $('#tabs-9tab').dataTable().fnGetData().length) {
					$('#result_filters').removeClass('btn btn-success');
					$('#result_filters').addClass('btn btn-default');
					$('#result_filters').text('Prov:' + rows.length + ' Clan:' + rows2.length + '(No Filter)');
				} else {
					$('#result_filters').removeClass('btn btn-default');
					$('#result_filters').addClass('btn btn-success');
					$('#result_filters').text('Prov:' + rows.length + ' Clan:' + rows2.length + '(Filtered)');
				}
				var modAff = $('#ModeAffichage').val();
				ModeAffichage(modAff);
			});
			$('select[id^= "yadcf-filter-"][class*="select2"]').each(function () {
				$(this).select2("close");
			});
		});
		// initialiize Filter for this table
		// actually Filter range slider is bugged, stay with range value
		// until YADCF was corrected (https://github.com/vedmack/yadcf/issues/308)
		yadcf.init(oTable, [{
					column_number : titlecolumns.indexOf("Province"),
					filter_type : "multi_select",
					select_type : 'select2',
					filter_default_label : "Province",
					filter_container_id : 'external_filter_container_0',
					filter_match_mode : 'exact',
					cumulative_filtering : false,
					select_type_options : {
						theme : "bootstrap",
						width : '150px',
						//placeholder: 'Province',
						language : "fr"
					}
				}, {
					column_number : titlecolumns.indexOf("Owner"),
					filter_container_id : 'external_filter_container_1',
					filter_type : "multi_select",
					select_type : 'select2',
					filter_default_label : "Clans",
					filter_match_mode : 'exact',
					cumulative_filtering : false,
					select_type_options : {
						theme : "bootstrap",
						width : '150px',
						templateResult : formatClan,
						templateSelection : formatClan
					}
				}, {
					column_number : titlecolumns.indexOf("Clan color"),
					filter_container_id : 'external_filter_container_29',
					filter_type : "multi_select",
					select_type : 'select2',
					filter_default_label : "Clan color",
					filter_match_mode : 'exact',
					sort_as : 'custom',
					sort_as_custom_func : sortColor,
					cumulative_filtering : false,
					select_type_options : {
						theme : "bootstrap",
						width : '150px',
						closeOnSelect : false,
						templateResult : formatColor,
						templateSelection : formatColor
					}
				}, {
					column_number : titlecolumns.indexOf("Front"),
					filter_container_id : 'external_filter_container_2',
					filter_type : "multi_select",
					select_type : 'select2',
					filter_default_label : "Front",
					cumulative_filtering : false,
					filter_match_mode : 'exact',
					select_type_options : {
						theme : "bootstrap",
						width : '150px'
					}
				}, {
					column_number : titlecolumns.indexOf("Prime time"),
					filter_container_id : 'external_filter_container_3',
					filter_type : "multi_select",
					select_type : 'select2',
					filter_default_label : "Prime Time",
					cumulative_filtering : false,
					filter_match_mode : 'exact',
					select_type_options : {
						theme : "bootstrap",
						width : '150px'
					}
				}, {
					column_number : titlecolumns.indexOf("Landing type"),
					filter_container_id : 'external_filter_container_4',
					// column_data_type: "html",
					filter_type : "multi_select",
					select_type : 'select2',
					filter_default_label : "Landing type",
					cumulative_filtering : false,
					filter_match_mode : 'exact',
					select_type_options : {
						theme : "bootstrap",
						width : '150px'
					}
				}, {
					column_number : titlecolumns.indexOf("Status"),
					filter_container_id : 'external_filter_container_6',
					filter_type : "multi_select",
					select_type : 'select2',
					filter_default_label : "Status",
					cumulative_filtering : false,
					filter_match_mode : 'exact',
					select_type_options : {
						theme : "bootstrap",
						width : '150px'
					}
				}, {
					column_number : titlecolumns.indexOf("Revenue"),
					filter_container_id : 'external_filter_container_7',
					filter_type : "range_number",
					filter_delay : 1000
				}, {
					column_number : titlecolumns.indexOf("Province Level"),
					filter_container_id : 'external_filter_container_8',
					filter_type : "range_number",
					filter_delay : 1000
				}, {
					column_number : titlecolumns.indexOf("Battles"),
					filter_container_id : 'external_filter_container_9',
					filter_type : "range_number",
					filter_delay : 1000
				}, {
					column_number : titlecolumns.indexOf("Attackers"),
					filter_container_id : 'external_filter_container_10',
					filter_type : "range_number",
					filter_delay : 1000
				}, {
					column_number : titlecolumns.indexOf("Competitors"),
					filter_container_id : 'external_filter_container_11',
					filter_type : "range_number",
					filter_delay : 1000
				}, {
					column_number : titlecolumns.indexOf("Arena"),
					filter_container_id : 'external_filter_container_12',
					filter_type : "multi_select",
					select_type : 'select2',
					filter_default_label : "Arena",
					filter_match_mode : 'exact',
					cumulative_filtering : false,
					select_type_options : {
						theme : "bootstrap",
						width : '150px'
					}
				}, {
					column_number : titlecolumns.indexOf("Language"),
					filter_container_id : 'external_filter_container_13',
					filter_type : "multi_select",
					select_type : 'select2',
					filter_default_label : "Clan Language",
					filter_match_mode : 'exact',
					cumulative_filtering : false,
					select_type_options : {
						theme : "bootstrap",
						width : '150px',
						templateResult : formatState,
						templateSelection : formatState
					}
				}, {
					column_number : titlecolumns.indexOf("ClanELO6"),
					filter_container_id : 'external_filter_container_14',
					filter_type : "range_number",
					filter_delay : 1000
				}, {
					column_number : titlecolumns.indexOf("ClanELO8"),
					filter_container_id : 'external_filter_container_15',
					filter_type : "range_number",
					filter_delay : 1000
				}, {
					column_number : titlecolumns.indexOf("ClanELO10"),
					filter_container_id : 'external_filter_container_16',
					filter_type : "range_number",
					filter_delay : 1000
				}, {
					column_number : titlecolumns.indexOf("accepts_join_requests"),
					filter_container_id : 'external_filter_container_17',
					filter_type : "multi_select",
					select_type : 'select2',
					filter_default_label : "Clan Recruit",
					filter_match_mode : 'exact',
					cumulative_filtering : false,
					select_type_options : {
						theme : "bootstrap",
						width : '150px'
					}
				}, {
					column_number : titlecolumns.indexOf("members_count"),
					filter_container_id : 'external_filter_container_18',
					filter_type : "range_number",
					filter_delay : 1000
				}, {
					column_number : titlecolumns.indexOf("battles"),
					filter_container_id : 'external_filter_container_19',
					filter_type : "range_number",
					filter_delay : 1000
				}, {
					column_number : titlecolumns.indexOf("battles_6_level"),
					filter_container_id : 'external_filter_container_20',
					filter_type : "range_number",
					filter_delay : 1000
				}, {
					column_number : titlecolumns.indexOf("battles_8_level"),
					filter_container_id : 'external_filter_container_21',
					filter_type : "range_number",
					filter_delay : 1000
				}, {
					column_number : titlecolumns.indexOf("battles_10_level"),
					filter_container_id : 'external_filter_container_22',
					filter_type : "range_number",
					filter_delay : 1000
				}, {
					column_number : titlecolumns.indexOf("wins"),
					filter_container_id : 'external_filter_container_23',
					filter_type : "range_number",
					filter_delay : 1000
				}, {
					column_number : titlecolumns.indexOf("wins_6_level"),
					filter_container_id : 'external_filter_container_24',
					filter_type : "range_number",
					filter_delay : 1000
				}, {
					column_number : titlecolumns.indexOf("wins_8_level"),
					filter_container_id : 'external_filter_container_25',
					filter_type : "range_number",
					cumulative_filtering : false,
					filter_delay : 1000
				}, {
					column_number : titlecolumns.indexOf("wins_10_level"),
					filter_container_id : 'external_filter_container_26',
					filter_type : "range_number",
					filter_delay : 1000
				}, {
					column_number : titlecolumns.indexOf("losses"),
					filter_container_id : 'external_filter_container_27',
					filter_type : "range_number",
					filter_delay : 1000
				}, {
					column_number : titlecolumns.indexOf("provinces_count"),
					filter_container_id : 'external_filter_container_28',
					filter_type : "range_number",
					filter_delay : 1000
				}, {
					column_number : titlecolumns.indexOf("captures"),
					filter_container_id : 'external_filter_container_30',
					filter_type : "range_number",
					filter_delay : 1000
				}
			], {
			cumulative_filtering : true
		});
	});
	return true;
};

function showLogSeason() {
	// function to prepare the table of season with his column
	$(document).ready(function () {
		seasonTable = $('#tabs-season').DataTable({
				// bJQueryUI: true,
				scrollY : 400,
				scrollX : true,
				//scroller:       true,
				paging : false,
				scrollCollapse : true,
				colReorder : true,
				deferRender : false,
				paginate : true,
				autoFill : true,
				processing : true,
				serverSide : false,
				bAutoWidth : true,
				order : [[3, "desc"]],
				sDom : '<r>t<i>',
				columns : [{
						title : "Id",
						data : "season_id",
						visible : false,
					}, {
						title : "Name",
						data : "season_name"
					}, {
						title : "Date Start",
						data : "start"
					}, {
						title : "Date End",
						data : "end"
					}, {
						title : "Status",
						data : "status"
					}, {
						title : "Map Build",
						data : "build"
					}
				]
			});
		return true;
	});
}

function formatState(state) {
	// function used to build column langage in table
	if (!state.id) {
		return state.text;
	}
	var langindex = languages.indexOf(state.text);
	if (langindex == -1) {
		imglang = flagdir + 'europeanunion.png';
		langage = '<img src="' + imglang + '" style="width: 20px; height: 20px" />' + state.text;
	} else {
		imglang = flagdir + state.text + '.png';
		langage = '<img src="' + imglang + '" style="width: 20px; height: 20px" />' + state.text;
	};
	var $state = $('<span>' + langage + '</span>');
	return $state;
};

function formatClan(state) {
	//function used to build clan column in table
	if (!state.id) {
		return state.text;
	}
	var result3 = $.grep(Object.keys(annuaireclan), function (e) {
			return annuaireclan[e].tag == state.text
		});
	emblem = '';
	if (result3[0]) {
		emblem = annuaireclan[result3[0]].emblem_url;
	}
	clantoshow = '<img src="' + emblem + '" style="width: 20px; height: 20px" />' + state.text;
	var $state = $('<span>' + clantoshow + '</span>');
	return $state;
};

function formatColor(state) {
	// function used to build color column in table
	if (!state.id) {
		return state.text;
	}
	clancolor = '<button type="button" style="background-color:' + state.text + '" disabled>' + state.text + '</button>';
	var $state = $('<span>' + clancolor + '</span>');
	return $state;
};

function loadLogSeason() {
	// Load the table SEASON.
	$(document).ready(function () {
		var tabevent = [];
		$.each(seasondata, function (season) {
			var mapbuild;
			if (seasondata[season].build != true) {
				if (seasondata[season].status == 'ACTIVE') {
					mapbuild = 'Wait Building';
				} else {
					mapbuild = 'Not Ready'
				}
			} else {
				mapbuild = 'Done'
			}

			tabevent.push({
				'season_id' : seasondata[season].season_id,
				'season_name' : seasondata[season].season_name,
				'start' : seasondata[season].start,
				'end' : seasondata[season].end,
				'status' : seasondata[season].status,
				'build' : mapbuild
			});
		});
		seasonTable.clear();
		seasonTable.rows.add(tabevent);
		seasonTable.columns.adjust();
		seasonTable.draw();
	});
}



function showLogClan() {
	// prepare the datatable CLAN
	$(document).ready(function () {
		clanTable = $('#tabs-clan').DataTable({
				// bJQueryUI: true,
				scrollY : 400,
				scrollX : true,
				//scroller:       true,
				paging : false,
				scrollCollapse : true,
				colReorder : true,
				deferRender : false,
				paginate : true,
				autoFill : true,
				processing : true,
				serverSide : false,
				bAutoWidth : true,
				order : [[3, "desc"]],
				sDom : '<r>t<fi>',
				columns : [{
						title : "Id",
						data : "id",
						visible : false,
					}, {
						title : "Clan",
						data : "clan"
					}, {
						title : "Color",
						data : "color"
					}, {
						title : "Language",
						data : "language"
					}, {
						title : "Name",
						data : "name"
					}, {
						title : "elo_rating_6",
						data : "elo_rating_6"
					}, {
						title : "elo_rating_8",
						data : "elo_rating_8"
					}, {
						title : "elo_rating_10",
						data : "elo_rating_10"
					}, {
						title : "members_count",
						data : "members_count"
					}, {
						title : "created_at",
						data : "created_at"
					}, {
						title : "accepts_join_requests",
						data : "accepts_join_requests"
					}, {
						title : "battles",
						data : "battles"
					}, {
						title : "battles_10_level",
						data : "battles_10_level"
					}, {
						title : "battles_8_level",
						data : "battles_8_level"
					}, {
						title : "battles_6_level",
						data : "battles_6_level"
					}, {
						title : "captures",
						data : "captures"
					}, {
						title : "losses",
						data : "losses"
					}, {
						title : "provinces_count",
						data : "provinces_count"
					}, {
						title : "wins",
						data : "wins"
					}, {
						title : "wins_6_level",
						data : "wins_6_level"
					}, {
						title : "wins_8_level",
						data : "wins_8_level"
					}, {
						title : "wins_10_level",
						data : "wins_10_level"
					}, {
						title : "captures",
						data : "captures"
					}, {
						title : "last refresh",
						data : "$daterefresh"
					}, {
						title : "force refresh",
						data : "forceRefresh"
					}
				]
			});
		yadcf.init(clanTable, [{
					column_number : 1,
					filter_type : "multi_select",
					select_type : 'select2',
					filter_default_label : "Clan",
					filter_match_mode : 'exact',
					cumulative_filtering : false,
					filter_container_id : 'external_filter_container_100',
					select_type_options : {
						theme : "bootstrap",
						templateResult : formatClan,
						templateSelection : formatClan,
						width : '100px'
					}
				}
			], {
			externally_triggered : true
		});
		return true;
	});
}

function loadLogClan() {
	// load the table Clan
	$(document).ready(function () {
		var tabevent = [];
		$.each(annuaireclan, function (clan) {
			var langindex = languages.indexOf(annuaireclan[clan].language);
			if (langindex == -1) {
				imglang = flagdir + 'europeanunion.png'
			} else {
				imglang = flagdir + annuaireclan[clan].language + '.png'
			};

			tabevent.push({
				'id' : annuaireclan[clan].id,
				'clan' : '<img src="' + annuaireclan[clan].emblem_url + '" style="width: 20px; height: 20px" />' + annuaireclan[clan].tag,
				'color' : '<button type="button" style="background-color:' + annuaireclan[clan].color + '" disabled>' + annuaireclan[clan].color + '</button>',
				'language' : '<img src="' + imglang + '" style="width: 20px; height: 20px" />' + annuaireclan[clan].language,
				'name' : annuaireclan[clan].name,
				'elo_rating_6' : annuaireclan[clan].elo_rating_6,
				'elo_rating_8' : annuaireclan[clan].elo_rating_8,
				'elo_rating_10' : annuaireclan[clan].elo_rating_10,
				'members_count' : annuaireclan[clan].members_count,
				'created_at' : annuaireclan[clan].created_at,
				'accepts_join_requests' : annuaireclan[clan].accepts_join_requests,
				'battles' : annuaireclan[clan].battles,
				'battles_10_level' : annuaireclan[clan].battles_10_level,
				'battles_8_level' : annuaireclan[clan].battles_8_level,
				'battles_6_level' : annuaireclan[clan].battles_6_level,
				'captures' : annuaireclan[clan].captures,
				'losses' : annuaireclan[clan].losses,
				'provinces_count' : annuaireclan[clan].provinces_count,
				'wins' : annuaireclan[clan].wins,
				'wins_6_level' : annuaireclan[clan].wins_6_level,
				'wins_8_level' : annuaireclan[clan].wins_8_level,
				'wins_10_level' : annuaireclan[clan].wins_10_level,
				'captures' : annuaireclan[clan].captures,
				'$daterefresh' : annuaireclan[clan].$daterefresh,
				'forceRefresh' : '<a class="btn btn-info" data-toggle="tooltip" title="Force refresh Clan"><i class="fa fa-refresh " onclick="refreshclan(\'' + annuaireclan[clan].id + '\', \'tableclan\')"></i></a>'
			});
		});
		clanTable.clear();
		clanTable.rows.add(tabevent);
		clanTable.columns.adjust();
		clanTable.draw();
	});
}

function Detailinfoclan(clanid) {
	// to finish, when a new modal windows with detailled information about clan is called
	// (button on window info province, and sheduled for datatable clan on clan click
	alert('not finshed yet : clan ' + clanid);
};

function refreshclan(clanid, context) {
	// too finsh, scheduled, call a new AJAX on PHP to have the last info on clan
	// maybe adding API clan for more information...
	alert('not finshed yet : clan ' + clanid);
};

function chargerlalog() {
	// load the table province
	// when the function LOADSAVE is fired, this function was called to refresh data
	var tabevent = [];
	//listclanunknow = [];
	$.each(listeinfos['provinces'], function (province) {
		var nomclan;
		var colorclan;
		var emblem;
		var langage;
		var clantoshow;
		var clancolor = ' ';
		if (typeof annuaireclan[listeinfos['provinces'][province].owner_clan_id] !== 'undefined') {
			nomclan = annuaireclan[listeinfos['provinces'][province].owner_clan_id].tag;
			colorclan = annuaireclan[listeinfos['provinces'][province].owner_clan_id].color;
			emblem = annuaireclan[listeinfos['provinces'][province].owner_clan_id].emblem_url;
			langagename = annuaireclan[listeinfos['provinces'][province].owner_clan_id].language;
			clantoshow = '<img src="' + emblem + '" style="width: 20px; height: 20px" />' + nomclan;
			ClanELO6 = annuaireclan[listeinfos['provinces'][province].owner_clan_id].elo_rating_6;
			ClanELO8 = annuaireclan[listeinfos['provinces'][province].owner_clan_id].elo_rating_8;
			ClanELO10 = annuaireclan[listeinfos['provinces'][province].owner_clan_id].elo_rating_10;
			accepts_join_requests = annuaireclan[listeinfos['provinces'][province].owner_clan_id].accepts_join_requests;
			members_count = annuaireclan[listeinfos['provinces'][province].owner_clan_id].members_count;
			battles = annuaireclan[listeinfos['provinces'][province].owner_clan_id].battles;
			battles_6_level = annuaireclan[listeinfos['provinces'][province].owner_clan_id].battles_6_level;
			battles_8_level = annuaireclan[listeinfos['provinces'][province].owner_clan_id].battles_8_level;
			battles_10_level = annuaireclan[listeinfos['provinces'][province].owner_clan_id].battles_10_level;
			wins = annuaireclan[listeinfos['provinces'][province].owner_clan_id].wins;
			wins_6_level = annuaireclan[listeinfos['provinces'][province].owner_clan_id].wins_6_level;
			wins_8_level = annuaireclan[listeinfos['provinces'][province].owner_clan_id].wins_8_level;
			wins_10_level = annuaireclan[listeinfos['provinces'][province].owner_clan_id].wins_10_level;
			losses = annuaireclan[listeinfos['provinces'][province].owner_clan_id].losses;
			provinces_count = annuaireclan[listeinfos['provinces'][province].owner_clan_id].provinces_count;
			captures = annuaireclan[listeinfos['provinces'][province].owner_clan_id].captures;
			var langindex = languages.indexOf(langagename);
			if (langindex == -1) {
				imglang = flagdir + 'europeanunion.png';
				langage = '<img src="' + imglang + '" style="width: 20px; height: 20px" />' + langagename;
			} else {
				imglang = flagdir + annuaireclan[listeinfos['provinces'][province].owner_clan_id].language + '.png';
				langage = '<img src="' + imglang + '" style="width: 20px; height: 20px" />' + langagename;
			};
		} else {
			if (listeinfos['provinces'][province].owner_clan_id !== null) {
				nomclan = listeinfos['provinces'][province].owner_clan_id;
				color = 'black';
				emblem = '';
				langage = ' ';
				clantoshow = 'Unknow';
				//listclanunknow.push(listeinfos['provinces'][province].owner_clan_id);
			} else {
				nomclan = listeinfos['provinces'][province].owner_clan_id;
				color = 'white';
				emblem = '';
				langage = ' ';
				clantoshow = 'Civilian';
			}
			ClanELO6 = 0;
			ClanELO8 = 0;
			ClanELO10 = 0;
			accepts_join_requests = false;
			members_count = 0;
			battles = 0;
			battles_6_level = 0;
			battles_8_level = 0;
			battles_10_level = 0;
			wins = 0;
			wins_6_level = 0;
			wins_8_level = 0;
			wins_10_level = 0;
			losses = 0;
			provinces_count = 0;
		}
		tabevent.push({
			'province_name' : '<button type="button" title="zoom to" onclick="chargerlaprov(\'' + listeinfos['provinces'][province].province_id + '\')">' + listeinfos['provinces'][province].province_name + '</button>',
			'owner_clan_id' : clantoshow,
			'clancolor' : '<button type="button" style="background-color:' + colorclan + '" disabled>' + colorclan + '</button>',
			'front_name' : listeinfos['provinces'][province].front_name,
			'prime_time' : listeinfos['provinces'][province].prime_time,
			'landing_type' : listeinfos['provinces'][province].landing_type,
			'server' : listeinfos['provinces'][province].server,
			'status' : listeinfos['provinces'][province].status,
			'daily_revenue' : listeinfos['provinces'][province].daily_revenue,
			'revenue_level' : listeinfos['provinces'][province].revenue_level,
			'active_battles' : listeinfos['provinces'][province].active_battles,
			'attackers' : listeinfos['provinces'][province].attackers,
			'competitors' : listeinfos['provinces'][province].competitors,
			'arena_name' : listeinfos['provinces'][province].arena_name,
			'langage' : langage,
			'pillage' : listeinfos['provinces'][province].pillage,
			'ClanELO6' : ClanELO6,
			'ClanELO8' : ClanELO8,
			'ClanELO10' : ClanELO10,
			'accepts_join_requests' : accepts_join_requests,
			'members_count' : members_count,
			'battles' : battles,
			'battles_6_level' : battles_6_level,
			'battles_8_level' : battles_8_level,
			'battles_10_level' : battles_10_level,
			'wins' : wins,
			'wins_6_level' : wins_6_level,
			'wins_8_level' : wins_8_level,
			'wins_10_level' : wins_10_level,
			'losses' : losses,
			'provinces_count' : provinces_count,
			'captures' : captures
		});
	});
	var tableLog = $("#tabs-9tab").DataTable();
	tableLog.clear();
	tableLog.rows.add(tabevent);
	tableLog.columns.adjust();
	tableLog.draw();

	// active or desactivate resync clan button
/* 	if (listclanunknow.length == 0) {
		$('#clanunknow').removeClass('btn btn-success');
		$('#clanunknow').addClass('btn btn-default');
		$('#clanunknow').attr('disabled', 'disabled');
	} else {
		$('#clanunknow').removeClass('btn btn-default');
		$('#clanunknow').addClass('btn btn-success');
		$('#clanunknow').removeAttr('disabled');
	}; */
};

function chargerlaprov(prov) {
	// when a province was clicked on table, go on map and zoom, then call method for displaying infos.
	var featuresas = varlayersource.getFeatures();
	var result3 = $.grep(featuresas, function (e) {
			return e.getProperties().province_id == prov
		});
	var geometry = result3[0].getGeometry();
	var point = getCenterOf(geometry);
	map.getView().setCenter(point);
	$('html,body').animate({
		scrollTop : $("#Mapp").offset().top
	}, 'slow');
	map.getView().setZoom(6);
	var features = selectInteraction.getFeatures();
	features.clear();
	features.push(result3[0]);
	var pixel = getCenterOf(result3[0].getGeometry());
	displayFeatureInfo(result3[0]);
	$('#provinceInfo').modal('show');
};

function Filterprovinceonmap() {
	// this function scan the Datatable PROVINCE, and add all province on map.
	// usefull to redraw the map when filter change.
	var vector = getLayerwarg(layers, "wargaming");
	var carteincomplete = new ol.source.Vector();
	var layer = new ol.layer.Vector({
			idbase : "wargaming",
			source : carteincomplete
		});

	map.removeLayer(vector);
	map.addLayer(layer);
	var filteredprov = new Array;
	var rows = $('#tabs-9tab').dataTable().$('tr', {
			"filter" : "applied"
		});
	$.each(rows, function (row) {
		var datarowprov = rows[row].cells[0].textContent;
		var result3 = $.grep(Object.keys(listeinfos.provinces), function (e) {
				return listeinfos.provinces[e].province_name == datarowprov
			});
		var datarowprovid = result3[0];
		if (result3 && result3.length == 1) {
			filteredprov.push(result3[0]);
		}
	});
	var i = 0;
	var listeprovinceatraiter = cartecomplete.getSource().getFeatures();
	$.each(listeprovinceatraiter, function (index, feature) {
		var result3 = $.grep(filteredprov, function (e) {
				return e == feature.getProperties().province_id
			});

		if (result3 && result3.length == 1) {
			i++;
			carteincomplete.addFeature(feature.clone());
		};
	});
};

function sortColor(a, b) {
	// function to order color in select list with hue value (use a JS script)
	var pastel = new HexArray([a, b]);
	var pastel2 = pastel.sortColorArray('hue');
	return pastel2[0] == b ? -1 : 1;
}

// -------------------END---FUNCTIONS ------------------------>>


// -------------------SPECIFIC BOOTSTRAP TEMPLATE ------------------------>>

$(document).ready(function () {

	/***************** Navbar-Collapse ******************/
	$(window).scroll(function () {
		if ($(".navbar").offset().top > 50) {
			$(".navbar-fixed-top").addClass("top-nav-collapse");
		} else {
			$(".navbar-fixed-top").removeClass("top-nav-collapse");
		}
	});
	/***************** Page Scroll ******************/
	$(function () {
		$('a.page-scroll').bind('click', function (event) {
			var $anchor = $(this);
			$('html, body').stop().animate({
				scrollTop : $($anchor.attr('href')).offset().top
			}, 1500, 'easeInOutExpo');
			event.preventDefault();
		});
	});
	/***************** Scroll Spy ******************/
	$('body').scrollspy({
		target : '.navbar-fixed-top',
		offset : 51
	})
	/***************** carrousel ******************/
	$("#Tutorialcarousel").owlCarousel({
		navigation : true, // Show next and prev buttons
		slideSpeed : 1000,
		paginationSpeed : 400,
		singleItem : true,
		transitionStyle : "fadeUp",
		autoPlay : true,
		navigationText : ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"]
	});
	var owl = $("#Newscarousel");
	owl.owlCarousel({
		navigation : true, // Show next and prev buttons
		slideSpeed : 1000,
		paginationSpeed : 400,
		singleItem : true,
		transitionStyle : "fadeUp",
		autoPlay : false,
		navigationText : ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"]
	})
	var $parseRSS = function (paramsObj) {
		var base = "https://ajax.googleapis.com/ajax/services/feed/load",
		params = "?v=1.0&num=" + paramsObj.count + "&callback=?&q=" + paramsObj.url,
		url = base + params;
		$.ajax({
			url : url,
			dataType : "json",
			success : function (data) {
				paramsObj.callback(data.responseData.feed.entries);
			}
		});
	};
	$parseRSS({
		url : "http://worldoftanks.eu/en/rss/news/cw/",
		count : 10,
		callback : function (posts) {
			$.each(posts, function (index, post) {
				var content = "<div class='item'>" +
					"<div class='container'>" +
					"<div class='col-md-8'>" +
					"<div class='team'>" +
					"<center><h4>" + posts[index].title + "</h4></center>" +
					"<center><h6>" + posts[index].publishedDate + "</h6></center>" +
					"<center>" + posts[index].content + "</center>" +
					"</div>" +
					"</div></div>" +
					"</div>";
				owl.data('owlCarousel').addItem(content);
			})
		}
	});
	/***************** Full Width Slide ******************/
	var slideHeight = $(window).height();
	$('#owl-hero .item').css('height', slideHeight);
	$(window).resize(function () {
		$('#owl-hero .item').css('height', slideHeight);
	});
	/***************** Wow.js ******************/
	new WOW().init();

	/***************** YADCF Bootstrap style .js ******************/
	function yadcfAddBootstrapClass() {
		var filterInput = $('.yadcf-filter, .yadcf-filter-range, .yadcf-filter-date'),
		filterReset = $('.yadcf-filter-reset-button');
		filterInput.addClass('form-control');
		filterReset.addClass('btn btn-default').html('&#10005;');
	};
	yadcfAddBootstrapClass();
});

// -----------------END--SPECIFIC BOOTSTRAP TEMPLATE ------------------------>
