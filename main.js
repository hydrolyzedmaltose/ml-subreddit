// Timeline chart making starts here
var marginTimeline = {top: 20, right: 50, bottom: 30, left: 50},
widthTimeline = 700 - marginTimeline.left - marginTimeline.right,
heightTimeline = 150 - marginTimeline.top - marginTimeline.bottom;

// parse the date / time
var parseTimeTimeline = d3.timeParse("%Y%m");

// set the ranges
var xTimeline = d3.scaleTime().range([0, widthTimeline]);
var yTimeline = d3.scaleLinear().range([heightTimeline, heightTimeline/2]);

var areaTimeline = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) {return xTimeline(d.date)})
    .y0(heightTimeline)
    .y1(function(d) { return yTimeline(d.popularity)});

var timeline = d3.select(".hero-popularity-timeline").append("svg")
    .attr("class", "timeline")
    .attr("width", widthTimeline + marginTimeline.left + marginTimeline.right)
    .attr("height", heightTimeline + marginTimeline.top + marginTimeline.bottom)
    .append("g")
    .attr("transform","translate(" + marginTimeline.left + "," + marginTimeline.top + ")")
    .style("fill", "grey");

d3.tsv("timeline-top.txt", function(error, data) {
    if (error) {
        throw error;
    }

    data.forEach(function(d) {
        d.date = parseTimeTimeline(d.date);
        d.popularity = +d.popularity;
    });

    xTimeline.domain(d3.extent(data, function(d) { return d.date;}));
    yTimeline.domain([0, d3.max(data, function(d) { return d.popularity; })]);

    timeline.append("g")
        .attr("class", "x axis timeline")
        .attr("transform", "translate(0," + heightTimeline + ")")
        .call(d3.axisBottom(xTimeline));
    
    timeline.append("path")
        .data([data])
        .attr("class", "area-timeline")
        .attr("d", areaTimeline);

    timeline.selectAll(".heroes")
        .data(data)
        .enter()
        .append("image")
        .attr("class", "heroes")
        // .attr("class", "timeline-image")
        .attr("height", 45)
        .attr("width", 45)
        .attr("preserveAspectRatio", "none")
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        .attr("xlink:href", function(d) {
            imagePath = "flair/" + d["hero"].toLowerCase() + ".png";
            return imagePath;
        })
        .attr("x", function(d,i) {
            return (widthTimeline/11 * i - 20);
        })
        .attr("transform", "translate(0," + (heightTimeline - 100) + ")")
        // .on("mouseover", function(d) {

        //     var coordinates = [0, 0]
        //     coordinates = d3.mouse(this);
        //     var x = coordinates[0];
        //     var y = coordinates[1];


        //     d3.select("#tooltip")
        //         .classed("hidden", false)
        //         .style("text-align", "center")
        //         .style("left", x + 60 + "px")
        //         .style("top", y + 60 + "px")
        //         .select("#hero")
        //         .text(d["hero"]);
        // })
        // .on("mouseout", function() {
        //     d3.select("#tooltip")
        //         .classed("hidden", true)
        // })
});

d3.select("#least-popular")
    .on("click", function() {
        d3.selectAll(".heroes").remove();
        updateTimeline("timeline-bottom.txt");
    });

d3.select("#most-popular")
    .on("click", function() {
        updateTimeline("timeline-top.txt");
    });

var updateTimeline = function(filename) {
    d3.tsv(filename, function(error, data) {

        if (error) {
            throw error;
        }
        data.forEach(function(d) {
            d.date = parseTimeTimeline(d.date);
            d.hero = d.hero;
        });

        var svg = d3.select("body").transition();

        // Add the area.

        timeline.selectAll(".heroes")
            .data(data)
            .enter()
            .attr("xlink:href", function(d) {
                imagePath = "flair/" + d["hero"].toLowerCase() + ".png";
                return imagePath;
            })
            .attr("x", function(d,i) {
                return (widthTimeline/11 * i - 20);
            })
            .attr("transform", "translate(0," + (heightTimeline - 60) + ")");
        
        svg.select(".area-timeline")
            .duration(750)
            .attr("d", areaTimeline);
    });
};


// Timeline charts making ends here

// Line graph making starts here
// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 860 - margin.left - margin.right,
    height = 430 - margin.top - margin.bottom;

// parse the date / time
var parseTime = d3.timeParse("%Y%m%d");

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.date)})
    .y0(height)
    .y1(function(d) { return y(d.lance)});

var bisectDate = d3.bisector(function(d) { return d.date; }).left;

// define the line
var valueline = d3.line()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.lance); });
// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select(".chart").append("svg")
    .attr("class", "line-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");

// gridlines in y axis functions
function make_y_gridlines() {
    return d3.axisLeft(y)
}


