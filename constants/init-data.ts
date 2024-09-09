import { Node, Edge } from 'reactflow';

export const inputNode: Node = {
  id: 'input-node',
  type: 'builtInNode',
  position: { x: 50, y: 50 },
  data: {
    human_friendly_block_name: 'Input',
    manifest_type_identifier: 'input',
    block_schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
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
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              value: { type: 'string' }
            },
            required: ['name', 'value']
          }
        }
      }
    },
    formData: {
      images: [],
      params: []
    },
    label: 'Input Node'
  }
};

export const outputNode: Node = {
  id: 'output-node',
  type: 'builtInNode',
  position: { x: 300, y: 50 },
  data: {
    human_friendly_block_name: 'Output',
    manifest_type_identifier: 'output',
    block_schema: {
      type: 'object',
      properties: {
        params: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              type: { type: 'string', enum: ['image', 'string'] },
              value: { type: 'string' }
            },
            required: ['name', 'type']
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

export const buildInNodes: Node[] = [inputNode, outputNode];

export const initialNodes: Node[] = [inputNode, outputNode];

export const initialEdges: Edge[] = [];
