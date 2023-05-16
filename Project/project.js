//GRAPH 1: MULTI LINE CHART
var w = 1000;
var h = 500;
var padding = 55;

var svg = d3.select("#chart")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

d3.csv("SyrianAsylum.csv").then(function(data) {
    data.forEach(function(d) {
        d.Year = +d.Year; //convert year and number to num
        d.number = +d.number;
    });

    var nestedData = Array.from(d3.group(data, d => d.Country));//create Map object where the keys are the country names and values are arrays containing data related tot hat country
/* how the data would look like for nestedData
[
  ["Germany", [{Year: 2016, Country: "Germany", number: 375122}, {Year: 2017, Country: "Germany", number: 496674}, ...]],
  ["Jordan", [{Year: 2016, Country: "Jordan", number: 648836}, {Year: 2017, Country: "Jordan", number: 653031}, ...]],
  ["Lebanon", [{Year: 2016, Country: "Lebanon", number: 1005503}, {Year: 2017, Country: "Lebanon", number: 992127}, ...]],
  ["Turkey", [{Year: 2016, Country: "Turkey", number: 2823987}, {Year: 2017, Country: "Turkey", number: 3424237}, ...]]
]

*/
    var xScale = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.Year; }))//extent return array if minimum and maximum value
        .range([padding, w - padding]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.number; })])
        .range([h - padding, padding]);

    var line = d3.line()
        .x(function(d) { return xScale(d.Year); })
        .y(function(d) { return yScale(d.number); });

    var countries = svg.selectAll(".country")//class country which is currently empty
        .data(nestedData)
        .enter()
        .append("g")
        .attr("class", "country");

    countries.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d[1]); }) //d[1] is the data points of each country when passed to line()
        .style("stroke", function(d) { return d3.schemeCategory10[nestedData.indexOf(d)]; })//using the Catrgory 10 color scheme
        .style("fill", "none"); // make sure its a line, fill will become area

    var xAxis = d3.axisBottom().scale(xScale).ticks(6).tickFormat(d3.format("d"));
    var yAxis = d3.axisLeft().scale(yScale).ticks(6).tickFormat(function(d) {
        return d / 1000000; // Divide the tick value by 1,000,000
      });

    svg.append("g")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .style("font-size","13")
        .call(xAxis);

    svg.append("g")
        .attr("transform", "translate(" + padding + ",0)")
        .style("font-size","13")
        .call(yAxis);

    var legend = svg.selectAll(".legend")
        .data(nestedData)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + (i * 20+80) + ")"; });

    legend.append("rect")
        .attr("x", w - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) { return d3.schemeCategory10[nestedData.indexOf(d)]; });

    legend.append("text")
        .attr("x", w - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d[0]; });
    
    var tooltip = d3.select("body").append("div") //adding tooltip
        .attr("class", "tooltip")               
        .style("opacity", 0);
    
    var circles = countries.selectAll(".dot")
    /*
 The code creates a new <g> element for each year in each country, and the <circle> and
  <text> elements are appended to these <g> elements. So there will be one <g> element 
  for each year in each country, and inside each <g> element, there will be a <circle> and a 
  <text> element.
    */
        .data(function(d) { return d[1]; })
        .enter()
        .append("g")
        .attr("class", "dot")
        .attr("transform", function(d) {
            return "translate(" + xScale(d.Year) + "," + yScale(d.number) + ")";
        });
    
    
    // Add the tooltip to the circles (dots) of the multiline chart
    circles.append("circle") 
        .attr("r", 5)
        .style("fill", function(d) { return d3.schemeCategory10[nestedData.indexOf(d3.select(this.parentNode).datum())]; })
        .on("mouseover", function(event, d) {
            tooltip.transition()        
                   .duration(200)      
                   .style("opacity", .9)
                   .style("display", "block");      
            tooltip.html("Year: " + d.Year + "<br/>"  + "Number: " + d.number +"<br/>"+"Country: "+d.Country)  
                   .style("left", (event.pageX + 20) + "px")     
                   .style("top", (event.pageY - 28) + "px");
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 8);
            //d3.select(this.parentNode).select("text").style("display", "block");
        })
        .on("mouseout", function() {
            tooltip.transition()        
                   .duration(500)      
                   .style("opacity", 0)
                   .style("display","none");
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 5);
            //d3.select(this.parentNode).select("text").style("display", "none");
        });
    
    
    
    var caption = d3.select("#chart")
        .append("p")
        .attr("class", "caption")
        .text("Figure 1: Syrian asylum seekers by country and year");
    //add unit text
    // Append the unit text
    svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -h/2)
    .attr("y", padding-30)
    .style("text-anchor", "middle")
    .text("number of Syrians (millions)");
});

