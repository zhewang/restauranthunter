var rating;     // store the the json file after importing
var revi;       // store ratings for one restaruant
var revit;      // store the date of corresponding rating
var firstN = 1;   //first firstN reviews will be compared with the total average
var ratMean;    // store avearge rating of selected restaurant
var firstRat;   // store the first rating of selected restaurant
var counter = 0;   //count how many restaurants of selected have been imported
var resName;   // store the restaurant name of selected restaurant
var resID;    // store the restaurant ID of selected restaurant
var numR;      // store how many ratings of each restaurant
var firstDate;   // store the date of first rating of each restaurant
var lastDate;  // store the date of last rating of each restuarant

// funtiont generate date object from database entry
var formatDate = d3.time.format("%Y-%m-%d");

function plotByID (business_id)
{
    // create new array to store mean rating for all the restaurant
    ratMean = new Array(business_id.length);
    firstRat = new Array(business_id.length);
    resName = new Array(business_id.length);
    numR = new Array(business_id.length);
    firstDate = new Array(business_id.length);
    lastDate = new Array(business_id.length);
    resID = new Array(business_id.length);
    counter = 0;

    d3.select("body").selectAll(".svgclass").remove();  // clean all the drawings

    for (var j=0; j<business_id.length; j++)
    {
        if (rating.hasOwnProperty(business_id[j])) {
            svgname = "svg" + j.toString();

            // create a svg for the new restaurant
            d3.select("body").append("svg").attr("width", 800).attr("height", 200)
                .attr("id", svgname).attr("class", "svgclass");

            // ToDo use a key value array for restaurant data, so that
            //      we can get name like restaurant_data["id"]
            function getNamebyID(id) {
                for (var i = 0; i < restaurant_data.length; i ++)
                    if (restaurant_data[i][0] == business_id[j]) {
                        return restaurant_data[i][1]
                    };
            }

            rName = getNamebyID(business_id[j]);      // actual name of restaurant
            resID[j] = business_id[j]
            resName[j] = rName;
            restaurantID = business_id[j];            // restaurant id in the database
            importRating(restaurantID);

            plotRating(revi, revit, svgname, rName);

            // initialize the table
            d3.select("body").select("#name").text(resName[0]);
            d3.select("body").select("#weiRating").text(firstRat[0]);
            d3.select("body").select("#aveRating").text(ratMean[0]);
            d3.select("body").select("#numRating").text(numR[0]);
            d3.select("body").select("#firRating").text(firstDate[0]);
            d3.select("body").select("#lasRating").text(lastDate[0]);

        } else {
            alert("Don't have reviews for this restaurant")
        }
    }

    // draw first review (y) vs avearage review (x)
    xaxisRange = d3.scale.linear().domain([0, 5]).range([40,390]);
    yaxisRange = d3.scale.linear().domain([0, 5]).range([370,20]);

    d3.select("#scatter").selectAll("circle").remove();
    d3.select("#scatter")//.append("svg").attr("width", 400).attr("height", 400).attr("id", "scatter")
        .selectAll("circle")
        .data(ratMean)
        .enter()
        .append("circle")
        .attr("cx", function (d, i) { return xaxisRange(firstRat[i]);} )
        .attr("cy", function (d) { return yaxisRange(d);})
        .attr("r", 5)

    // hide other circles when click on one
    d3.selectAll("circle")
        .on("click", function(d, i) {
            d3.selectAll("circle").classed("hidden", function (e, j) {
                return d != e || i != j;
            });
        });
}

// function to load ratings for one restaurant
function importRating (rid)
{
    var numRatings = rating[rid].length; // number of ratings for this restaurant
    revi = new Array(numRatings);         // import ratings
    revit = new Array(numRatings);        // import date of ratings
        for (var k=0; k<numRatings; k++)
        {
            revi[k] = rating[rid][k][0];
            revit[k] = formatDate.parse(rating[rid][k][1]);
            //console.log(revi[k], revit[k]);
        }

    firstDate[counter] = rating[rid][0][1];
    lastDate[counter] = rating[rid][numRatings-1][1];
    numR[counter] = numRatings;
    ratMean[counter] = (d3.mean(revi)).toFixed(1);
    firstRat[counter] = revi[0];
    //console.log(ratMean[0]);
    counter++;

}

var mindate = new Date("Janurary 1, 2011 00:00:00");
var maxdate = new Date("Janurary 1, 2015 00:00:00");

// plot the ratings
function plotRating (revi_temp, revit_temp, svgname, rName)
{

    svgname = "#" + svgname;
    var yScale = d3.scale.linear().domain([0, 5])    // ratings between 0 and 100
        .range([150, 50]);

    // var mindate = revit_temp[0];
    // var maxdate = revit_temp[(revit_temp.length - 1)];

    var xScale = d3.time.scale().domain([mindate, maxdate])
        .range([50, 750]);

    d3.select(svgname).selectAll("text").remove();

    d3.select(svgname).append("text")
        .attr("x", 50)
        .attr("y", 20)
        .style("font-size", "16px")
        .text("---" + rName + "---");

    var yearFormat = d3.time.format("%Y");
    //console.log(yearFormat(revit_temp[0]));
    d3.select(svgname)
        .selectAll("rect")
        .data(revi_temp)
        .enter()
        .append("rect")
        .attr("width", 5)
        .attr("height", function(d,i) { if (yearFormat(revit_temp[i]) > 2010 && yearFormat(revit_temp[i]) < 2015) return d*20; else return 0;})
        .attr("x", function(d,i) { return xScale(revit_temp[i]); })
        .attr("y", function(d) { return yScale(d); })
        .attr("fill", function(d,i) {if (i<firstN) return "red"; else return "blue";})
        .attr("stroke", "white")
        .attr("stroke-width", 1);

    var yAxis = d3.svg.axis()
        .orient("left")
        .ticks(5)
        .scale(yScale);

    var xAxis = d3.svg.axis()
        .orient("bottom")
        .ticks(6)
        .scale(xScale);

    // remove previous axis for previous restaurant

    d3.select(svgname).selectAll("g").remove();

    d3.select(svgname).append("g")
        .attr("class", "axises")
        .attr("transform", "translate(50,0)")
        .call(yAxis);

    d3.select(svgname).append("g")
        .attr("class", "axises")  // give it a class so it can be used to select only xaxis labels  below
        .attr("transform", "translate(0,150)")
        .call(xAxis);

    // d3.select(svgname).selectAll(".xaxis text")  // select all the text elements for the xaxis
    //       .attr("transform", function(d) {
    //           return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
    //     });

}

d3.json("reviews.json", function(json) {

	rating = json;
});

