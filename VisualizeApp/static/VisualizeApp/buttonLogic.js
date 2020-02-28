//CTRL + K, CTRL + 1
//CTRL + K, CTRL + J

//css.getPropertyValue('--main-graph-color')

//Visualizer map popup
model = document.querySelector(".model");
closeBtn = document.querySelector(".close-btn");
header = document.getElementById("stationHeader");
subheader = document.getElementById("stationSubHeader");
text = document.getElementById("text");
container = document.getElementById("model-content");

css = getComputedStyle(document.documentElement)

maxDetail = false;

Station = 'None';
Type = 'None';

//W & H of first bar chart
overallBarWidth = 500;
overallBarHeight = 400;
margin = 100;
xBarScale = 0;
yBarScale = 0;

//Scales for line chart
xLineScale = 0;
yLineScale = 0;

//Pie values
pieWidth = 500;
pieHeight = 400;
pieMargin = 100;
radius = 200;

function onClicked(message) //On clicked - Map popup button
{
	//Change header of popup
	headerText = message.siblings('h3').text();
	model.style.display = "block";
	
	header.innerHTML = headerText;
	subheader.innerHTML = "Loading...";

	//Create div and text elements
	var div = document.createElement("div");
	div.id = "mainContainer";
	container.appendChild(div); 

		//Create overall stat container
		createElement("div", "overallStatContainer", "mainContainer");

			/*Create text elements
			//createElement(Type, ID, ParentID)
			createElement("P", "overallCalls", "overallStatContainer");*/

	//Fetch line 2 data and draw
	/*$.when(fetchLine2Data(headerText, "Overall", "NA")).done(function(returnLine2Val){
		createLineChart(returnLine2Val, headerText, "Overall", "NA", "bar2svg", "Average Response Time | Type: Overall | Year: All", 680, "NA", "NA");	
	});*/
	
	/*Fetch bar 2 data and draw
	$.when(fetchBar2Data(headerText, "Overall", "NA")).done(function(returnBar2Val){
		createBarChart(returnBar2Val, headerText, "Overall", "NA", "catBarsvg", "Time Category Counts", 1200);
	});*/

	//Request from DB
	$.ajax({
		contentType: "application/x-www-form-urlencoded;charset=UTF-8",
		type: "POST",
		url: "http://localhost:8000/map/get_overall_data/",
		datatype: "json",
		async: true,
		data: {"station": headerText},
		success: function(json)
		{
			/*$('#overallCalls').html("Overall " + json.message[0]);*/
			text = createElement("h4", "filterText", "overallStatContainer");
			text.innerHTML = "<i>Filter by type:</i>";

			createOverall("Overall", json.message[0], "Overallsvg", headerText);
			createOverall("DA", json.message[1], "DAsvg", headerText);
			createOverall("DF", json.message[2], "DFsvg", headerText)

			//Fetch BarLine data and draw
			$.when(fetchBarLineData(headerText, "Overall", "NA", "NA", "NA")).done(function(returnVal){
					//createBarChart(returnVal, headerText, "Overall", "NA", "linesvg", "Station Calls Per Year | Type: Overall | Year: All", 500);
					createLineChart(returnVal, headerText, "Overall", "NA", "barsvg", "Station Calls Per Year | Type: Overall | Year: All | Month: NA | Day: NA", 1200, "NA", "NA");

				//Fetch pie data and draw
				/*$.when(fetchPieData(headerText, "Overall", "NA")).done(function(returnPieVal){
					createPieChart(returnPieVal, headerText, "Overall", "NA", "Most Common Incidents | Type: Overall | Year: All");		
				});*/
			});
				
			//Change loading text
			subheader.innerHTML = "Station Information";
		}
	});
}

closeBtn.onclick = function()
{
  removeBlock("mainContainer");
}

window.onclick = function(e)
{
	if(e.target == model)
	{
    	removeBlock("mainContainer");
	}
}

function removeBlock(ID)
{
	model.style.display = "none";
	text = document.getElementById(ID);
	text.parentNode.removeChild(text);
}

/* -------------------- CREATE ELEMENT FUNCTION -------------------- */

function createElement(elementType, id, appendTo)
{
	parentContainer = document.getElementById(appendTo);

	newElement = document.createElement(elementType);
	newElement.id = id;
	parentContainer.appendChild(newElement);

	return newElement;
}

/* -------------------- D3 Visualizations -------------------- */