// GRAPH 2: BAR CHART 

// set the dimensions and margins of the graph
var width = 1000;
var height = 500;
var barpad=55;

var originalData;// used this to save the original state of data so we can have reset button later

// set the ranges
var x = d3.scaleBand().rangeRound([barpad, width - barpad]).padding(0.1);
var y = d3.scaleLinear().range([height - barpad, barpad]);

// append the svg object to the body of the page
var svg2 = d3.select("#chart2").append("svg") // assuming a new div "chart2" for this new chart
    .attr("width", width )
    .attr("height", height)
  .append("g");
   

// load the data
d3.csv("idp.csv").then(function(data) {

  // format the data
  data.forEach(function(d) {
    d.Year = +d.Year;
    d.IDPs = +d.IDPs;
  });
  originalData = JSON.parse(JSON.stringify(data)); // Deep copy

  // Scale the range of the data in the domains
  x.domain(data.map(function(d) { return d.Year; }));
  y.domain([0, d3.max(data, function(d) { return d.IDPs; })]);

  // append the rectangles for the bar chart
  svg2.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.Year); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.IDPs); })
      .attr("height", function(d) { return height - barpad- y(d.IDPs); })
      .attr("fill", "#1f77b4")
      .on("mouseover",function(event,d){ //this function takes 2 arg, event = current event,d is current dataset
        var xPosition = parseFloat(d3.select(this).attr("x")) //convert x to floating point num
        var yPosition = parseFloat(d3.select(this).attr("y"))
        svg2.append("text") //we append text to tag svg no need enter because there is no dataset to bind the text to
            .attr("id","tooltip")
            .attr("x",xPosition+(x.bandwidth()/2)-27)
            .attr("y",yPosition-2)
            .text(d.IDPs);
        d3.select(this)
            .transition()
            .attr("fill","orange");
    })
    .on("mouseout",function(event,d){
        d3.select(this)
            .transition()
            .attr("fill","#1f77b4");
        d3.select("#tooltip").remove();
    })

  // add the x Axis
  svg2.append("g")
      .attr("class","x-axis") //add class to update with sort bar later
      .attr("transform", "translate(0," + (height-55) + ")")
      .style("font-size","13")
      .call(d3.axisBottom(x));

  // add the y Axis
  svg2.append("g")
      .attr("transform", "translate("+barpad+",0)")
      .style("font-size","13")
      .call(d3.axisLeft(y).tickFormat(function(d) {
        return d / 1000000; // Divide the tick value by 1,000,000
      }));
   // Append the unit text
   svg2.append("text")
   .attr("class", "axis-label")
   .attr("transform", "rotate(-90)")
   .attr("x", -height/2)
   .attr("y", padding-30)
   .style("text-anchor", "middle")
   .text("number of Syrians (millions)");   
  
  var caption = d3.select("#chart2")
        .append("p")
        .attr("class", "caption")
        .text("Figure 2: Syrian internally displaced persons (IDPs) by year");
//button 3
var sortOrder = false; // default value of sort order to ascending for first time click

