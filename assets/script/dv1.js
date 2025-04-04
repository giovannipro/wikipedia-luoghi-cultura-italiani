const map_contaier = "map1"
const map_maxZoom = 17
let map_startZoom =  6
let map_minZoom =  6

const wiki_link = "https://it.wikipedia.org/wiki/";

const typology_selector = document.getElementById("typology")
const region_selector = document.getElementById("region")
const loading_overlay = document.getElementById('loading_overlay');

let the_data;
// let filtered_data;

// let the_museums;
// let the_libraries;
// let the_archives;

let size_reducer = 0.065;
let min_size = 500;

let width = window.innerWidth;

if (width < 400){
	map_startZoom =  5
	map_minZoom =  5

	size_reducer = 0.04
	min_size = 800
}

let geoJSONData;

// make the map
function dv1(){
	
	// gzip [OPTION]... [FILE]...
	fetch("assets/data/data_map_small.tsv.gz")  // assets/data/data_map_small.tsv.gz assets/data/data_map_small.tsv
		.then(response => {
			if (!response.ok) {
				throw new Error(`Network error: ${response.status} - ${response.statusText}`);
			}
			return response.arrayBuffer();
		})
		.then(compressedData => {
			const data = pako.ungzip(compressedData, { to: 'string' });
			const parsedData = d3.tsvParse(data)

			the_data = filter_data(parsedData);
			console.log(the_data)
			
			geoJSONData = tsvToGeoJSON(data);
			console.log(geoJSONData)

			statistics(the_data)
			display_data(the_data)
			// console.log(data[0])

		})
		.catch(error => {
			console.log("There is an error: \n", error)
		})
}