//Create menu buttons
function createOverall(Type, Input, ID, Station)
{
	mainContainer = document.getElementById("mainContainer");
	
	width = 400;
	height = 80;

	//Create new SVG canvas
	const svgOverall = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svgOverall.id = ID;
	svgOverall.setAttribute("width", width);
	svgOverall.setAttribute("height", height);
	mainContainer.appendChild(svgOverall); 

	var svg = d3.select("#" + ID)

	//Create group elements
	var overallG = svg.append("g")
	            	  .attr("transform", "translate(" + 0 + "," + 0 + ")")
	            	  .on("mouseover", handleMouseOver)
         			  .on("mouseout", handleMouseOut)
         			  .on("click", handleClick)
	overallG.id = "test";

	//Name
	overallG.append("text")
   		   .attr("transform", "translate(15, -5)")
   		   .attr("x", 0)
   		   .attr("y", height/2)
   		   .attr("dy", "0em")
   		   .attr("font-size", "35px")
   		   .attr("font-weight", "bold")
   		   .attr("fill", css.getPropertyValue('--main-graph-color'))
   		   .attr("id", "filterHeader");

   	//Set type text
   	if(Type == "Overall")
   	{
   		overallG.select("#filterHeader")
   				.text("Total Calls");
   	}

   	else if (Type == "DA")
   	{
   		overallG.select("#filterHeader")
   				.text("Ambulance");
   	}

   	else
   	{
   		overallG.select("#filterHeader")
   				.text("Fire Brigade")
   	}

   	//Line
   	overallG.append("line")
            .attr("x1", 0)
            .attr("y1", height/2)
            .attr("x2", width)
            .attr("y2", height/2)
            .attr("stroke-width", 0.3)
	    	.attr("stroke", "black");

   	//Number
   	overallG.append("text")
   		   .attr("transform", "translate(15, 0)")
   		   .attr("x", 0)
   		   .attr("y", height/2)
   		   .attr("dy", "1em")
   		   .attr("font-size", "30px")
   		   .attr("id", "numVal")
   	 	   .text(Input);

   	//Create mouseover events
   	/*d3.select("#" + ID)
   			.on("mouseover", handleMouseOver)
         	.on("mouseout", handleMouseOut)
         	.on("click", handleClick);*/

   	function handleMouseOver(d, i) 
	{
		group = d3.select(this)
         
        group.select("#filterHeader")    
        	.transition()
	      	.style("fill", css.getPropertyValue('--mouse-over-graph-color'));

	    group.select("#numVal")    
        	.transition()
	      	.style("fill", css.getPropertyValue('--mouse-over-graph-color'));
	}

	function handleMouseOut(d, i) 
	{
        group = d3.select(this)
         
        group.select("#filterHeader")    
        	.transition()
	      	.style("fill", css.getPropertyValue('--main-graph-color'));

	    group.select("#numVal")    
        	.transition()
	      	.style("fill", "rgb(0, 0, 0)");	
    }

    function handleClick(d, i) 
	{
		maxDetail = false;
		callUpdate(Station, Type, "NA", "NA", "NA");
    }
}