d3.select("#button1")
    .on("click",function(){
        sortBars();
    });

    var sortBars = function() {
        sortOrder = !sortOrder; // toggle the sort order
    
        // sort the data
        data.sort(function(a, b) {
            if (sortOrder) {
                return d3.ascending(a.IDPs, b.IDPs);
            } else {
                return d3.descending(a.IDPs, b.IDPs);
            }
        });
    
        // update the x scale's domain
        x.domain(data.map(function(d) { return d.Year; }));
    
        // update the x axis labels
        svg2.select(".x-axis").selectAll("text")
            .data(data)
            .text(function(d) {
                return d.Year;
            });
    
        // transition the bars
        svg2.selectAll("rect")
            .transition()
            .duration(500)
            .attr("x", function(d) {
                return x(d.Year);
            })
            .attr("y", function(d) {
                return y(d.IDPs);
            })
            .attr("height", function(d) {
                return height - barpad- y(d.IDPs);
            });
    
        // update the x axis
        svg2.select(".x-axis")
            .transition()
            .duration(500)
            .call(d3.axisBottom(x));
    };
d3.select("#button2")
.on("click", function() {
    data = JSON.parse(JSON.stringify(originalData)); // Deep copy
    data.sort(function(a,b){
        return d3.ascending(a.Year, b.Year);
    });
    // Now redraw the bars, exactly the same way as in sortBars()
    x.domain(data.map(function(d) { return d.Year; })); //uopdate x scale domains
    svg2.selectAll("rect")
    .transition()
    .duration(500)
    .attr("x", function(d) {
        return x(d.Year);
    })
    .attr("y", function(d) {
        return y(d.IDPs);
    })
    .attr("height", function(d) {
        return height - barpad- y(d.IDPs);
    });
    //update x-axis
    svg2.select(".x-axis")
    .transition()
    .duration(1000)
    .call(d3.axisBottom(x));
});
});
// GRAPH 3: AREA CHART

// set the dimensions and margins of the graph
var areaWidth = 1000;
var areaHeight = 500;
var areaPad = 55;

// set the ranges
var xArea = d3.scaleLinear().range([areaPad, areaWidth - areaPad]);
var yArea = d3.scaleLinear().range([areaHeight - areaPad, areaPad]);

// append the svg object to the body of the page
var svg3 = d3.select("#chart3").append("svg") // assuming a new div "chart3" for this new chart
    .attr("width", areaWidth)
    .attr("height", areaHeight);

// define the area
var area = d3.area()
    .x(function(d) { return xArea(d.Year); })
    .y0(yArea(0)) // set y0 to 0 on the y-axis
    .y1(function(d) { return yArea(d.Inflation); }); // y1 is the scaled value of each data point

// load the data
d3.csv("inflation.csv").then(function(data) {

  // format the data
  data.forEach(function(d) {
    d.Year = +d.Year;
    d.Inflation = +d.Inflation;
  });

  // Scale the range of the data in the domains
  xArea.domain(d3.extent(data, function(d) { return d.Year; }));
  yArea.domain([
    d3.min(data, function(d) { return d.Inflation; }), // this should now include negative values
    d3.max(data, function(d) { return d.Inflation; })
  ]);


  // add the area
  svg3.append("path")
      .data([data])
      .attr("class", "area")
      .attr("d", area)
      .attr("fill", "steelblue");

  // add the x Axisss
  svg3.append("g")
      .attr("transform", "translate(0," + (areaHeight - areaPad) + ")")
      .style("font-size","13")
      .call(d3.axisBottom(xArea).tickFormat(d3.format("d")));

  // add the y Axis
  svg3.append("g")
      .attr("transform", "translate(" + areaPad + ",0)")
      .style("font-size","13")
      .call(d3.axisLeft(yArea));

  var caption = d3.select("#chart3")
        .append("p")
        .attr("class", "caption")
        .text("Figure 3: Inflation in Syria by year");
// Add points for each data
var tooltip = d3.select("body").append("div") 
    .attr("class", "tooltip")               
    .style("opacity", 0);

var circles2 = svg3.selectAll(".dot")
    .data(data)
    .enter().append("circle") // Uses the enter().append() method
    .attr("class", "dot") // Assign a class for styling
    .attr("cx", function(d) { return xArea(d.Year) })
    .attr("cy", function(d) { return yArea(d.Inflation) })
    .attr("r", 5)
    
 // Add hover effects
circles2
.on("mouseover", function(event, d) {    
    tooltip.transition()        
           .duration(200)      
           .style("opacity", .9)
           .style("display", "block");      
    tooltip.html("Year: " + d.Year + "<br/>"  + "Inflation: " + d.Inflation)  
           .style("left", (event.pageX + 30) + "px")     
           .style("top", (event.pageY - 28) + "px"); 
    d3.select(this)
           .transition()
           .duration(200)
           .attr("r", 8);   
})                  
.on("mouseout", function(d) {       
    tooltip.transition()        
           .duration(500)      
           .style("opacity", 0)
           .style("display", "none");
    d3.select(this)
           .transition()
           .duration(200)
           .attr("r", 5);   
});
 // Append the unit text
 svg3.append("text")
 .attr("class", "axis-label")
 .attr("transform", "rotate(-90)")
 .attr("x", -areaHeight/2)
 .attr("y", areaPad-30)
 .style("text-anchor", "middle")
 .text("Percentage %");
});

