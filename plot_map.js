// custom marker for selected restaurant
var plainMarker = L.icon({
    iconUrl: './leaflet-0.8-dev/images/marker-icon.png',
    iconSize:    [18, 30],
    iconAnchor:  [9, 30],
});

var starMarker1 = L.icon({
    iconUrl: './leaflet-0.8-dev/images/marker-star1.png',
    iconSize:    [18, 30],
    iconAnchor:  [9, 30],
  });

var starMarker2 = L.icon({
    iconUrl: './leaflet-0.8-dev/images/marker-star2.png',
    iconSize:    [18, 30],
    iconAnchor:  [9, 30],
   });

var starMarker3 = L.icon({
    iconUrl: './leaflet-0.8-dev/images/marker-star3.png',
    iconSize:    [18, 30],
    iconAnchor:  [9, 30],
   });

var starMarker4 = L.icon({
    iconUrl: './leaflet-0.8-dev/images/marker-star4.png',
    iconSize:    [18, 30],
    iconAnchor:  [9, 30],
  });

var starMarker5 = L.icon({
    iconUrl: './leaflet-0.8-dev/images/marker-star5.png',
    iconSize:    [18, 30],
    iconAnchor:  [9, 30],
  });

function GetMarkerbyStar(star) {
    var marker = L.Marker;
    switch(Math.round(star)) {
        case 1: marker = starMarker1; break;
        case 2: marker = starMarker2; break;
        case 3: marker = starMarker3; break;
        case 4: marker = starMarker4; break;
        case 5: marker = starMarker5; break;
    }
    return marker;
};

var map
var restaurant_data; //[business_id, name, lon, lat, average_rating]

// area selection
var markers = []
var SelectedMarkers = [];
var SelectedMarkerZIndex = [];
var selectedID = [];
var BrushedResID = []

var yScale = d3.scale.linear().domain([0, 5]).range([150, 50]);
var mindate = new Date("Janurary 1, 2011 00:00:00");
var maxdate = new Date("Janurary 1, 2015 00:00:00");
var yearFormat = d3.time.format("%Y");
var xScale = d3.time.scale().domain([mindate, maxdate]).range([50, 750]);
var allIDs;   // restaurant ID for all the restaurants
var rating;     // store the the json file after importing

// funtiont generate date object from database entry
var formatDate = d3.time.format("%Y-%m-%d");

