//CTRL + K, CTRL + 1
//CTRL + K, CTRL + J

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

//Scales for scatter plot
xPlotScale = 0;
yPlotScale = 0;

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
		//createElement(Type, ID, ParentID)
		createElement("div", "overallStatContainer", "mainContainer");
				
	//Fetch average dispatch data and draw
	$.when(fetchAvgDispatch(headerText, "Overall", "NA", "NA", "NA")).done(function(returnLine2Val){
		createLineChart(returnLine2Val, headerText, "Overall", "NA", "bar2svg", "Average Dispatch Category | Type: Overall | Year: All | Month: NA | Day: NA", 670, "NA", "NA");	
	});

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

			//Fetch Bar data and draw
			$.when(fetchBarData(headerText, "Overall", "NA", "NA", "NA")).done(function(returnVal){
				createBarChart(returnVal, headerText, "Overall", "NA", "linesvg", "Station Calls Per Year | Type: Overall | Year: All | Month: NA | Day: NA", getDivWidth('#model-content'), "NA", "NA");

				//Fetch pie data and draw
				$.when(fetchPieData(headerText, "Overall", "NA", "NA", "NA")).done(function(returnPieVal){
					createPieChart(returnPieVal, headerText, "Overall", "NA", "piesvg", "Incidents | Type: Overall | Year: All | Month: NA | Day: NA", "NA", "NA");		
				});

				//Fetch average travel data and draw
				$.when(fetchAvgTravel(headerText, "Overall", "NA", "NA", "NA")).done(function(returnAvgTravel){
					createLineChart(returnAvgTravel, headerText, "Overall", "NA", "avgTravelLine", "Average Travel Category | Type: Overall | Year: All | Month: NA | Day: NA", getDivWidth('#model-content')/2, "NA", "NA");	
				});

				//Fetch call times data and draw
				$.when(fetchCallTimes(headerText, "Overall", "NA", "NA", "NA")).done(function(returnCallTimes){
					console.log("Ready to draw...")
					createScatterPlot(returnCallTimes, headerText, "Overall", "NA", "callTimes", "Mins. Attended | Type: Overall | Year: All | Month: NA | Day: NA", getDivWidth('#model-content')/2, "NA", "NA");	
				//getDivWidth('#model-content')/2
				});
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
		d3.selectAll("#xLabel")
					.text("Years");
					
		maxDetail = false;
		callUpdate(Station, Type, "NA", "NA", "NA");
    }
}

/* ---------- Total CallsBar chart ---------- */
function createBarChart(inputData, Station, Type, Year, ID, title, width, month, day)
{
	//Process data	
	list = JSON.stringify(inputData);
	parsed = JSON.parse(list);

	//Transform the data
	data = Object.keys(parsed)
				 .map(function(key) { return [Number(key), parsed[key]]; });

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
        width = svg.attr("width") - margin - 15,
        height = svg.attr("height") - margin;

    xBarScale = d3.scaleBand().range ([0, width]).padding(0.2),
    yBarScale = d3.scaleLinear().range ([height, 0]);

    var g = svg.append("g")
               .attr("transform", "translate(" + 70 + "," + 50 + ")")
               .attr("id", "mainGroup");
    
    //Create graph scale
    xBarScale.domain(data.map(function(d) { return d[0]; }));
    yBarScale.domain([0, d3.max(data, function(d) { return d[1]; })]);

    g.append("g")
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(xBarScale))
     .attr("id", "xAxis")
     .append("text")
         //.attr("transform", "rotate(-90)")
         .attr("id", "xLabel")
         .attr("dx", svg.attr("width")/2 - 20)
         .attr("dy", "2em")
         .attr("text-anchor", "end")
         .text("Years");

    g.append("g")
     .call(d3.axisLeft(yBarScale).tickFormat(function(d){
         return d;
     }).ticks(7))
     .attr("id", "yAxis")
         .append("text")
         .attr("id", "yLabel")
         .attr("transform", "rotate(-90)")
         .attr("dx", "-8em")
         .attr("dy", "-2.5em")
         .attr("text-anchor", "end")
         .text("Calls");

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

        d3.selectAll("#xLabel")
				.text("Months");

		callUpdate(Station, Type, d[0], "NA", "NA");
    }
}

