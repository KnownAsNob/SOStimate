//CTRL + K, CTRL + 1
//CTRL + K, CTRL + J

//Visualizer map popup
model = document.querySelector(".model");
closeBtn = document.querySelector(".close-btn");
header = document.getElementById("stationHeader");
subheader = document.getElementById("stationSubHeader");
text = document.getElementById("text");
container = document.getElementById("model-content");

Station = 'None';
Type = 'None';

//W & H of first bar chart
overallBarWidth = 500
overallBarHeight = 400
xBarScale = 0;
yBarScale = 0;

xLineScale = 0;
yLineScale = 0;

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

		//createElement(Type, ID, ParentID)

		//Create overall stat container
		createElement("div", "overallStatContainer", "mainContainer");

			/*Create text elements
			createElement("P", "overallCalls", "overallStatContainer");

			//Create text elements
			createElement("P", "overallDA", "overallStatContainer");

			//Create text elements
			createElement("P", "overallDF", "overallStatContainer");*/

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
			/*$('#overallCalls').html("Overall " + json.message[0]);
				$('#overallDA').html("DA " + json.message[1]);
				$('#overallDF').html("DF " + json.message[2]);*/

			createOverall("Overall", json.message[0], "Overallsvg", headerText);
			createOverall("DA", json.message[1], "DAsvg", headerText);
			createOverall("DF", json.message[2], "DFsvg", headerText)
			
			//Fetch BarLine data and draw
			$.when(fetchBarLineData(headerText, "Overall", "NA")).done(function(returnVal){
					createBarChart(returnVal, headerText, "Overall", "NA");
					createLineChart(returnVal, headerText, "Overall", "NA");    			
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

	//console.log(newElement.id);
}

/* -------------------- D3 Visualizations -------------------- */

//Crate menu buttons
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
	overallG.id = "test";

	//Tag
	overallG.append("text")
   		   .attr("transform", "translate(15, -5)")
   		   .attr("x", 0)
   		   .attr("y", height/2)
   		   .attr("dy", "0em")
   		   .attr("font-size", "35px")
   		   .attr("font-weight", "bold")
   		   .attr("fill", "rgb(77, 121, 255)")
   	 	   .text(Type);

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
   	 	   .text(Input);

   	//Create mouseover events
   	d3.select("#" + ID)
   			.on("mouseover", handleMouseOver)
         	.on("mouseout", handleMouseOut)
         	.on("click", handleClick);

   	function handleMouseOver(d, i) 
		{
			d3.select(this)
            	.transition()
	      		.style("fill", "rgb(130, 160, 255)");
		}

	function handleMouseOut(d, i) 
		{
			//console.log("Finished");
            
            d3.select(this)
            	.transition()
	      		.style("fill", "rgb(0, 0, 0)");	
        }

    function handleClick(d, i) 
		{
			console.log("Clicked");
			//console.log("Station: " + Station);
			//console.log("Button:" + Type);
            callUpdate(Station, Type, "NA")
        }
}

/* ---------- Bar chart ---------- */
function createBarChart(inputData, Station, Type, Year)
{
	//Process data
	list = JSON.stringify(inputData);
	parsed = JSON.parse(list);

	//Transform the data
	data = Object.keys(parsed)
				 .map(function(key) { return [Number(key), parsed[key]]; });

	//console.log(data); 
	//console.log(data[0]);

	mainContainer = document.getElementById("mainContainer")
	
	//Create new SVG canvas
	const svgGraph = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svgGraph.id = "linesvg";
	svgGraph.setAttribute("width", overallBarWidth);
	svgGraph.setAttribute("height", overallBarHeight);
	mainContainer.appendChild(svgGraph); 
	
	//Create new bar chart
	var svg = d3.select("#linesvg"),
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
	 	.text("Station Calls Per Year")

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
  		.transition()
        .ease(d3.easeLinear)
        .duration(500)
        .attr("height", function(d) { return height - yBarScale(d[1]); })

    g.selectAll(".bar")
      	.transition()
      	.delay(500)
      	.style("fill", "rgb(77, 121, 255)"); 	

	/* FUNCTIONS FOR BAR CHART */

	function handleMouseOver(d, i) 
	{
        d3.select(this)
        	.transition()
      		.style("fill", "rgb(221, 246, 254)");
	}

	function handleMouseOut(d, i) 
	{
		//console.log("Finished");
        
        d3.select(this)
        	.transition()
      		.style("fill", "rgb(77, 121, 255)");	
    }

    function handleClick(d, i, year) 
	{
		d3.select(this)
          .transition()
      	  .style("fill", "rgb(55, 76, 172)");

		callUpdate(Station, Type, d[0])
    }
}

