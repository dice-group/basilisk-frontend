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

import {BoxplotData} from "../Interfaces";
import {nest} from 'd3-collection';

@Component
export default class Boxplot extends Vue {
  @Prop({required: true}) data!: BoxplotData[];
  @Prop({ required: true }) triplestores!: [];
  private checked = false;

  @Watch("data")
  dataChanged(): void {
    if(this.data.length){
      d3.selectAll("svg").remove();
      this.checked = false;
      let data = JSON.parse(JSON.stringify(this.data));
      this.drawBoxplot(data);
    }
  }

  public drawBoxplot(data: BoxplotData[]): void {

    var margin = {top: 10, right: 30, bottom: 150, left: 50},
      width = 900 - margin.left - margin.right,
      height = 460 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var sumstat = nest() // nest function allows to group the calculation per level of a factor
    .key(function(d: BoxplotData) { return d.triplestore;})
    .rollup(function(d: BoxplotData[]) {
      let q1 = d3.quantile(d.map(function(g: BoxplotData) { return g.value;}).sort(d3.ascending),.25);
      let median = d3.quantile(d.map(function(g: BoxplotData) { return g.value;}).sort(d3.ascending),.5);
      let q3 = d3.quantile(d.map(function(g: BoxplotData) { return g.value;}).sort(d3.ascending),.75);
      if(q1 && q3){
        let interQuantileRange = q3 - q1;
        let min = q1 - 1.5 * interQuantileRange;
        let max = q3 + 1.5 * interQuantileRange;
        return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
      }
    })
    .entries(data)

    // Show the X scale
    var x = d3.scaleBand()
      .range([ 0, width ])
      .domain(this.triplestores)
      .paddingInner(1)
      .paddingOuter(.5)
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Show the Y scale
    var y = d3.scaleLinear()
      .domain([-5000,10000])
      .range([height, 0])
    svg.append("g").attr("class", "axis y").call(d3.axisLeft(y))

    // Show the main vertical line
    svg
      .selectAll("vertLines")
      .data(sumstat)
      .enter()
      .append("line")
        .attr("class", "vertLine")
        .attr("x1", function(d: any): any {return(x(d.key))})
        .attr("x2", function(d: any): any {return(x(d.key))})
        .attr("y1", function(d: any): any {return(y(d.value.min))})
        .attr("y2", function(d: any): any {return(y(d.value.max))})
        .attr("stroke", "black")
        .style("width", 40)

    // rectangle for the main box
    var boxWidth = 100
    svg
      .selectAll("boxes")
      .data(sumstat)
      .enter()
      .append("rect")
          .attr("x", function(d: any): any{
            let xdKey = x(d.key);
            if(xdKey){
              return (xdKey-boxWidth/2);
            }
          })
          .attr("y", function(d: any){return(y(d.value.q3))})
          .attr("height", function(d: any){return(y(d.value.q1)-y(d.value.q3))})
          .attr("width", boxWidth )
          .attr("stroke", "black")
          .style("fill", "#69b3a2")

    // Show the median
    svg
      .selectAll("medianLines")
      .data(sumstat)
      .enter()
      .append("line")
        .attr("class", "medianLine")
        .attr("x1", function(d: any): any{
          let xdKey = x(d.key);
          if(xdKey){
            return (xdKey-boxWidth/2);
          }
        })
        .attr("x2", function(d: any): any{
          let xdKey = x(d.key);
          if(xdKey){
            return (xdKey+boxWidth/2);
          }
        })
        .attr("y1", function(d: any){return(y(d.value.median))})
        .attr("y2", function(d: any){return(y(d.value.median))})
        .attr("stroke", "black")
        .style("width", 80)

  // Add individual points with jitter
  var jitterWidth = 50
  svg
    .selectAll("indPoints")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function(d: BoxplotData): any{
        let xts = x(d.triplestore);
        if(xts){
          return(xts - jitterWidth/2 + Math.random()*jitterWidth)
        }
      })
      .attr("cy", function(d: BoxplotData){return(y(d.value))})
      .attr("r", 4)
      .style("fill", "white")
      .attr("stroke", "black")

  }

  public clickLog(): void{
    var margin = {top: 10, right: 30, bottom: 150, left: 50},
      w = 900 - margin.left - margin.right,
      h = 460 - margin.top - margin.bottom;
    let yScale: any;
    let yAxis: any;
 
    if(this.checked) {
      yScale = d3.scaleLinear()
        .domain([-5000,10000])
        .range([h, 0])
      
    } else {
      yScale = d3.scaleLog()
        .domain([0.01,10000])
        .range([h, 0])
      
    }
    yAxis = d3.axisLeft(yScale)
    
    d3.select("g.axis.y")
      .transition()
      .duration(500)
      .call(yAxis);

    d3.selectAll("line.vertLine")
      .transition()
      .delay(400)
      .duration(600)
      .attr("y1", function(d: any): any {
        let minVal = d.value.min;
        if (minVal < 0){
          minVal = 0.01;
        }
        return(yScale(minVal))
      })
      .attr("y2", function(d: any): any {
        return(yScale(d.value.max))
      })

    d3.selectAll("line.medianLine")
      .transition()
      .delay(400)
      .duration(600)
      .attr("y1", function(d: any){return(yScale(d.value.median))})
      .attr("y2", function(d: any){return(yScale(d.value.median))})

    d3.selectAll("rect")
      .transition()
      .delay(400)
      .duration(600)
      .attr("y", function(d: any){return(yScale(d.value.q3))})
      .attr("height", function(d: any){return(yScale(d.value.q1)-yScale(d.value.q3))})
    
    d3.selectAll("circle")
      .transition()
      .delay(400)
      .duration(600)
      .attr("cy", function(d: any) { 
        let val = d.value;
        if (val < 0){
          val = 0.01;
        }
        return yScale(val); 
      })

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
