d3.csv("Train.csv").then(data => {

  // Parse date column (assuming it's a string)
  data.forEach(d => {
    d.Date = new Date(d.Date);
  });

  const width = 800;
  const height = 500;

  // Function to create Bar Chart
  function createBarChart(dataField) {
    const xScale = d3.scaleBand()
      .domain(data.map(d => d[dataField]))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[dataField])])
      .range([height, 0]);

    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d[dataField]))
      .attr("y", d => yScale(d[dataField]))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - yScale(d[dataField]))
      .attr("fill", "steelblue");

    svg.append("g")
      .attr("class", "x axis")
      .call(d3.axisBottom(xScale))
      .attr("transform", `translate(0,${height})`);

    svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yScale));
  }

  // Function to create a line chart
  function createLineChart(dataField, xLabel, yLabel, title , divId) {

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.Date))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d[dataField]))
      .range([height, 0]);

    const line = d3.line()
      .x(d => xScale(d.Date))
      .y(d => yScale(d[dataField]));

    const svg = d3.select(`#${divId}`)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    svg.append("path")
      .datum(data)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2);

    svg.append("g")
      .attr("class", "x axis")
      .call(d3.axisBottom(xScale))
      .attr("transform", `translate(0,${height})`)
      .append("text")
      .attr("x", width / 2)
      .attr("y",  20)
      .attr("text-anchor", "middle")
      .text(xLabel);

    svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yScale))
      .appenwd("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end") 
      .text(yLabel);

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text(title);
  }

  // Create Bar Chart for "total_revenue"
  // createBarChart("total_revenue");
  // Create line charts for stock price, total revenue, and net income
  createLineChart("price", "Date", "Stock Price", "Stock Price Over Time" , "chart1");
  createLineChart("total_revenue", "Date", "Total Revenue", "Total Revenue Over Time" , "chart2");
  createLineChart("net_income", "Date", "Net Income", "Net Income Over Time" , "chart3");


});