/* ---------- Total CallsBar chart ---------- */
/* ---------- Time Categories Bar ---------- */
function createBarChart(inputData, Station, Type, Year, ID, title, width)
{
	//Process data	
	list = JSON.stringify(inputData);
	parsed = JSON.parse(list);

	//Transform the data
	data = Object.keys(parsed)
				 .map(function(key) { return [Number(key), parsed[key]]; });

	console.log(data);

	mainContainer = document.getElementById("mainContainer")
	
	//Create new SVG canvas
	const svgGraph = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svgGraph.id = ID;
	svgGraph.setAttribute("width", width);
	svgGraph.setAttribute("height", overallBarHeight);
	mainContainer.appendChild(svgGraph); 
	
	//Create new bar chart
	var svg = d3.select("#" + ID),
        margin = 100,
        width = svg.attr("width") - margin,
        height = svg.attr("height") - margin;

    xBarScale = d3.scaleBand().range ([0, width]).padding(0.2),
    yBarScale = d3.scaleLinear().range ([height, 0]);

    var g = svg.append("g")
               .attr("transform", "translate(" + 50 + "," + 50 + ")")
               .attr("id", "mainGroup");
    
    //Create graph scale
    xBarScale.domain(data.map(function(d) { return d[0]; }));
    yBarScale.domain([0, d3.max(data, function(d) { return d[1]; })]);

    g.append("g")
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(xBarScale))
     .attr("id", "xAxis");

    g.append("g")
     .call(d3.axisLeft(yBarScale).tickFormat(function(d){
         return d;
     }).ticks(7))
     .attr("id", "yAxis")
     .append("text")
     .attr("y", 6)
     .attr("dy", "0.71em")
     .attr("text-anchor", "end")
     .text("value");

    //Add bars
    g.selectAll(".bar")
     .data(data)
     .enter().append("rect")
     .attr("class", "bar")
     .attr("x", function(d) { return xBarScale(d[0]); })
     .attr("y", function(d) { return yBarScale(d[1]); })
     .attr("width", xBarScale.bandwidth())
     .attr("height", 10)
     .on("mouseover", handleMouseOver)
     .on("mouseout", handleMouseOut)
     .on("click", handleClick);

    //Add title text
    svg.append("text")
		.attr("transform", "translate(15,0)")
		.attr("x", 0)
		.attr("y", 20)
		.attr("font-size", "18px")
		.attr("id", "title")
	 	.text(title)

	//Add divider bar under text
	svg.append("line")
       .attr("x1", 0)
       .attr("y1", 25)
       .attr("x2", svg.attr("width"))
       .attr("y2", 25)
       .attr("stroke-width", 0.3)
       .attr("stroke", "black");

  	g.selectAll(".bar")
  		.data(data)
  		.transition("GrowBar")
        .ease(d3.easeLinear)
        .duration(500)
        .attr("height", function(d) { return height - yBarScale(d[1]); })

    g.selectAll(".bar")
      	.transition("ColourBar")
      	.delay(500)
      	.style("fill", css.getPropertyValue('--main-graph-color')); 

    //Define tooltip
	var popUp = d3.select("body").append("div")		
    			   .attr("class", "tooltip")				
    			   .style("opacity", 0);	

	/* FUNCTIONS FOR BAR CHART */

	function handleMouseOver(d, i) 
	{
        d3.select(this)
        	.transition()
      		.style("fill", css.getPropertyValue('--mouse-over-graph-color'));

      	popUp.transition()		
             .duration(200)		
             .style("opacity", .9);		
        popUp.html("<p class = 'popUpText'><b><i>" + d[0] + "</b></i><br>" + d[1] + "</p>")	
             .style("left", (d3.event.pageX) + "px")		
             .style("top", (d3.event.pageY - 30) + "px");
	}

	function handleMouseOut(d, i) 
	{ 
        d3.select(this)
        	.transition()
      		.style("fill", css.getPropertyValue('--main-graph-color'));

      	popUp.transition()		
           .duration(500)		
           .style("opacity", 0);	
    }

    function handleClick(d, i, year) 
	{
		d3.select(this)
          .transition()
      	  .style("fill", css.getPropertyValue('--mouse-click-graph-color'));

      	popUp.transition()		
           .duration(500)		
           .style("opacity", 0);

		callUpdate(Station, Type, d[0])
    }
}

function updateBarChart(inputData, station, type, year, ID, title)
{
	list = JSON.stringify(inputData);
	parsed = JSON.parse(list);

	//Transform the data
	var data = Object.keys(parsed).map(function(key) {
  		return [Number(key), parsed[key]];
	});

	// Select the section we want to apply our changes to
	var svg = d3.select("#" + ID)
	var g = svg.select("#mainGroup")
  
	height = d3.select("#" + ID).attr("height") - 100; //(margin)

	xBarScale = d3.scaleBand().range ([0, svg.attr("width") - margin]).padding(0.2)

	// Scale the range of the data again 
	xBarScale.domain(data.map(function(d) { return d[0]; }));
    yBarScale.domain([0, d3.max(data, function(d) { return d[1]; })]);

	//Remove old bars
	g.selectAll(".bar")
	.transition("RemoveBar")
	.duration(500)
	.attr("height", 0)
	.remove();

	//Redraw new bars
	g.selectAll("bar")
     .data(data)
     .enter().append("rect")
     .attr("class", "bar")
     .attr("x", function(d) { return xBarScale(d[0]); })
     .attr("y", function(d) { return yBarScale(d[1]); })
     .attr("width", xBarScale.bandwidth())
     .attr("height", 0)
     .on("mouseover", handleMouseOver)
 	 .on("mouseout", handleMouseOut)
 	 .on("click", handleClick)
     .transition("RedrawBar")
     .ease(d3.easeLinear)
     .duration(500)
     .delay(500)
     .attr("height", function(d) { return height - yBarScale(d[1]); })
     .style("fill", css.getPropertyValue('--main-graph-color'));
	
    //Update X-Axis    
	svg.select("#xAxis") 
	   .transition("UpdateXAxis")
	   .duration(500)
	   .call(d3.axisBottom(xBarScale));

	//Update Y-Axis
	svg.select("#yAxis") 
	    .transition("UpdateYAxis")
	    .duration(500)
	    .call(d3.axisLeft(yBarScale));

	//Define tooltip
	var popUp = d3.select("body").append("div")		
    			   .attr("class", "tooltip")				
    			   .style("opacity", 0);

    //Change title
   	svg.select("#title")
   	   .text(title)

	/* FUNCTIONS FOR BAR CHART */
	function handleMouseOver(d, i) 
	{
        d3.select(this)
        	.transition()
      		.style("fill", css.getPropertyValue('--mouse-over-graph-color'));

      	popUp.transition()		
             .duration(200)		
             .style("opacity", .9);		
        popUp.html("<p class = 'popUpText'><b><i>" + d[0] + "</b></i><br>" + d[1] + "</p>")	
             .style("left", (d3.event.pageX) + "px")		
             .style("top", (d3.event.pageY - 30) + "px");
	}

	function handleMouseOut(d, i) 
	{
        d3.select(this)
        	.transition()
      		.style("fill", css.getPropertyValue('--main-graph-color'));

      	popUp.transition()		
           .duration(500)		
           .style("opacity", 0);	
    }

    function handleClick(d, i, year) 
	{
        d3.select(this)
    	  .transition()
  		  .style("fill", css.getPropertyValue('--mouse-click-graph-color'));

  		popUp.transition()		
           .duration(500)		
           .style("opacity", 0);

        callUpdate(station, type, d[0]);
    }
}

