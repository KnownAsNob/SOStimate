formDiv = document.getElementById("vizForm");

stations = [];
agency = [];
selectedData = [];
selectedDataDisplay = [];
selectedYears = [];
monthsIncl = ["No_Months"];
selectedGraph = [];

/* ------------------ Form functions ------------------*/

//Push data to array
function prepareData(data, output)
{
    for(entry in data)
    {
        output.push(data[entry]['value']);
    }

    if(output == selectedYears)
    {
        console.log("Selecting time...");

        //Set months to yes or no
        //monthsIncl[0] = output[output.length - 1];
        //output.pop();
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
                                    '<input type="radio" id="totalCalls" name="data" value="Calls">'+
                                    '<label for="totalCalls">Total Number of Calls</label><br>'+
                                    //'<input type="radio" id="incidentType" name="data" value="Incident">'+
                                    //'<label for="incidentType">Incident Type</label><br>'+
                                    //'<input type="radio" id="dispatchTime" name="data" value="DispatchTime">'+
                                    //'<label for="dispatchTime">Dispatch Time</label><br>'+
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
                                        //'<input type="radio" id="average" name="dataType" value="Average">'+
                                        //'<label for="average">Average</label><br>'+
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

                //Change text - Choose time information
                formDiv.innerHTML = '<form id = "timeForm">'+
                                        '<fieldset>'+
                                            '<p class = "vizQuestion">Which timeframes should be included in the visualization? <i>[You may choose more than one]</i></p>'+
                                            '<button class = "unselectButton" type="reset">Unselect All</button>'+
                                            '<p class = "vizQuestion">Years</p>'+
                                                '<input type="checkbox" id="2013" name="year" value="2013">'+
                                                '<label for="2013">2013</label><br>'+
                                                '<input type="checkbox" id="2014" name="year" value="2014">'+
                                                '<label for="2014">2014</label><br>'+
                                                '<input type="checkbox" id="2015" name="year" value="2015">'+
                                                '<label for="2015">2015</label><br>'+
                                                '<input type="checkbox" id="2016" name="year" value="2016">'+
                                                '<label for="2016">2016</label><br>'+
                                                '<input type="checkbox" id="2017" name="year" value="2017">'+
                                                '<label for="2017">2017</label><br>'+
                                                '<input type="checkbox" id="2018" name="year" value="2018">'+
                                                '<label for="2018">2018</label><br>'+

                                                //'<p class = "vizQuestion">Include months? <i>[Slower graph generation]</i></p>'+
                                                //'<input type="radio" id="yesMonths" name="includeMonths" value="Months">'+
                                                //'<label for="yesMonths">Yes</label><br>'+
                                                //'<input type="radio" id="noMonths" name="includeMonths" value="No_Months">'+
                                                //'<label for="noMonths">No</label><br>'+
                                        '</fieldset>'+
                                        '<input class="submit" type="submit" value="Next" />'+
                                    '</form>'

                //Handle submit - Data
                $('#timeForm').submit(function () {
                console.log("User submitted year!");

                    //If handling fails, break
                    if(!handleInput($('#timeForm').serializeArray(), selectedYears))
                    {
                        return;
                    }

                    //Change text - Choose graph type
                    formDiv.innerHTML = '<form id = "graphSelectionForm">'+
                                            '<fieldset>'+
                                                '<p class = "vizQuestion">Which type of graph will your visalization be?</p>'+
                                                '<input type="radio" id="lineGraph" name="graphType" value="LineGraph">'+
                                                '<label for="lineGraph">Line Chart</label><br>'+
                                                '<input type="radio" id="barGraph" name="graphType" value="BarGraph">'+
                                                '<label for="barGraph">Bar Chart</label><br>'+
                                            '</fieldset>'+
                                            '<input class="submit" type="submit" value="Generate" />'+
                                        '</form>'

                    //Handle submit - Data display
                    $('#graphSelectionForm').submit(function (e) {
                        console.log("User submitted graph selection!");

                        e.preventDefault();

                        //If handling fails, break
                        if(!handleInput($('#graphSelectionForm').serializeArray(), selectedGraph))
                        {
                            return;
                        }

                        formDiv.innerHTML = "";

                        drawCanvas();
                        createLoader("overallCustomSVG");
                        processFetchData();
                        
                        //console.log(stations);
                        //console.log(agency);
                        //console.log(selectedData);
                        //console.log(selectedDataDisplay);
                        //console.log(selectedYear);
                        
                    });
                });
            });  
        }); 
    });
});

/* ------------------ Data functions ------------------*/

//Process, send and return data
function processFetchData()
{
    function ajaxUserDataCall()
    {
        //Request number of calls/time unit
        return $.ajax({
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            type: "POST",
            url: "http://localhost:8000/map/get_graph_data/",
            datatype: "json",
            //async: true,
            data: {"stations": stations, "agency": agency[0], "selectedData": selectedData, "selectedDataDisplay": selectedDataDisplay[0], "selectedYears": selectedYears, "monthsIncl": monthsIncl, "selectedGraph": selectedGraph[0]},
            success: function(json)
            {
                //Operations here
            }
        });
    }

    return $.when(ajaxUserDataCall()).done(function(returnObj){
    
        console.log("Data returned successfully...");


        //Transform the data
        data = Object.keys(returnObj)
            .map(function(key) { return [String(key), returnObj[key]]; });

        console.log("Original data: " + data);

        drawGraph(data);
    });
}