//Graph 4: DOnut chart:
var data = [
    {"age_group": "0-11", "percent_total": 33.6},
    {"age_group": "12-17", "percent_total": 14},
    {"age_group": "18-59", "percent_total": 49.2},
    {"age_group": "60+", "percent_total": 3.2}
];

var width2 = 1000
    height2 = 500
    margin = 40

var radius = Math.min(width2, height2) / 2 - margin

var svg4 = d3.select("#chart4")
  .append("svg")
    .attr("width", width2)
    .attr("height", height2)
  .append("g")
    .attr("transform", "translate(" + width2/2 + "," + height2 / 2 + ")");//in middle

var color = d3.scaleOrdinal()
  .domain(data.map(function(d) { return d.age_group }))
  .range(d3.schemeDark2);

var pie = d3.pie()
  .sort(null)
  .value(function(d) { return d.percent_total; });

var data_ready = pie(data)

var arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(radius * 0.8);

var arcHover = d3.arc() // This arc is slightly larger for the hover effect
.innerRadius(0)
.outerRadius(radius * 0.85);


var path= svg4
  .selectAll('mySlices')
  .data(data_ready)
  .enter()
  .append('path')
    .attr('d', arcGenerator)
    .attr('fill', function(d){ return(color(d.data.age_group)) })
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 0.7);
path.on("mouseover", function(d) {
    d3.select(this).style("fill", "#F9A602") // Change color on mouse over
    d3.select(this)
    .transition()
    .duration(500)
    .attr('d', arcHover);
    })
    .on("mouseout", function(d) {
    d3.select(this).style("fill", function(d){ return(color(d.data.age_group)) }); // Restore original color on mouse out
    d3.select(this)
    .transition()
    .duration(500)
    .attr('d', arcGenerator);
});

svg4
  .selectAll('mySlices')
  .data(data_ready)
  .enter()
  .append('text')
  .text(function(d){ return d.data.percent_total })
  .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
  .style("text-anchor", "middle")
  .style("font-size", 13);

  // Adding legends
legendRectSize = 18,
legendSpacing = 4;
// Get the legend group
var legend = svg4.append('g')
  .attr('transform', 'translate(' + (width2 / 2-150) + ',0)');

// Add legend items
legend.selectAll()
  .data(data)
  .enter()
  .append('g')
  .attr('transform', function(d, i) {
    var height = legendRectSize + legendSpacing;
    var offset =  height * data.length / 2;
    var vert = i * height - offset;
    return 'translate(0,' + vert + ')';
  })
  .each(function(d, i) {
    var g = d3.select(this);

    g.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', color(d.age_group))
      .style('stroke', color(d.age_group));

    g.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(d.age_group);
  });
  //caption
  var caption = d3.select("#chart4")
        .append("p")
        .attr("class", "caption")
        .text("Figure 4: Demographic distribution by age in percentage for Syrian migrants in 2016");

