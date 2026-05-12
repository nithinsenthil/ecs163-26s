let abFilter = 25;
const width = window.innerWidth;
const height = window.innerHeight;
// const width = 400;
// const height = 350;

// let barChartLeft = 0,
//   barChartTop = 0;
let barChartMargin = { top: 40, right: 30, bottom: 85, left: 70 },
  barChartWidth = width - barChartMargin.left - barChartMargin.right,
  barChartHeight = height - barChartMargin.top - barChartMargin.bottom;

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
    const svg = d3.select("#bar-svg");

    const g1 = svg.append("g").attr("width", width).attr("height", height);

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
			.padding(0.08);;

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
		const highlightColor = "orange"
		const rect = g1.append("g")
			.classed("mark", true)
			.selectAll("rect")
			.data(barData)
			.join("rect")
			.attr("x", d => x1(d.gpa))
			.attr("y", d => y1(d.age))
			.attr("width", x1.bandwidth())
			.attr("height", d => height - barChartMargin.bottom - y1(d.age))
			.style("fill", barColor)

    // const g2 = svg
    //   .append("g")
    //   .attr("width", distrWidth + distrMargin.left + distrMargin.right)
    //   .attr("height", distrHeight + distrMargin.top + distrMargin.bottom)
    //   .attr("transform", `translate(${distrLeft}, ${distrTop})`);

    // //plot 2: Bar Chart for Team Player Count

    // const teamCounts = processedData.reduce(
    //   (s, { teamID }) => ((s[teamID] = (s[teamID] || 0) + 1), s),
    //   {},
    // );
    // const teamData = Object.keys(teamCounts).map((key) => ({
    //   teamID: key,
    //   count: teamCounts[key],
    // }));
    // console.log("teamData", teamData);

    // const g3 = svg
    //   .append("g")
    //   .attr("width", teamWidth + teamMargin.left + teamMargin.right)
    //   .attr("height", teamHeight + teamMargin.top + teamMargin.bottom)
    //   .attr("transform", `translate(${teamMargin.left}, ${teamTop})`);

    // // X label
    // g3.append("text")
    //   .attr("x", teamWidth / 2)
    //   .attr("y", teamHeight + 50)
    //   .attr("font-size", "20px")
    //   .attr("text-anchor", "middle")
    //   .text("Team");

    // // Y label
    // g3.append("text")
    //   .attr("x", -(teamHeight / 2))
    //   .attr("y", -40)
    //   .attr("font-size", "20px")
    //   .attr("text-anchor", "middle")
    //   .attr("transform", "rotate(-90)")
    //   .text("Number of players");

    // // X ticks
    // const x2 = d3
    //   .scaleBand()
    //   .domain(teamData.map((d) => d.teamID))
    //   .range([0, teamWidth])
    //   .paddingInner(0.3)
    //   .paddingOuter(0.2);

    // const xAxisCall2 = d3.axisBottom(x2);
    // g3.append("g")
    //   .attr("transform", `translate(0, ${teamHeight})`)
    //   .call(xAxisCall2)
    //   .selectAll("text")
    //   .attr("y", "10")
    //   .attr("x", "-5")
    //   .attr("text-anchor", "end")
    //   .attr("transform", "rotate(-40)");

    // // Y ticks
    // const y2 = d3
    //   .scaleLinear()
    //   .domain([0, d3.max(teamData, (d) => d.count)])
    //   .range([teamHeight, 0])
    //   .nice();

    // const yAxisCall2 = d3.axisLeft(y2).ticks(6);
    // g3.append("g").call(yAxisCall2);

    // // bars
    // const bars = g3.selectAll("rect").data(teamData);

    // bars
    //   .enter()
    //   .append("rect")
    //   .attr("y", (d) => y2(d.count))
    //   .attr("x", (d) => x2(d.teamID))
    //   .attr("width", x2.bandwidth())
    //   .attr("height", (d) => teamHeight - y2(d.count))
    //   .attr("fill", "steelblue");
  })
  .catch(function (error) {
    console.log(error);
  });
