mainContainer = document.getElementsByClassName("container");
mapContainer = document.getElementById("map");

function overviewChange(click, event, map) {
    
    //Check if container already present
	if(document.getElementById("controlContainer") != null)
	{
		frame = document.getElementById("controlContainer");

		frame.parentNode.removeChild(frame);
	}

	//Check if none is selected i.e. default
    if(click.options[click.selectedIndex].text == "None")
    {
    	map.flyTo({center: [-6.259405, 53.347528], zoom: 13, essential: true});
    }

    else
    {
    	map.flyTo({center: [-6.183489, 53.458838], zoom: 9, essential: true});

    //Create map outer
    outer = createMapElement("div", "controlContainer", mapContainer);
    	inner = createMapElement("div", "controlContainerInner", outer);
    		createMapElement("h3", "filterTitle", inner).innerHTML = "Sample";
    		createMapElement("label", "month", inner);
    		input = createMapElement("input", "slider", inner);
	    	input.type = "range";
	    	input.min = "0";
	    	input.max = "11";
	    	input.step = "1";
	    	input.value = "0";
    	legend = createMapElement("div", "legend", outer);
	   		createMapElement("div", "bar", legend);
	   		createMapElement("div", "legendText", legend).innerHTML = "Calls";
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