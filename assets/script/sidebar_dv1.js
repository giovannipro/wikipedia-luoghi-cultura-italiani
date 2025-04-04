const min_circle_size = 0.5;
const max_circle_size = 35;

function update_sidebar_text(){
	// const sort_option = document.getElementById('sort_article');
	// const text_box = document.getElementById('sidebar_text');

	// sort = sort_option.options[sort_option.selectedIndex].text
	// text_box.innerHTML = sort
	// console.log(sort, sort_option)
}

function sidebar(dv,data,the_sort){
	// console.log(dv, the_sort)

	const button_open = document.getElementById('sidebar_button_open');
	const button_close = document.getElementById('sidebar_close_icon');
	const the_sidebar = document.getElementById('sidebar');
	const container = document.getElementById('sidebar_content');
	
	// let output = ''
	detail = ''
	
	container.innerHTML = ''

	function load_sidebar(){
		max = -Infinity;

		// output = ''
		// output += '<ul>'

		// update_sidebar_text()

        // add item in the sidebar
        // data.forEach(function (d,i) {
            
        //     // console.log(d.article)

        //     // if (dv == 1){
        //     //     detail = "" // formatNumber(d.unique_editors) // d.type
        //     //     num = 0 //d.unique_editors
        //     // }

        //     // if (max != 0) {
        //     //     size = num * 100 / max
        //     // }
        //     // else {
        //     //     size = 0
        //     // }

        //     // output += '<li>'

        //     // if (d.article_wikipedia != "Voce non esistente"){
        //     //     output += '<a class="item_box" href=" ' + wiki_link + d.article + '" target="_blank"">'
        //     // }
        //     // else {
        //     //     output += '<a class="item_box" href="#">'
        //     // }
            
        //     // output += '<div class="item_bubble" id="' + d.id_wikidata + '"></div>'

        //     // output += '<div class="item_value">'
        //     // output += '<div class="item_list">'

        //     // // console.log(d.article_wikipedia)
        //     // if (d.article_wikipedia != "Voce non esistente"){
        //     //     output += '<div class="article_list" data-id="' + d.id_wikidata + '">' + d.article + '</div>'
        //     // }
        //     // else {
        //     //     output += '<div class="article_list" data-id="' + d.id_wikidata + '">' + d.article + ' <br/><span style="color: #f57e7e;">(voce non esistente)</span></div>'
        //     // }
            

        //     // output += '<div class="article_region">' + d.region + '</div>'
        
        //     // if (isNaN(max) == false || max < 0) {
        //     //     output += '<div class="value">' + detail + '</div>'
        //     // }

        //     // output += '</div>'

        //     // if (the_sort != 1 || isNaN(max) == false){
        //     //     output += '<div class="bar" style="width: ' + size + '%;"></div>'
        //     // }
        //     // output += '</div>'

        //     // output += '</a>'
        //     // output += '</li>'

        //     // let container = d.id_wikidata
        //     // make_article_bubble(container,d)

        // })

        data.sort((a, b) => a.article.localeCompare(b.article));

        const fragment = document.createDocumentFragment();
        let output = ''

        let i = 0;
        function batchRender() {
            const batchSize = 100; // Render in small chunks
            for (let j = 0; j < batchSize && i < data.length; j++, i++) {
                const item = data[i];

                const anchor = document.createElement('a');
                const li = document.createElement("li");
                
                const items = document.createElement("div");
                items.classList = 'item_list'
                const article = document.createElement("div");
                article.classList = 'article_list'
                const region = document.createElement("div");
                region.classList = 'article_region'

                if (data[i].article_wikipedia != "Voce non esistente"){

					anchor.target = '_blank';
                	anchor.classList = 'item_box'

                    anchor.href = wiki_link + item.article;
                    article.innerHTML = capitalizeFirstLetter(item.article);
                }
                else {
                    // anchor.href = '#'
                    article.innerHTML = capitalizeFirstLetter(item.article) + '<br/><span style="color: #f57e7e;">(Voce Wikipedia non esistente)</span>';
                }
                
                region.textContent = item.region;

                items.appendChild(article);
                items.appendChild(region);

                anchor.appendChild(items);
                li.appendChild(anchor);

                fragment.appendChild(li);
            }
            
            container.appendChild(fragment); // Append batch to DOM
            if (i < data.length) requestAnimationFrame(batchRender); // Schedule next batch
        }
        
        requestAnimationFrame(batchRender);

        
		// if (dv == 1){
		// 	data.forEach(item => {
		// 		item.article = item.article.replace(/['"]/g, ""); 
		// 		item.article = item.article.charAt(0).toUpperCase() + item.article.slice(1);
		// 	})
		// 	data.sort((a, b) => a.article.localeCompare(b.article));

		// 	max = -Infinity;
		// }	


		// output += '</ul>'

		// container.innerHTML = output

		// add bubbles
		// data.forEach(function (d,i) {
		// 	let container = d.id_wikidata
		// 	make_article_bubble(container,d)
		// })

		// function make_article_bubble(container,individual_data){
		// 	// console.log(individual_data)	

		// 	const box_size = 40

		// 	let r_max = Math.sqrt(318000/3.14)

		// 	let r = d3.scaleLinear()
		// 		.range([min_circle_size, box_size/2])
		// 		.domain([0,r_max])

		// 	let svg = d3.select('#' + container)
		// 		.append("svg")
		// 		.attr("width", box_size)
		// 		.attr("height", box_size)
		// 		.attr("class", "bubble_svg")

		// 	let article_box = svg.append("g")

		// 	// article circle
		// 	let article = article_box
		// 		.append("circle")
		// 		.attr("cx", box_size/2)
		// 		.attr("cy", box_size/2)
		// 		.attr("r", r(Math.sqrt(individual_data.size/3.14)) )
		// 		.attr("fill", function(d,i){
		// 			return "#00b2ff"
		// 		})
		// 		.attr("opacity",0.5)

		// 	let incipit = article_box
		// 		.append("circle")
		// 		.attr("cx", box_size/2)
		// 		.attr("cy", box_size/2)
		// 		.attr("r", r(Math.sqrt(individual_data.incipit_size/3.14)) )
		// 		.attr("fill", function(d,i){
		// 			return "#00b2ff"
		// 		})
		// 		.attr("opacity",0.5)

		// 	let discussion = article_box
		// 		.append("circle")
		// 		.attr("cx", box_size/2)
		// 		.attr("cy", box_size/2)
		// 		.attr("r", r(Math.sqrt(individual_data.discussion_size/3.14)) )
		// 		.attr("stroke", function(d,i){
		// 			return "#00b2ff"
		// 		})
		// 		.attr("opacity",0.9)
		// 		.attr("fill","transparent")
		// 		.attr("stroke-width",0.5)
		// }
	}
	load_sidebar()

	let open = false;
	button_open.addEventListener('click', (event) => {

		if (open == false){
			the_sidebar.style.display = 'block'
			open = true

			button_close.style.display = 'block'
			button_open.style.display = 'none'
		}
	})

	button_close.addEventListener('click', (event) => {

		if (open == true){
			the_sidebar.style.display = 'none'
			open = false

			button_close.style.display = 'none'
			button_open.style.display = 'block'
		}
	})
}