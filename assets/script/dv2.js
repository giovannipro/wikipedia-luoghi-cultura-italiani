const container = "#dv2";
const font_size = 10;

const filter_item = 20; // also in Wikipedia and Italian school is 120
const shiftx_article = 30;
const wiki_link = "https://it.wikipedia.org/wiki/";
const variation_line_opacity = 0.7;
const min_avg_pv = 100;

const min_circle_size = 0.5;
const max_circle_size = 35;

const stroke_dash = "3,3";

const log_exponent = 0.5; 

// let multiply = 1;
let window_w = document.getElementById("dv2").offsetWidth;
	window_h = document.getElementById("dv2").offsetHeight;

if (window_w <= 768){
	reduction = 20;
}
else {
	reduction = 0;
}

let margin = {top: 20, left: 0-reduction, bottom: 20, right: 60-reduction},
	width = window_w - (margin.right + margin.right),
	height = window_h - (margin.top + margin.bottom);

function dv2(region,the_sort) {

	d3.tsv("../assets/data/voci.tsv")
		.then(loaded)

	function loaded(data) {
		// console.log(data,region,the_sort)

		data = format_data(data)
		filtered_data = data
		console.log(data)
	
		statistics(data)

		// svg 
		// ---------------------------
		let svg = d3.select(container)
			.append("svg")
			.attr("width", width + (margin.right + margin.right))
			.attr("height",height + (margin.top + margin.bottom))
			.attr("id", "svg")

		// scale 
		// ---------------------------

		let min = 0
		let max = filtered_data.length

		let y_max = d3.max(filtered_data, function(d) { 
			return d.avg_pv;
		})

		let r_max = d3.max(filtered_data, function(d) { 
			return Math.sqrt(d.size/3.14);
		})

		let r = d3.scaleLinear()
			.range([min_circle_size, max_circle_size])
			.domain([0,r_max])

		let x = d3.scaleLinear()
			.domain([min,max])
			.range([0,width-100])

		let y = d3.scaleLinear() // scaleSymlog() > it works
			.domain([0,y_max+(y_max/100*10)]) 
			.range([height-margin.top,0])
       
		// grid and plot
		// ---------------------------

		let grid = svg.append("g")
			.attr("id","grid")
			.attr("transform", "translate(-1," + margin.top*2 + ")")
			.call(make_y_gridlines()
				.tickSize(-width-margin.left-margin.right-60)
			)

		let plot = svg.append("g")
			.attr("id", "d3_plot")
			.attr("transform", "translate(" + margin.right + "," + margin.top + ")");

       	// axis and grid 
		// ---------------------------

		let yAxis_margin = 10;
		if (window_w < 700){
			yAxis_margin = 0;
		}
		let yAxis = plot.append("g")
			.attr("id","yAxis")
			.attr("transform", "translate(" + yAxis_margin + "," + (margin.top) +")")
			.call(d3.axisLeft(y))
			.selectAll("text")
			.attr("y", -10)

		let yaxis_label_box = plot.append("g")
			.attr("class","yaxis_label")
			.attr("transform","translate(7," + height + ")")

		let yaxis_label = yaxis_label_box.append("text")
			.attr("class","axis_name")
			.text("visite giornaliere (media)")
			.attr("data-it","visite giornaliere (media)")
			.attr("data-en","daily visits (average)")
			.attr("y",-6)
			.attr("font-size",font_size)

		function make_y_gridlines() {		
			return d3.axisLeft(y)
		}
	
		// tooltip
		// ---------------------------
		let tooltip = d3.tip()
			.attr('class', 'tooltip')
			.attr('id', 'tooltip_dv1')
			.attr('max-width',100)
			.direction(function (d,i) {
				let direction = tooltip_direction(filtered_data, i, 0, filtered_data.length, d.avg_pv,false)
				return direction 
			})
			.offset([-10,0])
			.html(function(d,i) {

				let params = new URLSearchParams(window.location.search);
				if (params.has('lang') == true) {
					lang = params.get('lang')
				}

				lang = 'it'
				if (lang == 'it'){
					creation_date = "Creato il: "
					visits = "visite giornaliere"
					size = "dimensioni"
					discussion = "discussione"
					issues = "avvisi"
					images = "immagini"
					incipit = 'incipit'

					references = "riferimenti bibliog."
					notes = "note"
				}
				else {
					creation_date = "Created on: "
					visits = "daily visits"
					size = "size"
					discussion = "discussion"
					issues = "issues"
					images = "images"
					incipit = "lead section"

					references = "references"
					notes = "notes"
				}

				let content = "<p style='margin: 0 0 .1rem 0; font-weight: bold;'>" + d.article + "</p>";
                content += "<p style='font-size: 0.8em; margin-bottom: 1rem;'>" + creation_date + format_date(d.first_edit) + "</p>"

                content += '<table>'
                
                // avg daily visits
                content += "<tr>"
				content += "<td class='label'>" + visits + "</td>"
				content += "<td class='value'>" + d.avg_pv.toLocaleString() + "</td>"
				content += "<td></td>"
				content += "</tr>"

                // size
				content += "<tr>"
				content += "<td class='label'>" + size + "<span style='color: #b9b9b9;'> (byte)</span></td>"
				content += "<td class='value'>" + d.size.toLocaleString() + "</td>"
				content += "<td></td>"
				content += "</tr>"


            	// discussion
				content += "<tr>"
				content += "<td class='label'>" + discussion + "<span style='color: #b9b9b9;'> (byte)</span></td>"
				content += "<td class='value'>" + d.discussion_size.toLocaleString() + "</td>"
				content += "<td></td>"
				content += "</tr>"

            	// incipit
				content += "<tr>"
				content += "<td class='label'>" + incipit + "<span style='color: #b9b9b9;'> (byte)</span></td>"
				content += "<td class='value'>" + d.incipit_size.toLocaleString() + "</td>"
				content += "<td></td>"
				content += "</tr>"

            	// issues
				content += "<tr>"
				content += "<td class='label'>" + issues + "</td>"
				content += "<td class='value'>" + d.issues.toLocaleString() + "</td>"
				content += "<td></td>"
				content += "</tr>"

				// images
				content += "<tr>"
				content += "<td class='label'>" + images + "</td>"
				content += "<td class='value'>" + d.images.toLocaleString() + "</td>"
				content += "<td></td>"
				content += "</tr>"

	            content += "</table>"
                return content;
            });
	    plot.call(tooltip);

       	const duration = 0
	    function handleMouseOver(){
			// hide circles
			d3.selectAll(".article_circles,.line_prev,.circle_prev")
				.transition()
				.duration(duration)
				.attr("opacity",0.2)

			// highlight
			d3.select(this)
				.transition()
				.duration(duration)
				.attr("opacity",1)

			d3.select(this.previousSibling).select(".circle_prev,.line_prev")
				.transition()
				.duration(duration)
				.attr("opacity",1)
		}

	    function handleMouseOut(){
			d3.selectAll(".article_circles")
				.transition()
				.duration(duration)
				.attr("opacity",1)

			d3.selectAll(".variation").select(".circle_prev")
				.transition()
				.duration(duration)
				.attr("opacity",0)

			d3.selectAll(".variation").select(".line_prev")
				.transition()
				.duration(duration)
				.attr("opacity",variation_line_opacity)
		}

		let articles = plot.append("g")	
			.attr("id","articles")
			.attr("transform","translate(" + shiftx_article + "," + (margin.top) + ")")	

		let article = articles.selectAll("g")
			.data(filtered_data)
			.enter()
			.append("g")
			.attr("class","article")
			.attr("id", function(d,i){
				return i
			})
			.attr("data-article", function(d,i){
				return d.article
			})
			.attr("data-subject", function(d,i){
				return d.subject
			})
			.attr("transform", function(d,i){
				return "translate(" + (x(i)+50) + ",0)"
			})
			.on("mouseover", tooltip.show) 
			.on("mouseout", tooltip.hide)

		let the_data;

		function display_data(region,the_sort){
			console.log(region,the_sort)

			article.remove()

			// filter data by region
			// ---------------------------
			if (region == 'all'){
				the_data = filtered_data.filter(item =>
					item.avg_pv > filter_item
				)
			}
			else {
				the_data = filtered_data.filter(item => item.region == region)
			}
			// console.log(the_data.length)

			// review the elements attributes
			// ---------------------------

			if (the_sort == 1) {
				min = 0
				max = the_data.length
			}
			else if (the_sort == 2){
				min = d3.max(the_data, function(d) { 
					return d.days;
				})
				max = d3.min(the_data, function(d) { 
					return d.days;
				})
			}
			else if (the_sort == 3){
				min = d3.min(the_data, function(d) { 
					return d.size;
				})
				max = d3.max(the_data, function(d) { 
					return d.size;
				})
			}
			else if (the_sort == 4){
				min = d3.min(the_data, function(d) { 
					return d.discussion_size;
				})
				max = d3.max(the_data, function(d) { 
					return d.discussion_size;
				})
			}
			else if (the_sort == 5){
				min = d3.min(the_data, function(d) { 
					return d.incipit_size;
				})
				max = d3.max(the_data, function(d) { 
					return d.incipit_size;
				})
			}
			else if (the_sort == 6){
				min = d3.min(the_data, function(d) { 
					return d.issues;
				})
				max = d3.max(the_data, function(d) { 
					return d.issues;
				})
			}
			else if (the_sort == 7){
				min = d3.min(the_data, function(d) { 
					return d.images;
				})
				max = d3.max(the_data, function(d) { 
					return d.images;
				})
			}
			// console.log(min, max)

			y_min = d3.min(the_data, function(d) { 
				return d.avg_pv;
			})

			y_max = d3.max(the_data, function(d) { 
				return d.avg_pv;
			})

			x = d3.scaleLinear()
				.domain([min,max])
				.range([0,width-100])

			y = d3.scaleLinear()
				.domain([0,y_max+(y_max/100*10)]) 
				.range([height-margin.top,0])

			tooltip
				.direction(function (d,i) {
					let direction = ''
					if (the_sort == 1) { // title
						direction = tooltip_direction(the_data, i, min, max, d.avg_pv, false)
					}
					else if (the_sort == 2){
						direction = tooltip_direction(the_data,d.days,min,max,d.avg_pv, true)
					}
					else if (the_sort == 3){
						direction = tooltip_direction(the_data,d.size,min,max,d.avg_pv, false)
					}
					else if (the_sort == 4){
						direction = tooltip_direction(the_data,d.discussion_size,min,max,d.avg_pv, false)
					}
					else if (the_sort == 5){
						direction = tooltip_direction(the_data,d.incipit_size,min,max,d.avg_pv, false)
					}
					else if (the_sort == 6){
						direction = tooltip_direction(the_data,d.issues,min,max,d.avg_pv, false)
					}
					else if (the_sort == 7){
						direction = tooltip_direction(the_data,d.images,min,max,d.avg_pv, false)
					}
					return direction 
				})

			svg.select("#yAxis")
			    .transition()
			    .duration(200)
			    .call(d3.axisLeft(y))

			d3.select('#grid')
				.transition()
			    .duration(200)
			    .call(d3.axisLeft(y)
			    	.tickSize(-width-margin.left-margin.right-60)
			    )

			// plot data
			// ---------------------------

			article = articles.selectAll("g")
				.data(the_data)
				.enter()
				.append("g")
				.attr("class","article")
				.attr("id", function(d,i){
					return i
				})
				.attr("data-article", function(d,i){
					return d.article
				})
				.attr("data-subject", function(d,i){
					return d.subject
				})
				.attr("transform", function(d,i){
					if (the_sort == 1) { // "article"
						x_position = "translate(" + (x(i)+50) + "," + 0 + ")"
					}
					else if (the_sort == 2){
						x_position = "translate(" + (x(d.days)+50) + "," + 0 + ")"
					}
					else if (the_sort == 3){
						x_position = "translate(" + (x(d.size)+50) + "," + 0 + ")"
					}
					else if (the_sort == 4){
						x_position = "translate(" + (x(d.discussion_size)+50) + "," + 0 + ")"
					}
					else if (the_sort == 5){
						x_position = "translate(" + (x(d.incipit_size)+50) + "," + 0 + ")"
					}
					else if (the_sort == 6){
						x_position = "translate(" + (x(d.issues)+50) + "," + 0 + ")"
					}
					else if (the_sort == 7){
						x_position = "translate(" + (x(d.images)+50) + "," + 0 + ")"
					}
					// console.log(d.article, x_position)
					return x_position
				})
				.on("mouseover", tooltip.show) 
				.on("mouseout", tooltip.hide)

			// articles
			let article_circles = article.append("g")
				.attr("class","article_circles")
				.attr("transform",function (d,i) {
					return "translate(" + 0 + "," + y(+d.avg_pv) + ")"
				})	
				.attr("id", function(d,i){
					return 'id_' + d.id_wikidata
				})
				.on("mouseover", handleMouseOver) 
				.on("mouseout", handleMouseOut)
				.append("a")
				.attr("xlink:href", function(d,i){
					return wiki_link + d.article
				})
				.attr("target","_blank")

			let circles = article_circles.append("circle")
				.transition()
				.duration(500)
				.delay(function(d,i){ 
					return i * 2
				})
				.attr("cx",0)
				.attr("cy",0)	
				.attr("fill", function(d,i){
					return "#00b2ff"
				})
				.attr("opacity",0.5)
				.attr("r",0)
				.transition()
				.ease(d3.easeLinear)
				.duration(500) 
				.attr("r", function(d,i){
					return r(Math.sqrt(d.size/3.14)) 
				})
				.attr("data-size", function(d,i){
					return d.size
				})

			let incipit = article_circles.append("circle")
				.transition()
				.duration(500)
				.delay(function(d,i){ 
					return i * 2
				})
				.attr("cx",0)
				.attr("cy",0)
				.attr("fill", function(d,i){
					return "#00b2ff"
				})
				.attr("opacity",0.5)
				.attr("r", function(d,i){
					return r(Math.sqrt(d.incipit_size/3.14))
				})
				.attr("data-incipit", function(d,i){
					return d.incipit_size
				})

			let discussion = article_circles.append("circle")
				.transition()
				.duration(500)
				.delay(function(d,i){ 
					return i * 2
				})
				.attr("cx",0)
				.attr("cy",0)
				.attr("stroke", function(d,i){
					return "#00b2ff"
				})
				.attr("fill","transparent")
				.attr("stroke-width",0.5)
				.attr("opacity",0.9)
				.attr("r",0)
				.transition()
				.delay(500)
				.ease(d3.easeLinear)
				.duration(500) 
				.attr("r", function(d,i){
					return r(Math.sqrt(d.discussion_size/3.14))
				})

			sidebar(1,the_data,the_sort)

			// sort data
			// ---------------------------
			const sort_box = document.getElementById('sort_article')
			sort_box.addEventListener("change", function() {
				const region_box = document.getElementById('regions')

				let new_sort = this.value;
				let new_region = region_box.options[region_box.selectedIndex].value;

				update_sort(new_region,new_sort)
			});

			function update_sort(region,the_sort){
				console.log(region,the_sort)

				// filter data by region
				// ---------------------------
				if (region == 'all'){
					the_data = filtered_data
				}
				else {
					the_data = filtered_data.filter(item => item.region == region)
				}

				if (the_sort == 1) {
					min = 0
					max = the_data.length
				}
				else if (the_sort == 2){
					min = d3.max(the_data, function(d) { 
						return d.days;
					})
					max = d3.min(the_data, function(d) { 
						return d.days;
					})
				}
				else if (the_sort == 3){
					min = d3.min(the_data, function(d) { 
						console.log(d.size)
						return d.size;
					})
					max = d3.max(the_data, function(d) { 
						return d.size;
					})
				}
				else if (the_sort == 4){
					min = d3.min(the_data, function(d) { 
						return d.discussion_size;
					})
					max = d3.max(the_data, function(d) { 
						return d.discussion_size;
					})
				}
				else if (the_sort == 5){
					min = d3.min(the_data, function(d) { 
						return d.incipit_size;
					})
					max = d3.max(the_data, function(d) { 
						return d.incipit_size;
					})
				}
				else if (the_sort == 6){
					min = d3.min(the_data, function(d) { 
						return d.issues;
					})
					max = d3.max(the_data, function(d) { 
						return d.issues;
					})
				}
				else if (the_sort == 7){
					min = d3.min(the_data, function(d) { 
						return d.images;
					})
					max = d3.max(the_data, function(d) { 
						return d.images;
					})
				}

				x = d3.scaleLinear()
					.domain([min,max])
					.range([0,width-100])

				svg.selectAll(".article")
		       		.data(the_data)
		       		.enter()
		       	// 	.append("div")

				svg.selectAll(".article")
					.transition()
					.attr("transform", function(d,i){
						if (the_sort == 1) { // "article"
							return "translate(" + (x(i)+50) + "," + 0 + ")"
						}
						else if (the_sort == 2){
							return "translate(" + (x(d.days)+50) + "," + 0 + ")"
						}
						else if (the_sort == 3){
							return "translate(" + (x(d.size)+50) + "," + 0 + ")"
						}
						else if (the_sort == 4){
							return "translate(" + (x(d.discussion_size)+50) + "," + 0 + ")"
						}
						else if (the_sort == 5){
							return "translate(" + (x(d.incipit_size)+50) + "," + 0 + ")"
						}
						else if (the_sort == 6){
							return "translate(" + (x(d.issues)+50) + "," + 0 + ")"
						}
						else if (the_sort == 7){
							return "translate(" + (x(d.images)+50) + "," + 0 + ")"
						}
					})

				tooltip
					.direction(function (d,i) {

						let direction = ''
						if (the_sort == 1) { // title
							direction = tooltip_direction(the_data, i, min, max, d.avg_pv, false)
						}
						else if (the_sort == 2){
							direction = tooltip_direction(the_data,d.days,min,max,d.avg_pv, true)
						}
						else if (the_sort == 3){
							direction = tooltip_direction(the_data,d.size,min,max,d.avg_pv, false)
						}
						else if (the_sort == 4){
							direction = tooltip_direction(the_data,d.discussion_size,min,max,d.avg_pv, false)
						}
						else if (the_sort == 5){
							direction = tooltip_direction(the_data,d.incipit_size,min,max,d.avg_pv, false)
						}
						else if (the_sort == 6){
							direction = tooltip_direction(the_data,d.issues,min,max,d.avg_pv, false)
						}
						else if (the_sort == 7){
							direction = tooltip_direction(the_data,d.images,min,max,d.avg_pv, false)
						}
						return direction 
					})

				sidebar(1,the_data,the_sort)
			}

		}
		display_data(region,the_sort)

		// chart scale
		// ---------------------------

		function chart_scale(){

			function update_scale(scale){
				y = d3.scaleLinear()

				if (scale == "linear"){
					y = d3.scaleLinear()
						.domain([0,y_max+(y_max/100*10)]) 
						.range([height-margin.top,0])
				}
				else if (scale == "log"){
					y = d3.scaleSymlog(10)
						.domain([0,y_max+(y_max/100*10)]) 
						.range([height-margin.top,0])
				}

				// articles
				svg.selectAll(".article_circles")
					.transition()
					.duration(200)
					.attr("transform",function (d,i) {
						return "translate(" + 0 + "," + y(+d.avg_pv) + ")"
					})	

				// y axis ticks text
				svg.select("#yAxis")
					.transition()
					.duration(200)
					.call(d3.axisLeft(y)) // it works

				d3.select('#grid')
					.transition()
					.duration(200)
					.call(d3.axisLeft(y)
						.tickSize(-width-margin.left-margin.right-60)
					)
				}

				function to_log(){
					update_scale("log")

					the_path = load_path() 
					scale_icon.style.background = "url(" + the_path + "assets/img/scale_linear.svg) center center / 55% no-repeat"
					scale = "log"

					tootip_linear.style.display = 'none'
					tootip_log.style.display = 'block'
				}

				function to_linear(){
					update_scale("linear")

					the_path = load_path() 
					scale_icon.style.background = "url(" + the_path + "assets/img/scale_log.svg) center center / 55% no-repeat"
					scale = "linear"

					tootip_log.style.display = 'none'
					tootip_linear.style.display = 'block'
				}

				let scale = "linear"
				const switch_scale = document.getElementById("scale_button")
				const scale_icon = document.getElementById("scale_button_icon")
				const tootip_linear = document.getElementById("scale_tooltip_linear")
				const tootip_log = document.getElementById("scale_tooltip_logarithmic")

				switch_scale.addEventListener('click', (event) => {
					if (scale == "linear"){
						to_log()
					}
					else if (scale == "log") {
						to_linear()
				    }
				})

				document.onkeydown = function (e) {
				    var key = e.key;
				    if(key == 1) { // s
						to_linear()
				    }
				    else if (key == 2){
				    	to_log()
				    }
				};
		}
		chart_scale()

		// filter data by region
		// ---------------------------

		const region_selection = document.getElementById('regions')

		region_selection.addEventListener('change', function() {
			let new_region = this.value;
			let new_sort =  $("#sort_article option:selected").val();

			display_data(new_region,new_sort)
		});


		// make the visualization responsive
		// ---------------------------
		function responsive_chart(width){

			svg
				.attr("width", width + (margin.right + margin.right))

			grid
				.call(make_y_gridlines()
					.tickSize(-width-margin.left-margin.right-60)
				)

			x = d3.scaleLinear()
				.domain([min,max])
				.range([0,width-100])

			svg.selectAll(".article")
				.transition()
				.attr("transform", function(d,i){
					if (the_sort == 1) { // "article"
						return "translate(" + (x(i)+50) + "," + 0 + ")"
					}
					else if (the_sort == 2){
						return "translate(" + (x(d.days)+50) + "," + 0 + ")"
					}
					else if (the_sort == 3){
						return "translate(" + (x(d.size)+50) + "," + 0 + ")"
					}
					else if (the_sort == 4){
						return "translate(" + (x(d.discussion_size)+50) + "," + 0 + ")"
					}
					else if (the_sort == 5){
						return "translate(" + (x(d.incipit_size)+50) + "," + 0 + ")"
					}
					else if (the_sort == 6){
						return "translate(" + (x(d.issues)+50) + "," + 0 + ")"
					}
					else if (the_sort == 7){
						return "translate(" + (x(d.images)+50) + "," + 0 + ")"
					}
				})
		}

		window.addEventListener("resize", (event) => {
			window_w = document.getElementById("dv2").offsetWidth;
			width = window_w - (margin.right + margin.right)

			responsive_chart(width)
		});

	}
}

// const array = [10, 'apple', 'A', 0, true]
// const object = {}

// const sports = ['footbal','golf','judo','boxe','karate'] 
// const sports_lenght = sports.length 

// console.log(sports_lenght)

function tooltip_direction(data,x,x_min,x_max,y,invert){

	let y_max = d3.max(data, function(d) { 
		return d.avg_pv;
	})

	x = parseInt(x)
	x_min = parseInt(x_min)
	x_max = parseInt(x_max)

	let n_s = ''
	let w_e = ''
	
	if (y > (y_max/3*2) ){
		n_s = 's'
	}
	else {
		n_s = 'n'
	}		

	if (invert == false){
		let range = x_max - x_min
		if (x < (x_min + range / 3)){
			w_e = 'e'
		}
		else if ( x > (x_min + range / 3 * 2) ) {
			w_e = 'w'
		}
	}
	else {
		let range = x_max - x_min
		if (x > (x_min + range / 3)){
			w_e = 'e'
		}
		else if ( x < (x_min + range / 3 * 2) ) {
			w_e = 'w'
		}
	}

	const direction = n_s + w_e
	return direction
}


window.onload = function() {
	dv2('all',1);
}