<template>
  <div id="app">   
    <Toolbar msg="Welcome to Your Vue.js + TypeScript App"/>
    <Charts/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Toolbar from './components/Toolbar.vue';
import Charts from './components/Charts.vue'

@Component({
  components: {
    Toolbar,
    Charts,
  },
})
export default class App extends Vue {}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  
}
</style>