/* ---------- Total Calls Line chart ---------- */
/* ---------- Response Time Line chart ---------- */
function createLineChart(dataIn, station, type, year, svg, name, width, month, day)
{
	//Process data
	list = JSON.stringify(dataIn);
	parsed = JSON.parse(list);

	//Transform the data
	data = Object.keys(parsed)
				 .map(function(key) { return [Number(key), parsed[key]]; });

	//console.log(data);
	//console.log(data[0]);

	mainContainer = document.getElementById("mainContainer")
	
	//Create new SVG canvas
	const svgGraph = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svgGraph.id = svg;
	svgGraph.setAttribute("width", width);
	svgGraph.setAttribute("height", 400);
	mainContainer.appendChild(svgGraph); 

	//Create new line chart
	var svg = d3.select('#' + svg),
    margin = 100,
    width = svg.attr("width") - margin,
    height = svg.attr("height") - margin;

    //Scale the chart
	xLineScale = d3.scaleLinear().range([0, width]),
	yLineScale = d3.scaleLinear().range([height, 0]);

	var g = svg.append("g")
	           .attr("transform", "translate(" + 50 + "," + 50 + ")")
	           .attr("id", "mainGroup");
  
	//Create graph scale
	xLineScale.domain([2013, d3.max(data, function(d) { return d[0]; })]);
	yLineScale.domain([0, d3.max(data, function(d) { return d[1]; })]);

		//Append scale to graph
		g.append("g")
		.call(d3.axisBottom(xLineScale).tickFormat(function(d){
	         return d;
	     }).ticks(6))
	     .attr("transform", "translate(0," + height + ")")
	     .attr("id", "xAxis");

	    g.append("g")
	     .call(d3.axisLeft(yLineScale).tickFormat(function(d){
	         return d;
	     }).ticks(7))
	     .attr("id", "yAxis")
	     .append("text")
	     .attr("y", 6)
	     .attr("dy", "0.71em")
	     .attr("text-anchor", "end")
	     .text("value");

	//Define line
	var valueline = d3.line()
    				  .x(function(d) { return xLineScale(d[0]); })
    				  .y(function(d) { return yLineScale(d[1]); })
    				  .curve(d3.curveMonotoneX);

    	//Append line
	    g.append("path")
	       .data([data])
	       .attr("d", valueline)
	       .attr("id", "line");

	//Define area under
	var area = d3.area()
    	.x(function(d) { return xLineScale(d[0]); })
    	.y0(height)
    	.y1(function(d) { return yLineScale(d[1]); })
    	.curve(d3.curveMonotoneX);;

	   	//Add area under
	    g.append("path")
	       .data([data])
	       .attr("class", "area")
	       .attr("d", area);

	    //Transition to blue
	    g.select(".area")
	      .transition()
	      .duration(400)
	      .style("fill", css.getPropertyValue('--light-area-graph-color'));

	//Append dots to line
	g.selectAll(".dot")
     .data(data)
  	 .enter().append("circle")
     .attr("class", "dot") // Assign a class for styling
     .attr("cx", function(d, i) { return xLineScale(d[0]) })
     .attr("cy", function(d) { return yLineScale(d[1]) })
     .attr("r", 6)
     .on("mouseover", handleMouseOver)
     .on("mouseout", handleMouseOut)
     .on("click", handleClick);

	//Add title text
    svg.append("text")
		.attr("transform", "translate(15,0)")
		.attr("x", 0)
		.attr("y", 20)
		.attr("id", "title")
		.attr("font-size", "18px")
	 	.text(name)

	//Add divider bar under text
	svg.append("line")
       .attr("x1", 0)
       .attr("y1", 25)
       .attr("x2", svg.attr("width"))
       .attr("y2", 25)
       .attr("stroke-width", 0.3)
       .attr("stroke", "black");

    //Define tooltip
	var popUp = d3.select("body").append("div")		
    			   .attr("class", "tooltip")				
    			   .style("opacity", 0);

    /* FUNCTIONS FOR LINE CHART */

	function handleMouseOver(d, i) 
	{
        d3.select(this)
        	.transition()
      		.style("fill", css.getPropertyValue('--mouse-over-graph-color'))
      		.attr("r", "8");

      	popUp.transition()		
             .duration(200)		
             .style("opacity", .9);		
        popUp.html("<p class = 'popUpText'><b><i>" + d[0] + "</b></i><br>" + d[1] + "</p>")	
             .style("left", (d3.event.pageX) + "px")		
             .style("top", (d3.event.pageY - 30) + "px");	
	}

	function handleMouseOut(d, i) 
	{
		//console.log("Finished");
        
        d3.select(this)
        	.transition()
      		.style("fill", css.getPropertyValue('--main-graph-color'))
      		.attr("r", "6");	

      	popUp.transition()		
           .duration(500)		
           .style("opacity", 0);
    }

    function handleClick(d, i, year) 
	{
		d3.select(this)
        	.transition()
      		.style("fill", css.getPropertyValue('--mouse-click-graph-color'))
      		.attr("r", "6");

      	d3.select(this)
      		.transition()
      		.delay(200)
      		.attr("r", "8");

      	popUp.transition()		
           .duration(500)		
           .style("opacity", 0);

		callUpdate(station, type, d[0], "NA", "NA");
    }
}