function mainPlot(){
    // ---------------------------------------------------------
    // Draw the map
    // ---------------------------------------------------------

    // create a map in the "map" div, set the view to a given place and zoom
    lon = restaurant_data[0][2]
    lat = restaurant_data[0][3]
    map = L.map('map').setView([lon, lat], 11);
    map.scrollWheelZoom.disable();

    // add an OpenStreetMap tile layer
    L.tileLayer('http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png', {
        detectRetina: true,
        styles: 'grayscale'
    }).addTo(map);

    // add reset button (using easyButton)
    L.easyButton("fa-rotate-left",
                 function() {
                     map.setView([restaurant_data[0][2], restaurant_data[0][3]], 11)

                     // resume all markers
                     for (var i = 0; i < markers.length; i++) {
                         markers[i].setOpacity(1);
                     }

                     for (var i = 0; i < markers.length; i++) {
                         selectedID.push(markers[i]._leaflet_id);
                         SelectedMarkers.push(markers[i]);
                         SelectedMarkerZIndex.push(markers[i]._zIndex);
                     }
                     plotByID(selectedID);
                  },
                  "Reset",
                  map);

    // ---------------------------------------------------------
    // Draw the scatter plot of the ratings
    // ---------------------------------------------------------

    // draw the scatter plot (weighted rating vs average rating) axises
    var xAxis = d3.svg.axis().ticks(5).scale(xaxisRange);
    var yAxis = d3.svg.axis().ticks(5).scale(yaxisRange);

    // color scale, Cynthia Brewer’s RdYlBu scale
    var color01 = "#91bfdb";     //blue
    var color02 = "#ffffbf";     //white
    var color03 = "#fc8d59";     //red
    var colorScale = d3.scale.linear().domain([0, 2.5, 5])
        .range([color01, color02, color03]);

    //axis of color scale map
    var rateScale = d3.scale.linear().domain([5, 2.5, 0]).range([100, 200, 300]);
    var rateAxis = d3.svg.axis().ticks(5).scale(rateScale);
    rateAxis.orient("left");
    var rateAxisSel = d3.select("#scatter") // or something else that selects the SVG element in your visualizations
        .append("g") // create a group node
        .attr("class", "axises")
        .attr("transform", "translate(30, 0)")
        .call(rateAxis); // call the axis generator

    //plot the legend of scatter plot
    gradientPlot = function (c1, c2, c3)
    {
        var gradientScale = d3.scale.linear()
        .domain([0, 50, 100])
        .range([c3, c2, c1]);

        for (k=0; k<100; k++)
        {
            d3.select("#scatter")
            .append("rect")
            .attr("width", 20)
            .attr("height", 2)
            .attr("x", 30)
            .attr("y", 100 + k*2)
            .style("fill", gradientScale(k));
        }
    }

    gradientPlot(color01, color02, color03);

    // Add brush
    var brush = d3.select("#scatter").append("g")
        .attr("class", "brush")
        .call(d3.svg.brush()
                .x(xaxisRange)
                .y(yaxisRange)
                .on("brushstart", brushstart)
                .on("brush", brushmove)
                .on("brushend", brushend));

    function clearDetail() {
        // Clear table content
        d3.select("body").select("#name").text("");
        d3.select("body").select("#weiRating").text("");
        d3.select("body").select("#aveRating").text("");
        d3.select("body").select("#numRating").text("");
        d3.select("body").select("#firRating").text("");
        d3.select("body").select("#lasRating").text("");

        // Clear review history
        d3.select("#historyPlot").selectAll("circle").remove();
    }

    function brushstart() {
        BrushedResID = [];
        highlightInMap(BrushedResID);
        clearDetail();
    }

    function brushmove() {
        BrushedResID = [];

        var extent = d3.event.target.extent();
        d3.select("#scatter").selectAll("circle").classed("hidden", function(d, i) {
            inBrush = (extent[0][0] <= weightedR[i] && weightedR[i] <= extent[1][0]
                      && extent[0][1] <= d && d <= extent[1][1]);
            if(inBrush) { BrushedResID.push(resID[i]);}
            return !inBrush;
        })

        highlightInMap(BrushedResID);
    }

    function brushend() {
        if (d3.event.target.empty()) {
            d3.select("#scatter").selectAll("circle").classed("hidden", false)
            for(var i = 0; i < SelectedMarkers.length; i ++) {
                SelectedMarkers[i].setOpacity(1);
                SelectedMarkers[i].setZIndexOffset(SelectedMarkerZIndex[i]);
            }
            plotByID(selectedID);
        }
    }

    // the equal line in the scatter plot
    d3.select("#scatter").append("line")
        .attr("x1", 110)
        .attr("y1", 370)
        .attr("x2", 460)
        .attr("y2", 20)
        .attr("stroke", "blue")
        .attr("stroke-width", 1);

    // axis of the scatter plot
    yAxis.orient("left");
    d3.select("#scatter").append("g").attr("class", "axises")
        .attr("transform", "translate(110, 0)")
        .call(yAxis); // call the axis generator
     d3.select("#scatter").append("g")
        .attr("class", "axises")
        .attr("transform", "translate(0, 370)")
        .call(xAxis); // call the axis generator

    // Click on scatterplot
    d3.select("#scatter")
    .on("mousedown", function()
    {
        var mouseC = d3.mouse(this);
        for (var k=0; k<weightedR.length; k++){
            if ((mouseC[0] + 5) > xaxisRange(weightedR[k]) && (mouseC[0] - 5) < xaxisRange(weightedR[k])) {
                if ((mouseC[1] + 5) > yaxisRange(ratMean[k]) && (mouseC[1] - 5) < yaxisRange(ratMean[k])) {
                    clickOnScatter(k);
                }
            }
        }

    });

    function clickOnScatter(resIndex) {
        var k = resIndex;
        d3.select("body").select("#name").text(resName[k]);
        d3.select("body").select("#weiRating").text(weightedR[k]);
        d3.select("body").select("#aveRating").text(ratMean[k]);
        d3.select("body").select("#numRating").text(numR[k]);
        d3.select("body").select("#firRating").text(firstDate[k]);
        d3.select("body").select("#lasRating").text(lastDate[k]);

        onCircle = true
        highlightInMap([resID[k]]);

        // plot single restaurant rating through the time
        var revi1;
        restaurantID1 = selectedID[k];
        //console.log(restaurantID1);

        function importRating1 (rid)     // import the rating info of a selected restaurant
        {
            //console.log(rid);
            var numRatings = rating[rid].length; // number of ratings for this restaurant
            revi1 = new Array(numRatings);       // import ratings
            revit = new Array(numRatings);       // import ratings date information

            for (var h=0; h<numRatings; h++)
            {
                revi1[h] = rating[rid][h][0];
                revit[h] = formatDate.parse(rating[rid][h][1]);

            }
        }

        importRating1 (restaurantID1);

        d3.select("body").select("#historyPlot").selectAll("circle").remove();
        d3.select("body").select("#historyPlot").select("#rNm").remove();
        d3.select("#historyPlot").append("text")
        .attr("id", "rNm")
        .attr("x", 50)
        .attr("y", 20)
        .text("Rating history");

        d3.select("#historyPlot")
        .selectAll("circle")
        .data(revi1)
        .enter()
        .append("circle")
        .attr("cx", function(d,i) { return xScale(revit[i]); })
        .attr("cy", function(d) { return yScale(d); })
        .attr("r", function(d,i) { if (yearFormat(revit[i]) > 2010 && yearFormat(revit[i]) < 2015) return 3; else return 0;})

        // hide other circles when click on one
        d3.select("#scatter").selectAll("circle").classed("hidden", function (d, j) {
            // d is average, weightedR[j] is weighted
            return !(k==j && ratMean[k]==d);
        });
    }

    // ----------------------------------------------------------
    // Draw the history of reviews
    // ----------------------------------------------------------

    // draw the axises
    d3.select("#historyPlot").append("text")
        .attr("id", "rNm")
        .attr("x", 50)
        .attr("y", 20)
        .style("font-size", "16px")
        .text("------");

    var yAxis = d3.svg.axis()
        .orient("left")
        .ticks(5)
        .scale(yScale);

    var xAxis = d3.svg.axis()
        .orient("bottom")
        .ticks(6)
        .scale(xScale);

    d3.select("#historyPlot").append("g")
        .attr("class", "axises")
        .attr("transform", "translate(50,0)")
        .call(yAxis);

    d3.select("#historyPlot").append("g")
        .attr("class", "axises")  // give it a class so it can be used to select only xaxis labels  below
        .attr("transform", "translate(0,150)")
        .call(xAxis);

    // ---------------------------------------------------------
    // Marker on map
    // ---------------------------------------------------------

    // Add markers to map
    for (var i = 0; i < restaurant_data.length; i ++) {
         var marker = L.marker([restaurant_data[i][2], restaurant_data[i][3]], {icon: GetMarkerbyStar(restaurant_data[i][4])} ).on('click', onClick);
         marker._leaflet_id = restaurant_data[i][0];
         marker.addTo(map);
         markers[markers.length] = marker
    }

    map.on("boxzoomend", function(e) {
        // reset
        for (var i = 0; i < markers.length; i++) {
            markers[i].setOpacity(1);
        }
        selectedID = [];
        SelectedMarkers = [];
        SelectedMarkerZIndex = [];
        for (var i = 0; i < markers.length; i++) {

            // Not in the boundary or not selected
            if (! e.boxZoomBounds.contains(markers[i].getLatLng())) {
                markers[i].setOpacity(0);
            }
            else {
                selectedID.push(markers[i]._leaflet_id);
                SelectedMarkers.push(markers[i]);
                SelectedMarkerZIndex.push(markers[i]._zIndex);
            }
        }
        plotByID(selectedID);
    });

    // Highlight the marker when click on corresponding scatterplot
    function highlightInMap(resIDs) {
        for(var i = 0; i < SelectedMarkers.length; i ++) {
            flag = false;
            for(var j = 0; j < resIDs.length; j ++) {
                if(SelectedMarkers[i]._leaflet_id == resIDs[j]) {
                    flag = true;
                    break;
                }
            }

            if(flag) {
                SelectedMarkers[i].setOpacity(1);
                SelectedMarkers[i].setZIndexOffset(10000);
            }
            else {
                SelectedMarkers[i].setOpacity(0.2);
                SelectedMarkers[i].setZIndexOffset(SelectedMarkerZIndex[i]);
            }
        }
    }

    // Click on a marker
    function onClick(e) {
        resIndex = 0;
        for(var i = 0; i < resID.length; i ++) {
            if(resID[i] == this._leaflet_id) {
                resIndex = i;
                break;
            }
        }
        clickOnScatter(resIndex);
        highlightInMap([this._leaflet_id]);
    }

    // --------------------------------------------
    // Others
    // --------------------------------------------

    // plot all the restaurant at the begining;
    for (var i = 0; i < markers.length; i++) {
        selectedID.push(markers[i]._leaflet_id);
        SelectedMarkers.push(markers[i]);
        SelectedMarkerZIndex.push(markers[i]._zIndex);
    }
    plotByID(selectedID);
};

d3.json("./reviews.json", function(error, json) {
    if (error) return console.warn(error);
    rating = json;

    d3.json("./az100.json", function(error, json) {
        if (error) return console.warn(error);
        restaurant_data= json;
        mainPlot();
    });

});
