mainContainer = document.getElementsByClassName("container");
mapContainer = document.getElementById("map");

function overviewChange(click, event, map, svg) {
    
    //Check if container already present
	if(document.getElementById("controlContainer") != null)
	{
		frame = document.getElementById("controlContainer");

		frame.parentNode.removeChild(frame);

		svg.selectAll(".mapCircle")
			.remove();
	}

	//Check if none is selected i.e. default
    if(click.options[click.selectedIndex].text == "None")
    {
    	map.flyTo({center: [-6.259405, 53.347528], zoom: 13, essential: true});
    }

    else
    {
    	map.flyTo({center: [-6.183489, 53.458838], zoom: 9, essential: true});

  		//Create control box
    	createBox();

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

function createBox()
{
	outer = createMapElement("div", "controlContainer", mapContainer);
	    	inner = createMapElement("div", "controlContainerInner", outer);
	    		createMapElement("h3", "filterTitle", inner).innerHTML = "Sample";
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
		   		createMapElement("p", "legendText", legend).innerHTML = "Calls";
}

// ---------- Fetch data ---------- //

output = {};

function fetchData(year, svg)
{
	function ajaxCall()
	{
		//Request number of calls/time unit
		return $.ajax({
			contentType: "application/x-www-form-urlencoded;charset=UTF-8",
			type: "POST",
			url: "http://localhost:8000/map/get_calls_year/",
			datatype: "json",
			//async: true,
			data: {"year": year},
			success: function(json)
			{
				output = json;
				//console.log("Return: " + json);
			}
		});
	}

	$.when(ajaxCall()).done(function(returnVal){
		
		//Process data	
		list = JSON.stringify(returnVal);
		parsed = JSON.parse(list);

		//Transform the data
		output = Object.keys(parsed)
			.map(function(key) { return [Array(key), parsed[key]]; });

		console.log("Return: " + output);

		addCircles(output);
		update();
	});

	
	//console.log("Return: " + output);

	return output;
}