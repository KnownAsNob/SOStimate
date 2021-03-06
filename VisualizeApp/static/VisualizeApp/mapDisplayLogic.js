//Located here:
  //Handle map overlay drawing
  //Handle map overlay fetching and updating

mainContainer = document.getElementsByClassName("container");
mapContainer = document.getElementById("map");

function overviewChange(click, event, map, svg) {
    
	output = {};

	//Remove default markers
	removeMarkers();

    //Check if container already present
	if(document.getElementById("controlContainer") != null)
	{
		clearMap(svg);
	}

	//Check if none is selected i.e. default
    if(click.options[click.selectedIndex].text == "None")
    {
    	map.flyTo({center: [-6.259405, 53.347528], zoom: 13, essential: true});

    	//Re-draw markers
    	drawMarkers();
    }

    else
    {
    	map.flyTo({center: [-6.183489, 53.458838], zoom: 9, essential: true});

    	if(click.options[click.selectedIndex].text == "Most Popular")
    	{
    		fetchData("Most_Pop");

    		//Create control box
    		createBox("Number of Calls", "Amount of calls (Less to more)");
    	}

    	else if(click.options[click.selectedIndex].text == "Average Response Time")
    	{
    		fetchData("Avg_Response");

    		//Create control box
    		createBox("Average Response Time", "Response time (Slow to fast)");
    	}

    	else if(click.options[click.selectedIndex].text == "Average Travel Time")
    	{
    		fetchData("Avg_Travel");

    		//Create control box
    		createBox("Average Travel Time", "Travel time (Slow to fast)");
    	}

    	else if(click.options[click.selectedIndex].text == "Average Time to Hospital [Ambulance]")
    	{
    		fetchData("Avg_Travel_Hosp");

    		//Create control box
    		createBox("Average Time to Hospital", "Travel time (Slow to fast)");
    	}

    	else if(click.options[click.selectedIndex].text == "Average Time at Hospital [Ambulance]")
    	{
    		fetchData("Avg_Hosp_Time");

    		//Create control box
    		createBox("Average Time at Hospital", "Time at Hospital (Less to more)");
    	}

  		//Get slider change info
    	slider = document.getElementById("slider");
    	sliderText = document.getElementById("sliderText");

    	//Update values based on slider
    	slider.oninput = function() 
    	{
  			updateCircles(this.value, output);
  			sliderText.innerHTML = "Current year: " + this.value;
		} 
    }
} //End overviewChange

function createMapElement(elementType, id, appendTo)
{
	parentContainer = appendTo;

	newElement = document.createElement(elementType);
	newElement.id = id;
	parentContainer.appendChild(newElement);

	return newElement;
}

function createBox(title, legendT)
{
	outer = createMapElement("div", "controlContainer", mapContainer);
	    	inner = createMapElement("div", "controlContainerInner", outer);
	    		createMapElement("h3", "filterTitle", inner).innerHTML = title;
	    		createMapElement("p", "sliderGuide", inner).innerHTML = "<i>Click and drag to change:</i>";
	    		input = createMapElement("input", "slider", inner);
		    	input.type = "range";
		    	input.min = "2013";
		    	input.max = "2018";
		    	input.step = "1";
		    	input.value = "0";
		    createMapElement("p", "sliderText", inner).innerHTML = "Current year: 2013";
	    	legend = createMapElement("div", "legend", outer);
	    	legend.style.background = 'linear-gradient(to right, ' + css.getPropertyValue('--mouse-over-graph-color') + ', ' + css.getPropertyValue('--mouse-click-graph-color') + ')';
		   		createMapElement("div", "bar", legend);
		   		createMapElement("p", "legendText", legend).innerHTML = legendT;

		   	//Create category list
		   	timeCatList = createMapElement("div", "timeCatList", outer);
		   	createMapElement("h3", "filterTitle", timeCatList).innerHTML = "Time Categories";
		   	createMapElement("p", "catList", timeCatList).innerHTML = '<ul>' +
																			'<li><b>1: </b>0 - 1 Minute</li>' +
																			'<li><b>2: </b>1 - 5 Minutes </li>' +
																			'<li><b>3:  </b>5 - 10 Minutes</li>' +
																			'<li><b>4: </b>10 - 15 Minutes</li>' +
																			'<li><b>5: </b>15 - 30 Minutes</li>' +
																			'<li><b>6: </b>30 Minutes - 1 Hour</li>' +
																			'<li><b>7: </b>1 - 1:30 Hour</li>' +
																			'<li><b>8: </b>1:30 - 2 Hours</li>' +
																			'<li><b>9: </b>2 - 3 Hours</li>' +
																			'<li><b>10: </b>> 3 Hours</li>' +
																		'</ul>';		   					
}

// ---------- Fetch data ---------- //

function fetchData(type)
{
	function ajaxCall()
	{
		//Request number of calls/time unit
		return $.ajax({
			contentType: "application/x-www-form-urlencoded;charset=UTF-8",
			type: "POST",
			url: "get_calls_year/",
			datatype: "json",
			//async: true,
			data: {"type": type},
			success: function(json)
			{
				output = json;
			}
		});
	}

	$.when(ajaxCall()).done(function(returnVal){
		
		//Process data	
		//console.log("Java return: " + typeof(returnVal1))
		
		//Transform the data
		output = Object.keys(returnVal)
			.map(function(key) { return [String(key), returnVal[key]]; });

		addCircles(output);
		update();
	});

	return output;
}

function clearMap()
{
	//Remove menu
	frame = document.getElementById("controlContainer");
	frame.parentNode.removeChild(frame);

	//Remove map elements
	svg.selectAll("g")
		.remove();
}