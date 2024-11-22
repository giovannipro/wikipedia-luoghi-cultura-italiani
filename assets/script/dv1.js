const map_contaier = "map1"
const map_maxZoom = 17
const map_minZoom =  6

// make the map
function dv1(){

	fetch("assets/data/data_map.tsv")
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

		let filtered_data = data.filter((item) => {
			return item.latitude !== "Nessuna coordinata geografica" && item.longitude !== "Nessuna coordinata geografica" && item.latitude !== "Deprecated"
		})
		display_data(filtered_data) //(filtered_data.slice(1, 5900))

	}).catch(error => {
		console.log("There is an error: ",error)
	})
}

function display_data(data){
	console.log(data)

	let map = L.map(map_contaier, {
		center: [42.1, 12.5],
		zoom: 6
	});

	let markerGroup;

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		maxZoom: map_maxZoom,
		minZoom: map_minZoom,
		tileSize: 256
	})
	.addTo(map);
	markerGroup = L.markerClusterGroup();

	// const places = data.filter((item) => {
	// 	let lat =  parseFloat(item.latitude)
	// 	let lon = parseFloat(item.longitude)

	// 	return lat !== NaN && lon !== NaN
	// })

	data.forEach(element => {
		let lat = parseFloat(element.latitude)
		let lon = parseFloat(element.longitude)
		// console.log(lat,lon)

		let marker = L.marker([
			lat, lon
		])
		// .addTo(map)

		markerGroup.addLayer(marker);

		marker.bindPopup(`
				<span id='popup_header'>
					<strong>${element.article_wikidata}</strong><br/>
					${element.type}<br/>
					${element.public_private}
				</span>
			`
		)
	});

	map.addLayer(markerGroup);
	console.log(markerGroup)

	L.control.locate().addTo(map);
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

window.addEventListener("load", function(){
    dv1()
});