// Get the data
d3.tsv("ml-td.txt", function(error, data) {
    if (error) throw error;

    var heroNames = [];

    Object.keys(data[0]).forEach(function(i) {
        heroNames.push(i);
    });

    var select = d3.select("#hero-selection")

    var options = select
        .selectAll('option')
        .data(heroNames.slice(1,))
        .enter()
        .append('option')
        .text(function(d){
            return d.charAt(0).toUpperCase() + d.slice(1);
        });

    // format the data
    data.forEach(function(d) {
        d.date = parseTime(d.date);
        d.lance = +d.lance;
    });


    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.lance; })]);

    // add the Y gridlines
    svg.append("g")
        .attr("class", "grid")
        .style("stroke-dasharray", "5 5")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
        )

    // Add the area.
    svg.append("path")
        .data([data])
        .attr("class", "area")
        .attr("d", area);

    // Add the valueline path.
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline);

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    // var focus = svg.append("g")
    //     .attr("class", "focus")
    //     .style("display", "none");

    // focus.append("circle")
    //     .attr("r", 4.5);

    // focus.append("text")
    //     .attr("x", 9)
    //     .attr("dy", ".35em");

    // svg.append("rect")
    //     .attr("class", "overlay")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .on("mouseover", function() { focus.style("display", null); })
    //     .on("mouseout", function() { focus.style("display", "none"); })
    //     .on("mousemove", mousemove);

    // function mousemove() {
    //     var x0 = x.invert(d3.mouse(this)[0]),
    //         i = bisectDate(data, x0, 1),
    //         d0 = data[i - 1],
    //         d1 = data[i],
    //         d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    //     focus.attr("transform", "translate(" + x(d.date) + "," + y(d.lance) + ")");
    //     focus.select("text").text(d.lance);
    // }
        

    var dropdown = d3.select("#hero-selection")
        .on("change", function(){
            var newHero = d3.select(this).property('value');
            
            updateData(newHero);
        });

    
});

// var remFocus = function() {
//     d3.select("focus").remove();
// }

function updateData(heroName) {

    heroName = heroName.toLowerCase();

    var area = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function(d) { return x(d.date)})
        .y0(height)
        .y1(function(d) { return y(d[heroName])});

    // define the line
    var valueline = d3.line()
        .curve(d3.curveMonotoneX)
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d[heroName]); });

    d3.tsv("ml-td.txt", function(error, data) {
        data.forEach(function(d){
            d.date = parseTime(d.date);
            d[heroName] = +d[heroName];

            x.domain(d3.extent(data, function(d) { return d.date }))
            y.domain([0, d3.max(data, function(d) { return d[heroName]; })]);
        });

        var svg = d3.select("body").transition();

        // Add the area.
        svg.select(".area")
        .duration(750)
        .attr("d", area);

        svg.select(".line")
            .duration(750)
            .attr("d", valueline);

        svg.select(".y.axis")
            .duration(750)
            .call(d3.axisLeft(y));
        
        svg.select(".grid")
            .style("stroke-dasharray", "5 5")
            .call(make_y_gridlines()
                .tickSize(-width)
                .tickFormat("")
            );

    // var focus = svg.append("g")
    //     .attr("class", "focus")
    //     .style("display", "none");

    // focus.append("circle")
    //     .attr("r", 4.5);

    // focus.append("text")
    //     .attr("x", 9)
    //     .attr("dy", ".35em");

    // svg.append("rect")
    //     .attr("class", "overlay")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .on("mouseover", function() { focus.style("display", null); })
    //     .on("mouseout", function() { focus.style("display", "none"); })
    //     .on("mousemove", mousemove);

    // function mousemove() {
    //     var x0 = x.invert(d3.mouse(this)[0]),
    //         i = bisectDate(data, x0, 1),
    //         d0 = data[i - 1],
    //         d1 = data[i],
    //         d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    //     focus.attr("transform", "translate(" + x(d.date) + "," + y(d[heroName]) + ")");
    //     focus.select("text").text(d[heroName]);
    // }

});
}


// Code for the correlation starts here
var marginCorr = {top: 20, right: 50, bottom: 30, left: 50},
    widthCorr = 700 - marginCorr.left - marginCorr.right,
    heightCorr = 100 - marginCorr.top - marginCorr.bottom;

// // parse the date / time
// var parseTime = d3.timeParse("%Y%m");

// // set the ranges
// var xCorr = d3.scaleTime().range([0, widthCorr]);

var corr = d3.select(".hero-correlation").append("svg")
    .attr("class", "corr")
    .attr("width", widthCorr + marginCorr.left + marginCorr.right)
    .attr("height", heightCorr + marginCorr.top + marginCorr.bottom)
    .append("g")
    .attr("transform","translate(" + marginCorr.left + "," + marginCorr.top + ")")
    .style("fill", "grey");

