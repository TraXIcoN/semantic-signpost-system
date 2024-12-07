"use client"; // Required for client-side rendering
import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function TimelineComponent({ data }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };

    svg.attr("width", width).attr("height", height);

    const parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");
    const formattedData = data.map((d) => ({
      ...d,
      timestamp: parseDate(d.metadata.timestamp),
    }));

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(formattedData, (d) => d.timestamp))
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, formattedData.length])
      .range([height - margin.bottom, margin.top]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    svg
      .selectAll("circle")
      .data(formattedData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.timestamp))
      .attr("cy", height / 2)
      .attr("r", 5)
      .attr("fill", "steelblue")
      .on("mouseover", (event, d) => {
        d3.select(event.target).attr("fill", "orange");
        const tooltip = d3.select("#tooltip");
        tooltip
          .style("left", `${event.pageX + 5}px`)
          .style("top", `${event.pageY - 5}px`)
          .style("display", "inline-block")
          .html(
            `<strong>${d.metadata.title}</strong><br>${d.metadata.timestamp}`
          );
      })
      .on("mouseout", (event) => {
        d3.select(event.target).attr("fill", "steelblue");
        d3.select("#tooltip").style("display", "none");
      });
  }, [data]);

  return (
    <div>
      <svg ref={svgRef}></svg>
      <div
        id="tooltip"
        style={{
          position: "absolute",
          display: "none",
          backgroundColor: "white",
          border: "1px solid black",
          padding: "5px",
          pointerEvents: "none",
        }}
      ></div>
    </div>
  );
}
