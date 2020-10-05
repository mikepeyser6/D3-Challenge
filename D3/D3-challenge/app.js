// sets chart bounds
var svgWidth = 1000;
var svgHeight = 600;
// sets chart margins
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};
// adjust charts bounds based on margins
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// create svg which holds the chart.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// appends chartgroup to svg
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// sets init x and y axis
var XAxis = "poverty";
var YAxis = "smokes";

// function that updates xscale var upon click on axis label
function xScale(Data, XAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(Data, d => d[XAxis]) * 0.8,
      d3.max(Data, d => d[XAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}
// function that updates y-scale var upon click on axis label
function yScale(Data, YAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
  .domain([0, d3.max(Data, d => d[YAxis]), 
  d3.max(Data, d => d[YAxis])*1.5 ])
  
  .range([height, 0]);

  return yLinearScale;
}

// function used for updating xAxis and yAxis var upon click on axis label
function renderAxes(newXScale, newYScale, xAxis, yAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  var leftYAxis = d3.axisLeft(newYScale)
  // adss transition animations 
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  yAxis.transition()
    .duration(1000)
    .call(leftYAxis);
  

  return xAxis, yAxis;
}

// function used for updating circles group and circletext with a transition to
function renderCircles(circlesGroup, circletext, newXScale, newYScale, XAxis, YAxis) {
  // adds transition animation for text and circles
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[XAxis]))
    .attr("cy", d => newYScale(d[YAxis]));

  circletext.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[XAxis]))
    .attr("y", d => newYScale(d[YAxis]));

  return circlesGroup, circletext;
}

// function used for updating circles group with new tooltip
function updateToolTip(XAxis, YAxis, circlesGroup) {
  // creates tooltip var that stores info 
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${XAxis} ${d[XAxis]} <br>${YAxis}  ${d[YAxis]}`);
    });

  circlesGroup.call(toolTip);
    // on mouse over displays info 
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // on mouse out hide info 
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// retrieves data from the CSV file and creates chart
d3.csv("data.csv").then(function(Data, err) {
  if (err) throw err;

  // parse data
  Data.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
  });
  // prints data
  console.log(Data);

 
  var xLinearScale = xScale(Data, XAxis);

  
  var yLinearScale = yScale(Data, YAxis);

  
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  
  var yAxis = chartGroup.append("g")
  .classed("y-axis", true)
  .call(leftAxis);

  
  var circlesGroup = chartGroup.selectAll("circle")
    .data(Data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[XAxis]))
    .attr("cy", d => yLinearScale(d[YAxis]))
    .attr("r", 15)
    .attr("fill", "blue")
    .attr("opacity", ".5")
    
  // adds text to circles 
  var circletext = chartGroup.selectAll(null)
    .data(Data)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[XAxis]))
    .attr("y", d => yLinearScale(d[YAxis]))
    .attr("text-anchor", "middle")
    .text(d =>  d.abbr)
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("fill", "white");
  
  // Create group for two x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  // Create group for two y-axis labels
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");

  // adds povery label to xlabelsgroup
  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") 
    .classed("active", true)
    .text("Poverty Rate");

  // adds age label to xlabelsgroup
  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") 
    .classed("inactive", true)
    .text("Median age");

  // adds smokes label to ylabelsgroup
  var smokesLabel = ylabelsGroup.append("text")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("value", "smokes")
    .attr("dy", "1em")
    .classed("active", true)
    .text("Smokes(%)");
  // adds health label to ylabelsgroup
  var healthLabel = ylabelsGroup.append("text")
    .attr("y", 40 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("value", "healthcare")
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Lacks Healthcare(%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(XAxis, YAxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces XAxis with value
        XAxis = value;

        // updates x scale for new data
        xLinearScale = xScale(Data, XAxis);

        // updates x axis with transition
        xAxis,yAxis = renderAxes(xLinearScale, yLinearScale, xAxis, yAxis);

        // updates circles with new x values
        circlesGroup, circletext = renderCircles(circlesGroup, circletext, xLinearScale, yLinearScale, chosenXAxis, YAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, YAxis, circlesGroup);

        // changes classes to change bold text
        if (XAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
  // y axis labels event listener
  ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== YAxis) {

        // replaces YAxis with value
        YAxis = value;

        // updates yscale for new data
        yLinearScale = yScale(Data, YAxis);

        // updates y axis with transition
        xAxis,yAxis = renderAxes(xLinearScale, yLinearScale, xAxis, yAxis);

        // updates circles with new y values
        circlesGroup,circletext = renderCircles(circlesGroup, circletext, xLinearScale, yLinearScale, XAxis, YAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(XAxis, YAxis, circlesGroup);

        // changes classes to change bold text
        if (YAxis === "smokes") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
      
      
// catchs error   
}).catch(function(error) {
  console.log(error);
});