function display_data(data){

	loading_overlay.style.display = 'none';

	let map = L.map(map_contaier, {
		center: [42.1, 12.5],
		zoom: map_startZoom
	});

	let markerGroup;
	let bounds = L.latLngBounds([]);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		maxZoom: map_maxZoom,
		minZoom: map_minZoom,
		tileSize: 256
	})
	.addTo(map);

	let count = 0
	const markers = L.markerClusterGroup({

		iconCreateFunction: function (cluster) {
			// console.log(cluster)

			count = cluster.getChildCount(); // Get the number of markers in the cluster
			// console.log(cluster)
		
			// Define the size of the cluster based on the count
			let sizeClass = 'xs_cluster';
			
			if (count > 50 && count < 100) {
				sizeClass = 's_cluster';
			}
			else if (count >= 100 && count < 200) {
				sizeClass = 'm_cluster';
			} 
			else if (count >= 200 && count < 500) {
				sizeClass = 'l_cluster';
			} 
			else if (count >= 500) {
				sizeClass = 'xl_cluster';
			} 

			let the_size = count * size_reducer
			if (count <= min_size){
				the_size = min_size * size_reducer
			}

			// Create a custom icon
			return L.divIcon({ 
				html: `<div> 
					<span>${count}</span>
				</div>`,
				className: `custom-cluster ${sizeClass}`,
				iconSize: L.point(the_size, the_size) // Adjust size if needed
			});
		}

	})

	function load_the_markers(data){
		setTimeout("remove_loader()",50)

		markers.clearLayers();

		console.log(data)

		// const markers = L.markerClusterGroup()
		let geoJsonLayer = L.geoJSON(data,{
			// preferCanvas: true,
			pointToLayer: function (feature, layer) {
				return L.marker(feature.geometry.coordinates);
			},
			onEachFeature: function (feature, layer) {
				const element = feature.properties
				// console.log(element)

				let title = feature.properties.name

				if (feature.properties.link !== "Nessun sito web"){
					// link = `<td><button onclick="window.open('${feature.properties.link}', '_blank');">Sito web</button></td>`
					link = `<tr><td><a href="${feature.properties.link}" target="_blank">Sito web</a></td></tr>`
				}
				else {
					link = '<tr><td>Nessun sito web</tr></td>'
				}
				
				layer.bindPopup(`
					<div id="popup_dv1">
						<table style="padding-right: 20px;">
							<tr>
				 				<td><strong>${title}</strong></td>
				 			</tr>
							<tr>
				 				<td>${element.region} | ${element.category}</td>
				 			</tr>
				 		</table>
						<hr style="border: 0.5px solid #e3e3e3;"/>
						<table>
				 			${link} 
				 		</table>
					</div>
				  `, {
					closeOnClick: false
				});

				// <tr>
				//  				<td>${element.type}</td>
				//  			</tr>
				//  			<tr>
				//  				<td>${element.public_private}</td>
				//  			</tr>
				//  			<tr>
				//  				<td>visitatori: ${element.visitors}</td>
				//  			</tr>
				//  			<tr>
				//  				<td>${link}</td>
				//  			</tr>
			}
		});
		
		// bounds = L.latLngBounds([]);
		bounds = markers.getBounds();
		if (bounds.isValid()) {
			map.fitBounds(bounds);
		}
		// console.log(bounds);

		markers.addLayer(geoJsonLayer);
		map.addLayer(markers);

	}

	// function load_markers(data){
	// 	// console.log(data)

	// 	setTimeout("remove_loader()",50)

	// 	// remove markers
	// 	markers.clearLayers();
	// 	bounds = L.latLngBounds([]);

	// 	// L.geoJSON(data, {
	// 	// 	onEachFeature: function (feature, layer) {
	// 	// 		markers.addLayer(layer);
	// 	// 		console.log(feature)
	// 	// 	}
	// 	// });
	// 	// map.addLayer(markers);


	// 	// add markers
	// 	data.forEach(element => {
	// 		let title = element.article
	// 		// console.log(element.latitude)
	
	// 		if (element.article_wikipedia !== "Voce non esistente"){
	// 			link = `<a href="${wiki_link}${title}" target="_blank"> ${title}</a>`
	// 		}
	// 		else {
	// 			link = title
	// 		}
	
	// 		let web = element.website
	// 		if (element.website !== "Nessun sito web"){
	// 			web = `<a href="${element.website}" target="_blank">sito web</a>`
	// 		}
			
	// 		try {
	// 			const marker = L.marker([
	// 				element.latitude, element.longitude
	// 			])
	// 			// console.log(title, element.latitude, element.longitude)

	// 			marker.bindTooltip(`
	// 					<div id="tooltip_dv1">
	// 						<table>
	// 							<tr>
	// 								<td><strong>${link}</strong></td>
	// 							</tr>
	// 						</table>
	// 						<hr style="border: 0.5px solid #e3e3e3;"/>
	// 						<table>
	// 							<tr>
	// 								<td>${element.type}</td>
	// 							</tr>
	// 							<tr>
	// 								<td>${element.public_private}</td>
	// 							</tr>
	// 							<tr>
	// 								<td>visitatori: ${element.visitors}</td>
	// 							</tr>
	// 							<tr>
	// 								<td>${web}</td>
	// 							</tr>
								
	// 						</table>
	// 					</div>
	// 				`, 
	// 			)
				
	// 			if (typeof element.latitude != 'number'){
	// 				console.log(element.latitude)
	// 			}
				
	// 			bounds.extend([element.latitude,element.longitude]);
	// 			markers.addLayer(marker);
	// 		}
	// 		  catch (error) {
	// 			console.error(error);
	// 		}
	// 	});
	// }

	const the_museums = the_data.filter(item => item.category === 'museo')
	const the_libraries = the_data.filter(item => item.category === 'biblioteca')
	const the_archives = the_data.filter(item => item.category === 'archivio')
	const the_archeology = the_data.filter(item => item.category === 'area_archeologica')
	const the_universities = the_data.filter(item => item.category === 'universita')
	const the_castel = the_data.filter(item => item.category === 'castello')

	// console.log(geoJSONData)
	const filteredMuseums = geoJSONData.features.filter(
		feature => feature.properties.category === 'museo'
	);
	const filteredLibraries = geoJSONData.features.filter(
		feature => feature.properties.category === 'biblioteca'
	);
	const filteredArchives = geoJSONData.features.filter(
		feature => feature.properties.category === 'archivio'
	);
	const filteredArcheology = geoJSONData.features.filter(
		feature => feature.properties.category === 'area_archeologica'
	);
	const filteredUniversities = geoJSONData.features.filter(
		feature => feature.properties.category === 'universita'
	);
	const filteredCastel = geoJSONData.features.filter(
		feature => feature.properties.category === 'castello'
	);

	load_the_markers(filteredArchives)

	function get_jsonData(new_type,new_region){
		// console.log(new_type,new_region)

		let selected_data = geoJSONData;

		if (new_type === 'museo'){
			selected_data = filteredMuseums
		}
		else if (new_type === 'biblioteca'){
			selected_data = filteredLibraries
		}
		else if (new_type === 'archivio'){
			selected_data = filteredArchives
		}
		else if (new_type === 'area_archeologica'){
			selected_data = filteredArcheology
		}
		else if (new_type === 'castello'){
			selected_data = filteredCastel
		}
		else {
			selected_data = filteredUniversities
		}

		// console.log(selected_data)

		if (new_region != 'all'){
			selected_data_ = selected_data.filter(
				feature => feature.properties.region === new_region
			);
		}
		else {
			selected_data_ = selected_data
		}

		return selected_data_
	}

	function get_data(new_type,new_region){
		// console.log(new_type,new_region)

		let selected_data = the_data;

		if (new_type === 'museo'){
			selected_data = the_museums
		}
		else if (new_type === 'biblioteca'){
			selected_data = the_libraries
		}
		else if (new_type === 'archivio'){
			selected_data = the_archives
		}
		else if (new_type === 'area_archeologica'){
			selected_data = the_archeology
		}
		else if (new_type === 'castello'){
			selected_data = the_castel
		}
		else {
			selected_data = the_universities
		}

		if (new_region != 'all'){
			selected_data_ = selected_data.filter(item => item.region === new_region)
		}
		else {
			selected_data_ = selected_data
		}

		return selected_data_
	}

	typology_selector.addEventListener('change', function() {
		loading_overlay.style.display = 'flex';

		let new_type = this.value;
		new_region = region_selector.value;

		filtered_data = get_jsonData(new_type,new_region)
		// console.log(filtered_data)

		// console.log(filtered_data)
		load_the_markers(filtered_data)
		map.fitBounds(bounds);

		the_sort = 1;
		// the_data_sidebar = filtered_data.filter(item => item.unique_editors != "No editori")
		sidebar(1,get_data(new_type,new_region),the_sort)
	})

	region_selector.addEventListener('change', function() {
		let new_region = this.value;
		new_type = typology_selector.value;

		filtered_data = get_jsonData(new_type,new_region)

		console.log(filtered_data)
		load_the_markers(filtered_data)
		map.fitBounds(bounds);

		the_sort = 1;
		// the_data_sidebar = filtered_data.filter(item => item.unique_editors != "No editori")
		sidebar(1,get_data(new_type,new_region),the_sort)
	})

	L.control.locate().addTo(map);

	the_sort = 1;
	// the_data_sidebar = data.filter(item => item.unique_editors != "No editori")
	sidebar(1,the_archives,the_sort)
}

