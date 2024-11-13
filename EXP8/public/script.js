// main graph calling funtion 
let mainData;

d3.csv('Forest.csv').then(data => {
    mainData = data
    createPieChart(data);
    animateLineChart(data); // Start the animation
    stackedHistogram(data); 
    createChoroplethMap(data); // india map
});


// pie chart -> settign up the line chart
function createPieChart(data) {
    const totalGeographicalArea = d3.sum(data, d => +d['Geographical area']);
    const totalForestArea = d3.sum(data, d => +d['Total forest']);
    
    // Summing up forest types
    const veryDenseForest = d3.sum(data, d => +d['Very dense forest']);
    const modDenseForest = d3.sum(data, d => +d['Mod. dense forest']);
    const openForest = d3.sum(data, d => +d['Open forest']);

    // Data for the pie chart
    const pieData = [
        { category: 'Total Geographical Area', value: totalGeographicalArea },
        { category: 'Total Forest Area', value: totalForestArea }
    ];

    // Set dimensions for the pie chart
    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    // Create a color scale
    const color = d3.scaleOrdinal()
        .domain(pieData.map(d => d.category))
        .range(['#66b3ff', '#99ff99']); // Colors for the categories

    // Create the SVG container
    const svg = d3.select("#pie-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Create the pie chart
    const pie = d3.pie()
        .value(d => d.value);

    const arc = d3.arc()
        .innerRadius(0) // Full pie chart
        .outerRadius(radius);

    const arcs = svg.selectAll(".arc")
        .data(pie(pieData))
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", (d) => color(d.data.category));

    // Tooltip for Total Forest Area -> adding a new div from js
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    arcs.filter(d => d.data.category === 'Total Forest Area')
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Total Forest Area : ${totalForestArea}<br>Very Dense : ${veryDenseForest}<br>Moderately Dense : ${modDenseForest}<br>Open : ${openForest}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

        arcs.filter(d => d.data.category === 'Total Geographical Area')
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Total Geographical Area : ${totalGeographicalArea}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add labels
    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle") // Center the text
        .text(d => d.data.category);
}

// animation logic
let currentIndex = 0;
let interval;

function animateLineChart(data) {
    const states = Array.from(new Set(data.map(d => d["State/UTs"])));
    interval = setInterval(() => {
        const state = states[currentIndex];
        d3.select("#line-chart").select("svg").remove(); // Clear the existing chart
        createLineChart(data, state);
        currentIndex = (currentIndex + 1) % states.length; // Loop back to the first state
    }, 1000); // Change every 3 seconds
}

// animated line chart -> settign up the line chart
function createLineChart(data, state) {
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#line-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Prepare data for the selected State/UT
    const filteredData = data.filter(d => d["State/UTs"] === state);
    const years = Object.keys(filteredData[0]).filter(key => key.startsWith("Forest_Coverage_"));

    const coverageData = years.map(year => ({
        year: year.replace("Forest_Coverage_", ""),
        coverage: parseFloat(filteredData[0][year]) || 0 // Replace dashes and other non-numeric values with 0
        }))

    console.log(`Coverage Data for ${state}:`, coverageData); // Log coverage data

    if (coverageData.length === 0) {
        console.error(`No valid coverage data found for ${state}`);
        return; // Stop if there's no valid data
    }

    const x = d3.scaleLinear()
        .domain(d3.extent(coverageData, d => d.year))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(coverageData, d => d.coverage)])
        .range([height, 0]);

    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.coverage));

    svg.append("path")
        .datum(coverageData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add label for the current state
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0) // Adjust this value to position the label vertically
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "black")
        .attr("class", "state-label") // Add a class for styling if needed
        .text(`Forest Coverage for State: ${state}`); // Set initial text
}


// play - pause button
document.getElementById("pause-button").addEventListener("click", () => {
    if (interval) {
        clearInterval(interval);
        interval = null;
        document.getElementById("pause-button").innerText = "Play"; // Change button text to Play
    } 
    else {
        animateLineChart(mainData); // Restart the animation
        document.getElementById("pause-button").innerText = "Pause"; // Change button text to Pause
    }
});


