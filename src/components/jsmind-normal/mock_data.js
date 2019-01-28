export const TREE_DATA = {
  id: '1',
  label: '风险评估导则',
  showChild: true,
  type: 'ROOT',
  position: {
    left: null,
    top: null
  },
  children: [
    {
      id: '11',
      label: '资产评价',
      showChild: true,
      position: {
        left: '200',
        top: '160'
      },
      children: []
    },
    {
      id: '12',
      label: '资产损失程度',
      showChild: true,
      position: {
        left: '200',
        top: '240'
      },
      children: [
        {
          id: '121',
          label: '成本要素损失程度',
          showChild: true,
          position: {
            left: '',
            top: ''
          },
          children: [
            {
              id: '1211',
              label: '一般设备损坏事故要素损失该概率',
              showChild: true,
              position: {
                left: '',
                top: ''
              },
              children: []
            },
            {
              id: '1212',
              label: '一般设备损坏事故要素损失值',
              showChild: true,
              position: {
                left: '',
                top: ''
              },
              children: []
            }
          ]
        },
        {
          id: '122',
          label: '成本要素权重',
          showChild: true,
          position: {
            left: '',
            top: ''
          },
          children: []
        },
        {
          id: '123',
          label: '环境要素损失程度',
          showChild: true,
          position: {
            left: '',
            top: ''
          },
          children: []
        },
        {
          id: '124',
          label: '环境要素权重',
          showChild: true,
          position: {
            left: '',
            top: ''
          },
          children: []
        },
        {
          id: '125',
          label: '安全要素损失程度',
          showChild: true,
          position: {
            left: '',
            top: ''
          },
          children: []
        },
        {
          id: '126',
          label: '安全要素权重',
          showChild: true,
          position: {
            left: '',
            top: ''
          },
          children: []
        },

      ]
    },
    {
      id: '13',
      label: '设备评价故障概率',
      showChild: true,
      position: {
        left: '200',
        top: '320'
      },
      children: []
    },
  ]
};

/*let TREE_DATA = {
  id: '1',
  label: '风险评估导则',
  showChild: true,
  type: 'ROOT',
  position: {
    left: null,
    top: null
  },
  children: []
};

export function setTreeData(data) {
  TREE_DATA = data;
}

export function getTreeData() {
  return TREE_DATA;
}*/
