/***************** Preloader ******************/
var preloader = $('.preloader');
preloader.show();
var flagdir = "http://wotclanwar2.16mb.com/tools/flags/"
var date_evenement = new Date();
var documentHeight = $('#map').height();
var documentWidth = $('#map').width();
var cartecomplete;
date_evenement.setHours(date_evenement.getHours()+1);
date_evenement.setMinutes(05);
var annuaireclan = JSON.parse(affichageclanproperty("CLANLIST", " ", false));
var listesaveresult = JSON.parse(affichageclanproperty("SAVE", " ", false));
var dernieresave = affichageclanproperty("LASTSAVE", " ", false);
var datedernieresave = affichageclanproperty("DATELASTSAVE", " ", false);
date = new Date(datedernieresave*1000);
var hours = date.getHours();
var minutes = date.getMinutes();
var year = date.getFullYear();
var month = date.getMonth() + 1;
var date = date.getDate();
//dernierereact.innerHTML = "Carte Fraiche : " + date + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
var clanselected = "";
var fullscreen = false;
var seasondata = JSON.parse(affichageclanproperty("SEASONDATA", " ", false));
console.log('seasondata :',seasondata);
showLogSeason();
showLogTab9('#tabs-9tab');
$("#reactualisation").button();
// export pdf ------
window.app = {};
var app = window.app;
app.pdf = function() {
	var button = document.createElement('button');
	button.innerHTML = '<img src="tools/images/pdf_icon.png" />';
	button.title = 'Save Image : plz do right click on map';
	var fonctionexport = function() {
		alert('Right click on map and make save image.');
	};
	button.addEventListener('click', fonctionexport, false);
	var element = document.createElement('div');
	element.className = 'pdfbutton ol-control';
	element.appendChild(button);
	ol.control.Control.call(this, {
		element: element
	});
};

