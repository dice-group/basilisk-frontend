<template>
  <div class="wrap">
    <div class="md-layout md-gutter">
      <div class="md-layout-item">
        <b-form-group label="Select dataset:" >
          <b-form-select v-model="datasetName" :options="allDatasets" @change="selectDataset(datasetName)"></b-form-select>
        </b-form-group>
        <b-form-group label="Select triplestores:" >  
          <b-form-select v-model="selectedTriplestores" :options="availableTriplestores" multiple :select-size="4" @change="selectTriplestores(selectedTriplestores)"></b-form-select>
        </b-form-group>
        <b-form-group label="Select chart type:" >
          <b-form-select v-model="chartType" :options="chartTypes" @change="selectChart(chartType)"></b-form-select>
        </b-form-group>
        <b-form-group label="Select metric type:" >
          <b-form-select v-model="metricType" :options="metrics" @change="selectMetric(metricType)"></b-form-select>
        </b-form-group>
      </div>
    
      <div class="md-layout-item">
        <Barchart  v-bind:data="barChartData"/>
        <Scatterplot  v-bind:data="scatterplotData" v-bind:triplestores="selectedTriplestores"/>
        <Boxplot v-bind:data="boxplotData"/>
        <md-button v-if="barChartData.length || scatterplotData.length || boxplotData.length" id="downloadButton" class="md-raised" @click="downloadChartAsSvg()">Download svg</md-button>
        <md-button v-if="barChartData.length || scatterplotData.length || boxplotData.length" id="downloadButton" class="md-raised" @click="downloadChartAsPdf()">Download pdf</md-button>
        <md-button v-if="barChartData.length || scatterplotData.length || boxplotData.length" id="downloadButton" class="md-raised" @click="downloadChartAsPng()">Download png</md-button>
        <md-button v-if="barChartData.length || scatterplotData.length || boxplotData.length" id="downloadButton" class="md-raised" @click="downloadCSV()">Download data</md-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Mixins } from 'vue-property-decorator';
import * as d3 from 'd3';
import * as savePng from 'save-svg-as-png';
import { jsPDF } from 'jspdf'
import 'svg2pdf.js'

import Barchart from './Barchart.vue';
import Scatterplot from './Scatterplot.vue';
import Boxplot from './Boxplot.vue';

import {TypeMetrics, BarchartData, BoxplotData, ScatterplotData} from "../Interfaces";

@Component({
  components: {
    Barchart,
    Scatterplot,
    Boxplot,
  },
})

export default class Charts extends Vue {
  // @Prop() private msg!: string;

  private msg1 = "welcome to my app";
  private datasetName = "";
  private allDatasets: string[] = [];
  private availableTriplestores: string[] = [];
  private selectedTriplestores: string[] =[];
  private chartType = "";
  private chartTypes: string[] = ["Scatterplot", "Barchart", "Boxplot"];
  private metricType = "";
  private metrics: string[] =[];
  private metricTypes: Array<TypeMetrics> = [{type: "Scatterplot", metrics: ["resultSize & QPS"]},
   {type: "Barchart", metrics: ["QMPH", "AvgQPS", "failed"]},
   {type: "Boxplot", metrics: ["QPS"]}];
  private barChartData: BarchartData[] = [];
  private scatterplotData: ScatterplotData[] = [];
  private boxplotData: BoxplotData[] = [];
  // private list: Array<object> = [
  //   {
  //     name: 'Preetish',
  //     age: '26'
  //   },
  //   {
  //     name: 'John',
  //     age: '30'
  //   }
  // ]

  public addNum(num1: number, num2: number): number {
    return num1 + num2
  }

  mounted(): void {
    this.getDatasets();
  }
  beforeUpdate(): void {
    // do something
  }

  public downloadChartAsPng(): void {
    // Get the d3js SVG element and save using saveSvgAsPng.js
    savePng.saveSvgAsPng(document.getElementsByTagName("svg")[0], "plot.png", {scale: 2, backgroundColor: "#FFFFFF"});
  }

