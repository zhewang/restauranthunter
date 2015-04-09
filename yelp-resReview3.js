var rating;     // store the the json file after importing
var revi;       // store ratings for one restaruant
var revit;      // store the date of corresponding rating
var firstN = 1;   //first firstN reviews will be compared with the total average

// funtiont generate date object from database entry
var formatDate = d3.time.format("%Y-%m-%d");

function plotByID (business_id) 
{
    d3.selectAll(".svgclass").remove();
    for (var j=0; j<business_id.length; j++)
    {
        if (rating.hasOwnProperty(business_id[j])) {
            svgname = "svg" + j.toString();
            console.log(svgname)

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
            restaurantID = business_id[j];            // restaurant id in the database
            importRating(restaurantID);

            plotRating(revi, revit, svgname, rName);
           
        } else {
            alert("Don't have reviews for this restaurant")
        }
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
            revit[k] = formatDate.parse(rating[rid][k][1]);
            //console.log(revi[k], revit[k]);
        }    

}

// plot the ratings
function plotRating (revi_temp, revit_temp, svgname, rName)
{
    
    svgname = "#" + svgname;
    var yScale = d3.scale.linear().domain([0, 5])    // ratings between 0 and 100
        .range([150, 50]); 

        var mindate = revit_temp[0];
        var maxdate = revit_temp[(revit_temp.length - 1)];

    var xScale = d3.time.scale().domain([mindate, maxdate])  
        .range([50, 750]);

    d3.select(svgname).selectAll("text").remove();

    d3.select(svgname).append("text")
        .attr("x", 50)             
        .attr("y", 20)
        .style("font-size", "16px") 
        .text("---" + rName + "---");
    
    d3.select(svgname)
        .selectAll("rect")
        .data(revi_temp)
        .enter()
        .append("rect")
        .attr("width", 5)
        .attr("height", function(d) { return d*20;})
        .attr("x", function(d,i) { return xScale(revit_temp[i]); })
        .attr("y", function(d) { return yScale(d);})
        .attr("fill", function(d,i) {if (i<firstN) return "red"; else return "blue";});

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
        .attr("transform", "translate(50,0)")
        .call(yAxis);

    d3.select(svgname).append("g")
        .attr("class", "xaxis")   // give it a class so it can be used to select only xaxis labels  below
        .attr("transform", "translate(0,150)")
        .call(xAxis);

    d3.select(svgname).selectAll(".xaxis text")  // select all the text elements for the xaxis
          .attr("transform", function(d) {
              return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
        });
   
}

d3.json("reviews.json", function(json) {

	rating = json;
});

