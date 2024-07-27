const container = "#dv3";
const font_size = 10;
const shiftx_article = 30;
const v_shift = 8;
const h_space = 2;
const wiki_link = "https://it.wikipedia.org/wiki/";
const filter_item = 1; // number of issues
// const article_width = 5;

let c_issues = '#EC4C4E',
	c_reference = '#49A0D8',
	c_note = '#A8D2A2',
	c_image = '#F5A3BD',
	c_days = '#9e9e9e',
	c_line = '#9E9E9E';

const stroke_dash = "2,2"

let window_w = document.getElementById("dv3").offsetWidth;
	window_h = document.getElementById("dv3").offsetHeight;

if (window_w <= 768){
	reduction = 10;
}
else {
	reduction = 0;
}

let margin = {
		top: 10, 
		left: 40-reduction, 
		bottom: 20, 
		right: 25-reduction
	},

	width = window_w - (margin.right + margin.right),
	height = window_h - (margin.top + margin.bottom);

const ticksAmount = 10;

const issue_height = height/2.4;
const features_height = height/2.4;
const circle_size = 2;

function dv3() {

	d3.tsv("../assets/data/voci.tsv")
		.then(loaded)

	function loaded(data) {

		data = format_data(data)
		filtered_data = data.filter(item =>
			item.issues > filter_item
		)

		// count features
		filtered_data.map(item =>{
			item.features = item.references + item.notes + item.images
		})
		console.log(filtered_data)
		
		let total = filtered_data.length


		// svg and plot
		// ---------------------------
		let svg = d3.select(container)
			.append("svg")
			.attr("width", width + (margin.right + margin.right))
			.attr("height",height + (margin.top + margin.bottom))
			.attr("id", "svg")

		// scale 
		// ---------------------------
		let issues_max = 3
		// let issues_max = d3.max(filtered_data, function(d) { 
		// 	return d.issues
		// })

		let max_features = 80
		// let max_features = d3.max(filtered_data, function(d) {
		// 	return d.features
		// })
		// console.log(max_features)

		// min and max size
		min_size = d3.min(filtered_data, function(d) { 
			return d.size;
		})
		max_size = d3.max(filtered_data, function(d) { 
			return d.size;
		})

		let my_max_features = max_features;

		let x = d3.scaleLinear()
			.domain([0,filtered_data.length]) 
			.range([0,width-(margin.left*1)])

		let y_issues = d3.scaleLinear()
			.domain([0,issues_max]) 
			.range([0,issue_height])

		let y_issues_text = d3.scaleLinear()
			.domain([issues_max,0]) 
			.range([0,issue_height])

		let y_features = d3.scaleLinear()
			.domain([0,my_max_features]) 
			.range([0,features_height])

		// grid
		// ---------------------------

		let axis_grid = svg.append("g")
			.attr("id","axis_grid")

		let grids = axis_grid.append("g")
			.attr("id","grids")

		function make_issue_gridlines() {		
	    	return d3.axisLeft(y_issues)
		}

		function make_features_gridlines() {		
	    	return d3.axisLeft(y_features)
		}

		// axis
		// ---------------------------

		let axis = axis_grid.append("g")
			.attr("id","axis")

		let axis_issues = axis.append("g")
			.attr("transform", "translate(" + (margin.left*1) + "," + (margin.top + (v_shift*2.1)) + ")") // v_shift
			.call(d3.axisLeft(y_issues_text)
				.ticks(ticksAmount)
				.tickValues(d3.range(0,issues_max,1))
				.tickFormat(d3.format("d"))
			)
			.attr("id","yAxis_issues")

		let x_features_axis = d3.scaleLinear()
			.domain([my_max_features,0]) 
			.range([features_height,0])

		let axis_features = axis.append("g")
			.attr("transform", "translate(" + (margin.left*1) + "," + (margin.top + (height/2)+(v_shift*1)) + ")") 
			.call(d3.axisLeft(x_features_axis)
				.ticks(ticksAmount)
				.tickValues(d3.range(0,my_max_features,50))
			)
			.attr("id","yAxis_features")

		// plot
		// ---------------------------
		let plot = svg.append("g")
			.attr("id", "d3_plot")
			.attr("transform", "translate(" + 50 + "," + margin.top + ")");

		// tooltip
		// ---------------------------
		let tooltip = d3.tip()
			.attr('class', 'tooltip')
			.attr('id', 'tooltip_dv3')
			.direction(function (d,i) {
				let length = filtered_data.length
				let n_s = ''
				let w_e = ''
				let direction = ''

				if (d.issues > 2 ){
					n_s = 's'
				}
				else {
					n_s = 'n'
				}

				if (i < length / 3){
					w_e = 'e'
				}
				else if (i > (length / 3 * 2) ) {
					w_e = 'w'
				}

				direction = n_s + w_e

				return direction
			})
			.offset(function (d,i){
				return [-20,0]
			})
			.html(function(d) {

				let params = new URLSearchParams(window.location.search);
				if (params.has('lang') == true) {
					lang = params.get('lang')
				}

				lang = 'it'

				if (lang == 'it'){
					creation_date = "Creato il: "
					issues = "avvisi"
					references = "riferimenti bibliog."
					notes = "note"
					images = "immagini"
				}
				else {
					creation_date = "Created on: "
					issues = "issues"
					references = "references"
					notes = "notes"
					images = "images"
				}

				let content = "<p style='margin: 0 0 8px 3px; font-weight: bold;'>" + d.article + "</p>";
                // content += "<span style='font-size: 0.8em;'>" + creation_date + format_date(d.first_edit) + "</span></p><table>"

				content += '<table>'

	            // issues
				content += "<tr>"
				content += "<td class='label'>" + issues + "</td>"
				content += "<td class='value'>" + d.issues.toLocaleString() + "</td>"
				content += "<td></td>"
				content += "</tr>"

                // references
				content += "<tr>"
				content += "<td class='label'>" + references + "</td>"
				content += "<td class='value'>" + d.references.toLocaleString() + "</td>"
				content += "<td></td>"
				content += "</tr>"

				// notes
				content += "<tr>"
				content += "<td class='label'>" + notes + "</td>"
				content += "<td class='value'>" + d.notes.toLocaleString() + "</td>"
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
	        })
       	plot.call(tooltip);


       	// plot data
		// ---------------------------

		let article = plot.append("g")	
			.attr("id","articles")
			.selectAll("g")
			.data(filtered_data)
			.enter()
			.append("g")
			.sort(function(a, b) {
	  			return d3.descending(a.issues, b.issues);
			})
			.attr("class","article")
			.attr("data-title", function(d,i){
				return d.article
			})
			.attr("id", function(d,i){
				return 'id_' + d.id_wikidata
			})
			.attr("transform", function(d,i){
				return "translate(" + x(i) + "," + 0 + ")"
			})
			.on("mouseover", handleMouseOver)
			.on("mouseout", handleMouseOut)
			.append("a")
			.attr("xlink:href", function(d,i){
				return wiki_link + d.article
			})
			.attr("target","_blank")
			.on("mouseover", tooltip.show) 
			.on("mouseout", tooltip.hide)

		// article circle
		let article_width = ((width-margin.left*2) - (h_space*(total-1))) / total

		let max_range = article_width/2 * circle_size

		if (article_width > 50){
			max_range = article_width / 2 * 1
		}
		// console.log(article_width,max_range)

		// if ( (article_width) > 40){
		// 	article_width = 40
		// // 	console.log(article_width)
		// // 	article_width = 40
		// // 	console.log(article_width/2 * circle_size)
		// }

		let r_size = d3.scaleLinear()
			.domain([0, max_size])
			.range([1,max_range])

		let article_circle = article.append("circle")
			.attr("class","article_c")
			.attr("cx", article_width/2)
			.attr("cy", height/2 - (height*0.04)) // -10
			.attr("r", function(d) {
				size = r_size(d.size)
				return size 
			})
			.style("fill", function(d,i) {
				return apply_color(d.subject)
			})
			.style("opacity",0.5)

		// incipit
		let article_incipit = article.append("circle")
			.attr("class","incipit_c")
			.attr("cx", article_width/2)
			.attr("cy", height/2 - (height*0.04))
			.attr("r", function(d) {
				incipit = r_size(d.incipit_size)
				// console.log(d.article, d.size, d.incipit_size)
				return incipit 
			})
			.style("fill", function(d,i) {
				return apply_color(d.subject)
			})
			.style("opacity",0.5)

		// discussion
		let article_discussion = article.append("circle")
			.attr("class","discussion_c")
			.attr("cx", article_width/2)
			.attr("cy", height/2 - (height*0.04))
			.attr("r", function(d) {
				discussion = r_size(d.discussion_size)
				return discussion 
			})
			.style("opacity",0.9)
			.attr("stroke", function(d,i){
				return apply_color(d.subject)
			})
			.attr("fill","transparent")
			.attr("stroke-width",0.5)

		//issues
		let issues = article.append("rect")
			.attr("class","issue_b")
			.attr("x",0)
			.attr("y",y_issues(issues_max))
			.attr("height",0)
			.attr("width",article_width)
			.attr("fill","red")
			.attr("class", function(d,i){
				return "iss " + d.issues 
			})
			.transition()
			.attr("height", function(d,i){
				return y_issues(d.issues) 
			})
			.attr("y",function(d,i){
				return y_issues(issues_max - d.issues)
			})

		let i_grid = [0,1,2,3,4,5,6,7,8,9]

		let issues_tick = article.selectAll("rect")
			.data(i_grid)
			.enter()
			.append("rect")
			.attr("fill","white")
			.attr("width",article_width + 2)
			.attr("height",5)
			.attr("y", (d, i) => y_issues (i) - 2)
			.attr("x", 0)

		// features
		let features = article.append("g")
			.attr("transform", function(d,i){
				return "translate(" + 0 + "," + ((height/2)+v_shift) + ")"
			})
			.attr("class", function(d,i){
				return "features"
			})
			.attr("data-features", function(d,i){
				return d.features
			})

		let images = features.append("rect")
			.attr("x",0)
			.attr("y",0)
			.attr("width",article_width)
			.attr("fill",c_image)
			.attr("class", function(d,i){
				return "feat img_" + d.images 
			})
			.attr("height",0)
			.transition()
			.attr("height", function(d,i){
				return y_features(d.references + d.notes + d.images)
			})

		let notes = features.append("rect")
			.attr("x",0)
			.attr("y",0)
			.attr("width",article_width)
			.attr("fill",c_note)
			.attr("class", function(d,i){
				return "feat not_" + d.notes 
			})
			.attr("height",0)
			.transition()
			.attr("height", function(d,i){
				return y_features(d.references + d.notes)
			})

		let references = features.append("rect")
			.attr("x",0)
			.attr("y",function(d,i){
				return 0
			})
			.attr("width",article_width)
			.attr("fill",c_reference)
			.attr("class", function(d,i){
				return "feat ref_" + d.references 
			})
			.attr("height", 0)
			.transition()
			.attr("height", function(d,i){
				return y_features(d.references)
			})

		// mouse hover
		function handleMouseOver(){
			d3.selectAll(".article")
				.attr("opacity",0.2)

			d3.select(this)
				.attr("opacity",1)
		}

	    function handleMouseOut(){
			d3.selectAll(".article")
				.attr("opacity",1)
	    }
	}
}

window.onload = function() {
	dv3();
}