function updateLineChart(inputData, station, type, year, svg, title, month, day)
{
	//process data
	list = JSON.stringify(inputData);
	parsed = JSON.parse(list);

	//Transform the data
	var data = Object.keys(parsed).map(function(key) {
  		return [Number(key), parsed[key]];
	});

	//Find elements
	svg = d3.select('#' + svg);
	g = svg.select("#mainGroup");

	xLineScale = d3.scaleLinear().range([0, svg.attr("width") - margin])

	//Create graph scale again
	xLineScale = xLineScale.domain([d3.min(data, function(d) { return d[0]; }), d3.max(data, function(d) { return d[0]; })]);
	yLineScale = yLineScale.domain([0, d3.max(data, function(d) { return d[1]; })]);

	//Update X-Axis    
	g.select("#xAxis") 
	   .transition()
	   .duration(500)
	   .call(d3.axisBottom(xLineScale).tickFormat(function(d){
	         return d;
	    }).ticks(data.length));
	   
	//Update Y-Axis    
	g.select("#yAxis") 
	   .transition()
	   .duration(500)
	   .call(d3.axisLeft(yLineScale));

	//Update line definition
	var valueline = d3.line()
    				  .x(function(d) { return xLineScale(d[0]); })
    				  .y(function(d) { return yLineScale(d[1]); })
    				  .curve(d3.curveMonotoneX);

	//Update line
	g.select("#line")
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr("d", valueline(data));

    //Update area definition
	var area = d3.area()
    	.x(function(d) { return xLineScale(d[0]); })
    	.y0(svg.attr("height") - 100)
    	.y1(function(d) { return yLineScale(d[1]); })
    	.curve(d3.curveMonotoneX);;

    	//Update area under
    	g.select(".area")
    		.transition()
    		.duration(500)
    		.ease(d3.easeLinear)
    		.attr("d", area(data));

   	//Update dots
	g.selectAll(".dot")
		.remove();

	g.selectAll(".dot")
     .data(data)
  	 .enter().append("circle")
     .attr("class", "dot") // Assign a class for styling
     .attr("cx", function(d, i) { return xLineScale(d[0]) })
     .attr("cy", function(d) { return yLineScale(d[1]) })
     .attr("r", 6)
     .on("mouseover", handleMouseOver)
     .on("mouseout", handleMouseOut)
     .on("click", handleClick);

    //Define tooltip
	var popUp = d3.select("body").append("div")		
    			   .attr("class", "tooltip")				
    			   .style("opacity", 0);

    //Change title
   	svg.select("#title")
   	   .text(title)

    /* FUNCTIONS FOR LINE CHART */

	function handleMouseOver(d, i) 
	{
        d3.select(this)
        	.transition()
      		.style("fill", css.getPropertyValue('--mouse-over-graph-color'))
      		.attr("r", "8");

      	popUp.transition()		
             .duration(200)		
             .style("opacity", .9);		
        popUp.html("<p class = 'popUpText'><b><i>" + d[0] + "</b></i><br>" + d[1] + "</p>")	
             .style("left", (d3.event.pageX) + "px")		
             .style("top", (d3.event.pageY - 30) + "px");	
	}

	function handleMouseOut(d, i) 
	{
		//console.log("Finished");
        
        d3.select(this)
        	.transition()
      		.style("fill", css.getPropertyValue('--main-graph-color'))
      		.attr("r", "6");

      	popUp.transition()		
           .duration(500)		
           .style("opacity", 0);	
    } 

    function handleClick(d, i) 
	{
		d3.select(this)
        	.transition()
      		.style("fill", css.getPropertyValue('--mouse-click-graph-color:'))
      		.attr("r", "6");

      	d3.select(this)
      		.transition()
      		.delay(200)
      		.attr("r", "8");	

      	popUp.transition()		
           .duration(500)		
           .style("opacity", 0); 

	    if(maxDetail == false)   
	    {
	        if(year == "NA" && d[0] == null )
	        {
	        	console.log("Call1");
				callUpdate(station, type, "NA", "NA", "NA");
	        }

	        if(year == "NA")
	        {
	        	console.log("Call1.2");
				callUpdate(station, type, d[0], "NA", "NA");
	        }

	        else if(month == "NA")
	        {
	        	console.log("Call2");
	        	callUpdate(station, type, year, d[0], "NA");
	        }

	        else if (day == "NA")
	        {
	        	console.log("Call3");
	        	callUpdate(station, type, year, month, d[0]);
	        	console.log("Max detail reached!");
	        	maxDetail = true;
	        }

	        else 
	        {
	        	console.log("Error!");
	        }
	    }

	    else
	    {
	    	popUp.transition()		
             .duration(200)		
             .style("opacity", .9);		
        	popUp.html("<p class = 'popUpText'><i>Current max level of detail reached!</i></p>")	
             .style("left", (d3.event.pageX) + "px")		
             .style("top", (d3.event.pageY - 30) + "px")

            popUp.transition()	
            	 .delay(1000)	
           		 .duration(500)		
           		 .style("opacity", 0);
	    }
    }
}

