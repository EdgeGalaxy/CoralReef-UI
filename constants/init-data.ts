import { Node, Edge } from 'reactflow';

export const inputNode: Node = {
  id: 'input-node',
  type: 'builtInNode',
  position: { x: 50, y: 200 },
  data: {
    human_friendly_block_name: 'Input',
    manifest_type_identifier: 'input',
    block_schema: {
      block_type: 'buildin',
      type: 'object',
      required: ['sources'],
      properties: {
        sources: {
          type: 'array',
          title: 'Sources',
          cn_title: '输入源',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' }
            },
            required: ['name']
          }
        },
        params: {
          type: 'array',
          title: 'Parameters',
          cn_title: '参数列表',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                title: '参数名称'
              },
              type: {
                type: 'string',
                enum: ['string', 'number', 'boolean', 'dict'],
                title: '参数类型',
                default: 'number'
              },
              value: {
                anyOf: [
                  {
                    type: 'string',
                    title: '字符串',
                    'x-display-if': {
                      field: 'type',
                      value: 'string'
                    }
                  },
                  {
                    type: 'number',
                    title: '数值',
                    'x-display-if': {
                      field: 'type',
                      value: 'number'
                    }
                  },
                  {
                    type: 'boolean',
                    title: '布尔值',
                    'x-display-if': {
                      field: 'type',
                      value: 'boolean'
                    }
                  },
                  {
                    type: 'object',
                    title: 'JSON对象',
                    'x-display-if': {
                      field: 'type',
                      value: 'dict'
                    }
                  }
                ]
              }
            },
            required: ['name', 'type', 'value']
          }
        }
      }
    },
    formData: {
      sources: [
        {
          name: 'image'
        }
      ],
      params: []
    },
    label: 'Input Node'
  }
};

export const outputNode: Node = {
  id: 'output-node',
  type: 'builtInNode',
  position: { x: 650, y: 200 },
  data: {
    human_friendly_block_name: 'Output',
    manifest_type_identifier: 'output',
    block_schema: {
      block_type: 'buildin',
      type: 'object',
      properties: {
        params: {
          type: 'array',
          title: 'Parameters',
          cn_title: '参数列表',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', title: 'Name', cn_title: '参数名称' },
              value: {
                title: 'Value',
                cn_title: '参数值',
                anyOf: [
                  {
                    kind: [
                      {
                        description: 'String value',
                        docs: '\nExamples:\n```\n"my string value"\n```\n',
                        name: 'string'
                      }
                    ],
                    pattern: '^\\$inputs.[A-Za-z_0-9\\-]+$',
                    reference: true,
                    selected_element: 'workflow_parameter',
                    type: 'string'
                  },
                  {
                    kind: [
                      {
                        description: 'Image in workflows',
                        docs: '\nThis is the representation of image in `workflows`. The value behind this kind \nis Python list of dictionaries. Each of this dictionary is native `inference` image with\nthe following keys defined:\n```python\n{\n    "type": "url",   # there are different types supported, including np arrays and PIL images\n    "value": "..."   # value depends on `type`\n}\n```\nThis format makes it possible to use [inference image utils](https://inference.roboflow.com/docs/reference/inference/core/utils/image_utils/)\nto operate on the images. \n\nSome blocks that output images may add additional fields - like "parent_id", which should\nnot be modified but may be used is specific contexts - for instance when\none needs to tag predictions with identifier of parent image.\n',
                        name: 'image'
                      }
                    ],
                    pattern: '^\\$inputs.[A-Za-z_0-9\\-]+$',
                    reference: true,
                    selected_element: 'any_data',
                    type: 'string'
                  },
                  {
                    kind: [
                      {
                        description: 'Image in workflows',
                        docs: '\nThis is the representation of image in `workflows`. The value behind this kind \nis Python list of dictionaries. Each of this dictionary is native `inference` image with\nthe following keys defined:\n```python\n{\n    "type": "url",   # there are different types supported, including np arrays and PIL images\n    "value": "..."   # value depends on `type`\n}\n```\nThis format makes it possible to use [inference image utils](https://inference.roboflow.com/docs/reference/inference/core/utils/image_utils/)\nto operate on the images. \n\nSome blocks that output images may add additional fields - like "parent_id", which should\nnot be modified but may be used is specific contexts - for instance when\none needs to tag predictions with identifier of parent image.\n',
                        name: 'image'
                      }
                    ],
                    pattern:
                      '^\\$steps\\.[A-Za-z_\\-0-9]+\\.[A-Za-z_*0-9\\-]+$',
                    reference: true,
                    selected_element: 'step_output',
                    type: 'string'
                  }
                ]
              }
            },
            required: ['name', 'value']
          }
        }
      }
    },
    formData: {
      params: []
    },
    label: 'Output Node'
  }
};

const mockNode: Node = {
  id: 'mock-node-1',
  type: 'mockNode',
  position: { x: 350, y: 200 },
  data: { label: 'Add a new node' }
};

export const buildInNodes: Node[] = [inputNode, outputNode];

export const initialNodes: Node[] = [inputNode, mockNode, outputNode];

export const initialEdges: Edge[] = [
  {
    id: 'e-input-mock',
    source: 'input-node',
    target: 'mock-node-1',
    type: 'custom'
  },
  {
    id: 'e-mock-output',
    source: 'mock-node-1',
    target: 'output-node',
    type: 'custom'
  }
];

// ReactFlow 默认配置
export const reactFlowDefaultConfig = {
  // 默认视口
  defaultViewport: { x: 0, y: 0, zoom: 1 },
  // 缩放配置
  minZoom: 0.1,
  maxZoom: 2,
  // 画布移动范围，允许负坐标
  translateExtent: [
    [-1000, -1000] as [number, number],
    [2000, 2000] as [number, number]
  ] as [[number, number], [number, number]],
  // 网格配置 - 关闭snapToGrid以提高性能
  snapToGrid: false,
  snapGrid: [20, 20] as [number, number],
  nodesDraggable: true
};
