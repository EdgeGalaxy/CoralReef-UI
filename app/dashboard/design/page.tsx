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
import { BlockDescription } from '@/constants/block';
import NodeDetail, { NodeData } from '@/components/workflow/node-detail';
import BuiltInNode from '@/components/workflow/buildin-node';

const initialNodes: Node[] = [
  {
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
              required: ['name']
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
  },
  {
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
  }
];

const initialEdges: Edge[] = [];

const nodeTypes = {
  customNode: CustomNode,
  builtInNode: BuiltInNode
};

const DesignPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { isMinimized } = useSidebar();
  const [flowWidth, setFlowWidth] = useState('calc(100vw - 72px)');
  const [availableNodes, setAvailableNodes] = useState<BlockDescription[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [availableKindValues, setAvailableKindValues] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    fetch('/describe.json')
      .then((response) => response.json())
      .then((data) => {
        setAvailableNodes(data.blocks);
      })
      .catch((error) => console.error('Error loading blocks:', error));
  }, []);

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

  const generateFormData = (blockSchema: any) => {
    return Object.entries(blockSchema.properties || {}).reduce(
      (acc: any, [key, value]: [string, any]) => {
        acc[key] = blockSchema.required?.includes(key) ? null : value.default;
        return acc;
      },
      {}
    );
  };

  const onNodeSelect = useCallback(
    (nodeData: BlockDescription) => {
      const newNode = {
        id: `${nodeData.manifest_type_identifier}-${nodes.length + 1}`,
        type: 'customNode',
        position: { x: 100, y: 100 },
        data: {
          ...nodeData,
          label: nodeData.human_friendly_block_name,
          formData: generateFormData(nodeData.block_schema)
        } as NodeData,
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

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const updateAvailableKindValues = useCallback(() => {
    const kindValues: Record<string, string[]> = {};
    nodes.forEach((node) => {
      if (
        node.type === 'builtInNode' &&
        node.data.manifest_type_identifier === 'input'
      ) {
        // Handle input node
        node.data.formData.images.forEach((image: any) => {
          const kind = 'Batch[image]';
          if (!kindValues[kind]) {
            kindValues[kind] = [];
          }
          kindValues[kind].push(`$input.${image.name}`);
        });
        node.data.formData.params.forEach((param: any) => {
          const kind = 'input';
          if (!kindValues[kind]) {
            kindValues[kind] = [];
          }
          kindValues[kind].push(`$input.${param.name}`);
        });
      } else if (
        node.data &&
        node.data.block_schema &&
        node.data.block_schema.properties
      ) {
        // Handle other nodes
        Object.entries(node.data.block_schema.properties).forEach(
          ([key, value]: [string, any]) => {
            if (value.anyOf) {
              value.anyOf.forEach((option: any) => {
                if (option.kind && Array.isArray(option.kind)) {
                  option.kind.forEach((kindObj: any) => {
                    const kindName = kindObj.name;
                    if (!kindValues[kindName]) {
                      kindValues[kindName] = [];
                    }
                    if (node.data.formData && node.data.formData[key]) {
                      // Add pattern matching check
                      if (option.pattern) {
                        const regex = new RegExp(option.pattern);
                        if (regex.test(node.data.formData[key])) {
                          kindValues[kindName].push(node.data.formData[key]);
                        }
                      }
                    }
                  });
                }
              });
            }
          }
        );
      }
    });
    setAvailableKindValues(kindValues);
  }, [nodes]);

  useEffect(() => {
    updateAvailableKindValues();
  }, [nodes, updateAvailableKindValues]);

  const onFormChange = useCallback(
    (formData: any) => {
      if (selectedNode) {
        if (
          selectedNode.type === 'builtInNode' &&
          selectedNode.data.manifest_type_identifier === 'input'
        ) {
          // Handle Input built-in node
          const updatedImages = formData.images.map((image: any) => ({
            name: image.name,
            selected_element: 'workflow_image',
            kind: `$input.${image.name}`
          }));

          const updatedParams = formData.params.map((param: any) => ({
            name: param.name,
            value: param.value,
            selected_element: 'workflow_parameter',
            kind: `$input.${param.name}`
          }));

          setNodes((nds) =>
            nds.map((node) =>
              node.id === selectedNode.id
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      formData: {
                        images: updatedImages,
                        params: updatedParams
                      }
                    }
                  }
                : node
            )
          );
        } else {
          // Handle other nodes
          setNodes((nds) =>
            nds.map((node) =>
              node.id === selectedNode.id
                ? { ...node, data: { ...node.data, formData } }
                : node
            )
          );
        }
        updateAvailableKindValues();
      }
    },
    [selectedNode, setNodes, updateAvailableKindValues]
  );

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (node.type === 'builtInNode') {
        // Prevent built-in nodes from being moved outside the visible area
        const newNodes = nodes.map((n) => {
          if (n.id === node.id) {
            return {
              ...n,
              position: {
                x: Math.max(0, Math.min(n.position.x, window.innerWidth - 250)),
                y: Math.max(0, Math.min(n.position.y, window.innerHeight - 100))
              }
            };
          }
          return n;
        });
        setNodes(newNodes);
      }
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
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
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
            nodes={availableNodes as unknown as BlockDescription[]}
            onNodeSelect={onNodeSelect}
          />
        </SheetContent>
      </Sheet>
      {selectedNode && (
        <NodeDetail
          isOpen={!!selectedNode}
          onClose={() => setSelectedNode(null)}
          nodeData={selectedNode.data}
          onFormChange={onFormChange}
          availableKindValues={availableKindValues}
        />
      )}
    </div>
  );
};

export default DesignPage;
