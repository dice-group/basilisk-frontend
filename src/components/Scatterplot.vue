<template>
  <div>
    <div v-if="data.length" class="controls">
      <input v-model="checked" id="logCheckbox" type="checkbox"  @click="clickLog()" value="logscale"/>
      <label for="logscale">Log scale</label>
    </div>
    <div id="my_dataviz"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import * as d3 from 'd3';

import {ScatterplotData} from "../Interfaces";

@Component
export default class Scatterplot extends Vue {
  @Prop({ required: true }) data!: ScatterplotData[];
  @Prop({ required: true }) triplestores!: [];
  private checked = false;

  @Watch("data")
  dataChanged() {
    if(this.data.length){
      d3.selectAll("svg").remove();
      let data = JSON.parse(JSON.stringify(this.data));
      this.drawScatterplot(data);
    }
  }

  public drawScatterplot(data: ScatterplotData[]): void {

    // // set the dimensions and margins of the graph
    // let margin = {top: 10, right: 30, bottom: 100, left: 60},
    //     width = 900 - margin.left - margin.right,
    //     height = 460 - margin.top - margin.bottom;

    // // append the svg object to the body of the page
    // let svg = d3.select("#my_dataviz")
    //   .append("svg")
    //     .attr("width", width + margin.left + margin.right)
    //     .attr("height", height + margin.top + margin.bottom)
    //   .append("g")
    //     .attr("transform",
    //           "translate(" + margin.left + "," + margin.top + ")");

    // // Add X axis
    // let x = d3.scaleLinear()
    //   .domain([0, 20])
    //   .range([ 0, width ]);
    // svg.append("g")
    //   .attr("transform", "translate(0," + height + ")")
    //   .call(d3.axisBottom(x));

    // // Add Y axis
    // let y = d3.scaleLinear()
    //   .domain([1000, 116289199])
    //   .range([height , 0]); //
    // svg.append("g")
    //   .call(d3.axisLeft(y).tickFormat(function(d){return d/100000000 +"* 10^8"})); // 

    // // Add dots
    // svg.append('g')
    //   .selectAll("dot")
    //   .data(data)
    //   .enter()
    //   .append("circle")
    //     .attr("cx", function (d) { return x(d.QPS); } )
    //     .attr("cy", function (d) { return y(d.resultSize); } )
    //     .attr("r", 1.5)
    //     .style("fill", "#69b3a2")


    // d3.select("#logCheckbox").on("click", function() {
    //   if(this.checked) {
    //     y = d3.scaleLog()
    //       .domain([1000, 116289199])
    //       .range([margin.left, width - margin.left - margin.right]);
    //   } else {
    //     y = d3.scaleLinear()
    //       .domain([1000, 116289199])
    //       .range([height , 0]); //
    //       svg.append("g")
    //       .call(d3.axisLeft(y).tickFormat(function(d){return d/100000000 +"* 10^8"})); //  
    //   }
    //   // y.scale(y);
    //   // d3.select("g")
    //   //   .transition()
    //   //   .duration(500)
    //   //   .call(d3.axisLeft(y).tickFormat(function(d){return d/100000000 +"* 10^8"}));
      
    //   d3.selectAll("circle")
    //     .transition()
    //     .delay(400)
    //     .duration(600)
    //     .attr("cy", function(d) { return y(d.resultSize); })
        
    // })
  let margin = {top: 30, right: 30, bottom: 30, left: 60};
  let w = 900 - margin.left - margin.right;
  let h = 460 - margin.top - margin.bottom;
  
  
  let svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
  
  let defaultColours = ["#E01A25", "#2074A0", "#10A66E", "#66489F", "#EFB605", "blue", "green", "black", "grey", "darkgreen", "pink", "brown", "slateblue", "grey1", "orange"];
  // colour scale for regions
  let colours = d3.scaleOrdinal()
    // .domain(["Asia Pacific", "North America", "Europe", "Latin America", "Middle East and Africa"])
    // .range(["#E01A25", "#2074A0", "#10A66E", "#66489F", "#EFB605"]);
    .domain(this.triplestores)
    .range(defaultColours.slice(0, this.triplestores.length));
  
  let xScale = d3.scaleLinear()
  // let xScale = d3.scaleLog()
    .range([margin.left, w - margin.left - margin.right]);
  
  let yScale = d3.scaleLinear()
    .range([h - margin.bottom, margin.top]);
  
  let xAxis = d3.axisBottom(xScale)
    .scale(xScale)
    .tickFormat(function(d: any){return d/10000000 +"* 10^7"})
    .tickSize(-(h - (margin.top+margin.bottom)))
    .ticks(10);
  
  let yAxis = d3.axisLeft(yScale)
    .scale(yScale)
    .tickFormat(d3.format(","))
    .tickSize(-(w - (margin.left+margin.right)))
    .ticks(5);
    
    // xScale.domain([400, 40000])
    yScale.domain([0, 3000]);
    xScale.domain([1000, 116289199]);
    
    svg.append("g")
      .attr("class", "axis x")
      .attr("transform", "translate(0," + (h - margin.bottom) + ")")
      .call(xAxis)
  
    svg.append("g")
      .attr("class", "axis y")
      .attr("transform", "translate(" + margin.left + ",0)")
      .call(yAxis)
    
    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function(d) { return xScale(d.resultSize); })
      .attr("cy", function(d) { return yScale(d.QPS); })
      .attr("r", 1.5)
      .style("fill", function(d): any { return colours(d.triplestore); });
    
