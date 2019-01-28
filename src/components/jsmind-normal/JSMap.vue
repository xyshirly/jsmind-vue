<template>
  <div class="risk-map-container">
    <svg width="100%" :height="nodes[Object.keys(nodes)[0]].weight * 50 + 'px'" xmlns="http://www.w3.org/2000/svg"
         xmlns:xlink="http://www.w3.org/1999/xlink" style="overflow: hidden; position: relative;">
      <path v-for="path in pathes" fill="none" stroke="#787878" :d="path.d"
            style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"></path>
    </svg>
    <map-node v-for="nodeId in visibleNodes" :node="nodes[nodeId]"
               :key="nodeId"
               @handleFold="handleFold"
               @handleExpand="handleExpand"
               @rightClick="rightClick"
               @handleClick="handleClick"
               @clickNode="clickNode"
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
        neibors: {},
        dialog: {
          visible: false,
          currentNode: '',
          title: "节点属性",
          form: {
            label: '',
            instruction: '',
            description: ''
          },
          formInfo: {
            name: '',
            type: '',
            rule: '',
            switchValue: false,
            checked1: '',
            checked2: '',
            value1: '',
            value2: ''
          },
          others: {}
        },
      }
    },
    watch: {
      data: function(val, oldVal) {
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
      let pairs = Array.from(document.querySelectorAll('.risk-node[data-node-id]')).map(i => [i.getAttribute('data-node-id'), i.getBoundingClientRect()]);
      let v = _.fromPairs(pairs);
      controller.setDomMeta(v);

      controller.calculateBoundaryLeft();

      controller.calculatePathes();

      this.pathes = controller.pathArr;
    },
    methods: {
      refreshDom() {
        this.nodes = controller.nodes;
        this.visibleNodes = controller.getVisibleUINodes();

        this.$nextTick(() => {
          let pairs = Array.from(document.querySelectorAll('.risk-node[data-node-id]')).map(i => [i.getAttribute('data-node-id'), i.getBoundingClientRect()]);
          let v = _.fromPairs(pairs);
          controller.setDomMeta(v);

          controller.calculateBoundaryLeft();

          controller.calculatePathes();

          this.pathes = controller.pathArr;
        });
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

      clickNode(nodeId) {
        const selectedNode = controller.updateSelected(nodeId);
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
        if (node.type === 'ROOT') {
          showMessage(this, "warning", "根节点不能删除");
          return;
        }

        controller.removeNode(node.id);

        this.nodes = controller.nodes;
        this.visibleNodes = controller.getVisibleUINodes();

        this.$nextTick(() => {
          controller.calculateWeight();
          controller.calculateBoundaryTop();

          let pairs = Array.from(document.querySelectorAll('.risk-node[data-node-id]')).map(i => [i.getAttribute('data-node-id'), i.getBoundingClientRect()]);
          let v = _.fromPairs(pairs);
          controller.setDomMeta(v);

          controller.calculateBoundaryLeft();

          controller.calculatePathes();

          this.pathes = controller.pathArr;

          this.nodes = controller.nodes;
        });
        const json = controller.transferNodesToTree(this.nodes);
        //调用后台接口
        this.doSave(json);
      },

      /**
       * 添加一个子节点
       * @param currentNode
       */
      addNode(node) {
        let parentId = node.id;

        controller.addNode(parentId, {
          id: Math.ceil(Math.random()*10000000000),
          label: '新增子节点',
          showChild: true,
          showOptions: false,
          position: {top: null, left: null}
        });

        this.nodes = controller.nodes;
        this.visibleNodes = controller.getVisibleUINodes();
        //controller.transferNodesToTree(this.nodes);

        this.$nextTick(() => {
          controller.calculateWeight();
          controller.calculateBoundaryTop();

          let pairs = Array.from(document.querySelectorAll('.risk-node[data-node-id]')).map(i => [i.getAttribute('data-node-id'), i.getBoundingClientRect()]);
          let v = _.fromPairs(pairs);
          controller.setDomMeta(v);

          controller.calculateBoundaryLeft();

          controller.calculatePathes();

          this.pathes = controller.pathArr;

          this.nodes = controller.nodes;
        });
      },

      clearData() {
        this.dialog.form = {
          label: '',
            instruction: '',
            description: ''
        };
        this.dialog.formInfo = {
          name: '',
          type: '',
          rule: '',
          switchValue: false,
          checked1: '',
          checked2: '',
          value1: '',
          value2: ''
        };
        this.dialog.others = {};
      },

      /**
       * 点击事件：显示信息弹出框
       * @param node
       */
      handleClick(node) {
        if (node.label == '新增子节点') {
          this.clearData();
        }
        const data = node.data;
        this.dialog.currentNode = node;
        if (data) {
          this.dialog.form = {
            label: data.nodeInfo.nodeName,
            instruction: data.nodeInfo.nodeInstruction,
            description: data.nodeInfo.nodeDesc
          };
          this.dialog.formInfo = {
            name: data.varInfo.varName,
            type: data.varInfo.varType,
            rule: data.varInfo.varRule,
            switchValue: false,
            checked1: '',
            checked2: '',
            value1: data.varInfo.minValue,
            value2: data.varInfo.maxValue
          };
          this.dialog.others = data.others;
        } else {
          this.dialog.form.label = node.label;
          this.dialog.others.parentVarId = this.nodes[node.parent].label; //父节点名称
        }
        this.dialog.visible = true;
      },

      /**
       * 弹出框：取消
       */
      handleCancel() {
        this.dialog.visible = false;
      },

      /**
       * 弹出框：确定
       * 操作步骤：
       * 1.更新一个节点的信息
       * 2.把整个树的节点信息传回后台
       */
      handleConfirm() {
        this.dialog.visible = false;
        const node = this.dialog.currentNode;
        //更新节点的信息
        const nodeData = {
          nodeInfo: {
            nodeName: this.dialog.form.label,         //节点名称
            nodeInstruction: this.dialog.form.instruction, //节点说明
            nodeDesc: this.dialog.form.description        //计算公式描述
          },
          varInfo: {
            varName: this.dialog.formInfo.name,  //变量名称
            varType: this.dialog.formInfo.type,  //变量类型
            varRule: this.dialog.formInfo.rule,   //变量公式
            minValue: this.dialog.formInfo.checked1 ? this.dialog.formInfo.value1 : '',//最小值
            maxValue: this.dialog.formInfo.checked2 ? this.dialog.formInfo.value2 : '' //最大值
          },
          others: {
            parentVarId: this.dialog.others.parentVarId,            //父节点id
            ruleEngineId: this.dialog.others.ruleEngineId,          //规则引擎id
            ruleEngineParams: this.dialog.others.ruleEngineParams,  //规则引擎参数
            ruleId: this.dialog.others.ruleId,                      //规则id
          }
        };
        //更新节点信息
        controller.updateNodeData(node.id, nodeData);
        //把所有节点转换成接口需要的树形结构
        const json = controller.transferNodesToTree(this.nodes);
        //调用后台接口
        this.doSave(json);
      },

      doSave(treeJson) {
        const $this = this;
        const data = {
          treeJson: JSON.stringify(treeJson)
        };
        saveTree(data).then(res => {
          if (res.meta.code == 200) {
            showMessage($this, "success", "保存成功");
            //更新页面的显示
            $this.$emit('updateDom');
          } else {
            showMessage($this, "error", res.meta.msg);
          }
        })
      },

      /**
       * 变量信息弹出框：确定
       * 说明：把整个树的节点信息传回后台
       */
      handleConfirmForInfo() {
        this.dialog.visible = false;
      },

      handleChange1() {
        this.dialog.formInfo.checked2 = false;
        this.dialog.formInfo.value2 = '';
      },

      handleChange2() {
        this.dialog.formInfo.checked1 = false;
        this.dialog.formInfo.value1 = '';
      }

    }
  }
</script>
<style lang="scss" scoped>
  .risk-map-container {
    height: 100%;
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
      font-family: "楷体", "Kaiti SC", "STKaiti" !important;;
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
