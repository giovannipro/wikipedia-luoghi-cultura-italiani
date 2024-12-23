const map_contaier = "map1"
const map_maxZoom = 17
let map_startZoom =  6
let map_minZoom =  6

const wiki_link = "https://it.wikipedia.org/wiki/";

const typology_selector = document.getElementById("typology")
const region_selector = document.getElementById("region")

let the_data;
// let filtered_data;

// let the_museums;
// let the_libraries;
// let the_archives;

let size_reducer = 0.06;
let min_size = 500;

let width = window.innerWidth;

if (width < 400){
	map_startZoom =  5
	map_minZoom =  5

	size_reducer = 0.04
	min_size = 800
}

// make the map
function dv1(){

	fetch("assets/data/data_map_small.tsv")
	.then(response => response.text())
	.then(raw_data => {
		const data = d3.tsvParse(raw_data)

		the_data = filter_data(data);
		console.log(the_data)
		
		statistics(the_data)
		display_data(the_data)

	}).catch(error => {
		console.log("There is an error: ",error)
	})
}

function display_data(data){

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

	const markers = L.markerClusterGroup({

		iconCreateFunction: function (cluster) {
			const count = cluster.getChildCount(); // Get the number of markers in the cluster
			// console.log(cluster)
		
			// Define the size of the cluster based on the count
			let sizeClass = 'small-cluster';
			
			if (count > 100 && count < 500) {
				sizeClass = 'medium-cluster';
			}
			else if (count >= 500) {
				sizeClass = 'large-cluster';
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

	function load_markers(data){
		// console.log(data)

		// remove markers
		markers.clearLayers();
		bounds = L.latLngBounds([]);

		// add markers
		data.forEach(element => {
			let title = element.article
			// console.log(element.latitude)
	
			if (element.article_wikipedia !== "Voce non esistente"){
				link = `<a href="${wiki_link}${title}" target="_blank"> ${title}</a>`
			}
			else {
				link = title
			}
	
			let web = element.website
			if (element.website !== "Nessun sito web"){
				web = `<a href="${element.website}" target="_blank">sito web</a>`
			}
	
			const marker = L.marker([
				element.latitude, element.longitude
			])

			marker.bindPopup(`
					<span id='popup_header'>
						<strong>${link}</strong><br/>
						${element.type}<br/>
						${element.public_private}<br/>
						visitatori: ${element.visitors}<br/>
						${web}<br/><br/>
	
						editor unici: ${element.unique_editors}
					</span>
				`
			)

			if (typeof element.latitude != 'number'){
				console.log(element.latitude)
			}

			bounds.extend([element.latitude,element.longitude]);
			markers.addLayer(marker);
		});
	}
	let the_museums = data.filter(item => item.category === 'museo')
	load_markers(the_museums)

	map.fitBounds(bounds);
	map.addLayer(markers);

	// console.log(bounds.getSouthWest(), bounds.getNorthEast());
	
	typology_selector.addEventListener('change', function() {
		let new_type = this.value;
		new_region = region_selector.value;
		console.log(new_type,new_region)
		// console.log(filter_data(data))

		if (new_region == 'all'){
			filtered_data = filter_data(data).filter(item => item.category === new_type)
		}
		else {
			filtered_data = filter_data(data).filter(item => item.region === new_region)
				.filter(item => item.category === new_type)
		}

		for (item of filtered_data){
			if (item.latitude < 35){

				console.log(item.article, item.latitude)
			}
		}

		// console.log(filtered_data)
		load_markers(filtered_data)
		map.fitBounds(bounds);

		console.log(bounds.getSouthWest(), bounds.getNorthEast());

		the_sort = 1;
		// the_data_sidebar = filtered_data.filter(item => item.unique_editors != "No editori")
		sidebar(1,filtered_data,the_sort)
	})

	region_selector.addEventListener('change', function() {
		let new_region = this.value;
		new_type = typology_selector.value;

		if (new_region == 'all'){
			filtered_data = filter_data(data).filter(item => item.category === new_type)
		}
		else {
			filtered_data = filter_data(data).filter(item => item.region === new_region)
				.filter(item => item.category === new_type)
		}

		// console.log(filtered_data)
		load_markers(filtered_data)
		map.fitBounds(bounds);

		the_sort = 1;
		// the_data_sidebar = filtered_data.filter(item => item.unique_editors != "No editori")
		sidebar(1,filtered_data,the_sort)
	})

	L.control.locate().addTo(map);

	the_sort = 1;
	// the_data_sidebar = data.filter(item => item.unique_editors != "No editori")
	sidebar(1,the_museums,the_sort)
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



window.addEventListener("load", function(){
    dv1()
});