function update_dv1_lang(lang){

	let transl = {};

	// Load translations
	fetch('assets/content/translations/home_translations.json')
		.then(response => response.json())
		.then(data => {
	    	transl = data;
	    	changeLanguage(lang);
	  })
	  // .catch(error => console.error('Error loading translations:', error));

	function changeLanguage(lang) {
		if (!transl[lang]) return;

		apply_language('how_to_read_label',transl[lang].how_to_read.label)
		apply_language('how_to_read_text',transl[lang].how_to_read.text)

		// apply_language('popup_header',transl[lang].popup.header)
		// apply_language('popup_text',transl[lang].popup.text)

		// apply_language('title_',transl[lang].title)

	}

	function apply_language(box,content){
		the_container = document.getElementById(box)
		the_container.innerText = content
	}
}


function statistics(data){
	// console.log(data)

	all_glams_box = document.getElementById("all_glams")
	no_wikipedia_box = document.getElementById("no_wikipedia")
	no_website_box = document.getElementById("no_website")

	all_glams = data.length
	no_wikipedia = data.filter(item => item.article_wikipedia !== "Voce non esistente")
	no_website = data.filter(item => item.website != "Nessun sito web")
	// no_wikipedia.forEach(item => console.log(item.article_wikidata))

	all_glams_box.innerText = formatNumber(all_glams)
	no_wikipedia_box.innerText = formatNumber(no_wikipedia.length)
	no_website_box.innerText = formatNumber(no_website.length)

}

function remove_loader(){
	loading_overlay.style.display = 'none'
}

window.addEventListener("load", function(){
    dv1()
});