/* ------------------ Graph functions ------------------*/

function drawCanvas()
{
    var totalWidth = d3.select('#vizForm')
        //Get width of div
        .style('width')
        //Take off 'px'
        .slice(0, -2)

    width = totalWidth;//* 0.98
    height = 500;

    //Create new SVG canvas
    const svgOverall = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgOverall.id = "overallCustomSVG";
    svgOverall.setAttribute("width", width);
    svgOverall.setAttribute("height", height);
    formDiv.appendChild(svgOverall); 
}

function drawGraph(data)
{
    //Create new bar chart
    var svg = d3.select("#overallCustomSVG"),
        margin = 100,
        width = svg.attr("width") - margin,
        height = svg.attr("height") - margin;

    console.log("Ready to draw graph...");

    //Draw line graph
    if(selectedGraph[0] == "LineGraph")
    {
        drawLineGraph(data, svg, width, height);
    }

    //Draw bar graph
    if(selectedGraph[0] == "BarGraph")
    {
        drawBarGraph(data, svg, width, height);
    }
}

function drawLineGraph(data, svg, width, height)
{
    removeLoader("overallCustomSVG");

    //Scale the chart
    xLineScale = d3.scaleLinear().range([0, width]),
    yLineScale = d3.scaleLinear().range([height, 0]);

    //Make new group to hold graph
    var g = svg.append("g")
               .attr("transform", "translate(" + 60 + "," + 50 + ")")
               .attr("id", "mainGroup");

    //Find max number of calls
    var keys = Object.keys(data[0][1]);
    max = 0;

    data.forEach(function(station) {
        keys.forEach(function(key) {
            if(station[1][key] > max)
            {
                max = station[1][key];
            }
        });
    });

    //Create graph scale
    xLineScale.domain([parseInt(selectedYears[0]), parseInt(selectedYears[selectedYears.length - 1])]);
    yLineScale.domain([0, max]);

    //Append X scale to graph
    g.append("g")
        .call(d3.axisBottom(xLineScale).tickFormat(function(d){
            return d;
        }).ticks(selectedYears.length))
        .attr("transform", "translate(0," + height + ")")
        .attr("id", "xAxis")
        .append("text")
        .attr("id", "xLabel")
        .attr("dx", 80)
        .attr("dy", 35)
        .attr("text-anchor", "end")
        .text("Years");

    //Append Y scale to graph
    g.append("g")
        .call(d3.axisLeft(yLineScale).tickFormat(function(d){
            return d;
        }).ticks(5))
        .append("text")
        .attr("id", "yLabel")
        .attr("transform", "rotate(-90)")
        .attr("dx", -300)
        .attr("dy", -35)
        .attr("text-anchor", "end")
        .text("Amount");

    //Define colours
    //var myColor = d3.scaleOrdinal().domain([0, stations.length])
        //.range(["gold", "blue", "green", "black", "grey", "pink", "brown", "slateblue", "orange"])

    //Define tooltip
    var popUp = d3.select("body").append("div")     
                .attr("class", "tooltip")                
                .style("opacity", 0);
    
    //Define and plot line for each station
    data.forEach(function(station, i) {

        singleData = [];

        //Build array of data for each station
        keys.forEach(function(key) {
            singleData.push([parseInt(key), station[1][key]]);
        });

        //Make new group to hold line
        var lineG = svg.append("g")
               .attr("transform", "translate(" + 60 + "," + 50 + ")")
               .attr("id", "lineGroup");

        //Define line
        var valueline = d3.line()
                          .x(function(d) { console.log(d[0]); return xLineScale(d[0]); })
                          .y(function(d) { console.log(d[1]); return yLineScale(d[1]); });
                          //.curve(d3.curveMonotoneX);

        //Append line
        lineG.append("path")
           .data([singleData])
           .attr("d", valueline)
           .attr("class", "line");
           //.attr("stroke", function(d){ return myColor(i); });

        //Append dots to line
        lineG.selectAll(".dot")
            .data(singleData)
            .enter()
            .append("circle")
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function(d) { return xLineScale(d[0]) })
            .attr("cy", function(d) { return yLineScale(d[1]) })
            .attr("r", 6)
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on("click", handleClick);

        // --- Legend ---

        lineG.append("text")
          .data(singleData)
          .attr("transform", function(d) { return "translate(" + (xLineScale(singleData[singleData.length - 1][0]) - 60) + "," + (yLineScale(singleData[singleData.length - 1][1]) - 20) + ")"; })
          .attr("x", 3)
          .attr("dy", "0.35em")
          .attr("class", "lineLabel")
          .text(function(d) { return stations[i]; });
          //.attr("fill", function(d){ return myColor(i); });

    }); //End for each

    // ------------------ Handle move events ------------------
    
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
        }

    console.log("Finished");
}

function drawBarGraph(data, svg, width, height)
{
    console.log(data);

    console.log("Drawing bar...");

    removeLoader("overallCustomSVG");
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