/* ---------- Incidents pie chart ---------- */
function createPieChart(dataIn, station, type, year, title, month, day)
{
	//Process data
	list = JSON.stringify(dataIn);
	parsed = JSON.parse(list);

	//Transform the data
	data = Object.keys(parsed)
				 .map(function(key) { return [String(key), parsed[key]]; });

	mainContainer = document.getElementById("mainContainer")

	//Create new SVG canvas
	const svgGraph = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svgGraph.id = "piesvg";
		svgGraph.setAttribute("width", pieWidth);
		svgGraph.setAttribute("height", pieHeight);
		mainContainer.appendChild(svgGraph); 
	
	//Create new bar chart
	var svg = d3.select("#piesvg"),
        width = svg.attr("width") - pieMargin,
        height = svg.attr("height") - pieMargin,
        radius = Math.min(width, height) / 2;

    //Append group with translation effect
    var g = svg.append("g")
                   .attr("transform", "translate(" + svg.attr("width") / 2 + "," + svg.attr("height") / 2 + ")")
                   .attr("id", "mainGroup");

    var color = d3.scaleOrdinal([css.getPropertyValue('--pie-color-1'), css.getPropertyValue('--pie-color-2'), css.getPropertyValue('--pie-color-3'), css.getPropertyValue('--pie-color-4'), css.getPropertyValue('--pie-color-5'), css.getPropertyValue('--pie-color-6')]);
	//'#4daf4a','#377eb8','#ff7f00','#984ea3','#e41a1c', '#FFFF00'

    var pie = d3.pie()
    			.value(function(d) { return d[1]; })
    			.sort(null);

    var path = d3.arc()
                     .outerRadius(radius)
                     .innerRadius(0);

    var label = d3.arc()
                      .outerRadius(radius)
                      .innerRadius(radius);

    var pathExtended = d3.arc()
                      .outerRadius(radius + 10)
                      .innerRadius(0);

 		//Draw pie
 		var arc = g.selectAll(".arc")
                       .data(pie(data))
                       .enter().append("g")
                       .attr("class", "arc");

        arc.append("path")
               .attr("d", path)
               .attr("fill", function(d) { return color(d.data[0]); })
               .on("mouseover", handleMouseOver)
     		   .on("mouseout", handleMouseOut)
    		   .on("click", handleClick);
        
        arc.append("text")
           .attr("class", "pieLabel")
           .attr("transform", function(d) { 
                    return "translate(" + label.centroid(d) + ")"; 
                })
           .text(function(d) { return d.data[0]; });
    
    //Add title text
    svg.append("text")
		.attr("transform", "translate(15,0)")
		.attr("x", 0)
		.attr("y", 20)
		.attr("font-size", "18px")
		.attr("id", "title")
	 	.text(title);

	//Add divider bar under text
	svg.append("line")
       .attr("x1", 0)
       .attr("y1", 25)
       .attr("x2", svg.attr("width"))
       .attr("y2", 25)
       .attr("stroke-width", 0.3)
       .attr("stroke", "black");

    //Define tooltip
	var popUp = d3.select("body").append("div")		
    			   .attr("class", "tooltip")				
    			   .style("opacity", 0);

    /* HANDLE PIE MOUSE */

    function handleMouseOver(d, i)
    {
    	d3.select(this)
        	.transition()
        	.attr("d", pathExtended)
      		.style("fill", css.getPropertyValue('--mouse-over-graph-color'));

      	popUp.transition()		
             .duration(200)		
             .style("opacity", .9);		
        popUp.html("<p class = 'popUpText'><b><i>" + d.data[0] + "</b></i><br>" + d.data[1] + "</p>")	
             .style("left", (d3.event.pageX) + "px")		
             .style("top", (d3.event.pageY - 30) + "px");	
    }

    function handleMouseOut(d, i)
    {
    	d3.select(this)
        	.transition()
        	.attr("d", path)
      		.style("fill", function(d) { return color(d.data[0]); });

      	popUp.transition()		
           .duration(500)		
           .style("opacity", 0);	
    }

    function handleClick(d, i)
    {
    	d3.select(this)
        	.transition()
        	.attr("d", path)
        	.transition()
      		.attr("d", pathExtended);

      	popUp.transition()		
           .duration(500)		
           .style("opacity", 0);	
    }
}

