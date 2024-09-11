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
import { BlockDescription, KindsConnections } from '@/constants/block';
import NodeDetail from '@/components/workflow/node-detail';
import { NodeData } from '@/constants/block';
import BuiltInNode from '@/components/workflow/buildin-node';
import { initialNodes, initialEdges } from '@/constants/init-data';
import { OutputDefinition, Kind, PropertyDefinition } from '@/constants/block';

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
  const [kindsConnections, setKindsConnections] = useState<KindsConnections>(
    {}
  );
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [availableKindValues, setAvailableKindValues] = useState<
    Record<string, PropertyDefinition[]>
  >({});

  useEffect(() => {
    fetch('/describe.json')
      .then((response) => response.json())
      .then((data) => {
        setAvailableNodes(data.blocks);
        setKindsConnections(data.kinds_connections);
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

  const onDeleteNode = useCallback(() => {
    if (selectedNode && selectedNode.type !== 'builtInNode') {
      setSelectedNode(null);
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
        )
      );
    }
  }, [selectedNode]);

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

  const generateFormData = (data: BlockDescription) => {
    const blockSchema = data.block_schema;
    const nodeName = data.manifest_type_identifier.split('/')[1].split('@')[0];
    const nodeCount = nodes.filter(
      (n) => n.data.formData?.type === data.manifest_type_identifier
    ).length;

    return Object.entries(blockSchema.properties || {}).reduce(
      (acc: any, [key, value]: [string, any]) => {
        if (key === 'name') {
          acc[key] = nodeCount > 0 ? `${nodeName}_${nodeCount}` : nodeName;
        } else if (key === 'type') {
          acc[key] = data.manifest_type_identifier;
        } else {
          acc[key] = blockSchema.required?.includes(key) ? null : value.default;
        }
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
          formData: generateFormData(nodeData)
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

  // Add this new function to handle key presses
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        event.key === 'Delete' &&
        selectedNode &&
        selectedNode.type !== 'builtInNode'
      ) {
        onDeleteNode();
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === 'c' &&
        selectedNode &&
        selectedNode.type !== 'builtInNode'
      ) {
        // Handle copy operation here if needed
        console.log('Copy operation prevented for non-built-in node');
      }
    },
    [selectedNode, onDeleteNode]
  );

  // Add useEffect to handle key events
  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  const updateAvailableKindValues = useCallback(() => {
    const kindValues: Record<string, PropertyDefinition[]> = {};
    nodes.forEach((node: Node) => {
      if (
        node.type === 'builtInNode' &&
        node.data.manifest_type_identifier === 'input'
      ) {
        // Handle input node
        node.data.formData.images.forEach((image: any) => {
          // TODO: kindName 后续需要更改为动态值，不能写死
          const kindName = 'image';
          if (!kindValues[kindName]) {
            kindValues[kindName] = [];
          }
          if (image.name) {
            kindValues[kindName].push({
              manifest_type_identifier: node.data.manifest_type_identifier,
              property_name: `$input.${image.name}`,
              property_description: 'Image',
              compatible_element: 'workflow_image',
              is_list_element: false,
              is_dict_element: false
            });
          }
        });
        node.data.formData.params.forEach((param: any) => {
          // TODO: kindName 后续需要更改为动态值，不能写死, 此处默认给string
          const kindName = 'string';
          if (!kindValues[kindName]) {
            kindValues[kindName] = [];
          }
          if (param.name) {
            kindValues[kindName].push({
              manifest_type_identifier: node.data.manifest_type_identifier,
              property_name: `$input.${param.name}`,
              property_description: 'Parameter',
              compatible_element: 'workflow_parameter',
              is_list_element: false,
              is_dict_element: false
            });
          }
        });
      } else if (node.data.outputs_manifest) {
        // Handle output nodes kinds
        node.data.outputs_manifest.forEach((output: OutputDefinition) => {
          // 遍历 OutputDefinition 中kind的name作为kindName，填充kindValues
          output.kind.forEach((kind: Kind) => {
            const kindName = kind.name;
            if (!kindValues[kindName]) {
              kindValues[kindName] = [];
            }
            if (node.data.formData.name) {
              kindValues[kindName].push({
                manifest_type_identifier: node.data.manifest_type_identifier,
                property_name: `$steps.${node.data.formData.name}.${output.name}`,
                property_description: 'Output',
                compatible_element: 'step_output',
                is_list_element: false,
                is_dict_element: false
              });
            }
          });
        });
      }
      setAvailableKindValues(kindValues);
    });
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
          deleteKeyCode={null} // Disable default delete behavior
          multiSelectionKeyCode={null} // Disable multi-selection
          selectionKeyCode={null} // Disable selection
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
          kindsConnections={kindsConnections}
          onDeleteNode={
            selectedNode.type !== 'builtInNode' ? onDeleteNode : undefined
          }
        />
      )}
    </div>
  );
};

export default DesignPage;
