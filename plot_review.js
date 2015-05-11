var revi;       // store ratings for one restaruant
var reviMax = new Array(2);    // store ratings for the restaruant with hightest ratings
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
var weightedR;   // store the weighted ratings of selected restaurant
//var rating;     // store the the json file after importing
var xaxisRange = d3.scale.linear().domain([0, 5]).range([110,460]);
var yaxisRange = d3.scale.linear().domain([0, 5]).range([370,20]);

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
    weightedR = new Array(business_id.length);
    counter = 0;

    //console.log(business_id[0]);

    for (var j=0; j<business_id.length; j++)
    {
        //console.log(business_id[j]);
        if (rating.hasOwnProperty(business_id[j]))
        //if (1 == 1)
        {
            function getNamebyID(id) {
                for (var i = 0; i < restaurant_data.length; i ++)
                    if (restaurant_data[i][0] == business_id[j]) {

                        return restaurant_data[i][1];
                    };
            }

            rName = getNamebyID(business_id[j]);      // actual name of restaurant
            resID[j] = business_id[j]
            resName[j] = rName;
            restaurantID = business_id[j];            // restaurant id in the database
            importRating(restaurantID);               // import data of one restaurant

        } else {
            alert("Don't have reviews for this restaurant")
        }
    }

    maxWeight(weightedR, business_id);

    // draw weighted rating (x) vs avearage rating (y)

    d3.select("#scatter").selectAll("circle").remove();
    d3.select("#scatter")//.append("svg").attr("width", 400).attr("height", 400).attr("id", "scatter")
        .selectAll("circle")
        .data(ratMean)
        .enter()
        .append("circle")
        .attr("cx", function (d, i) { return xaxisRange(weightedR[i]);} )
        .attr("cy", function (d) { return yaxisRange(d);})
        .attr("r", 5);

    // hide other circles when click on one
    d3.selectAll("circle")
        .on("click", function(d, i) {
            d3.select("#scatter").selectAll("circle").classed("hidden", function (e, j) {
                return d != e || i != j;
            });
        });
}


// calculate the weighted ratings for one restaurant
function calWeight (reviSum, indexR, numOfRatings)
{
    //for (var k = 0; k<numOfRatings; k++)
    var newMean = reviSum/(numOfRatings - 1.6);
    weightedR[indexR] = (numOfRatings/(numOfRatings + 30)*newMean + 30/(numOfRatings + 30)*3).toFixed(1);
}

// calculate the restaurant with maximum weighted rating
function maxWeight (wR, business_id)
{
    var maxIndex = 0;
    for (var k=0; k<wR.length-1; k++)
    {
        if (wR[maxIndex] < wR[k+1])
            maxIndex = k+1;
    }

    maxResID = business_id[maxIndex];            // restaurant id in the database with max weighted rating

    //console.log(counter, wR.length, weightedR[maxIndex]);
    // update table
    d3.select("body").select("#name").text(resName[maxIndex]);
    d3.select("body").select("#weiRating").text(weightedR[maxIndex]);
    d3.select("body").select("#aveRating").text(ratMean[maxIndex]);
    d3.select("body").select("#numRating").text(numR[maxIndex]);
    d3.select("body").select("#firRating").text(firstDate[maxIndex]);
    d3.select("body").select("#lasRating").text(lastDate[maxIndex]);

    // update hitory plot of one restaurant
    d3.select("body").select("#historyPlot").selectAll("circle").remove();
    d3.select("body").select("#historyPlot").select("#rNm").remove();
    d3.select("#historyPlot").append("text")
        .attr("id", "rNm").attr("x", 50).attr("y", 20)
        .text("Rating history of " + resName[maxIndex]);

    // import the data of the restaurant with hightest weighted score
    var numRatings = rating[maxResID].length; // number of ratings for this restaurant
    reviMax[0] = new Array(numRatings);     // import ratings
    reviMax[1] = new Array(numRatings);     // import date of ratings
    for (var k=0; k<numRatings; k++)
        {
            reviMax[0][k] = rating[maxResID][k][0];
            reviMax[1][k] = formatDate.parse(rating[maxResID][k][1]);
        }

    d3.select("#historyPlot")
        .selectAll("circle")
        .data(reviMax[0])
        .enter()
        .append("circle")
        .attr("cx", function(d,i) { return xScale(reviMax[1][i]); })
        .attr("cy", function(d) { return yScale(d); })
        .attr("r", function(d,i) { if (yearFormat(reviMax[1][i]) > 2010 && yearFormat(reviMax[1][i]) < 2015) return 3; else return 0;})
}

// function to load ratings for one restaurant
function importRating (rid)
{
    var numRatings = rating[rid].length; // number of ratings for this restaurant
    var reviSum = 0;

    revi = new Array(numRatings);         // import ratings
    revit = new Array(numRatings);        // import date of ratings
        for (var k=0; k<numRatings; k++)
        {
            revi[k] = rating[rid][k][0];
            revit[k] = formatDate.parse(rating[rid][k][1]);
            if (k == 0 || k == 1)
                reviSum = reviSum + 0.2 * rating[rid][k][0];
            else
                reviSum = reviSum + rating[rid][k][0];
        }

    firstDate[counter] = rating[rid][0][1];
    lastDate[counter] = rating[rid][numRatings-1][1];
    numR[counter] = numRatings;
    ratMean[counter] = (d3.mean(revi)).toFixed(1);
    firstRat[counter] = revi[0];
    calWeight(reviSum, counter, numRatings);
    counter++;
}