function updatePieChart(dataIn, station, type, year, title, month, day)
{
	//Process data
	list = JSON.stringify(dataIn);
	parsed = JSON.parse(list);

	//Transform the data
	data = Object.keys(parsed)
				 .map(function(key) { return [String(key), parsed[key]]; });

	//Find elements
	svg = d3.select("#piesvg");
	g = svg.select("#mainGroup");
	
	var color = d3.scaleOrdinal([css.getPropertyValue('--pie-color-1'), css.getPropertyValue('--pie-color-2'), css.getPropertyValue('--pie-color-3'), css.getPropertyValue('--pie-color-4'), css.getPropertyValue('--pie-color-5'), css.getPropertyValue('--pie-color-6')]);
	//'#4daf4a','#377eb8','#ff7f00','#984ea3','#e41a1c', '#FFFF00'

	updateRadius = radius - (pieMargin/2);

	//Create new pie values
	var newPie = d3.pie()
    			.value(function(d) { return d[1]; })
    			.sort(null);

   	//Select all old arcs and apply new data
    var arc = g.selectAll(".arc")
                       .data(newPie(data));

    //Create new pie paths
    var path = d3.arc()
                     .outerRadius(updateRadius)
                     .innerRadius(0);

    //Create new label paths
    var label = d3.arc()
                      .outerRadius(updateRadius)
                      .innerRadius(updateRadius);

    //Select paths in old arcs and update
    arc.select("path")
               .transition()
               .duration(750)
               .attr("d", path)
           	   .attr("fill", function(d) { return color(d.data[0]); });

    //Remove old labels
   	arc.selectAll("text")
   		.attr("fill-opacity", 1)
   		.transition()
   		.duration(300)
   		.attr("fill-opacity", 0)
   		.delay(300)
   		.remove();
   		

   	//Add new labels
    arc.append("text")
           .attr("class", "pieLabel")
           .attr("transform", function(d) { 
                    return "translate(" + label.centroid(d) + ")"; 
                })
           .attr("fill-opacity", 0)
           .text(function(d) { return d.data[0]; })
           .transition()
           .delay(400)
   		   .duration(300)
           .attr("fill-opacity", 1);

    //Change title
   	svg.select("#title")
   	   .text(title)
}

