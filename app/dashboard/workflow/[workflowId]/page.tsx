'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Icons } from '@/components/icons';

import 'reactflow/dist/style.css';

import { useSidebar } from '@/components/hooks/useSidebar';
import NodeSelector from '@/components/workflow/nodes-selector';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import CustomNode from '@/components/workflow/custom-node';
import { BlockDescription, KindsConnections } from '@/constants/block';
import NodeDetail from '@/components/workflow/node-detail';
import { useSession } from 'next-auth/react';
import { NodeData } from '@/constants/block';
import BuiltInNode from '@/components/workflow/buildin-node';
import {
  initialNodes,
  initialEdges,
  inputNode,
  outputNode,
  reactFlowDefaultConfig
} from '@/constants/init-data';
import { OutputDefinition, Kind, PropertyDefinition } from '@/constants/block';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { toast } from '@/components/ui/use-toast';
import { WorkflowCreate, WorkflowResponse } from '@/constants/workflow';
import { useAuthSWR, useAuthApi } from '@/components/hooks/useAuthReq';
import { handleApiRequest } from '@/lib/error-handle';

const nodeTypes = {
  customNode: CustomNode,
  builtInNode: BuiltInNode
};

const breadcrumbItems = [
  { title: '工作流', link: '/dashboard/workflow' },
  { title: '编辑', link: `/dashboard/workflow/edit` }
];

const formSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  description: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const DesignPage = () => {
  const params = useParams();
  const workflowId = params?.workflowId as string;
  const isNewWorkflow = workflowId === 'new';
  const session = useSession();
  const api = useAuthApi();
  const workspaceId =
    (params?.workspaceId as string) || session.data?.user.select_workspace_id;

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { isMinimized, toggle: toggleSidebar } = useSidebar();
  const [flowWidth, setFlowWidth] = useState('calc(100vw - 288px)');
  const [availableNodes, setAvailableNodes] = useState<BlockDescription[]>([]);
  const [kindsConnections, setKindsConnections] = useState<KindsConnections>(
    {}
  );
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [availableKindValues, setAvailableKindValues] = useState<
    Record<string, PropertyDefinition[]>
  >({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [workflowFormData, setWorkflowFormData] = useState({
    name: '',
    description: ''
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  });

  useEffect(() => {
    setFlowWidth(isMinimized ? 'calc(100vw - 72px)' : 'calc(100vw - 288px)');
  }, [isMinimized]);

  useEffect(() => {
    if (isMinimized) {
      toggleSidebar();
    }
  }, [isMinimized, toggleSidebar]);

  const { data: workflowData } = useAuthSWR<WorkflowResponse>(
    !isNewWorkflow
      ? `/api/reef/workspaces/${workspaceId}/workflows/${workflowId}`
      : ''
  );

  useEffect(() => {
    if (isNewWorkflow) {
      setNodes(initialNodes);
      setEdges(initialEdges);
    } else if (workflowData) {
      setNodes(workflowData.data.nodes);
      setEdges(workflowData.data.edges);
    }
  }, [workflowId, workflowData, isNewWorkflow]);

  useEffect(() => {
    fetch('/describe.json')
      .then((response) => response.json())
      .then((data) => {
        setAvailableNodes(data.blocks);
        setKindsConnections(data.kinds_connections);
      })
      .catch((error) => console.error('Error loading blocks:', error));
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find((node) => node.id === params.source);
      const targetNode = nodes.find((node) => node.id === params.target);

      if (sourceNode && targetNode) {
        const sourceManifest = sourceNode.data.manifest_type_identifier;
        const sourceNodeName = sourceNode.data.formData.name;
        const targetManifest = targetNode.data.manifest_type_identifier;

        const imageConnections = kindsConnections['image'] || [];
        const avaliableImageNodes = availableKindValues['image'] || [];
        let connectNode: PropertyDefinition | undefined = undefined;
        let propertyName: string | undefined = undefined;

        // 判断两个节点是否可连接，且连接时应该更新那个图片字段
        if (sourceManifest === inputNode.data.manifest_type_identifier) {
          connectNode = imageConnections.find(
            (conn) =>
              conn.manifest_type_identifier === targetManifest &&
              conn.compatible_element === 'any_data'
          );
          propertyName = avaliableImageNodes.find(
            (node) =>
              node.manifest_type_identifier === sourceManifest &&
              node.compatible_element === 'any_data'
          )?.property_name;
        } else if (
          targetManifest === outputNode.data.manifest_type_identifier
        ) {
          connectNode =
            sourceManifest !== inputNode.data.manifest_type_identifier
              ? targetManifest
              : undefined;
        } else {
          const canConnect =
            imageConnections.some(
              (conn) =>
                conn.manifest_type_identifier === sourceManifest &&
                conn.compatible_element === 'step_output'
            ) &&
            imageConnections.some(
              (conn) =>
                conn.manifest_type_identifier === targetManifest &&
                conn.compatible_element === 'step_output'
            );
          connectNode = canConnect
            ? imageConnections.find(
                (conn) =>
                  conn.manifest_type_identifier === sourceManifest &&
                  conn.compatible_element === 'step_output'
              )
            : undefined;
          propertyName = avaliableImageNodes.find(
            (node) =>
              node.manifest_type_identifier === sourceManifest &&
              node.compatible_element === 'step_output' &&
              node.property_name.includes(`$steps.${sourceNodeName}.`)
          )?.property_name;
        }

        // Check if both nodes are in the 'image' key of kindsConnections
        if (connectNode) {
          setEdges((eds: Edge[]) => addEdge(params, eds));
          if (propertyName) {
            setNodes((nds: Node[]) =>
              nds.map((node) =>
                node.id === targetNode.id
                  ? {
                      ...node,
                      data: {
                        ...node.data,
                        formData: {
                          ...node.data.formData,
                          [connectNode.property_name]: propertyName
                        }
                      }
                    }
                  : node
              )
            );
          }
        } else {
          console.log('Connection not allowed: Incompatible node types');
          // Optionally, you can show a notification to the user here
        }
      }
    },
    [setEdges, nodes, kindsConnections]
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
    let nodeName = data.manifest_type_identifier.split('/')[1].split('@')[0];
    // nodeName 过长时则split('_') 取后面的1到2个元素拼接
    if (nodeName.split('_').length > 1) {
      nodeName = nodeName.split('_').slice(-2).join('_');
    }
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

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    [setNodes]
  );

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

  const addKindValue = (
    kindValues: Record<string, PropertyDefinition[]>,
    kindName: string,
    item: any,
    node: Node,
    config: {
      prefix: string;
      description: string;
      element: string;
    }
  ) => {
    if (!kindValues[kindName]) {
      kindValues[kindName] = [];
    }

    // 处理不同类型的项目
    const itemName = item.name || (item.id ? item.id : undefined);

    if (itemName) {
      kindValues[kindName].push({
        manifest_type_identifier: node.data.manifest_type_identifier,
        property_name: `${config.prefix}${itemName}`,
        property_description: config.description,
        compatible_element: config.element,
        is_list_element: false,
        is_dict_element: false
      });
    }
  };

  const updateAvailableKindValues = useCallback(() => {
    const kindValues: Record<string, PropertyDefinition[]> = {};
    nodes.forEach((node: Node) => {
      if (
        node.type === 'builtInNode' &&
        node.data.manifest_type_identifier === 'input'
      ) {
        // Handle input node
        node.data.formData.sources.forEach((image: any) => {
          addKindValue(kindValues, 'image', image, node, {
            prefix: '$inputs.',
            description: 'Image',
            element: 'any_data'
          });
        });
        node.data.formData.params.forEach((param: any) => {
          // 根据参数类型添加对应的 kind
          const kindName = param.type || 'string'; // 默认为 string 类型
          addKindValue(kindValues, kindName, param, node, {
            prefix: '$inputs.',
            description: 'Parameter',
            element: 'any_data'
          });
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
              addKindValue(kindValues, kindName, output, node, {
                prefix: `$steps.${node.data.formData.name}.`,
                description: 'Output',
                element: 'step_output'
              });
            }
          });
        });
      }
      console.log('avaliableKinds', kindValues);
      setAvailableKindValues(kindValues);
    });
  }, [nodes]);

  useEffect(() => {
    updateAvailableKindValues();
  }, [nodes, updateAvailableKindValues]);

  const onFormChange = useCallback(
    (formData: any) => {
      let _formData: any = {};
      if (selectedNode) {
        if (
          selectedNode.type === 'builtInNode' &&
          selectedNode.data.manifest_type_identifier === 'input'
        ) {
          // Handle Input built-in node
          const updatedImages = formData.sources.map((image: any) => ({
            name: image.name,
            selected_element: 'any_data',
            kind: `$inputs.${image.name}`
          }));

          const updatedParams = formData.params.map((param: any) => ({
            name: param.name,
            value: param.value,
            type: param.type,
            selected_element: 'any_data',
            kind: `$inputs.${param.name}`
          }));

          _formData = {
            sources: updatedImages,
            params: updatedParams
          };
        } else if (
          selectedNode.type === 'builtInNode' &&
          selectedNode.data.manifest_type_identifier === 'output'
        ) {
          // Handle Output built-in node
          const updatedParams = formData.params.map((param: any) => ({
            name: param.name,
            selector: param.value,
            value: param.value
          }));

          _formData = {
            params: updatedParams
          };
        } else {
          // Handle other nodes
          _formData = formData;
        }

        setNodes((nds) =>
          nds.map((node) =>
            node.id === selectedNode.id
              ? { ...node, data: { ...node.data, formData: _formData } }
              : node
          )
        );
        updateAvailableKindValues();
      }
    },
    [selectedNode, setNodes, updateAvailableKindValues]
  );

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (node.type === 'builtInNode') {
        // 允许内置节点在更大范围内移动，包括负坐标区域，但有合理限制
        const newNodes = nodes.map((n) => {
          if (n.id === node.id) {
            return {
              ...n,
              position: {
                x: Math.max(
                  -500,
                  Math.min(n.position.x, window.innerWidth - 250)
                ),
                y: Math.max(
                  -500,
                  Math.min(n.position.y, window.innerHeight - 100)
                )
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

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (isNewWorkflow) {
      setIsEditModalOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      await handleApiRequest(
        () =>
          api.put(
            `api/reef/workspaces/${workspaceId}/workflows/${workflowId}`,
            {
              json: { data: { nodes: nodes, edges: edges } }
            }
          ),
        {
          toast,
          successTitle: '工作流更新成功',
          errorTitle: '工作流更新失败'
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      await handleApiRequest(
        () => {
          const workflowData: WorkflowCreate = {
            name: values.name,
            description: values.description || '',
            data: {
              nodes: nodes,
              edges: edges
            }
          };

          return api.post(`api/reef/workspaces/${workspaceId}/workflows`, {
            json: workflowData
          });
        },
        {
          toast,
          successTitle: '工作流保存成功',
          errorTitle: '工作流保存失败',
          onSuccess: () => {
            window.location.href = `/dashboard/workflow`;
          }
        }
      );
    } finally {
      setIsLoading(false);
      setIsEditModalOpen(false);
    }
  };

  // 监听全局workflow:update_input_models事件，用于更新input节点的models字段
  useEffect(() => {
    // 创建全局更新节点数据的方法
    window.updateWorkflowNode = (nodeId: string, nodeData: any) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: nodeData } : node
        )
      );
    };

    // 监听全局事件
    const handleUpdateInputModels = (event: CustomEvent) => {
      const { nodeId, models } = event.detail;
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  formData: {
                    ...node.data.formData,
                    models
                  }
                }
              }
            : node
        )
      );
      console.log('已通过全局事件更新input节点的models字段', models);
    };

    window.addEventListener(
      'workflow:update_input_models',
      handleUpdateInputModels as EventListener
    );

    // 清理函数
    return () => {
      delete window.updateWorkflowNode;
      window.removeEventListener(
        'workflow:update_input_models',
        handleUpdateInputModels as EventListener
      );
    };
  }, [setNodes]);

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Breadcrumbs items={breadcrumbItems} />
          <Button
            onClick={handleSave}
            disabled={isLoading}
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Icons.spinner className="h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Icons.save className="h-4 w-4" />
                保存工作流
              </>
            )}
          </Button>
        </div>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent
            className="sm:max-w-[425px]"
            onPointerDownOutside={(e) => {
              e.preventDefault();
            }}
            onEscapeKeyDown={(e) => {
              e.preventDefault();
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">
                创建新工作流
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-200">
                        工作流名称
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="输入工作流名称"
                          className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-200">
                        描述
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="输入描述信息"
                          className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    {isLoading ? '保存中...' : '保存工作流'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <div
          style={{
            width: flowWidth,
            height: 'calc(100vh - 80px)',
            transition: 'width 0.5s',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <ReactFlowProvider>
            <div
              className="react-flow-wrapper dark:border-sidebar-border"
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow:
                  '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                padding: '4px'
              }}
            >
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
                multiSelectionKeyCode={null} // Disable multi-selection
                selectionKeyCode={null} // Disable selection
                translateExtent={reactFlowDefaultConfig.translateExtent}
                minZoom={reactFlowDefaultConfig.minZoom}
                maxZoom={reactFlowDefaultConfig.maxZoom}
                snapToGrid={reactFlowDefaultConfig.snapToGrid}
                snapGrid={reactFlowDefaultConfig.snapGrid}
                defaultViewport={reactFlowDefaultConfig.defaultViewport}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                preventScrolling={true}
                attributionPosition="bottom-left"
              >
                <Controls
                  position="bottom-left"
                  style={{ bottom: 10, left: 10 }}
                />
                <MiniMap
                  position="bottom-right"
                  style={{ bottom: 10, right: 10 }}
                  zoomable
                  pannable
                />
                <Background
                  color="#aaa"
                  gap={16}
                  size={1}
                  className="dark:!bg-sidebar"
                />
              </ReactFlow>
            </div>
          </ReactFlowProvider>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="default"
                className="absolute right-6 top-6 z-10 flex items-center gap-2"
                size="sm"
              >
                <Icons.grid className="h-4 w-4" />
                节点选择器
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
              onClose={() => {
                setSelectedNode(null);
              }}
              nodeData={selectedNode.data}
              onFormChange={onFormChange}
              availableKindValues={availableKindValues}
              kindsConnections={kindsConnections}
              onDeleteNode={
                selectedNode.type !== 'builtInNode' ? onDeleteNode : () => {}
              }
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default DesignPage;