app.google = function() {
	var button = document.createElement('button');
	button.innerHTML = '<img src="tools/images/Google_Maps_Icon.png" />';
	button.title = 'Export format Google Map';
	var fonctionexportgoogle = function () {
		var kmlFormat = new ol.format.KML();
		var kmllayer = new String('');
		var layers = map.getLayers() ;
		var features = new Array;
		layers.forEach(function (layer) {
			if (layer.get('idbase') == 'TileWMS') {
				// on ne fait rien
			}
			if (layer.get('idbase') == 'wargaming' || layer.get('idbase') == 'batailles' || layer.get('idbase') == 'texte') {
				var varlayersource = layer.getSource().getSource();
				features = $.merge(features, varlayersource.getFeatures());
			}
			if (layer.get('idbase') == 'icone' || layer.get('idbase') == 'texte2') {
				var varlayersource = layer.getSource();
				features = $.merge(features, varlayersource.getFeatures());
			}
		});
		kmllayer = kmlFormat.writeFeatures(features, {featureProjection: 'EPSG:3857'});
		xmlDoc = $.parseXML( kmllayer );

		xml = $( xmlDoc );

		xml.find("scale").each(function () {
			var $this = $(this);
			$this.prop({textContent: 1});
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
		var blob = new Blob([xmlString], {type: "text/plain;charset=utf-8"});
		saveAs(blob, "WOTclanwar.kml");
	};
	button.addEventListener('click', fonctionexportgoogle, false);
	var element = document.createElement('div');
	element.className = 'googlebutton ol-control';
	element.appendChild(button);
	ol.control.Control.call(this, {
		element: element
	});
};
// select save sur la carte
/*
        app.savelist = function() {
        var selectList = document.createElement('select');
		selectList.id = "choixSave";
		selectList.name = "choixSave";
		var element = document.createElement('div');
        element.className = 'selectlist ol-control';
        element.appendChild(selectList);
		console.log(selectList);
		ol.control.Control.call(this, {
          element: element
        });
        }; */
/*         app.fulls = function() {
		var button = document.createElement('button');
		button.innerHTML =  '↔';
        var fonctionfulls =function () 		{
		if (fullscreen == true) {
		$("#bottomscreen").removeClass('Fbottomscreen');
		$("#topscreen").removeClass('Ftopscreen');
		$("#bottomscreen").addClass('bottomscreen');
		$("#topscreen").addClass('topscreen');
		exitFullscreen();
		button.innerHTML =  '↔';


		} else {
		$("#bottomscreen").removeClass('bottomscreen');
		$("#topscreen").removeClass('topscreen');
		$("#bottomscreen").addClass('Fbottomscreen');
		$("#topscreen").addClass('Ftopscreen');
		launchIntoFullscreen(document.documentElement);
		button.innerHTML =  'x';

		};
		};
		button.addEventListener('click', fonctionfulls, false);
	    var element = document.createElement('div');
        element.className = 'ol-full-screen ol-control';
        element.appendChild(button);
        ol.control.Control.call(this, {
          element: element
        });
		 }; */
		ol.inherits(app.pdf, ol.control.Control);
		ol.inherits(app.google, ol.control.Control);

	    //ol.inherits(app.savelist, ol.control.Control);
		//ol.inherits(app.fulls, ol.control.Control);



 // fin controles carte personnalisé




function chargerlaprov(prov) {
	var featuresas = varlayersource.getFeatures();
	var result3 = $.grep(featuresas, function(e){ return e.getProperties().province_id == prov});
	var geometry = result3[0].getGeometry();
	var point = getCenterOf(geometry);
	map.getView().setCenter(point);
	//map.getView().setZoom(8);

	var features = selectInteraction.getFeatures();
	features.clear();
	features.push(result3[0]);
	var pixel = getCenterOf(result3[0].getGeometry());
	displayFeatureInfo(result3[0]);
};

function chargerlalistesave() {
	$.each(listesaveresult, function(save) {
		$('#choixSave')
			.append($("<option></option>")
			.attr("value",listesaveresult[save].fichier)
			.text(listesaveresult[save].date));
	});
};

function chargerlasave(save) {
	setTimeout(function() {
		preloader.show();
		layers = map.getLayers().getArray() ;
		vector = getLayerwarg(layers, "wargaming");
		map.removeLayer(vector);
		if (save == dernieresave) {
			$('#ModeAffichage option[value="Batailles"]').removeAttr('disabled');
			$('#ModeAffichage option[value="Batailles2"]').removeAttr('disabled');
		} else {
			if ($('#ModeAffichage').val() == "Batailles" || $('#ModeAffichage').val() == "Batailles2") {
				$('#ModeAffichage').val("Clan");
			};
			$('#ModeAffichage option[value="Batailles"]').attr("disabled","disabled");
			$('#ModeAffichage option[value="Batailles2"]').attr("disabled","disabled");
		}
		if (save) {
			listeclan = affichageclanproperty("LOADSAVE", save, false);
			listeinfos = JSON.parse(listeclan);

			if (listeinfos['season_id']) {
				var lamapsave = 'tools/map/' +listeinfos['season_id'] + '.geojson';
			} else {
				var lamapsave = 'tools/map/europemap.geojson';
			};
			cartecomplete = new ol.layer.Image({
				idbase : "wargaming",
				source: new ol.source.ImageVector({
					source: new ol.source.Vector({
						opacity : 0.2,
						url: lamapsave,
						format: new ol.format.GeoJSON()
					}),
					style: new ol.style.Style({
						fill: new ol.style.Fill({
							color: [255, 255, 255, 0.5],
						}),
						stroke: new ol.style.Stroke({
							color: '#319FD3',
							width: 1
						})
					})
				})
			});
			map.addLayer(cartecomplete);
			layers = map.getLayers().getArray() ;
			vector = getLayerwarg(layers, "wargaming");
			varlayersource = vector.getSource().getSource();
			varlayersource.once('change',function(e) {
				if (varlayersource.getState() === 'ready') {
					// carte chargée
					var pourtest = varlayersource.getFeatures();
					chargerlalog();
					Filterprovinceonmap();
					// rafraichir la vue
					// var oTable = $("#tabs-9tab").DataTable();
					// if (oTable.button( 1 ).active() == false) {oTable.button( 1 ).active(true);oTable.button( 1 ).enable(); oTable.button( 1 ).trigger();};
					// if (oTable.button( 2 ).active() == false) {oTable.button( 2 ).active(true);oTable.button( 2 ).enable(); oTable.button( 2 ).trigger();};
					// if (oTable.button( 3 ).active() == false) {oTable.button( 3 ).active(true);oTable.button( 3 ).enable(); oTable.button( 3 ).trigger();};
					// if (oTable.button( 4 ).active() == false) {oTable.button( 4 ).active(true);oTable.button( 4 ).enable(); oTable.button( 4 ).trigger();};
					// if (oTable.button( 5 ).active() == false) {oTable.button( 5 ).active(true);oTable.button( 5 ).enable(); oTable.button( 5 ).trigger();};
					var modAff =  $('#ModeAffichage').val();
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
		}
		preloader.hide();
	}, 100);
};

var map = new ol.Map({
	RendererType: 'canvas',
	controls: ol.control.defaults().extend([
		//  new ol.control.FullScreen({
		//    source: 'screen'
		//  }),
		//  new ol.control.OverviewMap(),
		new app.pdf(),
		new app.google(),
		new ol.control.FullScreen()
		//new app.fulls()
		 //new app.savelist()
	]),
	layers: [
 		new ol.layer.Tile({
			idbase : "TileWMS",
			title: 'Global Imagery',
			source: new ol.source.TileWMS({
				url: 'http://demo.opengeo.org/geoserver/wms',
				params: {LAYERS: 'ne:NE1_HR_LC_SR_W_DR', VERSION: '1.1.1'}
			})
		})
	],
	target: 'map',
	view: new ol.View({
		center: [0, 0],
		zoom: 3,
		minZoom: 3,
		maxZoom: 8
	})
});
// ostrava
//map.getView().setCenter(ol.proj.transform([18.262524,  	49.820923], 'EPSG:4326', 'EPSG:3857'));

$(document).ready(function(){
	chargerlalistesave();
	$( "#choixSave" ).selectmenu({
		change: function( event, data ) {
			chargerlasave(data.item.value);
		}
	});
});

var layers;
var vector;
var varlayersource;

chargerlasave(dernieresave);

function ModeAffichage(mode) {
	setTimeout(function() {
		preloader.show();
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
				//afficherlesicones();
				break;
			case 'Horaire':
				effacericone();
				effacerbatailles();
				affichagehoraires();
				//afficherlesicones();
				break;
			case 'Revenu' :
				effacericone();
				effacerbatailles();
				affichagerevenu();
				//afficherlesicones();
				break;
			case 'Infrastructure' :
				effacericone();
				effacerbatailles();
				affichagelevel();
				//afficherlesicones();
				break;
			case 'Batailles' :
				effacericone();
				effacerbatailles();
				affichageclancolor();
				//afficherlesicones();
				affichagebatailles();
				break;
			case 'Langage' :
				effacericone();
				effacerbatailles();
				affichagelangagecolor();
				//afficherlesicones();
				break;
			case 'Province' :
				effacericone();
				effacerbatailles();
				affichageProvince();
				break;
			case 'ClanELO6' :
				effacericone();
				effacerbatailles();
				affichageclanELO('elo_rating_6');
				//afficherlesicones();
				break;
			case 'ClanELO8' :
				effacericone();
				effacerbatailles();
				affichageclanELO('elo_rating_8');
				//afficherlesicones();
				break;
			case 'ClanELO10' :
				effacericone();
				effacerbatailles();
				affichageclanELO('elo_rating_10');
				//afficherlesicones();
				break;
			case 'ClanELOF' :
				effacericone();
				effacerbatailles();
				affichageclanELO('fine_level');
				//afficherlesicones();
				break;
			case 'Batailles2' :
				effacericone();
				effacerbatailles();
				affichageclanbattles();
				//afficherlesicones();
				//affichagebatailles();
				break;
			case 'accepts_join_requests' :
				effacericone();
				effacerbatailles();
				affichageaccepts_join_requests();
				//afficherlesicones();
				break;
			case 'battles' :
				effacericone();
				effacerbatailles();
				affichagestat('battles');
				//afficherlesicones();
				break;
			case 'battles_6_level' :
				effacericone();
				effacerbatailles();
				affichagestat('battles_6_level');
				//afficherlesicones();
				break;
			case 'battles_8_level' :
				effacericone();
				effacerbatailles();
				affichagestat('battles_8_level');
				//afficherlesicones();
				break;
			case 'battles_10_level' :
				effacericone();
				effacerbatailles();
				affichagestat('battles_10_level');
				//afficherlesicones();
				break;
			case 'battles_6_percent' :
				effacericone();
				effacerbatailles();
				affichagestat('battles_6_percent');
				//afficherlesicones();
				break;
			case 'battles_8_percent' :
				effacericone();
				effacerbatailles();
				affichagestat('battles_8_percent');
				//afficherlesicones();
				break;
			case 'battles_10_percent' :
				effacericone();
				effacerbatailles();
				affichagestat('battles_10_percent');
				//afficherlesicones();
				break;
			case 'members_count' :
				effacericone();
				effacerbatailles();
				affichagestat('members_count');
				//afficherlesicones();
				break;
			case 'wins' :
				effacericone();
				effacerbatailles();
				affichagestat('wins');
				//afficherlesicones();
				break;
			case 'winspercent' :
				effacericone();
				effacerbatailles();
				affichagestat('winspercent');
				//afficherlesicones();
				break;
			case 'losses' :
				effacericone();
				effacerbatailles();
				affichagestat('losses');
				//afficherlesicones();
				break;
			case 'lossespercent' :
				effacericone();
				effacerbatailles();
				affichagestat('lossespercent');
				//afficherlesicones();
				break;
			case 'wins_6_level' :
				effacericone();
				effacerbatailles();
				affichagestat('wins_6_level');
				//afficherlesicones();
				break;
			case 'wins_8_level' :
				effacericone();
				effacerbatailles();
				affichagestat('wins_8_level');
				//afficherlesicones();
				break;
			case 'wins_10_level' :
				effacericone();
				effacerbatailles();
				affichagestat('wins_10_level');
				//afficherlesicones();
				break;
			case 'provinces_count' :
				effacericone();
				effacerbatailles();
				affichagestat('provinces_count');
				//afficherlesicones();
				break;
			default:
				break;
		};
		preloader.hide();
	}, 100);
};

function affichageclancolor() {
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource().getSource();
	var layerfeatures = new ol.source.Vector();
	layerfeatures.addFeatures (varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures()
	var layer = new ol.layer.Image({
		idbase : "wargaming",
		source: new ol.source.ImageVector({
			source: layerfeatures,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: [255, 255, 255, 1],
				}),
				stroke: new ol.style.Stroke({
					color: '#319FD3',
					width: 1
				})
			})
		})
	});
	map.addLayer(layer);

	// recherche des infos
	var stylecache = new Array;
	// boucle sur les fronts //
	var clancolor;
	var color;
	$.each(listeinfos['provinces'], function(index, province) {
		var provinceatraiter = listeinfos['provinces'][index];
		var couleurhexa = '#000000';
		if (provinceatraiter['owner_clan_id'] !== null) {
			var leclantrouve = provinceatraiter['owner_clan_id'];
			if (annuaireclan[leclantrouve]) {
				couleurhexa = annuaireclan[leclantrouve].color;
				clancolor = hexToRgb1(couleurhexa) ;
				color = [clancolor[0], clancolor[1],clancolor[2], 0.8];
			} else {
				couleurhexa = '#000000';
				clancolor = hexToRgb1(couleurhexa) ;
				color = [clancolor[0], clancolor[1],clancolor[2], 1];
			}
		} else {
			couleurhexa = '#F8F8FF';
			clancolor = hexToRgb1(couleurhexa) ;
			color = [clancolor[0], clancolor[1],clancolor[2], 0.1];
		}
		if (!stylecache[couleurhexa]) {
			stylecache[couleurhexa]  = new ol.style.Style({
				fill: new ol.style.Fill({
					color: color
				}),
				stroke: new ol.style.Stroke({
					color: '#FFFFFF',
					width: 1
				})
			});
		};
		var result3 = $.grep(features, function(e){ return e.getProperties().province_id == provinceatraiter['province_id']});
		if (result3[0]) {
			result3[0].setStyle(stylecache[couleurhexa]);
		};
	});
};


function affichageclanELO(ELO) {
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource().getSource();
	var layerfeatures = new ol.source.Vector();
	layerfeatures.addFeatures (varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures()
	var layer = new ol.layer.Image({
		idbase : "wargaming",
		source: new ol.source.ImageVector({
			source: layerfeatures,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: [255, 255, 255, 1],
				}),
				stroke: new ol.style.Stroke({
					color: '#319FD3',
					width: 1
				})
			})
		})
	});
	map.addLayer(layer);

	var layer2 = new ol.layer.Vector({
		idbase : "texte2",
		source: new ol.source.Vector({})
	});
	map.addLayer(layer2);
	var nouvellesource = layer2.getSource();

	// recherche des infos
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
	$.each(listeinfos['provinces'], function(index, province) {
		if (listeinfos['provinces'][index]['owner_clan_id'] !== null && annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]) {
			var valELO6 = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['elo_rating_6'];
			var valELO8 = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['elo_rating_8'];
			var valELO10 = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['elo_rating_10'];
			var valELOF = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['fine_level'];
			if (valELO6 > maxELO6) {
				maxELO6 = valELO6;
			}
			if (valELO6 < minELO6) {
				minELO6 = valELO6;
			}
			if (valELO8 > maxELO8) {
				maxELO8 = valELO8;
			}
			if (valELO8 < minELO8) {
				minELO8 = valELO8;
			}
			if (valELO10 > maxELO10) {
				maxELO10 = valELO10;
			}
			if (valELO10 < minELO10) {
				minELO10 = valELO10;
			}
			if (valELOF > maxELOF) {
				maxELOF = valELOF;
			}
			if (valELOF < minELOF) {
				minELOF = valELOF;
			}
		}
	});
	var color1 = [255,255, 255];
	var color2 = [0, 125, 0];
	var nbgradient = 20;
	var colorlist = generateGradient(color1, color2 ,nbgradient);

	// boucle sur les fronts //
	var clancolor;
	var color;
	$.each(listeinfos['provinces'], function(index, province) {
		var provinceatraiter = listeinfos['provinces'][index];
		var couleurhexa = '#000000';
		if (provinceatraiter['owner_clan_id'] !== null) {
			var leclantrouve = provinceatraiter['owner_clan_id'];
			if (annuaireclan[leclantrouve]) {
				ponderation = 0;
				var elovalue = 0;
				switch(ELO) {
					case 'elo_rating_6':
						elovalue = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['elo_rating_6']
						ponderation = Math.ceil((elovalue - minELO6) * nbgradient / (maxELO6 - minELO6));
						break;
					case 'elo_rating_8' :
						elovalue = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['elo_rating_8']
						ponderation = Math.ceil((elovalue - minELO8) * nbgradient / (maxELO8 - minELO8));
						break;
					case 'elo_rating_10' :
						elovalue = annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]['elo_rating_10']
						ponderation = Math.ceil((elovalue - minELO10) * nbgradient / (maxELO10 - minELO10));
						break;
					case 'fine_level' :
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
				}
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
		}
		if (!stylecache[ponderation]) {
			stylecache[ponderation]  = new ol.style.Style({
				fill: new ol.style.Fill({
					color: [colorlist[ponderation][0], colorlist[ponderation][1],colorlist[ponderation][2], 1]
				}),
				stroke: new ol.style.Stroke({
					color: '#FFFFFF',
					width: 1
				})
			});
		}
		if (!styleELO[elovalue]) {
			styleELO[elovalue]  = new ol.style.Style({
				text: new ol.style.Text({
					text: elovalue.toString(),
					fill: new ol.style.Fill({
						color: '#000'
					}),
					stroke: new ol.style.Stroke({
						color: '#fff'
					})
				})
			});
		}
		var result3 = $.grep(features, function(e){ return e.getProperties().province_id == provinceatraiter['province_id']});
		if ( result3[0] ) {
			result3[0].setStyle(stylecache[ponderation]);
			var geometry = result3[0].getGeometry();
			var point = getCenterOf(geometry);
			newFeature = new ol.Feature({
				ceciestunicone:true,
				geometry: new ol.geom.Point(point)
			});
			newFeature.setStyle(styleELO[elovalue] );
			nouvellesource.addFeature(newFeature);
		};
	});
};

