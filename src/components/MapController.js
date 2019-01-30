/**
 * Created by xy on 28/01/2019.
 */
const _ = require('lodash');

export class MapController {
  nodes = {};
  pathArr = [];

  rootId = null;

  buildFromRaw(raw) {
    this.rootId = raw.id;

    let nodes = {};

    function traverse(node, parent) {
      let children = node.children || [];

      for (let i of children) {
        traverse(i, node.id);
      }

      nodes[node.id] = {
        id: node.id,
        type: node.type || '',
        label: node.label,
        parent: parent,
        data: node.data,
        children: children.map(i => i.id),
        itemId: node.itemId,
        showChild: true,
        showOptions: false,
        selected: false,
        position: {top: null, left: null}
      }

    }

    traverse(raw, null);

    this.nodes = nodes;
  }

  updateOptionStatus(nodeId) {
    for(let id in this.nodes) {
      if (id == nodeId) {
        this.nodes[nodeId].showOptions = true;
      }
    }
  }

  updateSelected(nodeId) {
    for(let id in this.nodes) {
      if (id === nodeId) {
        this.nodes[nodeId].selected = !this.nodes[nodeId].selected;
        return this.nodes[nodeId];
      } else {
        this.nodes[id].selected = false;
      }
    }
  }

  setUnselectedForAllNodes() {
    for (let id in this.nodes) {
      this.nodes[id].showOptions = false;
    }
  }

  addNode(parent, node) {
    this.nodes = {
      ...this.nodes,
      [parent]: {
        ...this.nodes[parent],
        children: [
          ...this.nodes[parent].children,
          node.id
        ]
      },
      [node.id]: {
        ...node,
        parent: parent,
        children: []
      }
    }
  }

  removeNode(nodeId) {
    let nodes = this.nodes;

    let parentId = nodes[nodeId].parent;

    function travers(nodeId) {
      for(let i of nodes[nodeId].children) {
        travers(i);
      }

      delete nodes[nodeId];
    }

    travers(nodeId);

    nodes[parentId].children = nodes[parentId].children.filter(i => i !== nodeId)
  }

  getVisibleUINodes() {
    let nodes = this.nodes;
    let arr = [];
    function traverse(id) {
      arr.push(id);
      if(nodes[id].showChild && nodes[id].children.length > 0) {
        for(let i of nodes[id].children) {
          traverse(i);
        }
      }
    }

    traverse(this.rootId);

    return arr;
  }

  calculateWeight() {
    let nodes = this.nodes;
    if (!nodes) {
      return;
    }
    /**
     * Update weight of specific node.
     * @param id
     * @returns {number} weight of the node
     */
    function traverse(id) {
      if(nodes[id].showChild && nodes[id].children.length > 0) {
        let total = 0;
        for(let i of nodes[id].children) {
          total += traverse(i);
        }

        nodes[id].weight = total;
        return total;
      } else {
        nodes[id].weight = 1;
        return 1;
      }
    }

    traverse(this.rootId);
  }

  calculateBoundaryTop() {
    let nodes = this.nodes;
    if (!nodes) {
      return;
    }
    /**
     * Update boundary top of specific node.
     * @param id
     * @returns {void}
     */
    function traverse(id, boundaryTopOfParent, totalWeightOfBrothers) {
      let bt = boundaryTopOfParent + totalWeightOfBrothers;
      nodes[id].boundaryTop = bt;

      let allocatedWeight = 0;

      if(nodes[id].showChild) {
        for(let i of nodes[id].children) {
          traverse(i, bt, allocatedWeight);
          allocatedWeight += nodes[i].weight;
        }
      }
    }

    traverse(this.rootId, 0, 0);
  }


  calculateBoundaryLeft() {
    let nodes = this.nodes;
    let dom = this.dom;
    if (!nodes || !dom) {
      return;
    }

    /**
     * Update boundary top of specific node.
     * @param id
     * @returns {void}
     */
    function traverse(id, boundaryLeftOfParent) {
      let left = boundaryLeftOfParent;
      nodes[id].position.left = left;
      nodes[id].position.top = nodes[id].boundaryTop + (nodes[id].weight/2.0);

      if(nodes[id].showChild) {
        for(let i of nodes[id].children) {
          if (dom[id]) {
            traverse(i, left + dom[id].width + 30);
          }
        }
      }
    }

    traverse(this.rootId, 0);
  }

  calculatePathes() {
    let nodes = this.nodes;
    let dom = this.dom;
    if (!nodes || !dom) {
      return;
    }
    let pathArr = new Array();

    function traverse(nodeId) {
      if (dom[nodeId]) {
        let start = {
          left: nodes[nodeId].position.left + dom[nodeId].width,
          top: nodes[nodeId].position.top * 50 + dom[nodeId].height / 2.0
        };

        if(nodes[nodeId].showChild) {
          for(let i of nodes[nodeId].children) {
            let end = {
              left: nodes[i].position.left,
              top: nodes[i].position.top * 50 + dom[i].height / 2.0,
            };
            pathArr.push({start, end, d: `M${start.left},${start.top}C${start.left},${end.top},${start.left},${end.top},${end.left},${end.top}`});
            traverse(i);
          }
        }
      }
    }

    traverse(this.rootId);
    this.pathArr = pathArr;
  }

  setDomMeta(dom) {
    this.dom = dom;
  }

  collapse(nodeId) {
    this.nodes[nodeId].showChild = false;
  }
  expand(nodeId) {
    this.nodes[nodeId].showChild = true;
  }

  /**
   * 把前端的树结构转换成接口需要的json结构
   * @param nodes
   */
  transferNodesToTree(nodes) {
    let Root = {};
    //找到根节点
    for (let i in nodes) {
      if (nodes[i].parent == null) {
        //Root = {id: nodes[i].id, label: nodes[i].label, children: []}
        const data = nodes[i].data;
        Root = getObj(nodes[i], data);
      }
    }

    //处理其余子节点
    function traverse(parentNode, nodes) {
      for (let i in nodes) {
        if (nodes[i].parent == parentNode.id) {
          const data = nodes[i].data;
          //parentNode.children.push({id: nodes[i].id, label: nodes[i].label, children: []});
          parentNode.children.push(getObj(nodes[i], data));
          traverse(nodes[i], nodes);
        }
      }
    }

    function getObj(node, data) {
      return {
        id: node.id,
        parentVarId: data.others.parentVarId,
        remark: data.nodeInfo.nodeInstruction,
        ruleEngineId: data.others.ruleEngineId,
        ruleEngineParams: data.others.ruleEngineParams,
        ruleId: data.others.ruleId,
        valueMax: data.varInfo.maxValue,
        valueMin: data.varInfo.minValue,
        varDef: data.varInfo.varRule,
        varDesc: data.nodeInfo.nodeDesc,
        varId: data.nodeInfo.nodeName,
        varName: data.varInfo.varName,
        varType: data.varInfo.varType,
        children: []
      }
    }

    traverse(Root, nodes);
    return Root;
  }

  updateNodeData(nodeId, data) {
    this.nodes[nodeId].data = data;
  }
}