function stackedHistogram(data) {
    // Convert data fields to numbers and handle missing or invalid values
    data.forEach(d => {
        d["Very dense forest"] = +d["Very dense forest"] || 0; // Convert to number, fallback to 0 if NaN
        d["Mod. dense forest"] = +d["Mod. dense forest"] || 0;
        d["Open forest"] = +d["Open forest"] || 0;
        d["Total forest"] = d["Very dense forest"] + d["Mod. dense forest"] + d["Open forest"];
    });

    // Sort the data by total forest in descending order
    data.sort((a, b) => b["Total forest"] - a["Total forest"]);

    const margin = { top: 40, right: 20, bottom: 100, left: 60 }; // Increased bottom margin for rotated text
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#hist-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up the x and y scale
    const x = d3.scaleBand()
        .domain(data.map(d => d["State/UTs"])) // Map each state
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d["Total forest"])]) // Max value for total forest
        .range([height, 0]);

    // Set up the colors for each type of forest
    const color = d3.scaleOrdinal()
        .domain(["Very dense forest", "Mod. dense forest", "Open forest"])
        .range(["#004d00", "#66cc00", "#b3ff66"]);

    // Stack the data
    const stack = d3.stack()
        .keys(["Very dense forest", "Mod. dense forest", "Open forest"]); // Stack these keys

    const series = stack(data); // Stacked data

    // Create the tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0); // Initially hidden

    // Draw the bars
    svg.selectAll("g.layer")
        .data(series)
      .enter().append("g")
        .attr("class", "layer")
        .attr("fill", d => color(d.key)) // Apply color based on the forest type
      .selectAll("rect")
        .data(d => d)
      .enter().append("rect")
        .attr("x", d => x(d.data["State/UTs"])) // State
        .attr("y", d => y(d[1])) // Top of the bar
        .attr("height", d => {
            const height = y(d[0]) - y(d[1]); // Height based on the stack segment
            return isNaN(height) ? 0 : height; // Handle NaN height
        })
        .attr("width", x.bandwidth()) // Width of each bar

        // Tooltip events
        .on("mouseover", function(event, d) {
            const forestType = d3.select(this.parentNode).datum().key;
            const value = d[1] - d[0];
            const state = d.data["State/UTs"];
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9); // Show tooltip
            tooltip.html(`${forestType} in ${state}: ${value}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0); // Hide tooltip
        });

    // Add the x-axis with rotated text labels
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "rotate(-65)") // Rotate the text to make it vertical
        .style("text-anchor", "end"); // Anchor to the end

    // Add the y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add a title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("fill", "black")
}

// india map
// Function to create the choropleth map
function createChoroplethMap(data) {
    const width = 800;
    const height = 600;

    // Create the SVG element
    const svg = d3.select("#india-map")
        .attr("width", width)
        .attr("height", height);

    // Define a projection and path generator
    const projection = d3.geoMercator()
        .center([78.9629, 23.5937]) // Center of India
        .scale(1000) // Adjust scale as needed
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Define a color scale based on Percentage of Geographical Area
    const colorScale = d3.scaleLinear()
        .domain([0, 100]) // 0% to 100% coverage
        .range(["#c0e8af", "#1f3615"]); // Lighter for low percentages, darker for high

    // Tooltip for displaying percentages on hover
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");

    // Load the GeoJSON data for India's states
    d3.json("india_states.geojson").then(geoData => {

        // Merge GeoJSON and CSV data
        geoData.features.forEach(d => {
            const stateData = data.find(row => row["State/UTs"] === d.properties.NAME_1);
            d.properties.percentage = stateData ? +stateData["Percentage of geographical area"] : 0;
        });

        // Draw the map
        svg.selectAll("path")
            .data(geoData.features)
            .enter().append("path")
            .attr("d", path)
            .attr("class", "state-boundary")
            .attr("fill", d => colorScale(d.properties.percentage)) // Fill based on percentage
            .on("mouseover", function (event, d) {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`${d.properties.NAME_1}: ${d.properties.percentage}%`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                tooltip.transition().duration(500).style("opacity", 0);
            });
    });
}

