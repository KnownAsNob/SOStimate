mainContainer = document.getElementsByClassName("container");
mapContainer = document.getElementById("map");

function overviewChange(click, event, map, svg) {
    
	output = {};

    //Check if container already present
	if(document.getElementById("controlContainer") != null)
	{
		clearMap(svg);
	}

	//Check if none is selected i.e. default
    if(click.options[click.selectedIndex].text == "None")
    {
    	map.flyTo({center: [-6.259405, 53.347528], zoom: 13, essential: true});
    }

    else
    {
    	map.flyTo({center: [-6.183489, 53.458838], zoom: 9, essential: true});

    	if(click.options[click.selectedIndex].text == "Most Popular")
    	{
    		fetchData("Most_Pop");

    		//Create control box
    		createBox("Number of Calls");
    	}

    	else if(click.options[click.selectedIndex].text == "Average Response Time")
    	{
    		fetchData("Avg_Response");

    		//Create control box
    		createBox("Average Response Time");
    	}

    	else if(click.options[click.selectedIndex].text == "Average Travel Time")
    	{
    		fetchData("Avg_Travel");

    		//Create control box
    		createBox("Average Travel Time");
    	}

    	else if(click.options[click.selectedIndex].text == "Average Time to Hospital [Ambulance]")
    	{
    		fetchData("Avg_Travel_Hosp");

    		//Create control box
    		createBox("Average Time to Hospital");
    	}

    	else if(click.options[click.selectedIndex].text == "Average Time at Hospital [Ambulance]")
    	{
    		fetchData("Avg_Hosp_Time");

    		//Create control box
    		createBox("Average Time at Hospital");
    	}

  		//Get slider change info
    	slider = document.getElementById("slider");
    	sliderText = document.getElementById("sliderText");

    	//Update values based on slider
    	slider.oninput = function() 
    	{
  			updateCircles(this.value, output);
  			sliderText.innerHTML = this.value;
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

function createBox(title)
{
	outer = createMapElement("div", "controlContainer", mapContainer);
	    	inner = createMapElement("div", "controlContainerInner", outer);
	    		createMapElement("h3", "filterTitle", inner).innerHTML = title;
	    		createMapElement("label", "month", inner);
	    		input = createMapElement("input", "slider", inner);
		    	input.type = "range";
		    	input.min = "2013";
		    	input.max = "2018";
		    	input.step = "1";
		    	input.value = "0";
		    createMapElement("p", "sliderText", inner).innerHTML = "2013";
	    	legend = createMapElement("div", "legend", outer);
	    	legend.style.background = 'linear-gradient(to right, ' + css.getPropertyValue('--mouse-click-graph-color') + ', ' + css.getPropertyValue('--mouse-over-graph-color') + ')';
		   		createMapElement("div", "bar", legend);
		   		createMapElement("p", "legendText", legend).innerHTML = "Amount (Most to Least)";
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
			beforeSend: function(xhr){xhr.setRequestHeader('X-CSRFToken', "{{csrf_token}}");},
			url: "http://localhost:8000/map/get_calls_year/",
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