function affichageaccepts_join_requests() {
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource().getSource();
	var layerfeatures = new ol.source.Vector();
	layerfeatures.addFeatures (varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures();
	var layer = new ol.layer.Image({
		idbase : "wargaming",
		source: new ol.source.ImageVector({
			source: layerfeatures,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: [255, 255, 255, 1],
				}),
				stroke: new ol.style.Stroke({
					color: '#319FD3',
					width: 1
				})
			})
		})
	});
	map.addLayer(layer);
	var layer2 = new ol.layer.Vector({
		idbase : "texte2",
		source: new ol.source.Vector({})
	});
	map.addLayer(layer2);
	var nouvellesource = layer2.getSource();

	// recherche des infos
	var styleclan = new Array;
	styleaccept  = new ol.style.Style({
		fill: new ol.style.Fill({
			color: [0, 125, 0, 1]
		}),
		stroke: new ol.style.Stroke({
			color: '#FFFFFF',
			width: 1
		})
	});
	styleacceptno = new ol.style.Style({
		fill: new ol.style.Fill({
			color: [0, 0, 0, 1]
		}),
		stroke: new ol.style.Stroke({
			color: '#FFFFFF',
			width: 1
		})
	});
	var accepts_join_requests;
	var nomclan;
	var emblem;
	$.each(listeinfos['provinces'], function(index, province) {
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
		if (!styleclan[tag]) {
			styleclan[tag]  = new ol.style.Style({
				text: new ol.style.Text({
					text: tag.toString(),
					fill: new ol.style.Fill({
						color: '#fff'
					})
				})
			});
		};

		var result3 = $.grep(features, function(e){ return e.getProperties().province_id == provinceatraiter['province_id']});
		if ( result3[0]) {
			if (accepts_join_requests == true) {
				result3[0].setStyle(styleaccept);
			} else if (accepts_join_requests == false || accepts_join_requests == null) {
				result3[0].setStyle(styleacceptno);
			}

			if (accepts_join_requests != null) {
				var geometry = result3[0].getGeometry();
				var point = getCenterOf(geometry);
				newFeature = new ol.Feature({
					ceciestunicone:true,
					geometry: new ol.geom.Point(point)
				});
				newFeature.setStyle(styleclan[tag] );
				nouvellesource.addFeature(newFeature);
			}
		}
	});
};

function affichagestat(mode) {
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource().getSource();
	var layerfeatures = new 	ol.source.Vector();
	layerfeatures.addFeatures (varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures()

	var layer = new ol.layer.Image({
		idbase : "wargaming",
		source: new ol.source.ImageVector({
			source: layerfeatures,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: [255, 255, 255, 1],
				}),
				stroke: new ol.style.Stroke({
					color: '#319FD3',
					width: 1
				})
			})
		})
	});
	map.addLayer(layer);

	var layer2 = new ol.layer.Vector({
		idbase : "texte2",
		source: new ol.source.Vector({})
	});
	map.addLayer(layer2);
	var nouvellesource = layer2.getSource();

	// recherche des infos
	var stylecache = new Array;
	var styleValue = new Array;
	var maxvalue = 0;
	var minvalue = 999999999;

	$.each(listeinfos['provinces'], function(index, province) {
		if (listeinfos['provinces'][index]['owner_clan_id'] !== null && annuaireclan[listeinfos['provinces'][index]['owner_clan_id']]) {
			switch(mode) {
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
			}
			if (value < minvalue) {
				minvalue = value;
			}
		};
	});
	var color1 = [255,255, 255];
	var color2 = [0, 125, 0];
	var nbgradient = 20;
	var colorlist = generateGradient(color1, color2 ,nbgradient);

	// boucle sur les fronts //
	var clancolor;
	var color;
	$.each(listeinfos['provinces'], function(index, province) {
		var provinceatraiter = listeinfos['provinces'][index];
		var couleurhexa = '#000000';
		if (provinceatraiter['owner_clan_id'] !== null) {
			var leclantrouve = provinceatraiter['owner_clan_id'];
			if (annuaireclan[leclantrouve]) {
				ponderation = 0;
				var value = 0;
				var percent = 100;
				switch(mode) {
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
				}
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
		}
		if (!stylecache[ponderation]) {
			stylecache[ponderation]  = new ol.style.Style({
				fill: new ol.style.Fill({
					color: [colorlist[ponderation][0], colorlist[ponderation][1],colorlist[ponderation][2], 1]
				}),
				stroke: new ol.style.Stroke({
					color: '#FFFFFF',
					width: 1
				})
			});
		}
		if (!styleValue[value]) {
			styleValue[value]  = new ol.style.Style({
				text: new ol.style.Text({
					text: value.toString(),
					fill: new ol.style.Fill({
						color: '#000'
					})
				})
			});
		};
		var result3 = $.grep(features, function(e){ return e.getProperties().province_id == provinceatraiter['province_id']});
		if (result3[0]) {
			result3[0].setStyle(stylecache[ponderation]);
			var geometry = result3[0].getGeometry();
			var point = getCenterOf(geometry);
			newFeature = new ol.Feature({
				ceciestunicone:true,
				geometry: new ol.geom.Point(point)
			});
			newFeature.setStyle(styleValue[value] );
			nouvellesource.addFeature(newFeature);
		}
	});
};

function affichagelangagecolor() {
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource().getSource();
	var layerfeatures = new ol.source.Vector();
	layerfeatures.addFeatures (varlayersource.getFeatures());

	map.removeLayer(vector);
	var features = layerfeatures.getFeatures()

	var layer = new ol.layer.Image({
		idbase : "wargaming",
		source: new ol.source.ImageVector({
			source: layerfeatures,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: [255, 255, 255, 1],
				}),
				stroke: new ol.style.Stroke({
					color: '#319FD3',
					width: 1
				})
			})
		})
	});
	map.addLayer(layer);

	var layer2 = new ol.layer.Vector({
		idbase : "icone",
		source: new ol.source.Vector({})
	});
	map.addLayer(layer2);
	var nouvellesource = layer2.getSource();

	// recherche des infos
	var stylecache = [];
	var stylecache2 = [];
	// boucle sur les fronts //
	var numItems = $("#tabs-9tab").DataTable().column(13).data().unique().length;
	var languages = ["afrikaans", "arabic", "basque", "belarusian", "bulgarian", "catalan", "croatian", "czech", "danish", "dutch", "english", "esperanto", "estonian", "faroese", "finnish", "french", "galician", "german", "greek", "hebrew", "hindi", "hungarian", "icelandic", "indonesian", "irish", "italian", "japanese", "khmer", "korean", "latvian", "lithuanian", "luxembourgish", "malay", "mongolian", "norwegian", "persian", "polish", "portuguese", "romanian", "russian", "serbian", "slovak", "slovene", "spanish", "swedish", "turkish", "ukrainian", "vietnamese"];

	var color1 = [255,0, 0];
	var color2 = [0, 0, 255];
	var colorlist = generateGradient(color1, color2 ,numItems);
	var lastaffected = 0;
	var rows = oTable.$('tr', {"filter":"applied"});
	$.each(rows, function(row) {
		var datarowprov = rows[row].cells[0].textContent;
		var result3 = $.grep(Object.keys(listeinfos.provinces), function(e){return listeinfos.provinces[e].province_name == datarowprov});
		var datarowprovid = result3[0];
		var result3 = $.grep(features, function(e){return e.getProperties().province_id == datarowprovid});

		if (!stylecache[rows[row].cells[13].textContent]) {
			var newcolor = hexToRgb1(getRandomColor()),
				imgsrc = flagdir + 'europeanunion.png',
				langindex = languages.indexOf(rows[row].cells[13].textContent);
			if (langindex != -1) {
				imgsrc = flagdir +  rows[row].cells[13].textContent + '.png'
			}

			stylecache[rows[row].cells[13].textContent]  = new ol.style.Style({
				fill: new ol.style.Fill({
					color: [newcolor[0], newcolor[1],newcolor[2],  0.8]
				}),
				stroke: new ol.style.Stroke({
					color: '#FFFFFF',
					width: 1
				})
			});
			lastaffected++;

			stylecache2[rows[row].cells[13].textContent]  = new ol.style.Style({
				image: new ol.style.Icon (({
					scale: getScaleZoom(),
					src: imgsrc,
					opacity: 0.8
				}))
			});
		}
		if (result3[0]) {
			result3[0].setStyle(stylecache[rows[row].cells[13].textContent]);
			var geometry = result3[0].getGeometry();
			var point = getCenterOf(geometry);
			newFeature = new ol.Feature({
				ceciestunicone:true,
				geometry: new ol.geom.Point(point)
			});
			newFeature.setStyle(stylecache2[rows[row].cells[13].textContent] );
			nouvellesource.addFeature(newFeature);
		}
	});
	map.render();
};

