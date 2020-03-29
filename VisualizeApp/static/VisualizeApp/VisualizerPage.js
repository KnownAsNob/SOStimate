formDiv = document.getElementById("vizForm");

var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

stations = [];
agency = [];
selectedData = [];
selectedDataDisplay = [];
selectedYears = [];
monthsIncl = ["No_Months"];
selectedGraph = [];

/* ------------------ Form functions ------------------*/

//Show selected tab
function showTab(n) 
{
    var x = document.getElementsByClassName("tab");
    
    x[n].style.display = "block";
    
    //No prev button if first
    if (n == 0) 
    {
        document.getElementById("prevBtn").style.display = "none";
    } 

    else 
    {
        document.getElementById("prevBtn").style.display = "inline";
    }
    
    //Submit instead of next button if last
    if (n == (x.length - 1)) 
    {
        document.getElementById("nextBtn").innerHTML = "Submit";
    } 

    else 
    {
        document.getElementById("nextBtn").innerHTML = "Next";
    }

    fixStepIndicator(n)
}

function nextPrev(n) 
{
    // This function will figure out which tab to display
    var x = document.getElementsByClassName("tab");
    
    // Exit the function if any field in the current tab is invalid:
    if (n == 1 && !validateForm()) return false;
    
    // Hide the current tab:
    x[currentTab].style.display = "none";
    
    // Increase or decrease the current tab by 1:
    currentTab = currentTab + n;
    
    // if you have reached the end of the form... :
    if (currentTab >= x.length) 
    {
        //Submit form at end
        //document.getElementById("regForm").submit();

        console.log(stations);
        console.log(agency);
        console.log(selectedData);
        console.log(selectedDataDisplay);
        console.log(selectedYears);

        //formDiv.innerHTML =  "<div class='loader'></div>";
        formDiv.innerHTML =  "";

        drawCanvas();
        createLoader("overallCustomSVG");
        processFetchData();
       
        return false;
    }
    // Otherwise, display the correct tab:
    showTab(currentTab);
}

function validateForm() 
{
    //This function deals with validation of the form fields
    var x, y, i, valid = true;
    
    x = document.getElementsByClassName("tab");
    y = x[currentTab].getElementsByTagName("input");
    
    //Check inputs in current tab
    for (i = 0; i < y.length; i++) 
    {
        if (y.length == 0) 
        {
            // add an "invalid" class to the field:
            y[i].className += " invalid";
            
            // and set the current valid status to false:
            valid = false;
        }
    }
    
    // If the valid status is true, mark the step as finished and valid:
    if (valid) 
    {
        addToVar(y);
        document.getElementsByClassName("step")[currentTab].className += " finish";
    }
    
    return valid; // return the valid status
}

function fixStepIndicator(n) 
{
    
    // This function removes the "active" class of all steps...
    var i, x = document.getElementsByClassName("step");
    
    for (i = 0; i < x.length; i++) 
    {
        x[i].className = x[i].className.replace(" active", "");
    }
    
    //... and adds the "active" class to the current step:
    x[n].className += " active";
}

function addToVar(selection)
{
    //Decide variable to append
    switch(currentTab) 
    {
        case 0: //Station
                variable = stations;
        break;
    
        case 1: //Agency
                variable = agency;
        break;

        case 2: //Data
                variable = selectedData;
        break;

        case 3: //Data form
                variable = selectedDataDisplay;
        break;

        case 4: //Time
                variable = selectedYears;
        break;

        case 5: //Graph
                variable = selectedGraph;
        break;
    
        default:
            // code block
    } 

    for(item in selection)
    {
        if(selection[item].checked == true)
        {
            variable.push(selection[item].value)
        }
    }
}

//Check all
function checkAll() {
    var checkboxes = $("input:checkbox")
    checkboxes = [...checkboxes];
    
    for (var i = 0; i < checkboxes.length; i++) 
    {
        checkboxes[i].checked = true
    }
}

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
            url: "get_graph_data/",
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

        //Transform the data
        data = Object.keys(returnObj)
            .map(function(key) { return [String(key), returnObj[key]]; });

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

        // --- Legend --- //

        lineG.append("text")
          .data(singleData)
          .attr("transform", function(d) { return "translate(" + (xLineScale(singleData[singleData.length - 1][0])) + "," + (yLineScale(singleData[singleData.length - 1][1]) - 20) + ")"; })
          .attr("dy", "0.35em")
          .attr("class", "lineLabel")
          .text(function(d) { return stations[i]; })
          .attr("x", function() { return -this.getComputedTextLength(); });
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