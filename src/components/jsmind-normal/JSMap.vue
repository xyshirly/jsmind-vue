<template>
  <div class="risk-map-container" @click.stop.prevent="removeAllOptionMenu">
    <svg width="100%" :height="nodes[Object.keys(nodes)[0]].weight * 50 + 'px'" xmlns="http://www.w3.org/2000/svg"
         xmlns:xlink="http://www.w3.org/1999/xlink" style="overflow: hidden; position: relative;">
      <path v-for="path in pathes" fill="none" stroke="#787878" :d="path.d" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"></path>
    </svg>
    <map-node v-for="nodeId in visibleNodes" :node="nodes[nodeId]"
               :key="nodeId"
               @handleFold="handleFold"
               @handleExpand="handleExpand"
               @rightClick="rightClick"
               @selectNode="selectNode"
               @removeNode="removeNode"
               @addNode="addNode"></map-node>
  </div>
</template>
<script>
  import {MapController} from "../MapController";
  import _ from 'lodash';
  import MapNode from "./MapNode";
  let controller = new MapController();

  export default {
    components: {MapNode},
    name: 'JsMap',
    props: ['data'],
    data() {
      return {
        nodes: '',
        visibleNodes: '',
        pathes: '',
        parent: {},
        children: {},
        neibors: {}
      }
    },
    watch: {
      data: function(val) {
        controller.buildFromRaw(val);
        controller.calculateWeight();
        controller.calculateBoundaryTop();

        this.refreshDom()
      }
    },
    created() {
      controller.buildFromRaw(this.data);
      controller.calculateWeight();
      controller.calculateBoundaryTop();

      this.nodes = controller.nodes;
      this.visibleNodes = controller.getVisibleUINodes();
      this.pathes = controller.pathArr;
    },
    mounted()  {
      this.updateDom();
    },
    methods: {
      refreshDom() {
        this.nodes = controller.nodes;
        this.visibleNodes = controller.getVisibleUINodes();

        this.$nextTick(() => {
          this.updateDom();
        });
      },

      updateDom() {
        let pairs = Array.from(document.querySelectorAll('.risk-node[data-node-id]')).map(i => [i.getAttribute('data-node-id'), i.getBoundingClientRect()]);
        let v = _.fromPairs(pairs);
        controller.setDomMeta(v);

        controller.calculateBoundaryLeft();

        controller.calculatePathes();

        this.pathes = controller.pathArr;
      },

      removeAllOptionMenu() {
        controller.setUnselectedForAllNodes();
        this.refreshDom();
      },

      /**
       * 折叠节点
       */
      handleFold(node) {
        controller.collapse(node.id);

        controller.calculateWeight();
        controller.calculateBoundaryTop();
        this.refreshDom();
      },
      /**
       * 展开节点
       */
      handleExpand(node) {
        controller.expand(node.id);

        controller.calculateWeight();
        controller.calculateBoundaryTop();

        this.refreshDom();
      },

      selectNode(nodeId) {
        const selectedNode = controller.updateSelectedStatus(nodeId);
        this.refreshDom();
        this.$emit('getSelectedNode', selectedNode)
      },

      /**
       * 右键点击
       */
      rightClick(nodeId) {
        controller.updateOptionStatus(nodeId);
        this.refreshDom();
      },

      /**
       * 删除子节点
       */
      removeNode(node) {
        controller.removeNode(node.id);

        this.nodes = controller.nodes;
        this.visibleNodes = controller.getVisibleUINodes();

        this.$nextTick(() => {
          controller.calculateWeight();
          controller.calculateBoundaryTop();
          this.updateDom();
          this.nodes = controller.nodes;
        });
      },

      /**
       * 添加一个子节点
       * @param node
       */
      addNode(node) {
        let parentId = node.id;

        controller.addNode(parentId, {
          id: Math.ceil(Math.random()*10000000000),
          label: '新增子节点',
          showChild: true,
          showOptions: false,
          selected: false,
          position: {top: null, left: null}
        });

        this.nodes = controller.nodes;
        this.visibleNodes = controller.getVisibleUINodes();

        this.$nextTick(() => {
          controller.calculateWeight();
          controller.calculateBoundaryTop();
          this.updateDom();
          this.nodes = controller.nodes;
        });
      }
    }
  }
</script>
<style lang="scss" scoped>
  .risk-map-container {
    height: 100%;
    font-size: .9rem;
    position: relative;

    .tab-container {
      background-color: #283955 !important;
      padding: 30px 30px 30px 10px;
    }

    .btn-group {
      padding: 0 70px;
      justify-content: space-around;
      p {
        cursor: pointer;
        color: #ffffff;
        background-color: #295184;
        padding: 5px 20px;
        border-radius: 5px;
      }
    }
    .node-info .btn-group {
      margin-top: 20px;
    }
    .node-info-row1 {
      justify-content: space-between;
    }
    .node-info-row2 {
      margin-top: 20px;
      span {
        min-width: 70px;
      }
    }
    .node-info-row3 {
      margin-top: 20px;
    }
    .node-info-row4 {
      padding: 10px 80px;
      div {
        margin-top: 10px;
      }
    }
  }
</style>
<style lang="scss">
  .risk-map-container {
    .el-form-item__label {
      color: #ffffff !important;
    }
    .el-input__inner, .el-textarea__inner {
      font-size: .8rem;
      color: #ffffff;
      background-color: #295184 !important;
    }
    .commonDialogContainer .el-tabs__content {
      height: auto !important;
    }

    .node-info .node-info-row1 .el-input--mini {
      max-width: 140px !important;
    }
    .node-info-row3 .el-switch__label {
      color: #ffffff !important;
    }
    .node-info-row4 .el-checkbox__label {
      color: #ffffff !important;
      padding-right: 20px;
    }
  }
</style>
