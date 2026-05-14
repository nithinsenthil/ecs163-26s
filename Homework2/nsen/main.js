let abFilter = 25;
const width = window.innerWidth / 2;
const height = window.innerHeight / 2;
// const width = 400;
// const height = 350;

let barChartMargin = { top: 40, right: 30, bottom: 85, left: 70 },
  barChartWidth = width - barChartMargin.left - barChartMargin.right,
  barChartHeight = height - barChartMargin.top - barChartMargin.bottom;

let pieMargin = 30;

// plots
d3.csv("student_mental_health.csv")
  .then((rawData) => {
    console.log("rawData", rawData);

    // Process data into usable headers
    let processedData = rawData.map((d) => {
      return {
        gender: d["Choose your gender"],
        age: Number(d["Age"]),
        course: d["What is your course?"],
        year: d["Your current year of Study"].toLowerCase(),
        gpa: d["What is your CGPA?"].trim(),
        depression: d["Do you have Depression?"].toLowerCase(),
      };
    });
    processedData = processedData.filter((d) => d.age != 0);

    console.log("processedData", processedData);

    // plot 1: Bar chart
    const barSvg = d3.select("#bar-svg");

    const g1 = barSvg.append("g").attr("width", width).attr("height", height);

    // Reduce data to category counts
    let barData = d3.rollup(
      processedData,
      (v) =>
        v.reduce(
          (a, b) => {
            return { age: a.age + b.age };
          },
          { age: 0 },
        ).age / v.length,
      (d) => d.gpa,
    );
    barData = Array.from(barData, ([gpa, age]) => ({ gpa, age }));
    console.log("barData", barData);

    // Create x and y axis

    // Compute x axis
    const x1 = d3
      .scaleBand()
      .domain(
        barData
          .map((d) => d.gpa)
          .sort(
            (a, b) => parseFloat(a.slice(0, 3)) - parseFloat(b.slice(0, 3)),
          ),
      )
      .range([barChartMargin.left, width - barChartMargin.right])
      .padding(0.08);

    // Draw x axis
    const xAxisCall = d3.axisBottom(x1).ticks(5);
    g1.append("g")
      .attr("transform", `translate(0, ${height - barChartMargin.bottom})`)
      .call(xAxisCall)
      .selectAll("text")
      .attr("text-anchor", "end");

    // Label x axis
    g1.append("text")
      .attr("x", barChartMargin.left + barChartWidth / 2)
      .attr("y", height - 5)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text("GPA Range");

    // Compute y axis
    const y1 = d3
      .scaleLinear()
      .domain([
        d3.min(processedData, (d) => d.age),
        d3.max(processedData, (d) => d.age),
      ])
      .range([height - barChartMargin.bottom, barChartMargin.top])
      .nice();

    // Draw y axis
    const yAxisCall = d3.axisLeft(y1).tickSize(5).ticks(5);
    g1.append("g")
      .attr("transform", `translate(${barChartMargin.left}, 0)`)
      .call(yAxisCall)
      .selectAll("text")
      .style("text-anchor", "end");

    // Label y axis
    g1.append("text")
      .attr(
        "transform",
        `translate(25, ${barChartMargin.top + barChartHeight / 2}) rotate(-90)`,
      )
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .text("Age (years)");

    // Draw bars
    const barColor = "#77ACA2";
    const highlightColor = "orange";
    const rect = g1
      .append("g")
      .classed("mark", true)
      .selectAll("rect")
      .data(barData)
      .join("rect")
      .attr("x", (d) => x1(d.gpa))
      .attr("y", (d) => y1(d.age))
      .attr("width", x1.bandwidth())
      .attr("height", (d) => height - barChartMargin.bottom - y1(d.age))
      .style("fill", barColor);

    // plot 2: Pie charts
    const pieWidth = width / 2 + pieMargin * 1.5;
    const pieHeight = height / 2 + pieMargin * 1.5;

    const radius = Math.min(pieWidth, pieHeight) / 2 - pieMargin * 2;

    const pieSvg = d3.select("#pie-svg");

    // const data_pie1 = { a: 20, b: 80 };
    const pieData = d3.rollup(
      processedData,
      (d) => (d.filter((f) => f.depression == "yes").length / d.length) * 100,
      (d) => d.year,
    );
    // const
    console.log(pieData);

    // console.log(pieData["year 1"])
    const data_pie1 = {
      a: pieData.get("year 1"),
      b: 100 - pieData.get("year 1"),
    };
    drawPie(pieSvg, data_pie1, pieWidth, pieHeight, radius, 0, 0, "Year 1");

    const data_pie2 = {
      a: pieData.get("year 2"),
      b: 100 - pieData.get("year 2"),
    };
    drawPie(pieSvg, data_pie2, pieWidth, pieHeight, radius, 1, 0, "Year 2");

    const data_pie3 = {
      a: pieData.get("year 3"),
      b: 100 - pieData.get("year 3"),
    };
    drawPie(pieSvg, data_pie3, pieWidth, pieHeight, radius, 0, 1, "Year 3");

    const data_pie4 = {
      a: pieData.get("year 4"),
      b: 100 - pieData.get("year 4"),
    };
    drawPie(pieSvg, data_pie4, pieWidth, pieHeight, radius, 1, 1, "Year 4");

    const g2 = pieSvg
      .append("g")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", `translate(${300},${100})`);

    // Legend
    g2.append("text")
      .attr("font-size", "10px")
      .attr("text-anchor", "left")
      .text("Key");

    // Color 1
    const item1 = g2
      .append("g")
      .attr("transform", `translate(${-20},${10})`);

    item1.append("rect")
      .attr("width", "10px")
      .attr("height", "10px")
      .attr("fill", "#98abc5");
      item1.append("text")
      .attr("font-size", "10px")
      .attr("text-anchor", "left")
      .attr("transform", `translate(${15},${8})`)
      .text("Depressed");
    
    // Color 2
    const item2 = g2
      .append("g")
      .attr("transform", `translate(${-20},${30})`);

    item2.append("rect")
      .attr("width", "10px")
      .attr("height", "10px")
      .attr("fill", "#8a89a6");
      item2.append("text")
      .attr("font-size", "10px")
      .attr("text-anchor", "left")
      .attr("transform", `translate(${15},${8})`)
      .text("Not Depressed");

  })
  .catch(function (error) {
    console.log(error);
  });

function drawPie(svg, data, pieWidth, pieHeight, radius, x, y, text) {
  const g2 = svg
    .append("g")
    .attr("width", width)
    .attr("height", height)
    .attr(
      "transform",
      `translate(${pieMargin + radius + (pieMargin + radius * 2) * x},${pieMargin + radius + (pieMargin + radius * 2) * y})`,
    );

  const color = d3
    .scaleOrdinal()
    .domain(Object.keys(data))
    .range(["#98abc5", "#8a89a6"]);

  const dataArray = Object.entries(data).map(([key, value]) => ({
    key,
    value,
  }));
  const pie = d3
    .pie()
    .value((d) => d.value)
    .sort(null);
  const data_ready = pie(dataArray);

  const arc = d3.arc().innerRadius(0).outerRadius(radius);
  g2.selectAll("whatever")
    .data(data_ready)
    .enter()
    .append("path")
    .attr("d", (d) => arc(d))
    .attr("fill", (d) => color(d.data.key))
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7);

  // Label pie
  g2.append("text")
    .attr("x", 0)
    .attr("y", radius + 15)
    .attr("font-size", "10px")
    .attr("text-anchor", "middle")
    .text(text);
}