function updateBarChart(inputData, station, type, year, svg, title, month, day)
{
	removeLoader(svg);

	list = JSON.stringify(inputData);
	parsed = JSON.parse(list);

	//Transform the data
	var data = Object.keys(parsed).map(function(key) {
  		return [Number(key), parsed[key]];
	});

	// Select the section we want to apply our changes to
	var svg = d3.select("#" + svg)
	var g = svg.select("#mainGroup")
  
	height = svg.attr("height") - 100; //(margin)

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

    function handleClick(d, i) 
	{
        d3.select(this)
    	  .transition()
  		  .style("fill", css.getPropertyValue('--mouse-click-graph-color'));

  		popUp.transition()		
           .duration(500)		
           .style("opacity", 0);

        if(maxDetail == false)   
	    {
	        if(year == "NA" && d[0] == null )
	        {
				callUpdate(station, type, "NA", "NA", "NA");

				d3.selectAll("#xLabel")
					.text("Years");
	        }

	        if(year == "NA")
	        {
				callUpdate(station, type, d[0], "NA", "NA");

				d3.selectAll("#xLabel")
					.text("Months");
	        }

	        else if(month == "NA")
	        {
	        	callUpdate(station, type, year, d[0], "NA");

	        	d3.selectAll("#xLabel")
					.text("Days");
	        }

	        else if (day == "NA")
	        {
	        	callUpdate(station, type, year, month, d[0]);

	        	d3.selectAll("#xLabel")
					.text("Hours");

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

/* ---------- Response Time Line chart ---------- */

function createLineChart(dataIn, station, type, year, svg, name, width, month, day)
{
	//Process data
	list = JSON.stringify(dataIn);
	parsed = JSON.parse(list);

	//Transform the data
	data = Object.keys(parsed)
				 .map(function(key) { return [Number(key), parsed[key]]; });

	console.log(data);

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
    width = svg.attr("width") - margin - 5,
    height = svg.attr("height") - margin;

    //Scale the chart
	xLineScale = d3.scaleLinear().range([0, width]),
	yLineScale = d3.scaleLinear().range([height, 0]);

	var g = svg.append("g")
	           .attr("transform", "translate(" + 60 + "," + 50 + ")")
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
	     .attr("id", "xAxis")
	     	 .append("text")
		     .attr("id", "xLabel")
	         .attr("dx", svg.attr("width")/2 - 20)
	         .attr("dy", "2em")
	         .attr("text-anchor", "end")
	         .text("Years");

	    g.append("g")
	     .call(d3.axisLeft(yLineScale).tickFormat(function(d){
	         return d;
	     }).ticks(7))
	     	 .append("text")
	         .attr("id", "yLabel")
	         .attr("transform", "rotate(-90)")
	         .attr("dx", "-6em")
	         .attr("dy", "-1.8em")
	         .attr("text-anchor", "end")
	         .text("Time Category");

	//Define line
	var valueline = d3.line()
    				  .x(function(d) { return xLineScale(d[0]); })
    				  .y(function(d) { return yLineScale(d[1]); })
    				  .curve(d3.curveMonotoneX);

    	//Append line
	    g.append("path")
	       .data([data])
	       .attr("d", valueline)
	       .attr("class", "line");

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

        d3.selectAll("#xLabel")
					.text("Months");

		callUpdate(station, type, d[0], "NA", "NA");
    }
}

function updateLineChart(inputData, station, type, year, svg, title, month, day)
{
	removeLoader(svg);

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
	        	d3.selectAll("#xLabel")
					.text("Years");

				callUpdate(station, type, "NA", "NA", "NA");
	        }

	        if(year == "NA")
	        {
	        	d3.selectAll("#xLabel")
					.text("Months");

				callUpdate(station, type, d[0], "NA", "NA");
	        }

	        else if(month == "NA")
	        {
	        	d3.selectAll("#xLabel")
					.text("Days");

	        	callUpdate(station, type, year, d[0], "NA");
	        }

	        else if (day == "NA")
	        {
	        	d3.selectAll("#xLabel")
					.text("Hours");

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
function createPieChart(dataIn, station, type, year, ID, title, month, day)
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
		svgGraph.id = ID;
		svgGraph.setAttribute("width", pieWidth);
		svgGraph.setAttribute("height", pieHeight);
		mainContainer.appendChild(svgGraph); 
	
	//Create new bar chart
	var svg = d3.select("#" + ID),
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

function updatePieChart(dataIn, station, type, year, ID, title, month, day)
{
	removeLoader(ID);

	//Process data
	list = JSON.stringify(dataIn);
	parsed = JSON.parse(list);

	//Transform the data
	data = Object.keys(parsed)
				 .map(function(key) { return [String(key), parsed[key]]; });

	//Find elements
	svg = d3.select("#" + ID);
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

/* ---------- Call time scatter plot ---------- */
function createScatterPlot(dataIn, station, type, year, ID, title, width, month, day)
{
	//Process data
	list = JSON.stringify(dataIn);
	parsed = JSON.parse(list);

	console.log(parsed);

	//Transform the data
	data = Object.keys(parsed)
				 .map(function(key) { return [Number(key), parsed[key]]; });
	
	array = [];

	for (item in data)
	{
		year = data[item][0]
		
		for(callTime in data[item][1])
		{
			if(data[item][1][callTime] < 30)
			{
				if(Math.random() > 0.98)
				{
					array.push([year, data[item][1][callTime]]);
				}
			}

			else
			{
				array.push([year, data[item][1][callTime]]);
			}
		}
	}

	//console.log("Data: " + data);
	//console.log("Array: " + array);

	mainContainer = document.getElementById("mainContainer")
	
	//Create new SVG canvas
	const svgGraph = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svgGraph.id = ID;
	svgGraph.setAttribute("width", width);
	svgGraph.setAttribute("height", 400);
	mainContainer.appendChild(svgGraph); 

	//Create new chart
	var svg = d3.select('#' + ID),
    margin = 100,
    width = svg.attr("width") - margin,
    height = svg.attr("height") - margin;

    //Scale the chart
	xPlotScale = d3.scaleLinear().range([0, width]),
	yPlotScale = d3.scaleLinear().range([height, 0]);

	var g = svg.append("g")
	           .attr("transform", "translate(" + 50 + "," + 50 + ")")
	           .attr("id", "mainGroup");
  
	//Create graph scale
	xPlotScale.domain([2013, d3.max(data, function(d) { return d[0]; })]);
	yPlotScale.domain([0, d3.max(data[1][1], function(d) { return d; })]);

		//Append scale to graph
		g.append("g")
			.call(d3.axisBottom(xPlotScale).tickFormat(function(d){
		         return d;
		     }).ticks(6))
		     .attr("transform", "translate(0," + height + ")")
		     .attr("id", "xAxis");

	    g.append("g")
		     .call(d3.axisLeft(yPlotScale).tickFormat(function(d){
		         return d;
		     }).ticks(7))
		     .attr("id", "yAxis")
		     .append("text")
		     .attr("y", 6)
		     .attr("dy", "0.71em")
		     .attr("text-anchor", "end")
		     .text("value");

	// Add dots
	g.selectAll(".scatterDot")
		.data(array)
		.enter()
		.append("circle")
		.attr("cx", function (d, i) { return xPlotScale(d[0]); } )
		.attr("cy", function (d, i) { return yPlotScale(d[1]); } )
		.attr("r", 3)
		.attr("class", "scatterDot")
		.on("mouseover", handleMouseOver)
     	.on("mouseout", handleMouseOut);

	//Add title text
    svg.append("text")
		.attr("transform", "translate(15,0)")
		.attr("x", 0)
		.attr("y", 20)
		.attr("id", "title")
		.attr("font-size", "18px")
	 	.text(title)

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

    /* FUNCTIONS FOR SCATTER PLOT */

    function handleMouseOver(d, i) 
	{
        d3.select(this)
        	.transition()
      		.style("fill", css.getPropertyValue('--mouse-over-graph-color'))
      		.attr("r", "5");

      	popUp.transition()		
             .duration(200)		
             .style("opacity", .9);		
        popUp.html("<p class = 'popUpText'><b><i>" + d[0] + "</b></i><br>" + d[1] + " minutes</p>")	
             .style("left", (d3.event.pageX) + "px")		
             .style("top", (d3.event.pageY - 30) + "px");	
	}

	function handleMouseOut(d, i) 
	{ 
        d3.select(this)
        	.transition()
      		.style("fill", css.getPropertyValue('--main-graph-color'))
      		.attr("r", "3");	

      	popUp.transition()		
           .duration(500)		
           .style("opacity", 0);
    }
}

function updateScatterPlot(dataIn, station, type, year, ID, title, month, day)
{
	removeLoader(ID);

	//Process data
	list = JSON.stringify(dataIn);
	parsed = JSON.parse(list);

	//Transform the data
	data = Object.keys(parsed)
				 .map(function(key) { return [String(key), parsed[key]]; });

	array = [];			 

	for (item in data)
	{
		year = data[item][0]
		
		for(callTime in data[item][1])
		{
			if(data[item][1][callTime] < 30)
			{
				if(data[item][1].length > 800)
				{
					if(Math.random() > 0.7)
					{
						array.push([year, data[item][1][callTime]]);
					}
				}

				else
				{
					array.push([year, data[item][1][callTime]]);
				}
			}

			else
			{
				array.push([year, data[item][1][callTime]]);
			}
		}
	}

	//Find elements
	svg = d3.select("#" + ID);
	g = svg.select("#mainGroup");

	//Remove old dots
	g.selectAll(".scatterDot")
		.remove();

	xPlotScale = d3.scaleLinear().range([0, svg.attr("width") - margin])
	yPlotScale = d3.scaleLinear().range([svg.attr("height") - margin, 0]);

	//Create graph scale again
	xPlotScale = xPlotScale.domain([d3.min(data, function(d) { return d[0]; }), d3.max(data, function(d) { return parseInt(d[0]); })]);
	yPlotScale = yPlotScale.domain([0, d3.max(data[1][1], function(d) { return parseInt(d); })]);

		//Update X-Axis    
		g.select("#xAxis") 
		   .transition()
		   .duration(500)
		   .call(d3.axisBottom(xPlotScale).tickFormat(function(d){
		         return d;
		    }).ticks(data.length));
		   
		//Update Y-Axis    
		g.select("#yAxis") 
		   .transition()
		   .duration(500)
		   .call(d3.axisLeft(yPlotScale));	

	//Redraw dots
	g.selectAll(".scatterDot")
		.data(array)
		.enter()
		.append("circle")
		.attr("cx", function (d, i) { return xPlotScale(d[0]); } )
		.attr("cy", function (d, i) { return yPlotScale(d[1]); } )
		.attr("r", 3)
		.attr("class", "scatterDot")
		.on("mouseover", handleMouseOver)
     	.on("mouseout", handleMouseOut);

	//Change title
   	svg.select("#title")
   	   .text(title)

   	//Define tooltip
	var popUp = d3.select("body").append("div")		
    			   .attr("class", "tooltip")				
    			   .style("opacity", 0);

   	/* FUNCTIONS FOR SCATTER PLOT */

    function handleMouseOver(d, i) 
	{
        d3.select(this)
        	.transition()
      		.style("fill", css.getPropertyValue('--mouse-over-graph-color'))
      		.attr("r", "5");

      	popUp.transition()		
             .duration(200)		
             .style("opacity", .9);		
        popUp.html("<p class = 'popUpText'><b><i>" + d[0] + "</b></i><br>" + d[1] + " minutes</p>")	
             .style("left", (d3.event.pageX) + "px")		
             .style("top", (d3.event.pageY - 30) + "px");	
	}

	function handleMouseOut(d, i) 
	{ 
        d3.select(this)
        	.transition()
      		.style("fill", css.getPropertyValue('--main-graph-color'))
      		.attr("r", "3");	

      	popUp.transition()		
           .duration(500)		
           .style("opacity", 0);
    }
}

/* -------------------- AJAX CALLS -------------------- */

//Returns numbers of incidents
function fetchBarData(station, type, year, month, day)
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
function fetchAvgDispatch(station, type, year, month, day)
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

//Returns average response times
function fetchAvgTravel(station, type, year, month, day)
{
	function ajaxAvgTravelCall()
	{
		//Request number of calls/time unit
		return $.ajax({
			contentType: "application/x-www-form-urlencoded;charset=UTF-8",
			type: "POST",
			url: "http://localhost:8000/map/get_avg_travel/",
			datatype: "json",
			//async: true,
			data: {"station": station, "type": type, "year": year, "month": month, "day": day},
			success: function(json)
			{
				//Operations here
			}
		});
	}

	return $.when(ajaxAvgTravelCall()).done(function(data){
	
		return data;
	});
}

//Returns each incident time
function fetchCallTimes(station, type, year, month, day)
{
	function ajaxCallTimes()
	{
		//Request number of calls/time unit
		return $.ajax({
			contentType: "application/x-www-form-urlencoded;charset=UTF-8",
			type: "POST",
			url: "http://localhost:8000/map/get_incident_lengths/",
			datatype: "json",
			//async: true,
			data: {"station": station, "type": type, "year": year, "month": month, "day": day},
			success: function(json)
			{
				//Operations here
			}
		});
	}

	return $.when(ajaxCallTimes()).done(function(data){
	
		return data;
	});
}

/* -------------------- UPDATE GRAPHS -------------------- */
function callUpdate(station, type, year, month, day)
{
	createLoader("linesvg");
	createLoader("piesvg");
	createLoader("bar2svg");
	createLoader("avgTravelLine");
	createLoader("callTimes");

	//Request number of calls/time unit
	function ajaxBar()
	{
		return fetchBarData(station, type, year, month, day);
	}

	function ajaxPieChart()
	{
		return fetchPieData(station, type, year, month, day);
	}

	function ajaxLine2Chart()
	{
		return fetchAvgDispatch(station, type, year, month, day);
	}

	function ajaxAvgTravel()
	{
		return fetchAvgTravel(station, type, year, month, day);
	}

	function ajaxAvgIndcidentTime()
	{
		return fetchCallTimes(station, type, year, month, day);
	}

	/* ----------------- Call updates ----------------- */

	//Call bar and line update
	$.when(ajaxBar()).done(function(returnVal){
   
		updateBarChart(returnVal, station, type, year, "linesvg", "Station Calls Per Year | Type: " + type + " | Year: " + year + " | Month: " + month + " | Day: " + day, month, day);
	});

	//Call pie update
	$.when(ajaxPieChart()).done(function(returnVal){
    	
		updatePieChart(returnVal, station, type, year, "piesvg", "Incidents | Type: " + type + " | Year: " + year + " | Month: " + month + " | Day: " + day, month, day);

	});

	//Call line 2 update
	$.when(ajaxLine2Chart()).done(function(returnVal){
    	
		updateLineChart(returnVal, station, type, year, "bar2svg",  "Average Dispatch Category | Type: " + type + " | Year: " + year + " | Month: " + month + " | Day: " + day, month, day);
	});

	//Call average travel update (Line 2)
	$.when(ajaxAvgTravel()).done(function(returnAvgTravel){
    	
		updateLineChart(returnAvgTravel, station, type, year, "avgTravelLine",  "Average Travel Category | Type: " + type + " | Year: " + year + " | Month: " + month + " | Day: " + day, month, day);
	});

	//Call average travel update (Line 2)
	$.when(ajaxAvgIndcidentTime()).done(function(returnCallTime){
    	
		updateScatterPlot(returnCallTime, station, type, year, "callTimes", "Mins. Attended | Type: " + type + " | Year: " + year + " | Month: " + month + " | Day: " + day, month, day);
	});
}

/* ------------------- DRAW LOADING OVERLAY  -------------------- */

function createLoader(ID)
{
	ID = d3.select("#" + ID);

	ID.append("rect")
       .attr("x", 0)
       .attr("y", 0)
       .attr("width", ID.attr("width") + 20)
       .attr("height", ID.attr("height"))
       .attr("id", "loadBox")
       .attr("fill", "black")
       .style("opacity", "0.8");

	ID.append("text")
		.attr("x", ID.attr("width")/2 - 175)
		.attr("y", ID.attr("height")/2)
		.attr("font-size", "30px")
		.style("fill", "white")
		.style("font-style", "italic")
		.attr("id", "loadText")
		.text("Fetching your information...");
}

function removeLoader(ID)
{
	ID = d3.select("#" + ID);

	ID.select("#loadBox").remove();
	ID.select("#loadText").remove();
}

function getDivWidth (div) 
{
	var width = d3.select(div)
		//Get width of div
		.style('width')
		//Take off 'px'
		.slice(0, -2)
	//Return as an integer
	return Math.round(Number(width)) - (Math.round(Number(width)) * 0.06)
 }

/* ------------------- SET COOKIES FOR AJAX -------------------- */

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