d3.json("hero-correlation.json", function(error, data) {
    if (error) {
        throw error;
    }

    // data.forEach(function(d){
    //     d["corr"].forEach(function(c){
    //         c.mention = +c.mention;
    //     })
    // })

    var corrSelect = d3.select("#hero-selection-corr")
    
    var corrOptions = corrSelect
        .selectAll('option')
        .data(data)
        .enter()
        .append('option')
        .text(function(d){
            return d["hero"].charAt(0).toUpperCase() + d["hero"].slice(1);
        });
    
    name = "akai";

    for (i=0; i< data.length; i++) {
        if (data[i].hero == name) {
            usableDataIndex = i;        
            break;
        }
    }

    data = data.slice(usableDataIndex, usableDataIndex+1);
    
    // console.log(data);

    corrImgContainer= corr.selectAll(".corr-image-container")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "corr-image-container")
            .style("text-align", "center")
            .style("width", 750)
            .style("height", 100)
            .selectAll(".corr-image-block")
            .data(function(d) {
                // console.log(d["corr"]);
                return d["corr"];
            })
            .enter()
            .append("g")
            .attr("class", "corr-image-block")
            .style("display", "inline-block");

    corrImgContainer.append("image")
        .attr("class", "corr-image")
        .attr("height", 45)
        .attr("width", 45)
        .style("padding", "0 2.5px")
        .attr("preserveAspectRatio", "none")
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        .attr("xlink:href", function(d) {
            imagePath = "flair/" + d["name"].toLowerCase() + ".png";
            return imagePath;
        })
        .attr("x", function(d,i) {
            return (widthCorr/8 * i - 20);
        })
        .attr("transform", "translate(0," + (heightCorr - 65) + ")")
        // .attr("preserveAspectRatio", "none")
        // .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")

    corrImgContainer.append("text")
        .attr("class", "corr-hero-details")
        .html(function(d) {
            return d["mention"] + "%";
        })
        .style("size", 8)
        .style("font-family", "Source Sans Pro")
        .style("color", "black")
        .attr("x", function(d,i) {
            return (widthCorr/7.875 * i - 20);
        })
        .attr("transform", "translate(0," + (heightCorr) + ")")
        // .attr("x", function(d,i) {
        //     return (widthCorr/11 * i - 20);
        // })
        // .attr("transform", "translate(0," + (heightCorr - 60) + ")")
        
});

var dropdown = d3.select("#hero-selection-corr")
    .on("change", function(){
    var newHero = d3.select(this).property('value');
    corr.selectAll(".corr-image-container").remove();
    updateHeroCorrData(newHero);
});

var updateHeroCorrData = function(heroName) {
d3.json("hero-correlation.json", function(error, data) {
    if (error) {
        throw error;
    }

    // data.forEach(function(d){
    //     d["corr"].forEach(function(c){
    //         c.mention = +c.mention;
    //     })
    // })

    corr.exit().remove();
    
    name = heroName.toLowerCase();
    console.log(name);
    usableDataIndex = 0;

    for (i=0; i< data.length; i++) {
        if (data[i].hero == name) {
            usableDataIndex = i;
            // console.log(i)        
            break;
        }
    }

    data = data.slice(usableDataIndex, usableDataIndex+1);
    
    corr.selectAll(".corr-image-container").exit().remove();

    console.log(data)

    corrImgContainer= corr.selectAll(".corr-image-container")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "corr-image-container")
            .style("text-align", "center")
            .style("width", 750)
            .style("height", 100)
            .selectAll(".corr-image-block")
            .data(function(d) {
                // console.log(d["corr"]);
                return d["corr"];
            })
            .enter()
            .append("g")
            .attr("class", "corr-image-block")
            .style("display", "inline-block");

    corrImgContainer.append("image")
        .attr("class", "corr-image")
        .attr("height", 45)
        .attr("width", 45)
        .style("padding", "0 2.5px")
        .attr("preserveAspectRatio", "none")
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        .attr("xlink:href", function(d) {
            imagePath = "flair/" + d["name"].toLowerCase() + ".png";
            return imagePath;
        })
        .attr("x", function(d,i) {
            return (widthCorr/8 * i - 20);
        })
        .attr("transform", "translate(0," + (heightCorr - 65) + ")")
        // .attr("preserveAspectRatio", "none")
        // .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")

    corrImgContainer.append("text")
        .attr("class", "corr-hero-details")
        .html(function(d) {
            return d["mention"] + "%";
        })
        .style("size", 8)
        .style("font-family", "Source Sans Pro")
        .style("color", "black")
        .attr("x", function(d,i) {
            return (widthCorr/7.875 * i - 20);
        })
        .attr("transform", "translate(0," + (heightCorr) + ")")

    // corrImgContainer= corr.selectAll(".corr-image-container")
    //         .data(data)
    //         .enter()
    
    //         .selectAll(".corr-image-block")
    //         .data(function(d) {
    //             console.log(d);
    //             return d["corr"];
    //         })
    //         .enter();

    // corrImgContainer.selectAll(".corr-image")
    //     .attr("class", "corr-image")
    //     .attr("height", 45)
    //     .attr("width", 45)
    //     .style("padding", "0 2.5px")
    //     .attr("preserveAspectRatio", "none")
    //     .attr("xlink:href", function(d) {
    //         imagePath = "flair/" + d["name"].toLowerCase() + ".png";
    //         return imagePath;
    //     })
    //     .attr("x", function(d,i) {
    //         return (widthCorr/8 * i - 20);
    //     })
    //     .attr("transform", "translate(0," + (heightCorr - 65) + ")")

    // corrImgContainer.selectAll(".corr-hero-details")
    //     .html(function(d) {
    //         return d["mention"] + "%";
    //     })

});
}