  public downloadChartAsSvg(): void {
    // save as svg
    var svgData = document.getElementsByTagName("svg")[0].outerHTML;
    var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = "plot.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  public downloadChartAsPdf(): void {
    //save as pdf
    const element = document.getElementsByTagName("svg")[0];
    let width = element.clientWidth;
    let height = element.clientHeight;
    const doc = new jsPDF(width > height ? 'l' : 'p', 'pt', [width, height]);
    doc
      .svg(element)
      .then(() => {
        // save the created pdf
        doc.save('plot.pdf')
      })
  }

  public selectDataset(name: string): void{
    this.availableTriplestores.splice(0);
    this.datasetName = name;
    this.getTriplestoresForDataset(name);
  }
  // with async await
  public async getAllResults(query: string): Promise<any>{
    let url = `http://localhost:3030/ds/?query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }

  public async getDatasets(): Promise<void>{
    let query = "select ?dataset WHERE {?dataset  <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>  <http://iguana-benchmark.eu/class/Dataset>.}";
    const datasets = await this.getAllResults(query);
    const ds: string[] = [];
    datasets.results.bindings.forEach(
      (i: any) => ds.push(i.dataset.value.split("resource/")[1]));
    this.allDatasets.push(...ds);
  }

  public async getTriplestoresForDataset(datasetName: string): Promise<void>{
    let query = `select distinct ?triplestore \
    WHERE {\
      ?s  <http://iguana-benchmark.eu/properties/dataset>  <http://iguana-benchmark.eu/resource/${datasetName}>.\
      ?s <http://iguana-benchmark.eu/properties/task> ?task .\
      ?task <http://iguana-benchmark.eu/properties/connection> ?triplestore .\
      ?triplestore  <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>  <http://iguana-benchmark.eu/class/Connection>.\
    }`;
    const triplestores = await this.getAllResults(query);
    const ts: string[] = [];
    triplestores.results.bindings.forEach(
      (i: any) => ts.push(i.triplestore.value.split("resource/")[1]));
    this.availableTriplestores.push(...ts);
    
  }

  public async getDataForBarChart(datasetName: string, triplestoreNames: string[], propName: string): Promise<BarchartData[]>{
    let query = `select distinct ?value ?ts \
    WHERE {\
      ?s  <http://iguana-benchmark.eu/properties/dataset>  <http://iguana-benchmark.eu/resource/${datasetName}>.\
      ?s <http://iguana-benchmark.eu/properties/task> ?task .\
      ?task <http://iguana-benchmark.eu/properties/connection> ?ts .\
      ?task ?p ?worker .\
      ?worker <http://iguana-benchmark.eu/properties/${propName}> ?value .\
    }`;
    const valuesObj = await this.getAllResults(query);
    let values: BarchartData[] = [];
    valuesObj.results.bindings.forEach(
      (i: any): any => values.push({"triplestore": i.ts.value.split("resource/")[1], "value": i.value.value}));
    values = values.filter((i: any) => triplestoreNames.filter(ts => i.triplestore === ts).length != 0);

    return values;
    //let data = [{ Triplestore: "blazegraph", Value: "646.8328044347188" }, { Triplestore: "virtuoso", Value: "101.99332553977811" }]
    
  }

  public async getDataForScatterplot(datasetName: string, triplestoreNames: string[], propNames: string): Promise<ScatterplotData[]>{
    let props = propNames.split("&");
    let query = `select distinct ?value1 ?value2 ?ts\
    WHERE {\
      ?s  <http://iguana-benchmark.eu/properties/dataset>  <http://iguana-benchmark.eu/resource/${datasetName}>.\
      ?s <http://iguana-benchmark.eu/properties/task> ?task .\
      ?task <http://iguana-benchmark.eu/properties/connection> ?ts .\
      ?task ?p ?worker .\
      ?worker <http://iguana-benchmark.eu/properties/${props[0].trim()}> ?value1 .\
      ?worker <http://iguana-benchmark.eu/properties/${props[1].trim()}> ?value2 .\
    }`;
    const valuesObj = await this.getAllResults(query);
    let values: ScatterplotData[] = [];
    values = valuesObj.results.bindings.filter((i: any) => triplestoreNames.filter(ts => i.ts.value.split("resource/")[1] === ts).length != 0);
    values = values.map((i: any) => {return {"triplestore": i.ts.value.split("resource/")[1], "resultSize": i.value1.value, "QPS": i.value2.value}});
    

    // valuesObj.results.bindings.forEach(
    //   (i: any): number => values.push({"Triplestore": i.ts.value.split("resource/")[1], "Value": i.value.value}));
    // values = values.filter(i => triplestoreNames.filter(ts => i.Triplestore === ts).length != 0);

    return values;
    //let data = [{ Triplestore: "blazegraph", Value: "646.8328044347188" }, { Triplestore: "virtuoso", Value: "101.99332553977811" }]
    
  }

  public selectChart(name: string): void{
    this.clearChart();
    this.metrics = this.metricTypes.filter((i: any) => i.type === name)[0].metrics;

  }

  public async selectMetric(name: string): Promise<void> {
    this.barChartData.splice(0);
    if (this.metricTypes[1].metrics.includes(name)){ // Barchart
      let data =  await this.getDataForBarChart(this.datasetName, this.selectedTriplestores, name);
      this.barChartData = data;
    } else if(this.metricTypes[0].metrics.includes(name)){ //Scatterplot
      let data =  await this.getDataForScatterplot(this.datasetName, this.selectedTriplestores, name);
      console.log(data);
      this.scatterplotData = data;
    } else if(this.metricTypes[2].metrics.includes(name)){ //Boxplot
      let data =  await this.getDataForBarChart(this.datasetName, this.selectedTriplestores, name);
      this.boxplotData = data.map((i: any) => {return i.value});
    }
  }

  public selectTriplestores (names: string): void{
    this.chartType = "";
    this.clearChart();
  }

  public clearChart(){
    this.metricType = "";
    d3.selectAll("svg").remove();
    this.barChartData.splice(0);
    this.scatterplotData.splice(0);
    this.boxplotData.splice(0);
  }

  public convertArrayOfObjectsToCSV(data: BoxplotData[] | ScatterplotData[]): string | null {  
    let result: string, ctr: number, keys: Array<string>, columnDelimiter: string, lineDelimiter: string;

    data = data || null;
    if (data == null || !data.length) {
        return null;
    }

    columnDelimiter = ',';
    lineDelimiter = '\n';

    keys = Object.keys(data[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach((item: BoxplotData | ScatterplotData) => {
        ctr = 0;
        keys.forEach(function(key: string): void {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
  }
  public downloadCSV(): void {  
    let data: BoxplotData[] | ScatterplotData[] = [];
    if (this.barChartData.length){
      data = this.barChartData;
    }
    if (this.scatterplotData.length){
      data = this.scatterplotData;
    }
    if (this.boxplotData.length){
      data = this.boxplotData;
    }

    let filename = "data.csv";
    let link, dataH;
    let csv = this.convertArrayOfObjectsToCSV(data);
    if (csv == null) return;

    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    dataH = encodeURI(csv);

    link = document.createElement('a');
    link.setAttribute('href', dataH);
    link.setAttribute('download', filename);
    link.click();
  }


  // with then
  // public getAlldatasets(): void {
  //   let query = "select ?dataset WHERE {?dataset  <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>  <http://iguana-benchmark.eu/class/Dataset>.}";
  //   let url = `http://localhost:3030/ds/?query=${encodeURIComponent(query)}`;
  //   const response = fetch(url)
  //   .then((response) => response.json())
  //   .then((datasets: any): any => {
  //     const ds: string[] = [];
  //     datasets.results.bindings.forEach(
  //       (i: any) => ds.push(i.dataset.value.split("resource/")[1]));
  //     this.allDatasets.push(...ds);
  //   });
  // }

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