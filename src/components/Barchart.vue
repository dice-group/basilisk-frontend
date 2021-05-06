<template>
    <div id="my_dataviz"></div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import * as d3 from 'd3';
import {BarchartData} from "../Interfaces";

@Component
export default class Barchart extends Vue {
  @Prop({required: true}) data!: BarchartData[];

  @Watch("data")
  dataChanged() {
    if(this.data.length){
      d3.selectAll("svg").remove();
      let data = JSON.parse(JSON.stringify(this.data));
      this.drawBarchart(data);
    }
  }

  public drawBarchart(data: BarchartData[]): void {

    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 10, bottom: 150, left: 60},
        width = 500 - margin.left - margin.right,
        height = 460 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    // Parse the Data
    // let data = [{ Triplestore: "United States", Value: "12394" }, { Triplestore: "Russia", Value: "6148" }];

    // console.log(data);
    // X axis
    var x = d3.scaleBand()
      .range([ 0, width ])
      .domain(data.map(function(d: BarchartData) { return d.triplestore; }))
      .padding(0.2);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");


    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, 2000])
      .range([ height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Bars
    svg.selectAll("mybar")
      .data(data)
      .enter()
      .append("rect")
        .attr("x", function(d: BarchartData): any { return x(d.triplestore); })
        .attr("y", function(d: BarchartData): any { return y(d.value); })
        .attr("width", x.bandwidth())
        .attr("height", function(d: any) { return height - y(d.value); })
        .attr("fill", "#69b3a2")

  }


}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.wrap {
  margin: 30px 30px;
}
</style>