function affichagebatailles() {
	var featurestableau = new Array();
	// creation du style
	/* 	var style = new OpenLayers.Style({
			pointRadius: "${radius}",
			fillColor: "#FF3300",
			fillOpacity: 0.8,
			strokeColor: "#66FF00",
			strokeWidth: "${width}",
			strokeOpacity: 0.8,
			label: "${getLabel}",
			fontSize: "12px",
			fontFamily: "Courier New, monospace",
			fontWeight: "bold",
			labelOutlineColor: "white",
			labelOutlineWidth: 2.5
		}, {
			context: {
				width: function(feature) {
					return (feature.cluster) ? 2 : 1;
				},
				radius: function(feature) {
					var pix = 2;
					if(feature.cluster) {
						pix = Math.min(feature.attributes.count, 7) + 2;
					}
					return pix;
				},
				getLabel: function(feature) {
					if (feature.cluster) {
						if (feature.cluster.length > 1) {
							return feature.cluster.length;
						}
					}
					return '';
				}
			}
		}); */
	// parcours de la datatable et creation d'un feature
	var rows = oTable.$('tr', {"filter":"applied"});

	$.each(rows, function(row) {
		var datarowprov = rows[row].cells[0].textContent;
		var result3 = $.grep(Object.keys(listeinfos.provinces), function(e){return listeinfos.provinces[e].province_name == datarowprov});
		var datarowprovid = result3[0];
		var listeprovinceatraiter = cartecomplete.getSource().getSource().getFeatures();
		if (rows[row].cells[10].textContent > 0 || rows[row].cells[11].textContent > 0 || rows[row].cells[9].textContent > 0) {
			var result3 = $.grep(listeprovinceatraiter, function(e){return e.getProperties().province_id == datarowprovid});
			var geometry = result3[0].getGeometry();
			var center = getCenterOf(geometry);
			var listevaleur = parseInt(rows[row].cells[10].textContent) + parseInt(rows[row].cells[11].textContent);
			for (pas = 0; pas < listevaleur; pas++) {
				var newFeature = new ol.Feature({
					geometry: new ol.geom.Point(center)
				});
				featurestableau.push(newFeature);
			}
		} /* else {
			var newFeature = new ol.Feature({
				geometry: new ol.geom.Point(center)
			});
			featurestableau.push(newFeature);
			console.log('push f2');
		};
		*/
	});
	// creation d'un layer
	var source = new ol.source.Vector({
		features: featurestableau
	});
	var clusterSource = new ol.source.Cluster({
		distance: 20,
		source: source
	});

	var styleCache = {};
	var clusters = new ol.layer.Vector({
		idbase : "batailles",
		source: clusterSource,
		style: function(feature, resolution) {
			var size = feature.get('features').length;
			var style = styleCache[size];
			if (!style) {
				style = [new ol.style.Style({
					image: new ol.style.Circle({
						radius: 10,
						stroke: new ol.style.Stroke({
							color: '#fff'
						}),
						fill: new ol.style.Fill({
							color: '#3399CC'
						})
					}),
					text: new ol.style.Text({
						text: size.toString(),
						fill: new ol.style.Fill({
							color: '#fff'
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
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource().getSource();
	var layerfeatures = new 	ol.source.Vector();
	layerfeatures.addFeatures (varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures()
	var layer = new ol.layer.Image({
		idbase : "wargaming",
		source: new ol.source.ImageVector({
			source: layerfeatures,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: [255, 255, 255, 0.5],
				}),
				stroke: new ol.style.Stroke({
					color: '#319FD3',
					width: 1
				})
			})
		})
	});
	map.addLayer(layer);

	// recherche des infos
	var stylecache = new Array;
	// boucle sur les fronts //
	var numItems = $("#tabs-9tab").DataTable().column(2).data().unique().length;
	var color1 = [255,0, 0];
	var color2 = [0, 0, 255];
	var colorlist = generateGradient(color1, color2 ,numItems);
	var lastaffected = 0;
	$.each(listeinfos['provinces'], function(index, province) {
		var provinceatraiter = listeinfos['provinces'][index];
		var lefronttrouve = provinceatraiter['front_name'];
		if (!stylecache[lefronttrouve]) {
			stylecache[lefronttrouve]  = new ol.style.Style({
				fill: new ol.style.Fill({
					color: [colorlist[lastaffected][0], colorlist[lastaffected][1],colorlist[lastaffected][2],  0.8]
				}),
				stroke: new ol.style.Stroke({
					color: '#FFFFFF',
					width: 1
				})
			});
			lastaffected = lastaffected + 1;
		}
		var result3 = $.grep(features, function(e){ return e.getProperties().province_id == provinceatraiter['province_id']});
		if (result3[0]) {
			result3[0].setStyle(stylecache[lefronttrouve]);
		}
	});
};

function affichageclanbattles() {
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource().getSource();
	var layerfeatures = new ol.source.Vector();
	layerfeatures.addFeatures (varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures();
	var layer = new ol.layer.Image({
		idbase : "wargaming",
		source: new ol.source.ImageVector({
			source: layerfeatures,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: [255, 255, 255, 1],
				}),
				stroke: new ol.style.Stroke({
					color: '#319FD3',
					width: 1
				})
			})
		})
	});
	map.addLayer(layer);
	var layer2 = new ol.layer.Vector({
		idbase : "texte2",
		source: new ol.source.Vector({})
	});
	map.addLayer(layer2);
	var nouvellesource = layer2.getSource();

	// recherche des infos
	var stylecache = new Array;
	var styleNumber = new Array;
	var scale = getScaleZoom();
	var rows = oTable.$('tr', {"filter":"applied"});
	$.each(rows, function(row) {
		var datarowprov = rows[row].cells[0].textContent;
		var result3 = $.grep(Object.keys(listeinfos.provinces), function(e){return listeinfos.provinces[e].province_name == datarowprov});
		var datarowprovid = result3[0];
		var listeprovinceatraiter = cartecomplete.getSource().getSource().getFeatures();
		var color1 ;
		var color2= new Array;
		var nbtotal;
		//gradient vert
		var colorA = [255,255, 255];
		var colorB = [0, 125, 0];
		var nbgradient = 11;
		var colorlistvert = generateGradient(colorA, colorB ,nbgradient);
		//gradient rouge
		var colorA = [255,255, 255];
		var colorB = [255,0, 0];
		var nbgradient = 11;
		var colorlistrouge = generateGradient(colorA, colorB ,nbgradient);

		// si modes bataille est activé Couleur jaune intensité rouge (
		if (rows[row].cells[6].textContent == "STARTED") {
			color1 = [255,255, 0];
			color2 = colorlistrouge;
			nbtotal = parseInt(rows[row].cells[9].textContent) * 2;
		} else if (parseInt(rows[row].cells[10].textContent) > 0 || parseInt(rows[row].cells[11].textContent) > 0 || parseInt(rows[row].cells[9].textContent) > 0) {
			// si modes batailles est inactif Couleur gris pale intensité vert
			color1 = [224,224, 224];
			color2 = colorlistvert;
			nbtotal = parseInt(rows[row].cells[10].textContent) + parseInt(rows[row].cells[11].textContent);
		} else {
			color1 = [255,255, 255];
			color2 = colorlistvert;
			nbtotal = 0;
		}

		//gestion intensité
		var intensity;
		switch(true) {
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
		}
		//if (rows[row].cells[10].textContent > 0 || rows[row].cells[11].textContent > 0 || rows[row].cells[9].textContent > 0) {
		var result3 = $.grep(features, function(e){return e.getProperties().province_id == datarowprovid});
		var newstyle = color2[intensity][0].toString() + color2[intensity][1].toString() + color2[intensity][2].toString() + color1[0].toString() + color1[1].toString()+ color1[2].toString();
		if (!stylecache[newstyle] && nbtotal > 0) {
			stylecache[newstyle]  = new ol.style.Style({
				fill: new ol.style.Fill({
					color: [color2[intensity][0], color2[intensity][1],color2[intensity][2],  1]
				}),
				stroke: new ol.style.Stroke({
					color: '#FFFFFF',
					width: 1
				})
			});
		}
		if (!stylecache[newstyle] && nbtotal == 0) {
			stylecache[newstyle]  = new ol.style.Style({
				fill: new ol.style.Fill({
					color: [0, 0, 0,  0.2]
				}),
				stroke: new ol.style.Stroke({
					color: '#FFFFFF',
					width: 0.3
				})
			});
		}
		if (!styleNumber[newstyle] && nbtotal > 0) {
			styleNumber[newstyle]  = new ol.style.Style({
				image: new ol.style.Circle({
					radius: 10,
					snapToPixel : false,
					stroke: new ol.style.Stroke({
						color: '#fff'
					}),
					fill: new ol.style.Fill({
						color: [color1[0], color1[1],color1[2],  1]
					})
				}),
				text: new ol.style.Text({
					text: nbtotal.toString(),
					fill: new ol.style.Fill({
						color: '#000'
					}),
					stroke: new ol.style.Stroke({
						color: '#fff'
					})
				})
			});
		}
		if (!styleNumber[newstyle] && nbtotal == 0) {
			styleNumber[newstyle]  = new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: '#FFFFFF',
					width: 1
				})
			});
		}
		if (result3[0]) {
			if (nbtotal > 0) {
				var geometry = result3[0].getGeometry();
				var center = getCenterOf(geometry);
				var newFeature = new ol.Feature({
					ceciestunicone:true,
					geometry: new ol.geom.Point(center)
				});
				newFeature.setStyle(styleNumber[newstyle]);
				nouvellesource.addFeature(newFeature);
				newFeature.getStyle().getImage().setScale(scale);
			}
			result3[0].setStyle(stylecache[newstyle]);
		}
	//};
	});
};

function affichageProvince() {
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource().getSource();
	var layerfeatures = new 	ol.source.Vector();
	layerfeatures.addFeatures (varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures();
	var styleText = new Array;

	var layer = new ol.layer.Image({
		idbase : "wargaming",
		source: new ol.source.ImageVector({
			source: layerfeatures,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: [255, 255, 255, 0],
				}),
				stroke: new ol.style.Stroke({
					color: '#319FD3',
					width: 1
				})
			})
		})
	});
	map.addLayer(layer);

	//map.getView().setZoom(6);
	var layer2 = new ol.layer.Vector({
		idbase : "texte2",
		source: new ol.source.Vector({})
	});
	map.addLayer(layer2);
	var nouvellesource = layer2.getSource();
	var stylecache = new ol.style.Style({
		fill: new ol.style.Fill({
			color: [255, 255, 255, 0.9],
		}),
		stroke: new ol.style.Stroke({
			color: [0, 0, 0, 0.3],
			width: 1
		})
	});
	$.each(listeinfos['provinces'], function(index, province) {
		var provinceatraiter = listeinfos['provinces'][index];
		var province_name = provinceatraiter['province_name'];
		if (!styleText[province_name]) {
			styleText[province_name]  = new ol.style.Style({
				text: new ol.style.Text({
					text: province_name,
					fill: new ol.style.Fill({
						color: '#000'
					}),
					stroke: new ol.style.Stroke({
						color: '#fff'
					})
				})
			});
		}
		var result3 = $.grep(features, function(e){ return e.getProperties().province_id == provinceatraiter['province_id']});
		if (result3[0]) {
			result3[0].setStyle(stylecache);
			var geometry = result3[0].getGeometry();
			var point = getCenterOf(geometry);
			newFeature = new ol.Feature({
				ceciestunicone:true,
				geometry: new ol.geom.Point(point)
			});
			newFeature.setStyle(styleText[province_name]);
			nouvellesource.addFeature(newFeature);
		}
	});
};

function affichagehoraires() {
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource().getSource();
	var layerfeatures = new 	ol.source.Vector();
	layerfeatures.addFeatures (varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures()
	var layer = new ol.layer.Image({
		idbase : "wargaming",
		source: new ol.source.ImageVector({
			source: layerfeatures,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: [255, 255, 255, 0.5],
				}),
				stroke: new ol.style.Stroke({
					color: '#319FD3',
					width: 1
				})
			})
		})
	});
	map.addLayer(layer);

	// recherche des infos
	var stylecache = new Array;
	// boucle sur les fronts //
	var numItems = $("#tabs-9tab").DataTable().column(3).data().unique().length;

	var color1 = [255,0, 0];
	var color2 = [0, 0, 255];
	var colorlist = generateGradient(color1, color2 ,numItems);
	var lastaffected = 0;
	$.each(listeinfos['provinces'], function(index, province) {
		var provinceatraiter = listeinfos['provinces'][index];
		var lefronttrouve = provinceatraiter['prime_time'];

		if (!stylecache[lefronttrouve]) {
			stylecache[lefronttrouve]  = new ol.style.Style({
				fill: new ol.style.Fill({
					color: [colorlist[lastaffected][0], colorlist[lastaffected][1],colorlist[lastaffected][2],  0.8]
				}),
				stroke: new ol.style.Stroke({
					color: '#FFFFFF',
					width: 1
				})
			});
			lastaffected++;
		}
		var result3 = $.grep(features, function(e){ return e.getProperties().province_id == provinceatraiter['province_id']});
		if (result3[0]) {
			result3[0].setStyle(stylecache[lefronttrouve]);
		}
	});
};