/* -------------------- AJAX CALLS -------------------- */

//Returns numbers of incidents
function fetchBarLineData(station, type, year, month, day)
{
	function ajaxCall()
	{
		//Request number of calls/time unit
		return $.ajax({
			contentType: "application/x-www-form-urlencoded;charset=UTF-8",
			type: "POST",
			url: "http://localhost:8000/map/get_calls_unit/",
			datatype: "json",
			//async: true,
			data: {"station": station, "type": type, "year": year, "month": month, "day": day},
			success: function(json)
			{
				//Operations here
			}
		});
	}

	return $.when(ajaxCall()).done(function(data){
	
		return data;
	});	
}

//Returns types of incidents
function fetchPieData(station, type, year, month, day)
{
	function ajaxPieCall()
	{
		//Request number of calls/time unit
		return $.ajax({
			contentType: "application/x-www-form-urlencoded;charset=UTF-8",
			type: "POST",
			url: "http://localhost:8000/map/get_incidents/",
			datatype: "json",
			//async: true,
			data: {"station": station, "type": type, "year": year, "month": month, "day": day},
			success: function(json)
			{
				//Operations here
			}
		});
	}

	return $.when(ajaxPieCall()).done(function(data){
	
		return data;
	});
}

//Returns average response times
function fetchLine2Data(station, type, year, month, day)
{
	function ajaxLine2Call()
	{
		//Request number of calls/time unit
		return $.ajax({
			contentType: "application/x-www-form-urlencoded;charset=UTF-8",
			type: "POST",
			url: "http://localhost:8000/map/get_avg_response/",
			datatype: "json",
			//async: true,
			data: {"station": station, "type": type, "year": year, "month": month, "day": day},
			success: function(json)
			{
				//Operations here
			}
		});
	}

	return $.when(ajaxLine2Call()).done(function(data){
	
		return data;
	});
}

/*function fetchBar2Data(station, type, year)
{
	function ajaxBar2Call()
	{
		//Request number of calls/time unit
		return $.ajax({
			contentType: "application/x-www-form-urlencoded;charset=UTF-8",
			type: "POST",
			url: "http://localhost:8000/map/get_total_cats/",
			datatype: "json",
			//async: true,
			data: {"station": station, "type": type, "year": year},
			success: function(json)
			{
				//Operations here
			}
		});
	}

	return $.when(ajaxBar2Call()).done(function(data){
	
		return data;
	});
}*/

/* -------------------- UPDATE GRAPHS -------------------- */
function callUpdate(station, type, year, month, day)
{
	//Request number of calls/time unit
	function ajaxBarLine()
	{
		return fetchBarLineData(station, type, year, month, day);
	}

	function ajaxPieChart()
	{
		return fetchPieData(station, type, year, month, day);
	}

	function ajaxLine2Chart()
	{
		return fetchLine2Data(station, type, year, month, day);
	}
	
	/*function ajaxBar2()
	{
		return fetchBar2Data(station, type, year);
	}*/

	/* ----------------- Call updates ----------------- */

	//Call bar and line update
	$.when(ajaxBarLine()).done(function(returnVal){
   
		//updateBarChart(returnVal, station, type, year, "linesvg", "Station Calls Per Year | Type: " + type + " | Year: " + year);
		updateLineChart(returnVal, station, type, year, "barsvg",  "Station Calls Per Year | Type: " + type + " | Year: " + year + " | Month: " + month + " | Day: " + day, month, day);
		
	});

	//Call pie update
	/*$.when(ajaxPieChart()).done(function(returnVal){
    	
		updatePieChart(returnVal, station, type, year, "Most Common Incidents | Type: " + type + " | Year: " + year);

	});*/

	//Call line 2 update
	/*$.when(ajaxLine2Chart()).done(function(returnVal){
    	
		updateLineChart(returnVal, station, type, year, "bar2svg", "Average Response Time | Type: " + type + " | Year: " + year);

	});*/

	//Call bar 2 update
	/*$.when(ajaxBar2()).done(function(returnCatVal){
    	
		updateBarChart(returnCatVal, station, type, year, "catBarsvg", "Title");

	});*/
}

/* -------------------- SET COOKIES FOR AJAX -------------------- */

var csrftoken = Cookies.get('csrftoken');

function csrfSafeMethod(method) 
{
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

