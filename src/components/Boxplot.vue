<template>
    <div id="my_dataviz"></div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import * as d3 from 'd3';

import {BoxplotData} from "../Interfaces";

@Component
export default class Boxplot extends Vue {
  @Prop({required: true}) data!: BoxplotData[];

  @Watch("data")
  dataChanged(): void {
    if(this.data.length){
      d3.selectAll("svg").remove();
      let data = JSON.parse(JSON.stringify(this.data));
      this.drawBoxplot(data);
    }
  }

  public drawBoxplot(data: BoxplotData[]): void {

    var margin = {top: 10, right: 30, bottom: 30, left: 40},
      width = 400 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // data = [12,19,11,13,12,22,13,4,15,16,18,19,20,12,11,9];
    // Compute summary statistics used for the box:
    var data_sorted = data.sort(<any>d3.ascending)
    var q1 = d3.quantile(<any>data_sorted, .25)
    var median = d3.quantile(<any>data_sorted, .5)
    var q3 = d3.quantile(<any>data_sorted, .75)
    if(q1 && q3){
      var interQuantileRange = q3 - q1
      var min = q1 - 1.5 * interQuantileRange
      var max = q1 + 1.5 * interQuantileRange

      // Show the Y scale
      var y = d3.scaleLinear()
        .domain([50,5000])
        .range([height, 0]);
      svg.call(d3.axisLeft(y))

      // a few features for the box
      var center = 200
      width = 100

      // Show the main vertical line
      svg
      .append("line")
        .attr("x1", center)
        .attr("x2", center)
        .attr("y1", y(min) )
        .attr("y2", y(max) )
        .attr("stroke", "black")

      // Show the box
      svg
      .append("rect")
        .attr("x", center - width/2)
        .attr("y", y(q3) )
        .attr("height", (y(q1)-y(q3)) )
        .attr("width", width )
        .attr("stroke", "black")
        .style("fill", "#69b3a2")

      // show median, min and max horizontal lines
      svg
      .selectAll("toto")
      .data([min, median, max])
      .enter()
      .append("line")
        .attr("x1", center-width/2)
        .attr("x2", center+width/2)
        .attr("y1", function(d: any){ return(y(d))} )
        .attr("y2", function(d: any){ return(y(d))} )
        .attr("stroke", "black")

    }
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
