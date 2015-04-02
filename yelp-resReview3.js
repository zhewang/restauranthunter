var rating;     // store the the json file after importing
var revi;
var firstN = 1;   //first firstN reviews will be compared with the total average

function plotByID (business_id) {

    if (rating.hasOwnProperty(business_id)) {
        d3.select("#svg1").selectAll("rect").remove();

        restaurantID = business_id;
        importRating(restaurantID);

        plotRating(revi, revit);
        
        d3.select("#rID").text(restaurantID);
    } else {
        alert("Don't have reviews for this restaurant")
    }
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
            revit[k] = rating[rid][k][1];
        }    
}

// plot the ratings
function plotRating (revi_temp, revit_temp)
{
    d3.select("#svg1").selectAll("rect")
        .data(revi_temp)
        .enter()
        .append("rect")
        .attr("width", 10)
        .attr("height", function(d) { return d*10;})
        .attr("x", function(d,i) { return 100+i*10; })
        .attr("y", function(d) { return 100-d*10;})
        .attr("fill", function(d,i) {if (i<firstN) return "blue"; else return "black";});
}

d3.json("reviews.json", function(json) {

	rating = json;
});

