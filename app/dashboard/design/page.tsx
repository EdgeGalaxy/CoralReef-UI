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
  const [availableNodes, setAvailableNodes] = useState<BlockDescription[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

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

  const onFormChange = useCallback(
    (formData: any) => {
      if (selectedNode) {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === selectedNode.id
              ? { ...node, data: { ...node.data, formData } }
              : node
          )
        );
      }
    },
    [selectedNode, setNodes]
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
        />
      )}
    </div>
  );
};

export default DesignPage;