function affichagerevenu() {
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource().getSource();
	var layerfeatures = new 	ol.source.Vector();
	layerfeatures.addFeatures (varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures();

	var layer = new ol.layer.Image({
		idbase : "wargaming",
		source: new ol.source.ImageVector({
			source: layerfeatures,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: [255, 255, 255, 0.5],
				}),
				stroke: new ol.style.Stroke({
					color: '#319FD3',
					width: 1
				})
			})
		})
	});
	map.addLayer(layer);

	var layer2 = new ol.layer.Vector({
		idbase : "texte2",
		source: new ol.source.Vector({})
	});
	map.addLayer(layer2);
	var nouvellesource = layer2.getSource();

	// recherche des infos
	var maxrevenu = 0;
	$.each(listeinfos['provinces'], function(index, province) {
		var revenu = listeinfos['provinces'][index]['daily_revenue'];
		if (revenu > maxrevenu) {
			maxrevenu = revenu;
		}
	});
	var color1 = [255,255, 255];
	var color2 = [0, 125, 0];
	var nbgradient = 40;
	var colorlist = generateGradient(color1, color2 ,nbgradient);
	var stylecache = new Array;
	var styleRevenu = new Array;

	// boucle sur les fronts //
	$.each(listeinfos['provinces'], function(index, province) {
		var provinceatraiter = listeinfos['provinces'][index];
		var lefronttrouve = provinceatraiter['daily_revenue'];
		var ponderation = Math.ceil(provinceatraiter['daily_revenue'] * nbgradient / maxrevenu);
		var revenuprov = provinceatraiter['daily_revenue'].toString();
		if (ponderation > 39) {
			ponderation = 39;
		}

		if (!stylecache[ponderation]) {
			stylecache[ponderation]  = new ol.style.Style({
				fill: new ol.style.Fill({
					color: [colorlist[ponderation][0], colorlist[ponderation][1],colorlist[ponderation][2],  0.8]
				}),
				stroke: new ol.style.Stroke({
					color: '#FFFFFF',
					width: 1
				})
			});
		}

		if (!styleRevenu[revenuprov]) {
			styleRevenu[revenuprov]  = new ol.style.Style({
				text: new ol.style.Text({
					text: revenuprov,
					fill: new ol.style.Fill({
						color: '#000'
					}),
					stroke: new ol.style.Stroke({
						color: '#fff'
					})
				})
			});
		}
		var result3 = $.grep(features, function(e){ return e.getProperties().province_id == provinceatraiter['province_id']});
		if (result3[0]) {
			result3[0].setStyle(stylecache[ponderation]);

			var geometry = result3[0].getGeometry();
			var point = getCenterOf(geometry);
			newFeature = new ol.Feature({
				ceciestunicone:true,
				geometry: new ol.geom.Point(point)
			});

			newFeature.setStyle(styleRevenu[revenuprov]);
			nouvellesource.addFeature(newFeature);
		}
	});
};

function affichagelevel() {
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource().getSource();
	var layerfeatures = new ol.source.Vector();
	layerfeatures.addFeatures (varlayersource.getFeatures());
	map.removeLayer(vector);
	var features = layerfeatures.getFeatures();
	var layer = new ol.layer.Image({
		idbase : "wargaming",
		source: new ol.source.ImageVector({
			source: layerfeatures,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: [255, 255, 255, 0.5],
				}),
				stroke: new ol.style.Stroke({
					color: '#319FD3',
					width: 1
				})
			})
		})
	});
	map.addLayer(layer);

	// recherche des infos
	var maxrevenu = 0;
	$.each(listeinfos['provinces'], function(index, province) {
		var revenu = listeinfos['provinces'][index]['revenue_level'];
		if (revenu > maxrevenu) {
			maxrevenu = revenu;
		};
	});
	if (maxrevenu == 0) {
		maxrevenu = 1;
	}
	var color1 = [255,255, 255];
	var color2 = [0, 125, 0];
	var nbgradient = 40;
	var colorlist = generateGradient(color1, color2 ,nbgradient);
	var stylecache = new Array;
	// boucle sur les fronts //
	$.each(listeinfos['provinces'], function(index, province) {
		var provinceatraiter = listeinfos['provinces'][index];
		var lefronttrouve = provinceatraiter['revenue_level'];
		var ponderation = Math.ceil(provinceatraiter['revenue_level'] * nbgradient / maxrevenu);
		if (ponderation > 39) {
			ponderation = 39;
		}
		if (!stylecache[ponderation]) {
			stylecache[ponderation]  = new ol.style.Style({
				text: new ol.style.Text({
					scale : 1.2,
					text: provinceatraiter['revenue_level'].toString(),
					fill: new ol.style.Fill({
						color: '#000'
					}),
					stroke: new ol.style.Stroke({
						color: '#fff'
					})
				}),
				fill: new ol.style.Fill({
					color: [colorlist[ponderation][0], colorlist[ponderation][1],colorlist[ponderation][2],  0.8]
				}),
				stroke: new ol.style.Stroke({
					color: '#FFFFFF',
					width: 1
				})
			});
		}
		var result3 = $.grep(features, function(e){ return e.getProperties().province_id == provinceatraiter['province_id']});
		if (result3[0]) {
			console.log('ponderation', ponderation, stylecache[0]);
			result3[0].setStyle(stylecache[ponderation]);
		}
	});
};

function afficherlesicones() {
	var vector = getLayerwarg(layers, "wargaming");
	var varlayersource = vector.getSource().getSource();
	var layerfeatures = new ol.source.Vector();
	layerfeatures.addFeatures (varlayersource.getFeatures());
	var featuresas = layerfeatures.getFeatures()
	var layer = new ol.layer.Vector({
		idbase : "icone",
		source: new ol.source.Vector({})
	});
	map.addLayer(layer);
	var nouvellesource = layer.getSource();

	// recherche des infos
	var stylecache = new Array;
	// boucle sur les fronts //
	$.each(listeinfos['provinces'], function(index, province) {
		var provinceatraiter = listeinfos['provinces'][index];
		var couleurhexa = '#000000';
		var emblem = 'vide';
		if (provinceatraiter['owner_clan_id']) {
			var leclantrouve = provinceatraiter['owner_clan_id'];
			if (annuaireclan[leclantrouve] && leclantrouve !== null) {
				emblem = annuaireclan[leclantrouve].emblem_url;
			}
		}
		if (!stylecache[emblem]) {
			stylecache[emblem] = new ol.style.Style({
				image: new ol.style.Icon (({
					scale: getScaleZoom(),
					src: emblem,
					opacity: 0.8
				}))
			});
		}
		var result3 = $.grep(featuresas, function(e){ return e.getProperties().province_id == provinceatraiter['province_id']});
		if (result3[0] && emblem != 'vide') {
			var geometry = result3[0].getGeometry();
			var point = getCenterOf(geometry);
			newFeature = new ol.Feature({
				ceciestunicone:true,
				geometry: new ol.geom.Point(point)
			});
			newFeature.setStyle(stylecache[emblem]);
			nouvellesource.addFeature(newFeature);
			map.render();
		}
	});
};

