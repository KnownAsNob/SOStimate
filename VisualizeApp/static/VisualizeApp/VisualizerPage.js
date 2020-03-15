formDiv = document.getElementById("vizForm");

stations = [];
agency = [];
selectedData = [];
selectedDataDisplay = [];

//Push data to array
function prepareData(data, output)
{
    for(entry in data)
    {
        output.push(data[entry]['value']);
    }
}

//Check entry not empty
function checkEntry(entry)
{
    if(entry.length == 0)
    {
        alert("Must select atleast one option for each category to build the visualization!");
        return false;
    }

    else
    {
        return true;
    }
}

function handleInput(form, pushTo)
{
    if (!checkEntry(form))
    {
        console.log("Fail");
        return false;
    }

    else
    {
        prepareData(form, pushTo);
        return true;
    }
}

//Handle form submissions
//Form - Station
$('#stationForm').submit(function () {
    console.log("User submitted station!");

    //If handling fails, break
    if(!handleInput($('#stationForm').serializeArray(), stations))
    {
        return;
    }

    //Change text - Choose Agency
    formDiv.innerHTML = '<form id = "agencyForm">'+
                            '<fieldset>'+
                                '<p class = "vizQuestion">Which agency should be included in the visualization?</p>'+
                                '<input type="radio" id="overall" name="agency" value="Overall">'+
                                '<label for="overall"> Both Ambulance and Fire Brigade</label><br>'+
                                '<input type="radio" id="da" name="agency" value="DA">'+
                                '<label for="da"> Ambulance Only</label><br>'+
                                '<input type="radio" id="df" name="agency" value="DF">'+
                                '<label for="df"> Fire Brigade Only</label><br>'+
                            '</fieldset>'+
                            '<input class="submit" type="submit" value="Next" />'+
                        '</form>';

    //Handle submit - Agency
    $('#agencyForm').submit(function () {
        console.log("User submitted agency!");

        //If handling fails, break
        if(!handleInput($('#agencyForm').serializeArray(), agency))
        {
            return;
        }

        //Change text - Choose Data
        formDiv.innerHTML = '<form id = "dataForm">'+
                                '<fieldset>'+
                                    '<p class = "vizQuestion">What data would you like to see on the graph?</p>'+
                                    '<input type="radio" id="incidentType" name="data" value="Incident Type">'+
                                    '<label for="incidentType">Incident Type</label><br>'+
                                    '<input type="radio" id="dispatchTime" name="data" value="DispatchTime">'+
                                    '<label for="dispatchTime">Dispatch Time</label><br>'+
                                    //'<input type="radio" id="" name="data" value="">'+
                                    //'<label for=""></label><br>'+
                                '</fieldset>'+
                                '<input class="submit" type="submit" value="Next" />'+
                            '</form>';
        
        //Handle submit - Data
        $('#dataForm').submit(function () {
            console.log("User submitted data!");

            //If handling fails, break
            if(!handleInput($('#dataForm').serializeArray(), selectedData))
            {
                return;
            }

            //Change text - Choose data display
            formDiv.innerHTML = '<form id = "dataViewForm">'+
                                    '<fieldset>'+
                                        '<p class = "vizQuestion">What would you like to see about the chosen data?</p>'+
                                        '<input type="radio" id="totalCount" name="dataType" value="TotalCount">'+
                                        '<label for="totalCount">Total Count</label><br>'+
                                        '<input type="radio" id="average" name="dataType" value="Average">'+
                                        '<label for="average">Average</label><br>'+
                                    '</fieldset>'+
                                    '<input class="submit" type="submit" value="Next" />'+
                                '</form>'

            //Handle submit - Data display
            $('#dataViewForm').submit(function () {
                console.log("User submitted data view!");

                //If handling fails, break
                if(!handleInput($('#dataViewForm').serializeArray(), selectedDataDisplay))
                {
                    return;
                }

                console.log(stations);
                console.log(agency);
                console.log(selectedData);
                console.log(selectedDataDisplay);

                formDiv.innerHTML = "Ready";

            });  
        }); 
    });
});