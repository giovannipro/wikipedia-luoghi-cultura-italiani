const container = "#dv3";
const font_size = 10;
const shiftx_article = 50;
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

function dv3(region, category, the_sort) {

	// size constants
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
	}

	width = window_w - (margin.right + margin.right),
	height = window_h - (margin.top + margin.bottom);

	const ticksAmount = 6;

	const issue_height = height/2.4;
	const features_height = height/2.4;
	const circle_size = 2;

	// load data
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
		
		// let bar_width = (width - (total * 2)) / total
		// console.log(bar_width)

		statistics(data)

		// svg and plot
		// ---------------------------
		let svg = d3.select(container)
			.append("svg")
			.attr("width", width + (margin.right + margin.right))
			.attr("height",height + (margin.top + margin.bottom))
			.attr("id", "svg")

		// scale 
		// ---------------------------

		let total = filtered_data.length
		let article_width = ((width-margin.left*2) - (h_space*(total-1))) / total

		let max_range = article_width/2 * circle_size

		if (article_width > 50){
			max_range = article_width / 2 * 1
		}
		// console.log(article_width,max_range)

		let issues_max = 4
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

		let r_size = d3.scaleLinear()
			.domain([0, max_size])
			.range([1,max_range])

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

		let grid_issues = grids.append("g")
			.attr("id","grid_issues")
			.attr("transform", "translate(-1," + margin.top + ")")
			.call(make_issue_gridlines()
				.ticks(ticksAmount)
				.tickValues(d3.range(0,issues_max,1))
          		.tickSize(-width-margin.left-margin.right-60)
			)

        let grid_features = grids.append("g")
			.attr("id","grid_features")
			.attr("transform", "translate(-1," + (margin.top + v_shift + (height/2)) + ")")
			.call(make_features_gridlines()
				.ticks(ticksAmount)
          		.tickValues(d3.range(0,my_max_features,25) )
          		.tickSize(-width-margin.left-margin.right-60) 
          	)

		// axis
		// ---------------------------

		let axis = axis_grid.append("g")
			.attr("id","axis")

		let axis_issues = axis.append("g")
			.attr("transform", "translate(" + (margin.left*1) + "," + (margin.top + (v_shift*4.5)) + ")") // v_shift
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
			// .attr("transform", "translate(" + 50 + "," + margin.top + ")");

		let articles = plot.append("g")	
			.attr("id","articles")
			.attr('transform',"translate(" + shiftx_article + "," + margin.top + ")") 

		let tooltip = get_tooltip('dv3')
       	plot.call(tooltip);

		function display_data(region, category, the_sort){
       		console.log(region, category, the_sort)

       		if (d3.selectAll('.article')){
				d3.selectAll('.article').remove()
			}

       		// filter data by region and category
			// ---------------------------
			if (region == 'all'){
				filtered_data = data.filter(item =>
					item.issues > filter_item
				)
			}
			else {
				filtered_data = data.filter(item => 
					item.issues > filter_item
				)
				.filter(item =>
					item.region == region
				)
			}

			if (category != 'all'){
				filtered_data = filtered_data.filter(item =>
					item.category == category
				)
			}
			console.log(category, filtered_data)

			if (filtered_data.length == 0){
				show_no_data()
			}

			// review the elements attributes
			// ---------------------------

			// total = filtered_data.length
			// article_width = ((width-margin.left*2) - (h_space*(total-1))) / total
			
			// x.domain([0,article_width * filtered_data.length]) 

			// plot data
			// ---------------------------

			let article = articles.selectAll("g")
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
				.attr("x",0)
				.attr("y",y_issues(issues_max))
				.attr("height",0)
				.attr("width",article_width)
				.attr("fill","red")
				.attr("class","article_rect")
				.attr("data-issue", function(d,i){
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

			// tooltip
			// 	.offset(function (d,i){
			// 		let direction = ''
			// 		let off = [0,0] // [top, left]

			// 		if (the_sort == 1) { // title
			// 			direction = tooltip_direction(filtered_data, i, min, max, d.avg_pv, false)
			// 		}
			// 		else if (the_sort == 2){
			// 			direction = tooltip_direction(filtered_data,d.days,min,max,d.avg_pv, true)
			// 		}
			// 		else if (the_sort == 3){
			// 			direction = tooltip_direction(filtered_data,d.size,min,max,d.avg_pv, false)
			// 		}
			// 		else if (the_sort == 4){
			// 			direction = tooltip_direction(filtered_data,d.discussion_size,min,max,d.avg_pv, false)
			// 		}
			// 		else if (the_sort == 5){
			// 			direction = tooltip_direction(filtered_data,d.incipit_size,min,max,d.avg_pv, false)
			// 		}
			// 		else if (the_sort == 6){
			// 			direction = tooltip_direction(filtered_data,d.issues,min,max,d.avg_pv, false)
			// 		}
			// 		else if (the_sort == 7){
			// 			direction = tooltip_direction(filtered_data,d.images,min,max,d.avg_pv, false)
			// 		}
			// 		// console.log(d.article, direction)
			// 		// let size = (r(Math.sqrt(d.size/3.14)) * 0.10) + 20
			// 		if (direction == 'nw'){
			// 			off = [-10,-10] 
			// 		}
			// 		else if (direction == 'n'){
			// 			off = [-10,0] 
			// 		}
			// 		else if (direction == 'ne'){
			// 			off = [-10,-10] 
			// 		}

			// 		return off
			// 	})
			// 	.direction(function (d,i) {
			// 		let direction = ''
			// 		if (the_sort == 1) { // title
			// 			direction = tooltip_direction(filtered_data, i, min, max, d.avg_pv, false)
			// 		}
			// 		else if (the_sort == 2){
			// 			direction = tooltip_direction(filtered_data,d.days,min,max,d.avg_pv, true)
			// 		}
			// 		else if (the_sort == 3){
			// 			direction = tooltip_direction(filtered_data,d.size,min,max,d.avg_pv, false)
			// 		}
			// 		else if (the_sort == 4){
			// 			direction = tooltip_direction(filtered_data,d.discussion_size,min,max,d.avg_pv, false)
			// 		}
			// 		else if (the_sort == 5){
			// 			direction = tooltip_direction(filtered_data,d.incipit_size,min,max,d.avg_pv, false)
			// 		}
			// 		else if (the_sort == 6){
			// 			direction = tooltip_direction(filtered_data,d.issues,min,max,d.avg_pv, false)
			// 		}
			// 		else if (the_sort == 7){
			// 			direction = tooltip_direction(filtered_data,d.images,min,max,d.avg_pv, false)
			// 		}
			// 		return direction 
			// 	})

			min_circle_size = 1
			sidebar(3,filtered_data,the_sort)
		}
		display_data(region, category, the_sort)


		// filter data by region
		// ---------------------------
		
		const select_region = document.getElementById("regions")
		const select_category = document.getElementById("categories")
		const select_sort = document.getElementById("sort_article")

		select_region.addEventListener('change', function() {
			let new_region = this.value;
			let new_category = select_category.value;
			let new_sort = parseInt(select_sort.value);

			display_data(new_region, new_category, new_sort)
		});

		// filter data by category
		// ---------------------------

		select_category.addEventListener('change', function() {
			let new_region = select_region.value;
			let new_category = this.value;
			let new_sort = parseInt(select_sort.value);

			display_data(new_region, new_category, new_sort)
		});

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

	    function show_no_data(){
	    	console.log('no data')
	    }

	    // sort data
		// ---------------------------
		select_sort.addEventListener("change", function() {
			let new_region = select_region.value;
			let new_category = select_category.value;
			let new_sort = this.value;

			update_sort(new_region,new_sort)
		});

		function update_sort(region,the_sort){
			the_sort = parseInt(the_sort)

			// sort
			if (the_sort == 1){
				filtered_data = filtered_data.sort(function(a, b){
					return d3.descending(+a.issues, +b.issues);
				})
			}
			else if (the_sort == 2){
				filtered_data = filtered_data.sort(function(a, b){
					return d3.ascending(a.article, b.article);
				})
			}
			else if (the_sort == 3){
				filtered_data = filtered_data.sort(function(a, b){
					return d3.descending(+a.references, +b.references);
				})
			}
			else if (the_sort == 4){
				filtered_data = filtered_data.sort(function(a, b){
					return d3.descending(+a.notes, +b.notes);
				})
			}
			else if (the_sort == 5){
				filtered_data = filtered_data.sort(function(a, b){
					return d3.descending(+a.images, +b.images);
				})
			}
			else if (the_sort == 6){
				filtered_data = filtered_data.sort(function(a, b){
					return d3.descending(+a.size, +b.size);
				})
			}

			filtered_data.forEach(function(d,i){
				d.new_id = i;
			})

			if (filtered_data.length < 10){
				article_width = 100
			}

			x.domain([0, filtered_data.length]) 

			svg.selectAll(".article")
				.transition()
				.attr("transform", function(d,i){
					return "translate(" + x(d.new_id) + "," + 0 + ")"
				})

			sidebar(3,filtered_data,the_sort)
		}

		// make the visualization responsive
		// ---------------------------
		function responsive_chart(width){

			if (width <= 768){
				translate_articles = 40
				reduction = 0

			}
			else {
				translate_articles = shiftx_article
				reduction = 100
			}
			// console.log(width, translate_articles, reduction)

			svg
				.attr("width", width + (margin.right + margin.right))
			
			grid_issues 
				.call(make_issue_gridlines()
					.ticks(ticksAmount)
    	      		.tickSize(-width-margin.left-margin.right-60)
          		)

			grid_features
				.call(make_issue_gridlines()
					.ticks(ticksAmount)
          			.tickSize(-width-margin.left-margin.right-60)
          		)

			x = d3.scaleLinear()
				.domain([0,filtered_data.length])
				.range([0,width - reduction])

			articles.attr("transform","translate(" + translate_articles + "," + margin.top + ")") 

			svg.selectAll(".article")
				.transition()
				.attr("transform", function(d,i){
					x_position = 0

					if (the_sort == 1) { // "article"
						x_position = x(i)
					}
					else if (the_sort == 2){
						x_position = x(d.days)
					}
					else if (the_sort == 3){
						x_position = x(d.size)
					}
					else if (the_sort == 4){
						x_position = x(d.discussion_size)
					}
					else if (the_sort == 5){
						x_position = x(d.incipit_size)
					}
					else if (the_sort == 6){
						x_position = x(d.issues)
					}
					else if (the_sort == 7){
						x_position = x(d.images)
					}
					else { // the_sort === undefined
						x_position = x(i)
					}
					// console.log(d.article,min,max,d.size,width,x_position)
					return "translate(" + x_position + "," + 0 + ")"
				})
				

			svg.selectAll(".article_rect")
				.attr("width", function(d,i){
					rect_width = ((width-margin.left*2) - (h_space*(total-1))) / total // (width / filtered_data.length) - 8// - (1 * filtered_data.length)
					
					if (rect_width < 1) {
						rect_width = 1
					}

					console.log(rect_width)
					return rect_width
				})
		}

		window.addEventListener("resize", (event) => {
			window_w = document.getElementById("dv3").offsetWidth;
			width = window_w - (margin.right + margin.right)

			responsive_chart(width)
		});

	}
}

function tooltip_direction(data,x,x_min,x_max,y,invert){

}

window.onload = function() {
	dv3('all', 'all', 1);
}