function getCenterOf(geometry) {
	switch (geometry.getType()) {
		case 'MultiPolygon':
			var poly = geometry.getPolygons().reduce(function(left, right) {
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
	var vector = getLayerwarg(layers, "icone");
	map.removeLayer(vector);
	var vector = getLayerwarg(layers, "texte2");
	map.removeLayer(vector);
	var vector = getLayerwarg(layers, "texte");
	map.removeLayer(vector);
};

function effacerbatailles() {
	var vector = getLayerwarg(layers, "batailles");
	map.removeLayer(vector);
};

function affichageclanproperty(entree, clanid, async) {
	var resultatajax = "";
	$.ajax({
		type: 'POST',
		url: 'tools/fonctions_showmap.php',
		data: {
			typeselection: entree,
			clanid : clanid
		},
		success: function(result) {
			resultatajax = result;
		},
		dataType: 'text',
		async: async
	});
	return resultatajax;
};

function hexToRgb1(hex) {
	hex = hex.replace(/[^0-9A-F]/gi, '');
	var bigint = parseInt(hex, 16),
		r = (bigint >> 16) & 255,
		g = (bigint >> 8) & 255,
		b = bigint & 255,
		result = [r, g, b];
	return result;
};

function getRandomColor() {
	var letters = '0123456789ABCDEF'.split(''),
		color = '#',
		i = 0;
	for (i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
};

function getLayerwarg(vector, id) {
	var layer;
	vector.forEach(function(lyr) {
		if (id == lyr.get('idbase')) {
			layer = lyr;
		}
	});
	return layer;
};

function generateGradient(colorA, colorB, steps){
	var result = [], rInterval, gInterval, bInterval;

	//colorA = this.hexToRgb(colorA); // [r,g,b]
	//colorB = this.hexToRgb(colorB); // [r,g,b]
	steps -= 1; // Reduce the steps by one because we're including the first item manually

	// Calculate the intervals for each color
	rStep = ( Math.max(colorA[0], colorB[0]) - Math.min(colorA[0], colorB[0]) ) / steps;
	gStep = ( Math.max(colorA[1], colorB[1]) - Math.min(colorA[1], colorB[1]) ) / steps;
	bStep = ( Math.max(colorA[2], colorB[2]) - Math.min(colorA[2], colorB[2]) ) / steps;

	result.push( (colorA) );

	// Set the starting value as the first color value
	var rVal = colorA[0],
		gVal = colorA[1],
		bVal = colorA[2];

	// Loop over the steps-1 because we're includeing the last value manually to ensure it's accurate
	for (var i = 0; i < (steps-1); i++) {
		// If the first value is lower than the last - increment up otherwise increment down
		rVal = (colorA[0] < colorB[0]) ? rVal + Math.round(rStep) : rVal - Math.round(rStep);
		gVal = (colorA[1] < colorB[1]) ? gVal + Math.round(gStep) : gVal - Math.round(gStep);
		bVal = (colorA[2] < colorB[2]) ? bVal + Math.round(bStep) : bVal - Math.round(bStep);
		result.push([rVal, gVal, bVal] );
	};

	result.push(colorB );

	return result;
};

// click et double click sur la carte
var selectEuropa = new ol.style.Style({
	stroke: new ol.style.Stroke({
		color: '#ff0000',
		width: 6
	}),
	zIndex: 1
});
// mouse move sur la carte
var selectEuropa2 = new ol.style.Style({
	stroke: new ol.style.Stroke({
		color: '#ff0000',
		width: 2
	}),
	zIndex: 1
});

var selectInteraction = new ol.interaction.Select({
	layers: function (layer) {
		return layer.get('idbase') == 'wargaming';
	}
});

var mouseInteraction = new ol.interaction.Pointer({
	layers: function (layer) {
		return layer.get('idbase') == 'wargaming';
	}
});
map.getInteractions().extend([selectInteraction]);

var featureOverlay =  new ol.layer.Vector({
	map: map,
	source: new ol.source.Vector({
		useSpatialIndex: false // optional, might improve performance
	}),
	style: selectEuropa2,
	updateWhileAnimating: true, // optional, for instant visual feedback
	updateWhileInteracting: true // optional, for instant visual feedback
});

var featureOverlay2 =  new ol.layer.Vector({
	map: map,
	source: new ol.source.Vector({
		useSpatialIndex: false // optional, might improve performance
	}),
	style: selectEuropa2,
	updateWhileAnimating: true, // optional, for instant visual feedback
	updateWhileInteracting: true // optional, for instant visual feedback
});

var displaywargamingmap = function(pixel) {
	var features = [];
	var vector = getLayerwarg(layers, "wargaming");
	map.forEachFeatureAtPixel(pixel, function(feature, layer) {
		if (layer == vector) {
			var linkprov = feature.get('linkurl');
			window.open("https://eu.wargaming.net/globalmap/?utm_campaign=wot-portal&utm_medium=link&utm_source=main-menu" + linkprov );
		}
	});
};

function displayFeature(pixel, coord) {
	var features = [];
	var vector = getLayerwarg(layers, "wargaming");
	map.forEachFeatureAtPixel(pixel, function(feature, layer) {
		if (layer == vector) {
			displayFeatureInfo(feature);
		}
	});
};

function displayFeatureInfo(feature) {
	var linkprov = feature.get('linkurl');
	var idprov = feature.get('province_id');
	var listeinfoprov = listeinfos['provinces'][idprov];
	if (listeinfoprov['owner_clan_id'] === null) {
		if ($('#fullscreen').height() == $(document).height()) {
			content.innerHTML = '<p>zoom sur la prov : <a href="https://eu.wargaming.net/globalmap/?utm_campaign=wot-portal&utm_medium=link&utm_source=main-menu' +linkprov + '">'+listeinfoprov['province_name']+'</a>'
				+ '</br><p> clan : Aucun </code>';
			var pixel = getCenterOf(feature.getGeometry());
			overlay.setPosition(pixel);
		}
		// alimentation onglet province
		var contenuclan = '<div class="titreentoure" style="display: inline-block;"><div style="float: left; margin: 20px;">' +
			'<p> Tag      : / </p>' +
			'<p> Nom      : Aucun </p>' +
			'<p> Couleur  : <input type="color" value="white" /> </p>' +
			'<p> Emblem   :  </p>' +
			'</div><div style="float: left; margin: 20px;">' +
			'<p> Niveau VI    : / </p>' +
			'<p> Niveau VIII  : / </p>' +
			'<p> Niveau X     : / </p>' +
			'<p> Front Requis : / </p>' +
			'</div></div>'+
			'<div class="titreentoure" style="display: inline-block;"><div style="float: left; margin: 20px;">' +
			'<p> Province : ' + listeinfoprov['province_name'] + ' </p>' +
			'<p> Front    : ' + listeinfoprov['front_name'] + ' </p>' +
			'<p> Carte    : ' + listeinfoprov['arena_name'] + ' </p>' +
			'<p> Horaire  : ' + listeinfoprov['prime_time'] + ' </p>' +
			'<p> Serveur  : ' + listeinfoprov['server'] + ' </p>' +
			'</div><div style="float: left; margin: 20px;">' +
			'<p> Statut   : ' + listeinfoprov['status'] + ' </p>' +
			'<p> Revenu   : ' + listeinfoprov['daily_revenue'] + ' </p>' +
			'<p> Niveau   : ' + listeinfoprov['revenue_level'] + ' </p></div></div>';
			/*    '<div class="titreentoure" style="display: inline-block;"><div style="float: left; margin: 20px;">' +
				competitor + attackers + '</div></div>'; */
	} else {
		var listeinfoclan = annuaireclan[listeinfoprov['owner_clan_id']];
		clanselected = listeinfoprov.owner_clan_id;
		if ($('#fullscreen').height() == $( document ).height()) {
			content.innerHTML = '<p>zoom sur la prov : <a href="https://eu.wargaming.net/globalmap/?utm_campaign=wot-portal&utm_medium=link&utm_source=main-menu' +linkprov + '">'+listeinfoprov['province_name']+'</a>' +
				'</br><p> clan : Aucun </code>';
			var pixel = getCenterOf(feature.getGeometry());
			overlay.setPosition(pixel);
		}
		// alimentation onglet province
		var contenuclan = '<div class="titreentoure" style="display: inline-block;"><div style="float: left; margin: 20px;">' +
			'<p> Tag      : ' + listeinfoclan.tag + ' </p>' +
			'<p> Nom      : ' + listeinfoclan.name + ' </p>' +
			'<p> Couleur  : <input type="color" value="' + listeinfoclan.color + '" /> </p>' +
			'<p> Emblem   : <img src="' + listeinfoclan.emblem_url + '" /> </p>' +
			'</div><div style="float: left; margin: 20px;">' +
			'<p> Niveau VI    : ' + listeinfoclan.elo_rating_6 + ' </p>' +
			'<p> Niveau VIII  : ' + listeinfoclan.elo_rating_8 + ' </p>' +
			'<p> Niveau X     : ' + listeinfoclan.elo_rating_10 + ' </p>' +
			'<p> Front Requis : ' + listeinfoclan.fine_level + ' </p>' +
			'</div></div>'+
			'<div class="titreentoure" style="display: inline-block;"><div style="float: left; margin: 20px;">' +
			'<p> Province : ' + listeinfoprov['province_name'] + ' </p>' +
			'<p> Front    : ' + listeinfoprov['front_name'] + ' </p>' +
			'<p> Carte    : ' + listeinfoprov['arena_name'] + ' </p>' +
			'<p> Horaire  : ' + listeinfoprov['prime_time'] + ' </p>' +
			'<p> Serveur  : ' + listeinfoprov['server'] + ' </p>' +
			'</div><div style="float: left; margin: 20px;">' +
			'<p> Statut   : ' + listeinfoprov['status'] + ' </p>' +
			'<p> Revenu   : ' + listeinfoprov['daily_revenue'] + ' </p>' +
			'<p> Niveau   : ' + listeinfoprov['revenue_level'] + ' </p></div></div>';
			/*    '<div class="titreentoure" style="display: inline-block;"><div style="float: left; margin: 20px;">' +
				competitor + attackers + '</div></div>'; */
	}
	//$( "#tabs-1" ).html(contenuclan);
};
map.on('dblclick', function(evt) {
	var pixel = evt.pixel;
	displaywargamingmap(pixel);
});

var keyclik =   map.on('click', function(evt) {
	var pixel = evt.pixel;
	var provcoord = evt.coordinate;
	featureOverlay.getSource().clear();
	map.forEachFeatureAtPixel(pixel, function(feature, layer) {
		var newfeature = new ol.Feature();
		newfeature = feature.clone();
		newfeature.setStyle();
		featureOverlay.getSource().addFeature(newfeature);
		map.renderSync();
		displayFeature(pixel, provcoord);
	});
});


/* 	  		var movepointer =   map.on('pointermove', function(evt) {
        var pixel = evt.pixel;
		var provcoord = evt.coordinate;
		//console.log("pointer move : ", pixel);
				 featureOverlay2.getSource().clear();
        map.forEachFeatureAtPixel(pixel, function(feature, layer) {
		var newfeature = new ol.Feature();
		newfeature = feature.clone();
		newfeature.setStyle();
        featureOverlay2.getSource().addFeature(newfeature);


        });
      }); */

map.getView().on('propertychange', function(e) {
	switch (e.key) {
		case 'resolution':
			var layers = map.getLayers().getArray() ;
			var vector1 = getLayerwarg(layers, "icone");
			var vector2 = getLayerwarg(layers, "tournoi");
			var vector3 = getLayerwarg(layers, "encheres");
			var vector = [vector1, vector2, vector3];
			$.each(vector, function(index, vector) {
				if (vector) {
					var mesfeatures = vector.getSource().getFeatures();
					var filtrefeatures =$.grep(mesfeatures, function( n, i ) {
						return ( n.getProperties().ceciestunicone == true);
					});
					$.each(filtrefeatures, function(index, province) {
						var scale = getScaleZoom();
						province.getStyle().getImage().setScale(scale);
					});
				}
			});
			break;
	}
});

function getScaleZoom() {
	// taille icone en fonction zoom
	var scalezoom = new Array();
	scalezoom[3] = 0.2;
	scalezoom[4] = 0.4;
	scalezoom[5] = 0.8;
	scalezoom[6] = 1;
	scalezoom[7] = 2;
	scalezoom[8] = 3;
	var monzoom = map.getView().getZoom();
	var zoomopt = Math.round(monzoom);
	var scale  = scalezoom[zoomopt];
	return scale;
};

function getScaleZoom2() {
	// taille icone en fonction zoom
	var scalezoom = new Array();
	scalezoom[3] = 0.4;
	scalezoom[4] = 0.6;
	scalezoom[5] = 1;
	scalezoom[6] = 2;
	scalezoom[7] = 3;
	scalezoom[8] = 4;
	var monzoom = map.getView().getZoom();
	var zoomopt = Math.round(monzoom);
	var scale  = scalezoom[zoomopt];
	return scale;
};

function compte_a_rebours() {
	var compte_a_rebours = document.getElementById("compte_a_rebours");
	var date_actuelle = new Date();
	var datesave = new Date(datedernieresave * 1000);
	var total_secondesreact = (date_actuelle - datesave) / 1000;
	var total_secondes = (date_evenement - date_actuelle) / 1000;
	if (total_secondesreact > 300 && total_secondes > 300) {
		$('#reactualisation').prop('disabled', false);
	}
	//var prefixe = " Prochaine prévu dans ";
	if (total_secondes < 150) {
		//prefixe = " Reactualisation en cours"; // On modifie le préfixe si la différence est négatif
		//total_secondes = Math.abs(total_secondes); // On ne garde que la valeur absolue
	}
	if (total_secondes <= 0) {
		//window.location.reload(false );
		//datedernieresave = affichageclanproperty("DATELASTSAVE", " ", false);
	}
	if (total_secondes > 150) {
		var jours = Math.floor(total_secondes / (60 * 60 * 24));
		var heures = Math.floor((total_secondes - (jours * 60 * 60 * 24)) / (60 * 60));
		minutes = Math.floor((total_secondes - ((jours * 60 * 60 * 24 + heures * 60 * 60))) / 60);
		secondes = Math.floor(total_secondes - ((jours * 60 * 60 * 24 + heures * 60 * 60 + minutes * 60)));
		var et = "et";
		var mot_jour = "jours,";
		var mot_heure = "heures,";
		var mot_minute = "minutes,";
		var mot_seconde = "secondes";

		if (jours == 0) {
			jours = '';
			mot_jour = '';
		} else if (jours == 1) {
			mot_jour = "jour,";
		}
		if (heures == 0) {
			heures = '';
			mot_heure = '';
		} else if (heures == 1) {
			mot_heure = "heure,";
		}

		if (minutes == 0) {
			minutes = '';
			mot_minute = '';
		} else if (minutes == 1) {
			mot_minute = "minute,";
		}
		if (secondes == 0) {
			secondes = '';
			mot_seconde = '';
			et = '';
		} else if (secondes == 1) {
			mot_seconde = "seconde";
		}
		if (minutes == 0 && heures == 0 && jours == 0) {
			et = "";
		}
		//compte_a_rebours.innerHTML = prefixe + jours + ' ' + mot_jour + ' ' + heures + ' ' + mot_heure + ' ' + minutes + ' ' + mot_minute + ' ' + et + ' ' + //secondes + ' ' + mot_seconde;
		//compte_a_rebours.innerHTML = prefixe + minutes + mot_minute;
	} else {
		//compte_a_rebours.innerHTML = prefixe ;
	}
	var actualisation = setTimeout("compte_a_rebours();", 60000);
};
compte_a_rebours();

var oTable;
function showLogTab9(idlog) {
	$(document).ready(function() {
	oTable = $(idlog).DataTable({
		bJQueryUI: true,
		scrollY: "400px",
		scrollX: "500px",
		scroller: true,
		scrollCollapse: true,
		colReorder: true,
		deferRender: false,
		paginate: true,
		autoFill: true,
		processing: true,
		serverSide: false,
		bAutoWidth : true,
		sDom: '<"H">t<"F"p>',
		/* buttons: [
			{
				text: 'Effacer les filtres',
				action: function ( e, dt, node, config ) {
					$(this).css({'cursor' : 'wait'});
					yadcf.exResetAllFilters(dt);
					$(this).css({'cursor' : 'default'});
				dt.buttons().enable();
				}
			},
			{
				text: 'Mode Clan',
				action: function ( e, dt, node, config ) {
				effacericone();
				affichageclancolor();
				afficherlesicones();
				dt.buttons().enable();
				this.disable();
				dt.buttons().active( true );
				this.active( false );

				}
			},
			{
				text: 'Mode Front',
				action: function ( e, dt, node, config ) {
				effacericone();
				affichagefront();
				afficherlesicones();
				dt.buttons().enable();
				this.disable();
				dt.buttons().active( true );
				this.active( false );
				}
			},
			{
				text: 'Mode Revenu',
				action: function ( e, dt, node, config ) {
				effacericone();
				affichagerevenu();
				afficherlesicones();
				dt.buttons().enable();
				this.disable();
				dt.buttons().active( true );
				this.active( false );
				}
			},
			{
				text: 'Mode Infrastructure',
				action: function ( e, dt, node, config ) {
				effacericone();
				affichagelevel();
				afficherlesicones();
				dt.buttons().enable();
				this.disable();
				dt.buttons().active( true );
				this.active( false );
				}
			},
			{
				text: 'Mode Horaire',
				action: function ( e, dt, node, config ) {
				effacericone();
				affichagehoraires();
				afficherlesicones();
				dt.buttons().enable();
				this.disable();
				dt.buttons().active( true );
				this.active( false );
				}
			},
			{
				text: 'PLEIN ECRAN',
				action: function ( e, dt, node, config ) {
					$(".ol-full-screen-false").click();
				}
			}
		], */
		//sDom: '<"H"Br>t<"F"fip>',
		sDom: '<"H"r>t<"F"fip>',
		columns : [
			{ title: "Province" , data: "province_name" },
			{ title: "Owner", data: "owner_clan_id" },
			{ title: "Front" , data: "front_name" },
			{ title: "Prime time" , data: "prime_time" },
			{ title: "Landing type" , data: "landing_type" },
			{ title: "Server", data: "server" },
			{ title: "Status", data: "status" },
			{ title: "Revenue", data: "daily_revenue" },
			{ title: "Province Level", data: "revenue_level" },
			{ title: "Battles", data: "active_battles" },
			{ title: "Attackers", data: "attackers" },
			{ title: "Competitors", data: "competitors" },
			{ title: "Arena", data: "arena_name" },
			{ title: "Language", data: "langage" },
			{ title: "Pillage", data: "pillage" },
			{ title: "ClanELO6", data: "ClanELO6" },
			{ title: "ClanELO8", data: "ClanELO8" },
			{ title: "ClanELO10", data: "ClanELO10" },
			{ title: "accepts_join_requests", data: "accepts_join_requests" },
			{ title: "members_count", data: "members_count" },
			{ title: "battles", data: "battles" },
			{ title: "battles_6_level", data: "battles_6_level" },
			{ title: "battles_8_level", data: "battles_8_level" },
			{ title: "battles_10_level", data: "battles_10_level" },
			{ title: "wins", data: "wins" },
			{ title: "wins_6_level", data: "wins_6_level" },
			{ title: "wins_8_level", data: "wins_8_level" },
			{ title: "wins_10_level", data: "wins_10_level" },
			{ title: "losses", data: "losses" },
			{ title: "provinces_count", data: "provinces_count" }
		]
	});
	oTable.on( 'search.dt', function () {
		Filterprovinceonmap();
		// rafraichir la vue
		// if (oTable.button( 1 ).active() == false) {oTable.button( 1 ).active(true);oTable.button( 1 ).enable(); oTable.button( 1 ).trigger();};
		// if (oTable.button( 2 ).active() == false) {oTable.button( 2 ).active(true);oTable.button( 2 ).enable(); oTable.button( 2 ).trigger();};
		// if (oTable.button( 3 ).active() == false) {oTable.button( 3 ).active(true);oTable.button( 3 ).enable(); oTable.button( 3 ).trigger();};
		// if (oTable.button( 4 ).active() == false) {oTable.button( 4 ).active(true);oTable.button( 4 ).enable(); oTable.button( 4 ).trigger();};
		// if (oTable.button( 5 ).active() == false) {oTable.button( 5 ).active(true);oTable.button( 5 ).enable(); oTable.button( 5 ).trigger();};
		var modAff =  $('#ModeAffichage').val();
		ModeAffichage(modAff);
	});
	yadcf.init(oTable,
		[
			{
				column_number: 0,
				filter_type: "multi_select",
				select_type: 'select2',
				filter_default_label: "Province",
				filter_container_id: 'external_filter_container_0',
				filter_match_mode : 'exact',
				cumulative_filtering : false,
				select_type_options: {
					theme: "bootstrap",
					width: '200px',
					//placeholder: 'Province',
					language: "fr"
				}
			},
			{
				column_number : 1,
				filter_container_id: 'external_filter_container_1',
				filter_type: "multi_select",
				select_type: 'select2',
				filter_default_label: "Clans",
				filter_match_mode : 'exact',
				cumulative_filtering : false,
				select_type_options: {
					theme: "bootstrap",
					width: '200px'
				}
			},
			{
				column_number : 2,
				filter_container_id: 'external_filter_container_2',
				filter_type: "multi_select",
				select_type: 'select2',
				filter_default_label: "Front",
				cumulative_filtering : false,
				filter_match_mode : 'exact',
				select_type_options: {
					theme: "bootstrap",
					width: '200px'
				}
			},
			{
				column_number : 3,
				filter_container_id: 'external_filter_container_3',
				filter_type: "multi_select",
				select_type: 'select2',
				filter_default_label: "Prime Time",
				cumulative_filtering : false,
				filter_match_mode : 'exact',
				select_type_options: {
					theme: "bootstrap",
					width: '200px'
				}
			},
			{
				column_number : 4,
				filter_container_id: 'external_filter_container_4',
				// column_data_type: "html",
				filter_type: "multi_select",
				select_type: 'select2',
				filter_default_label: "Landing type",
				cumulative_filtering : false,
				filter_match_mode : 'exact',
				select_type_options: {
					theme: "bootstrap",
					width: '200px'
				}
			},
			{
				column_number : 6,
				filter_container_id: 'external_filter_container_6',
				filter_type: "multi_select",
				select_type: 'select2',
				filter_default_label: "Status",
				cumulative_filtering : false,
				filter_match_mode : 'exact',
				select_type_options: {
					theme: "bootstrap",
					width: '200px'
				}
			},
			{
				column_number : 7,
				filter_container_id: 'external_filter_container_7',
				filter_type: "range_number"
			},
			{
				column_number : 8,
				filter_container_id: 'external_filter_container_8',
				filter_type: "range_number"
			},
			{
				column_number : 9,
				filter_container_id: 'external_filter_container_9',
				filter_type: "range_number"
			},
			{
				column_number : 10,
				filter_container_id: 'external_filter_container_10',
				filter_type: "range_number"
			},
			{
				column_number : 11,
				filter_container_id: 'external_filter_container_11',
				filter_type: "range_number"
			},
			{
				column_number : 12,
				filter_container_id: 'external_filter_container_12',
				filter_type: "multi_select",
				select_type: 'select2',
				filter_default_label: "Arena",
				filter_match_mode : 'exact',
				cumulative_filtering : false,
				select_type_options: {
					theme: "bootstrap",
					width: '200px'
				}
			},
			{
				column_number : 13,
				filter_container_id: 'external_filter_container_13',
				filter_type: "multi_select",
				select_type: 'select2',
				filter_default_label: "Clan Language",
				filter_match_mode : 'exact',
				cumulative_filtering : false,
				select_type_options: {
					theme: "bootstrap",
					width: '200px'
				}
			},
			{
				column_number : 15,
				filter_container_id: 'external_filter_container_14',
				filter_type: "range_number"
			},
			{
				column_number : 16,
				filter_container_id: 'external_filter_container_15',
				filter_type: "range_number"
			},
			{
				column_number : 17,
				filter_container_id: 'external_filter_container_16',
				filter_type: "range_number"
			},
			{
				column_number : 18,
				filter_container_id: 'external_filter_container_17',
				filter_type: "multi_select",
				select_type: 'select2',
				filter_default_label: "Clan Recruit",
				filter_match_mode : 'exact',
				cumulative_filtering : false,
				select_type_options: {
					theme: "bootstrap",
					width: '200px'
				}
			},
			{
				column_number : 19,
				filter_container_id: 'external_filter_container_18',
				filter_type: "range_number"
			},
			{
				column_number : 20,
				filter_container_id: 'external_filter_container_19',
				filter_type: "range_number"
			},
			{
				column_number : 21,
				filter_container_id: 'external_filter_container_20',
				filter_type: "range_number"
			},
			{
				column_number : 22,
				filter_container_id: 'external_filter_container_21',
				filter_type: "range_number"
			},
			{
				column_number : 23,
				filter_container_id: 'external_filter_container_22',
				filter_type: "range_number",
			},
			{
				column_number : 24,
				filter_container_id: 'external_filter_container_23',
				filter_type: "range_number"
			},
			{
				column_number : 25,
				filter_container_id: 'external_filter_container_24',
				filter_type: "range_number"
			},
			{
				column_number : 26,
				filter_container_id: 'external_filter_container_25',
				filter_type: "range_number",
				cumulative_filtering : false
			},
			{
				column_number : 27,
				filter_container_id: 'external_filter_container_26',
				filter_type: "range_number"
			},
			{
				column_number : 28,
				filter_container_id: 'external_filter_container_27',
				filter_type: "range_number"
			},
			{
				column_number : 29,
				filter_container_id: 'external_filter_container_28',
				filter_type: "range_number"
			}
		],
		{
			cumulative_filtering: true,
			externally_triggered: true
		});
	});
	return true;
};

var seasonTable;
function showLogSeason() {
	$(document).ready(function() {
		seasonTable = $('#tabs-season').DataTable({
			bJQueryUI: true,
			scrollY: "400px",
			scrollX: "500px",
			scroller: true,
			scrollCollapse: true,
			colReorder: true,
			deferRender: false,
			paginate: true,
			autoFill: true,
			processing: true,
			serverSide: false,
			bAutoWidth : true,
			order: [[ 3, "desc" ]],
			sDom: '<"H"r>t<"F"ip>',
			columns : [
				{ title: "Id" , data: "season_id", visible: false, },
				{ title: "Name", data: "season_name" },
				{ title: "Date Start" , data: "start" },
				{ title: "Date End" , data: "end" },
				{ title: "Status" , data: "status" },
				{ title: "Map Build" , data: "build" }
			]
		});
		var tabevent = [];
		$.each(seasondata, function(season) {
			console.log(seasondata[season]);
			var mapbuild;
			if (seasondata[season].build != true) {
				if (seasondata[season].status == 'ACTIVE') {
					mapbuild = '<button type="button" title="Help Build map" onclick="buildmap(\''+seasondata[season].season_id +'\')"> Not finished, BUILD IT</button>'
				} else {
					mapbuild = 'Not Build'
				}
			} else {
				mapbuild = 'Done'
			}
			tabevent.push({
				'season_id' : seasondata[season].season_id ,
				'season_name' : seasondata[season].season_name ,
				'start' : seasondata[season].start ,
				'end' : seasondata[season].end ,
				'status' : seasondata[season].status,
				'build' : mapbuild
			});
		});
		seasonTable.clear();
		seasonTable.rows.add(tabevent);
		seasonTable.columns.adjust();
		seasonTable.draw();
	});
	return true;
};

function buildmap(seasonid) {
	console.log('click sur build');
	$.ajax({
		type: 'POST',
		url: 'tools/buildmap.php',
		data: {
			typeselection: seasonid
		},
		success: function(result) {
			alert("thanx msg ajax =" + result);
		},
		dataType: 'text',
		async:false
	});
}

function chargerlalog() {
	var tabevent = [];
	$.each(listeinfos['provinces'], function(province) {
		// retrouver le tag du clan
		var nomclan;
		var colorclan;
		var emblem;
		var langage;
		var clantoshow;
		if (typeof annuaireclan[listeinfos['provinces'][province].owner_clan_id] !== 'undefined') {
			nomclan = annuaireclan[listeinfos['provinces'][province].owner_clan_id].tag;
			colorclan = annuaireclan[listeinfos['provinces'][province].owner_clan_id].color;
			emblem = annuaireclan[listeinfos['provinces'][province].owner_clan_id].emblem_url;
			langage = annuaireclan[listeinfos['provinces'][province].owner_clan_id].language;
			clantoshow ='<img src="'+ emblem + '" style="width: 20px; height: 20px" />' + nomclan;
			ClanELO6 = annuaireclan[listeinfos['provinces'][province].owner_clan_id].elo_rating_6;
			ClanELO8 = annuaireclan[listeinfos['provinces'][province].owner_clan_id].elo_rating_8;
			ClanELO10 = annuaireclan[listeinfos['provinces'][province].owner_clan_id].elo_rating_10;
			accepts_join_requests = annuaireclan[listeinfos['provinces'][province].owner_clan_id].accepts_join_requests;
			members_count = annuaireclan[listeinfos['provinces'][province].owner_clan_id].members_count;
			battles = annuaireclan[listeinfos['provinces'][province].owner_clan_id].battles;
			battles_6_level  = annuaireclan[listeinfos['provinces'][province].owner_clan_id].battles_6_level;
			battles_8_level = annuaireclan[listeinfos['provinces'][province].owner_clan_id].battles_8_level;
			battles_10_level = annuaireclan[listeinfos['provinces'][province].owner_clan_id].battles_10_level;
			wins = annuaireclan[listeinfos['provinces'][province].owner_clan_id].wins;
			wins_6_level = annuaireclan[listeinfos['provinces'][province].owner_clan_id].wins_6_level;
			wins_8_level = annuaireclan[listeinfos['provinces'][province].owner_clan_id].wins_8_level;
			wins_10_level = annuaireclan[listeinfos['provinces'][province].owner_clan_id].wins_10_level;
			losses = annuaireclan[listeinfos['provinces'][province].owner_clan_id].losses;
			provinces_count = annuaireclan[listeinfos['provinces'][province].owner_clan_id].provinces_count;
		} else {
			if (listeinfos['provinces'][province].owner_clan_id !== null) {
				nomclan = listeinfos['provinces'][province].owner_clan_id;
				color = 'black';
				emblem = '';
				langage = ' ';
				clantoshow = 'Unknow';
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
			battles_6_level  = 0;
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
			'province_name' : '<button type="button" title="zoom to" onclick="chargerlaprov(\''+listeinfos['provinces'][province].province_id +'\')">'+listeinfos['provinces'][province].province_name + '</button>',
			'owner_clan_id' : clantoshow,
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
			'battles_6_level'  : battles_6_level,
			'battles_8_level' : battles_8_level,
			'battles_10_level' : battles_10_level,
			'wins' : wins,
			'wins_6_level' : wins_6_level,
			'wins_8_level' : wins_8_level,
			'wins_10_level' : wins_10_level,
			'losses' : losses,
			'provinces_count' : provinces_count
		});
	});

	$.fn.dataTable.ext.errMode = 'none';
	var tableLog = $("#tabs-9tab").DataTable();
	tableLog.clear();
	tableLog.rows.add(tabevent);
	console.log("chargement de la table avec :",tabevent);
	tableLog.columns.adjust();
	/* var availableHeight = ($(window).height() - 420) - $(tabs).height() ;
	var oldHeight = $('.dataTables_scrollBody').height();
	var newHeight = oldHeight + availableHeight;
	$('.dataTables_scrollBody').height( newHeight );
	$('.dataTables_scrollBody').css('max-height', newHeight );
	console.log(newHeight); */
	tableLog.draw();
	$.fn.dataTable.ext.errMode = 'alert';
};

function Filterprovinceonmap() {
	var vector = getLayerwarg(layers, "wargaming");
	var carteincomplete = new ol.source.Vector();
	var layer = new ol.layer.Image({
		idbase : "wargaming",
		source: new ol.source.ImageVector({
			source: carteincomplete,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: [255, 255, 255, 0.5],
				}),
				stroke: new ol.style.Stroke({
					color: '#319FD3',
					width: 1
				})
			})
		})
	});
	map.removeLayer(vector);
	map.addLayer(layer);
	// constitution liste provinces filtrée sur le tableau
	var filteredprov = new Array;
	var rows = $('#tabs-9tab').dataTable().$('tr', {"filter":"applied"});
	$.each(rows, function(row) {
		var datarowprov = rows[row].cells[0].textContent;
		var result3 = $.grep(Object.keys(listeinfos.provinces), function(e){return listeinfos.provinces[e].province_name == datarowprov});
		var datarowprovid = result3[0];
		if (result3 && result3.length == 1) {
			filteredprov.push(result3[0]);
		}
	});
	var i =0;
	var listeprovinceatraiter = cartecomplete.getSource().getSource().getFeatures();
	$.each(listeprovinceatraiter, function(index, feature) {
		var result3 = $.grep(filteredprov, function(e){return e == feature.getProperties().province_id});
		if (result3 && result3.length == 1 ) {
			i++;
			carteincomplete.addFeature(feature.clone());
		}
	});
	/* effacericone();
	affichageclancolor();
	afficherlesicones();
	map.renderSync(); */
};

