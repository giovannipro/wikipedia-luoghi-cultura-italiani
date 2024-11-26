const map_contaier = "map1"
const map_maxZoom = 17
const map_startZoom =  6
const map_minZoom =  6

const wiki_link = "https://it.wikipedia.org/wiki/";

const typology_selector = document.getElementById("typology")

let the_data;

let the_museums;
let the_libraries;
let the_archives;

// make the map
function dv1(){

	fetch("assets/data/data_map_small.tsv")
	.then(response => response.text())
	.then(raw_data => {

		const rows = raw_data.trim().split("\n");
		const headers = rows[0].split("\t");
		const data = rows.slice(1).map(row => {
			const values = row.split("\t");
			return headers.reduce((obj, header, index) => {
			  obj[header] = values[index];
			  return obj;
			}, {});
		});
		console.log(data)

		statistics(data)

		let filtered_data = data.filter(item => {
			return item.latitude !== "Nessuna coordinata geografica" && item.longitude !== "Nessuna coordinata geografica" && item.latitude !== "Deprecated" && item.latitude !== "" && item.longitude !== "" // && item.article_wikipedia !== "Voce non esistente"
		})

		the_data = data;

		the_museums = filtered_data.filter(item => 
			item.category === "museo"
		)
		the_libraries = filtered_data.filter(item => 
			item.category === "biblioteca"
		)
		the_archives = filtered_data.filter(item => 
			item.category === "archivio"
		)

		display_data(the_museums)

	}).catch(error => {
		console.log("There is an error: ",error)
	})
}

function display_data(data){
	console.log(data)

	let map = L.map(map_contaier, {
		center: [42.1, 12.5],
		zoom: map_startZoom
	});

	let markerGroup;

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		maxZoom: map_maxZoom,
		minZoom: map_minZoom,
		tileSize: 256
	})
	.addTo(map);

	// markerGroup = L.markerClusterGroup();

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

			let min_size = 500
			let the_size = count * 0.06	
			if (count <= min_size){
				the_size = min_size * 0.06
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

		// remove markers
		markers.clearLayers();

		// add markers
		data.forEach(element => {
			let lat = parseFloat(element.latitude)
			let lon = parseFloat(element.longitude)
			let title = element.article
			// console.log(lat,lon)
	
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
				lat, lon
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

			markers.addLayer(marker);
		});

	}
	load_markers(data)

	map.addLayer(markers);

	typology_selector.addEventListener('change', function() {
		let new_type = this.value;
		console.log(new_type)

		if (new_type === "museo"){
			filtered_data = the_museums
		}
		else if (new_type === "archivio"){
			filtered_data = the_archives
		}
		else {
			filtered_data = the_libraries
		}

		console.log(filtered_data)
		load_markers(filtered_data)

		the_sort = 1;
		// the_data_sidebar = filtered_data.filter(item => item.unique_editors != "No editori")
		sidebar(1,filtered_data,the_sort)
	})


	L.control.locate().addTo(map);

	the_sort = 1;
	the_data_sidebar = data.filter(item => item.unique_editors != "No editori")
	sidebar(1,the_data_sidebar,the_sort)
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
	no_website = data.filter(item => item.website !== "Nessun sito web")
	// no_wikipedia.forEach(item => console.log(item.article_wikidata))


	all_glams_box.innerText = all_glams
	no_wikipedia_box.innerText = no_wikipedia.length
	no_website_box.innerText = no_website.length

}



window.addEventListener("load", function(){
    dv1()
});