    svg.append("g")
      .append("text")
      .attr("class", "x title shadow")
      .attr("text-anchor", "end")
      .attr("transform", "translate(" + (w - margin.right - 5) + "," + (h - margin.bottom + 16 ) + ")")
      .text("resultSize")
  
    svg.append("g")
      .append("text")
      .attr("class", "y title shadow")
      .attr("text-anchor", "end")
      .attr("transform", "translate(" + (margin.left-40) + "," + (margin.top-30) + ") rotate(-90)")
      .text("QPS")
    
    // legend
    let legendMargin = {top:12, right:5, bottom:10, left:5};
    let legendW = 250;
    let legendH = 200;
  
    let svgLegend = svg.append("svg")
      .attr("width", legendW)
      .attr("height", legendH)
      .attr("x", w - margin.right - legendW)
      .attr("y", margin.top);
  
    let legendContainer = svgLegend.append("g")
      .attr("class", "legendContainer")
      .attr("transform", "translate(" + legendMargin.left + "," + legendMargin.top + ")");
  
    let rectSize = 10;
    let rowHeight = 20;
    let maxWidth = 125;

    let legend = legendContainer.selectAll(".legendSquare")
      .data(colours.range())
      .enter()
      .append("g")
      .attr("class", "legendSquare")
      .attr("transform", function(d, i) {
        return "translate(0," + (i*rowHeight) + ")";
      })

    // append squares to legend
    legend.append("rect")
      .attr("width", rectSize)
      .attr("height", rectSize)
      .style("fill", function(d: any) { return d; })

    // append text to legend
    legend.append("text")
      .attr("transform", "translate(20," + rectSize/2 + ")")
      .attr("class", "legendText shadow")
      .attr("dy", ".35em")
      .text(function(d, i) { return colours.domain()[i]; }) 
      
    
    // d3.select("#logCheckbox").on("click", function() {
    //   console.log(this.checked);
    //   if(this.checked) {
    //     xScale = d3.scaleLog()
    //       .domain([1000, 116289199])
    //       .range([margin.left, w - margin.left - margin.right]);
    //   } else {
    //     xScale = d3.scaleLinear()
    //       .domain([1000, 116289199])
    //       .range([margin.left, w - margin.left - margin.right]);
    //   }
    //   xAxis.scale(xScale);
    //   d3.select("g.axis.x")
    //     .transition()
    //     .duration(500)
    //     .call(xAxis);
      
    //   d3.selectAll("circle")
    //     .transition()
    //     .delay(400)
    //     .duration(600)
    //     .attr("cx", function(d) { return xScale(d.resultSize); })
    // })
  }

  public clickLog(): void{
    let margin = {top: 30, right: 30, bottom: 30, left: 60};
    let w = 900 - margin.left - margin.right;
    let h = 460 - margin.top - margin.bottom;
    let xScale: any;
    let xAxis: any;
 
    if(this.checked) {
      xScale = d3.scaleLinear()
        .domain([1000, 116289199])
        .range([margin.left, w - margin.left - margin.right]);

       xAxis = d3.axisBottom(xScale)
      .scale(xScale)
      .tickFormat(function(d: any){return d/10000000 +"* 10^7"})
      .tickSize(-(h - (margin.top+margin.bottom)))
      .ticks(10);
    } else {
      xScale = d3.scaleLog()
        .domain([10, 116289199])
        .range([margin.left, w - margin.left - margin.right]);

      xAxis = d3.axisBottom(xScale)
      .scale(xScale)
      // .tickFormat(function(d: any){return d/10000000 +"* 10^7"})
      .tickSize(-(h - (margin.top+margin.bottom)))
      .ticks(10);
    }

    // xAxis.scale(xScale);
    

    d3.select("g.axis.x")
      .transition()
      .duration(500)
      .call(xAxis);
    
    
    d3.selectAll("circle")
      .transition()
      .delay(400)
      .duration(600)
      .attr("cx", function(d: any) { return xScale(d.resultSize); })

  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  
  .axis path, .axis line {
    fill: none;
    stroke: #6b6b6b;
    stroke-dasharray: 2, 3;
    shape-rendering: crispEdges;
  }
  
  .axis text {
    font-size: 10px;
    fill: #6b6b6b;
  }
  
  .title {
    font-size: 14px;
    fill: #6b6b6b;
  }
  
  .legendText {
    fill: #6b6b6b;
  }
  
  .shadow {
    text-shadow: 2px 2px 2px #fff, -2px -2px 2px #fff, -2px 2px 2px #fff, 2px -2px 2px #fff, -2px 0px 2px #fff, 2px 0px 2px #fff;
  }
  
  circle {
    fill-opacity: 0.55;
  }
</style>