function launchIntoFullscreen(element) {
	if(element.requestFullscreen) {
		element.requestFullscreen();
	} else if(element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if(element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	} else if(element.msRequestFullscreen) {
		element.msRequestFullscreen();
	}
	fullscreen = true;
};

function exitFullscreen() {
	if(document.exitFullscreen) {
		document.exitFullscreen();
	} else if(document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if(document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	}
	fullscreen = false;
};

$("#reactualisation").click(function() {
	var datedernieresave = affichageclanproperty("DATELASTSAVE", " ", false);
	var date_actuelle = new Date();
	var datesave = new Date(datedernieresave * 1000);
	var total_secondesreact = (date_actuelle - datesave) / 1000;
	if (total_secondesreact < 300 ) {
		window.location.reload(false);
		datedernieresave = affichageclanproperty("DATELASTSAVE", " ", false);
	} else {
		var resultatajax = "";
		setTimeout(function() {
			preloader.show();
			$.ajax({
				type: 'POST',
				url: 'tools/extracthour.php',
				success: function(result) {
					resultatajax = result;
					window.location.reload(false);
					datedernieresave = affichageclanproperty("DATELASTSAVE", " ", false);
				},
				dataType: 'text',
				async:false
			});
			return resultatajax;
			preloader.hide();
		}, 100);
	}
});

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
				scrollTop: $($anchor.attr('href')).offset().top
			}, 1500, 'easeInOutExpo');
			event.preventDefault();
		});
	});

	/***************** Scroll Spy ******************/
	$('body').scrollspy({
		target: '.navbar-fixed-top',
		offset: 51
	});

	$("#Tutorialcarousel").owlCarousel({
		navigation: true, // Show next and prev buttons
		slideSpeed: 1000,
		paginationSpeed: 400,
		singleItem: true,
		transitionStyle: "fadeUp",
		autoPlay: true,
		navigationText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"]
	});
	var owl = $("#Newscarousel");
	owl.owlCarousel({
		navigation: true, // Show next and prev buttons
		slideSpeed: 1000,
		paginationSpeed: 400,
		singleItem: true,
		transitionStyle: "fadeUp",
		autoPlay: false,
		navigationText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"]
	});

	var $parseRSS = function (paramsObj) {
		var base = "https://ajax.googleapis.com/ajax/services/feed/load",
			params = "?v=1.0&num=" + paramsObj.count + "&callback=?&q=" + paramsObj.url,
			url = base + params;
		$.ajax({
			url: url,
			dataType: "json",
			success: function (data) {
				paramsObj.callback(data.responseData.feed.entries);
			}
		});
	};

	$parseRSS({
		url: "http://worldoftanks.eu/en/rss/news/cw/",
		count: 5,
		callback: function (posts) {
			console.log(posts);
			$.each(posts, function(index, post) {
			var content = "<div class='item'>" +
					"<div class='container'>" +
					"<div class='col-md-8'>" +
						"<div class='team'>" +
								"<center><h4>"+posts[index].title+"</h4></center>" +
								"<center><h6>"+posts[index].publishedDate+"</h6></center>" +
								"<center>"+posts[index].content+"</center>"+
						"</div>"+
					"</div></div>"+
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
		$(window).load(function () {
		preloader.hide();
	});
});