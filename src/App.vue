<template>
  <div id="app">
    <js-map :data="TREE_DATA"></js-map>
  </div>
</template>

<script>
  import JsMap from "./components/jsmind-normal/JSMap";
  import {TREE_DATA} from './components/jsmind-normal/mock_data.js'

  export default {
    components: {JsMap},
    name: 'app',
    data() {
      return {
        TREE_DATA: TREE_DATA
      }
    },
    created() {
      this.TREE_DATA = TREE_DATA;
    }
  }
</script>
