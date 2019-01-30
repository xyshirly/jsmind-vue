<template>
  <div class="risk-node"
       :data-node-id="node.id"
       :style="{top: `${node.position.top * 50}px`, left: `${node.position.left}px`}"
       @contextmenu.stop.prevent="rightClick">
    <div class="risk-node-label">
      <span @click.stop.prevent="selectNode(node)">
        <span v-if="!isEdit" :class="{'node-active': node.selected}" @dblclick.stop.prevent="dbClickLabel">{{node.label}}</span>
        <input v-if="isEdit" type="text" v-model="node.label" @keyup.enter="saveNodeInfo"/>
        <i v-if="node.showChild && node.children.length > 0"  @click.stop.prevent="handleFold(node)"  class="el-icon-remove-outline"></i>
        <i v-if="!node.showChild && node.children.length > 0" @click.stop.prevent="handleExpand(node)" class="el-icon-circle-plus-outline"></i>
      </span>
    </div>

    <div v-if="node.showOptions" class="risk-node-options" :class="{'risk-node-options-position': node.type !== 'ROOT'}">
      <p v-if="node.type !== 'ROOT'" @click.stop.prevent="removeNode(node)">删除节点</p>
      <p @click.stop.prevent="addNode(node)">新增子节点</p>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'MapNode',
    props: ['node'],
    data() {
      return {
        showOptions: false,
        isEdit: false,
      }
    },
    created(){
    },
    methods: {
      dbClickLabel() {
        this.isEdit = true;
      },
      saveNodeInfo() {
        this.isEdit = false;
        this.$emit('saveNodeInfo');
      },
      handleFold(node) {
        this.$emit('handleFold', node);
      },

      handleExpand(node) {
        this.$emit('handleExpand', node);
      },

      rightClick() {
        this.$emit('rightClick', this.node.id);
      },

      selectNode(node) {
        this.$emit('selectNode', node.id);
      },

      removeNode(node) {
        this.$confirm('确定删除此节点?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$emit('removeNode', node);
          this.showOptions = false;
        }).catch(() => {
          //do nothing
        })
      },

      addNode(node) {
        this.$emit('addNode', node);

        setTimeout(_ => {
          this.showOptions = false;
        }, 300)
      }
    }
  }
</script>
<style lang="scss" scoped>
  .risk-node {
    position: absolute;

    .node-active {
      color: #d78c16;
    }

    .risk-node-label {
      color: #ffffff;
      display: flex;
      flex-direction: row;
      align-items: center;
      border-radius: 5px;
      background-color: #24569b;
      padding: 5px !important;

      i {
        padding-left: 20px;
        cursor: pointer;
      }
      span {
        cursor: pointer;
      }
    }

    .risk-node-options {
      font-size: .8rem;
      min-width: 80px;
      bottom: -100px;
      right: -50px;
      z-index: 100;
      cursor: pointer;
      border-radius: 5px;
      position: absolute;
      color: #ffffff;
      background-color: #24569b;

      p {
        padding: 5px 10px;
      }
      p:hover {
        color: #d78c16;
      }
    }
    .risk-node-options-position {
      bottom: -102px !important;
    }
    .risk-node-options:before {
      top: -7px;
      left: 9px;
      content: '';
      position: absolute;
      display: inline-block;
      border-right: 7px solid transparent;
      border-bottom: 7px solid #ccc;
      border-left: 7px solid transparent;
      border-bottom-color: #24569b;
    }
  }
</style>
