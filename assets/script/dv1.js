const map_contaier = "map1"
const map_maxZoom = 15
const map_minZoom =  6

// make the map
function dv1(){

	let map = L.map(map_contaier, {
		center: [42.21, 12.6],
		zoom: 6
	});

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		maxZoom: map_maxZoom,
		minZoom: map_minZoom,
		tileSize: 256
	}).addTo(map);

	L.control.locate().addTo(map);

}

function update_dv1_lang(lang){
	// let text = document.querySelectorAll('.axis_name');

	// text.forEach(function(content) {
	// 	let it = content.dataset.it
	// 	let en = content.dataset.en

	// 	if (lang == 'it'){
	// 		content.textContent = it
	// 	}
	// 	else if (lang == 'en') {
	// 		content.textContent = en
	// 	}
	// });
}

window.addEventListener("load", function(){
    dv1()
});