function updateBarChart(inputData, station, type, year)
{
	list = JSON.stringify(inputData);
	parsed = JSON.parse(list);

	//Transform the data
	var data = Object.keys(parsed).map(function(key) {
  		return [Number(key), parsed[key]];
	});

	// Scale the range of the data again 
	xBarScale.domain(data.map(function(d) { return d[0]; }));
    yBarScale.domain([0, d3.max(data, function(d) { return d[1]; })]);

	// Select the section we want to apply our changes to
	var svg = d3.select("#linesvg")
	var g = svg.select("#mainGroup")
  
	height = d3.select("#linesvg").attr("height") - 100; //(margin)

	//Remove old bars
	g.selectAll(".bar")
	.transition()
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
     .transition()
     .ease(d3.easeLinear)
     .duration(500)
     .delay(500)
     .attr("height", function(d) { return height - yBarScale(d[1]); })
     .style("fill", "rgb(77, 121, 255)");
	
    //Update X-Axis    
	svg.select("#xAxis") 
	   .transition()
	   .duration(500)
	   .call(d3.axisBottom(xBarScale));

	//Update Y-Axis
	svg.select("#yAxis") 
	    .transition()
	    .duration(500)
	    .call(d3.axisLeft(yBarScale));

	/* FUNCTIONS FOR BAR CHART */
	function handleMouseOver(d, i) 
	{
        d3.select(this)
        	.transition()
      		.style("fill", "rgb(221, 246, 254)");
	}

	function handleMouseOut(d, i) 
	{
        d3.select(this)
        	.transition()
      		.style("fill", "rgb(77, 121, 255)");	
    }

    function handleClick(d, i, year) 
	{
        d3.select(this)
    	  .transition()
  		  .style("fill", "rgb(55, 76, 172)");

        callUpdate(station, type, d[0]);
    }
}

/* ---------- Line chart ---------- */
function createLineChart(dataIn, station, type, year)
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
	svgGraph.id = "barsvg";
	svgGraph.setAttribute("width", 680);
	svgGraph.setAttribute("height", 400);
	mainContainer.appendChild(svgGraph); 

	//Create new line chart
	var svg = d3.select("#barsvg"),
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
		.attr("font-size", "18px")
	 	.text("Station Calls Per Year")

	//Add divider bar under text
	svg.append("line")
       .attr("x1", 0)
       .attr("y1", 25)
       .attr("x2", svg.attr("width"))
       .attr("y2", 25)
       .attr("stroke-width", 0.3)
       .attr("stroke", "black");

    /* FUNCTIONS FOR LINE CHART */

	function handleMouseOver(d, i) 
	{
        d3.select(this)
        	.transition()
      		.style("fill", "rgb(55, 76, 172)")
      		.attr("r", "8");
	}

	function handleMouseOut(d, i) 
	{
		//console.log("Finished");
        
        d3.select(this)
        	.transition()
      		.style("fill", "rgb(77, 121, 197)")
      		.attr("r", "6");	
    }

    function handleClick(d, i, year) 
	{
		d3.select(this)
        	.transition()
      		.style("fill", "rgb(77, 121, 197)")
      		.attr("r", "6");

      	d3.select(this)
      		.transition()
      		.delay(200)
      		.attr("r", "8");

		callUpdate(station, type, d[0]);
    }
}

function updateLineChart(inputData, station, type, year)
{
	//process data
	list = JSON.stringify(inputData);
	parsed = JSON.parse(list);

	//Transform the data
	var data = Object.keys(parsed).map(function(key) {
  		return [Number(key), parsed[key]];
	});

	

	//Create graph scale again
	xLineScale = xLineScale.domain([d3.min(data, function(d) { return d[0]; }), d3.max(data, function(d) { return d[0]; })]);
	yLineScale = yLineScale.domain([0, d3.max(data, function(d) { return d[1]; })]);

	//Find elements
	svg = d3.select("#barsvg");
	g = svg.select("#mainGroup");

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

    /* FUNCTIONS FOR LINE CHART */

	function handleMouseOver(d, i) 
	{
        d3.select(this)
        	.transition()
      		.style("fill", "rgb(55, 76, 172)")
      		.attr("r", "8");
	}

	function handleMouseOut(d, i) 
	{
		//console.log("Finished");
        
        d3.select(this)
        	.transition()
      		.style("fill", "rgb(77, 121, 197)")
      		.attr("r", "6");	
    }

    function handleClick(d, i, year) 
	{
		d3.select(this)
        	.transition()
      		.style("fill", "rgb(77, 121, 197)")
      		.attr("r", "6");

      	d3.select(this)
      		.transition()
      		.delay(200)
      		.attr("r", "8");

		callUpdate(station, type, d[0]);
    }
}

/* -------------------- AJAX CALLS -------------------- */

function fetchBarLineData(station, type, year)
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
			data: {"station": station, "type": type, "year": year},
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

/* -------------------- UPDATE GRAPHS -------------------- */
function callUpdate(station, type, year)
{
	//Request number of calls/time unit
	function ajax2()
	{
		return fetchBarLineData(station, type, year);
	}
	
	$.when(ajax2()).done(function(returnVal){
    	
		updateBarChart(returnVal, station, type, year);
		updateLineChart(returnVal, station, type, year);
		
	});
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

