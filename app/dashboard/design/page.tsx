'use client';

import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Connection,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSidebar } from '@/hooks/useSidebar';
import NodeSelector from '@/components/workflow/nodes-selector';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import CustomNode from '@/components/workflow/custom-node';
import { NodeData } from '@/components/workflow/nodes-selector';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const nodeTypes = {
  customNode: CustomNode
};

const DesignPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { isMinimized } = useSidebar();
  const [flowWidth, setFlowWidth] = useState('calc(100vw - 72px)');
  const [availableNodes, setAvailableNodes] = useState([
    // 这里应该从API获取完整的节点数据
    {
      additionalProperties: true,
      block_type: 'model',
      license: 'Apache-2.0',
      long_description:
        '\nRun Segment Anything 2, a zero-shot instance segmentation model, on an image.\n\n** Dedicated inference server required (GPU recomended) **\n\nYou can use pass in boxes/predictions from other models to Segment Anything 2 to use as prompts for the model.\nIf you pass in box detections from another model, the class names of the boxes will be forwarded to the predicted masks.  If using the model unprompted, the model will assign integers as class names / ids.\n',
      name: 'Segment Anything 2 Model',
      properties: {
        type: {
          const: 'roboflow_core/segment_anything@v1',
          enum: ['roboflow_core/segment_anything@v1'],
          title: 'Type',
          type: 'string'
        },
        name: {
          description: 'The unique name of this step.',
          title: 'Step Name',
          type: 'string'
        },
        images: {
          anyOf: [
            {
              kind: [
                {
                  description: 'Image in workflows',
                  docs: '\nThis is the representation of image batch in `workflows`. The value behind this kind \nis Python list of dictionaries. Each of this dictionary is native `inference` image with\nthe following keys defined:\n```python\n{\n    "type": "url",   # there are different types supported, including np arrays and PIL images\n    "value": "..."   # value depends on `type`\n}\n```\nThis format makes it possible to use [inference image utils](https://inference.roboflow.com/docs/reference/inference/core/utils/image_utils/)\nto operate on the images. \n\nSome blocks that output images may add additional fields - like "parent_id", which should\nnot be modified but may be used is specific contexts - for instance when\none needs to tag predictions with identifier of parent image.\n\n\n**Important note**:\n\nWhen you see `Batch[<A>]` in a name, it means that each group of data, called a batch, will contain elements \nof type `<A>`. This also implies that if there are multiple inputs or outputs for a batch-wise operation, \nthey will maintain the same order of elements within each batch. \n\n',
                  name: 'Batch[image]'
                }
              ],
              pattern: '^\\$inputs.[A-Za-z_0-9\\-]+$',
              reference: true,
              selected_element: 'workflow_image',
              type: 'string'
            },
            {
              kind: [
                {
                  description: 'Image in workflows',
                  docs: '\nThis is the representation of image batch in `workflows`. The value behind this kind \nis Python list of dictionaries. Each of this dictionary is native `inference` image with\nthe following keys defined:\n```python\n{\n    "type": "url",   # there are different types supported, including np arrays and PIL images\n    "value": "..."   # value depends on `type`\n}\n```\nThis format makes it possible to use [inference image utils](https://inference.roboflow.com/docs/reference/inference/core/utils/image_utils/)\nto operate on the images. \n\nSome blocks that output images may add additional fields - like "parent_id", which should\nnot be modified but may be used is specific contexts - for instance when\none needs to tag predictions with identifier of parent image.\n\n\n**Important note**:\n\nWhen you see `Batch[<A>]` in a name, it means that each group of data, called a batch, will contain elements \nof type `<A>`. This also implies that if there are multiple inputs or outputs for a batch-wise operation, \nthey will maintain the same order of elements within each batch. \n\n',
                  name: 'Batch[image]'
                }
              ],
              pattern: '^\\$steps\\.[A-Za-z_\\-0-9]+\\.[A-Za-z_*0-9\\-]+$',
              reference: true,
              selected_element: 'step_output',
              type: 'string'
            }
          ],
          description: 'The image to infer on',
          examples: ['$inputs.image', '$steps.cropping.crops'],
          title: 'Image'
        },
        boxes: {
          anyOf: [
            {
              kind: [
                {
                  description:
                    "`'predictions'` key from Object Detection Model output",
                  docs: '\nThis kind represents batch of predictions from an Object Detection Model.\n\nExample:\n```\n# Each prediction in batch is list of dictionaries that contains detected objects (detections)\n[\n    [\n        {"x": 300, "y": 400, "width": 100, "height" 50, "confidence": 0.3, "class": "car", "class_id": 0.1, "detection_id": "random-uuid"},\n        {"x": 600, "y": 900, "width": 100, "height" 50, "confidence": 0.3, "class": "car", "class_id": 0.1, "detection_id": "random-uuid"}\n    ],\n    [\n        {"x": 300, "y": 400, "width": 100, "height" 50, "confidence": 0.3, "class": "car", "class_id": 0.1, "detection_id": "random-uuid"},\n        {"x": 600, "y": 900, "width": 100, "height" 50, "confidence": 0.3, "class": "car", "class_id": 0.1, "detection_id": "random-uuid"}\n    ]\n]\n```\n\n\n**Important note**:\n\nWhen you see `Batch[<A>]` in a name, it means that each group of data, called a batch, will contain elements \nof type `<A>`. This also implies that if there are multiple inputs or outputs for a batch-wise operation, \nthey will maintain the same order of elements within each batch. \n\n',
                  name: 'Batch[object_detection_prediction]'
                },
                {
                  description:
                    "`'predictions'` key from Instance Segmentation Model outputs",
                  docs: '\nThis kind represents batch of predictions from Instance Segmentation Models.\n\nExample:\n```\n# Each prediction in batch is list of dictionaries that contains detected objects (detections) and list of points \nproviding object contour,\n[\n    [\n        {"x": 300, "y": 400, "width": 100, "height" 50, "confidence": 0.3, "class": "car", "class_id": 0.1, "detection_id": "random-uuid", "points": [{"x": 300, "y": 200}]},\n        {"x": 600, "y": 900, "width": 100, "height" 50, "confidence": 0.3, "class": "car", "class_id": 0.1, "detection_id": "random-uuid", "points": [{"x": 300, "y": 200}}\n    ],\n    [\n        {"x": 300, "y": 400, "width": 100, "height" 50, "confidence": 0.3, "class": "car", "class_id": 0.1, "detection_id": "random-uuid", "points": [{"x": 300, "y": 200}},\n        {"x": 600, "y": 900, "width": 100, "height" 50, "confidence": 0.3, "class": "car", "class_id": 0.1, "detection_id": "random-uuid", "points": [{"x": 300, "y": 200}}\n    ]\n]\n```\n\n\n**Important note**:\n\nWhen you see `Batch[<A>]` in a name, it means that each group of data, called a batch, will contain elements \nof type `<A>`. This also implies that if there are multiple inputs or outputs for a batch-wise operation, \nthey will maintain the same order of elements within each batch. \n\n',
                  name: 'Batch[instance_segmentation_prediction]'
                },
                {
                  description:
                    "`'predictions'` key from Keypoint Detection Model output",
                  docs: '\nThis kind represents batch of predictions from Keypoint Detection Models.\n\nExample:\n```\n# Each prediction in batch is list of dictionaries that contains detected objects (detections) and list of points of \nobject skeleton. \n[\n    [\n        {"x": 300, "y": 400, "width": 100, "height" 50, "confidence": 0.3, "class": "car", "class_id": 0.1, "detection_id": "random-uuid", "keypoints": [{"x": 300, "y": 200, "confidence": 0.3, "class_id": 0, "class_name": "tire_center"}]},\n        {"x": 600, "y": 900, "width": 100, "height" 50, "confidence": 0.3, "class": "car", "class_id": 0.1, "detection_id": "random-uuid", "keypoints": [{"x": 300, "y": 200, "confidence": 0.3, "class_id": 0, "class_name": "tire_center"}}\n    ],\n    [\n        {"x": 300, "y": 400, "width": 100, "height" 50, "confidence": 0.3, "class": "car", "class_id": 0.1, "detection_id": "random-uuid", "keypoints": [{"x": 300, "y": 200, "confidence": 0.3, "class_id": 0, "class_name": "tire_center"}},\n        {"x": 600, "y": 900, "width": 100, "height" 50, "confidence": 0.3, "class": "car", "class_id": 0.1, "detection_id": "random-uuid", "keypoints": [{"x": 300, "y": 200, "confidence": 0.3, "class_id": 0, "class_name": "tire_center"}}\n    ]\n]\n```\n\n\n**Important note**:\n\nWhen you see `Batch[<A>]` in a name, it means that each group of data, called a batch, will contain elements \nof type `<A>`. This also implies that if there are multiple inputs or outputs for a batch-wise operation, \nthey will maintain the same order of elements within each batch. \n\n',
                  name: 'Batch[keypoint_detection_prediction]'
                }
              ],
              pattern: '^\\$steps\\.[A-Za-z_\\-0-9]+\\.[A-Za-z_*0-9\\-]+$',
              reference: true,
              selected_element: 'step_output',
              type: 'string'
            },
            {
              type: 'null'
            }
          ],
          default: null,
          description: 'Boxes (from other model predictions) to ground SAM2',
          examples: ['$steps.object_detection_model.predictions'],
          title: 'Boxes'
        },
        version: {
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
              enum: [
                'hiera_large',
                'hiera_small',
                'hiera_tiny',
                'hiera_b_plus'
              ],
              type: 'string'
            }
          ],
          default: 'hiera_tiny',
          description:
            'Model to be used.  One of hiera_large, hiera_small, hiera_tiny, hiera_b_plus',
          examples: ['hiera_large', '$inputs.openai_model'],
          title: 'Version'
        },
        threshold: {
          anyOf: [
            {
              kind: [
                {
                  description: 'Float value',
                  docs: '\nExample:\n```\n1.3\n2.7\n```\n',
                  name: 'float'
                }
              ],
              pattern: '^\\$inputs.[A-Za-z_0-9\\-]+$',
              reference: true,
              selected_element: 'workflow_parameter',
              type: 'string'
            },
            {
              type: 'number'
            }
          ],
          default: 0,
          description: 'Threshold for predicted masks scores',
          examples: [0.3],
          title: 'Threshold'
        },
        multimask_output: {
          anyOf: [
            {
              type: 'boolean'
            },
            {
              kind: [
                {
                  description: 'Boolean flag',
                  docs: '\nThis kind represents single boolean value - `True` or `False`\n',
                  name: 'boolean'
                }
              ],
              pattern: '^\\$inputs.[A-Za-z_0-9\\-]+$',
              reference: true,
              selected_element: 'workflow_parameter',
              type: 'string'
            },
            {
              type: 'null'
            }
          ],
          default: true,
          description:
            'Flag to determine whether to use sam2 internal multimask or single mask mode. For ambiguous prompts setting to True is recomended.',
          examples: [true, '$inputs.multimask_output'],
          title: 'Multimask Output'
        }
      },
      required: ['type', 'name', 'images'],
      search_keywords: ['SAM2', 'META'],
      short_description:
        'Convert bounding boxes to polygons, or run SAM2 on an entire image to generate a mask.',
      title: 'BlockManifest',
      type: 'object',
      version: 'v1'
    }
    // ... 其他节点
  ]);

  useEffect(() => {
    setFlowWidth(isMinimized ? 'calc(100vw - 72px)' : 'calc(100vw - 288px)');
  }, [isMinimized]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const position = { x: event.clientX, y: event.clientY };

      const newNode: Node = {
        id: `${type}-${nodes.length + 1}`,
        type,
        position,
        data: { label: `${type} node` }
      };

      setNodes((nds: Node[]) => nds.concat(newNode));
    },
    [nodes, setNodes]
  );

  const onNodeSelect = useCallback(
    (nodeData: any) => {
      const newNode = {
        id: `${nodeData.type}-${nodes.length + 1}`,
        type: 'customNode',
        position: { x: 100, y: 100 },
        data: {
          ...nodeData,
          label: nodeData.name,
          formData: nodeData.required.reduce((acc: any, key: any) => {
            acc[key] = '';
            return acc;
          }, {})
        },
        // Add these properties to make the node more compact
        style: {
          width: 200,
          fontSize: '12px'
        }
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [nodes, setNodes]
  );

  return (
    <div
      style={{
        width: flowWidth,
        height: '100vh',
        transition: 'width 0.5s',
        position: 'relative'
      }}
    >
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background />
        </ReactFlow>
      </ReactFlowProvider>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="absolute right-4 top-4 z-10">
            Open Node Selector
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <NodeSelector
            nodes={availableNodes as unknown as NodeData[]}
            onNodeSelect={onNodeSelect}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DesignPage;
