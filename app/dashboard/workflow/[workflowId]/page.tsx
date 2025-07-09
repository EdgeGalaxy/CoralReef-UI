'use client';

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo
} from 'react';
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
  Edge,
  ReactFlowInstance,
  XYPosition
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
import ConnectNodePanel from '@/components/workflow/connect-node-panel';
import CustomEdge from '@/components/workflow/custom-edge';
import MockNode from '@/components/workflow/mock-node';

interface HandleBound {
  id: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  position: string;
}

interface NodeWithBounds extends Node {
  handleBounds?: {
    source?: HandleBound[];
    target?: HandleBound[];
  };
}

const nodeTypes = {
  customNode: CustomNode,
  builtInNode: BuiltInNode,
  mockNode: MockNode
};

const edgeTypes = {
  custom: CustomEdge
};

const defaultEdgeOptions = {
  type: 'custom',
  style: {
    strokeWidth: 2
  }
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

  const rfWrapperRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { isMinimized, toggle: toggleSidebar } = useSidebar();
  const [availableNodes, setAvailableNodes] = useState<BlockDescription[]>([]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [kindsConnections, setKindsConnections] = useState<KindsConnections>(
    {}
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [availableKindValues, setAvailableKindValues] = useState<
    Record<string, PropertyDefinition[]>
  >({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [workflowFormData, setWorkflowFormData] = useState({
    name: '',
    description: ''
  });
  const [connectMenu, setConnectMenu] = useState<{
    position: XYPosition;
    sourceNodeId: string;
    sourceHandleId: string | null;
    connectableManifests: string[];
  } | null>(null);
  const [dragState, setDragState] = useState<{
    startNodePos: XYPosition;
    startPanelPos: XYPosition;
  } | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // 为边线添加选中状态
  const edgesWithSelection = edges.map((edge) => ({
    ...edge,
    selected: edge.id === selectedEdgeId
  }));

  // 添加一个计算属性来获取当前选中的节点
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find((node) => node.id === selectedNodeId) || null;
  }, [selectedNodeId, nodes]);

  const getConnectableNodeManifests = useCallback(
    (node: Node): string[] => {
      if (!node?.data || !kindsConnections) {
        return [];
      }

      const connectableManifests = new Set<string>();
      const outputKindNames = new Set<string>();

      if (node.data.outputs_manifest) {
        node.data.outputs_manifest.forEach((output: OutputDefinition) => {
          output.kind.forEach((k: Kind) => {
            outputKindNames.add(k.name);
          });
        });
      } else if (node.data.manifest_type_identifier === 'input') {
        // Special handling for input node as it doesn't have outputs_manifest
        // It provides 'image' and other parameter types as outputs.
        if (node.data.formData?.sources) {
          outputKindNames.add('image');
        }
        if (node.data.formData?.params) {
          node.data.formData.params.forEach((param: any) => {
            if (param.type) {
              outputKindNames.add(param.type);
            }
          });
        }
      }

      outputKindNames.forEach((kindName) => {
        if (kindsConnections[kindName]) {
          kindsConnections[kindName].forEach((connection) => {
            connectableManifests.add(connection.manifest_type_identifier);
          });
        }
      });

      // Any node can connect to the output node
      connectableManifests.add(outputNode.data.manifest_type_identifier);

      return Array.from(connectableManifests);
    },
    [kindsConnections]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  });

  useEffect(() => {
    if (isMinimized) {
      toggleSidebar();
    }
  }, [isMinimized, toggleSidebar]);

  // 确保页面初始化时不选中任何节点
  useEffect(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  const { data: workflowData } = useAuthSWR<WorkflowResponse>(
    !isNewWorkflow
      ? `/api/reef/workspaces/${workspaceId}/workflows/${workflowId}`
      : ''
  );

  useEffect(() => {
    if (isNewWorkflow) {
      // 确保初始节点没有选中状态
      const nodesWithoutSelection = initialNodes.map((node) => ({
        ...node,
        selected: false
      }));
      setNodes(nodesWithoutSelection);
      setEdges(initialEdges);
    } else if (workflowData) {
      // 确保加载的节点没有选中状态
      const nodesWithoutSelection = workflowData.data.nodes.map(
        (node: Node) => ({
          ...node,
          selected: false
        })
      );
      setNodes(nodesWithoutSelection);
      setEdges(workflowData.data.edges);
    }
    // 确保页面加载时不选中任何节点
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [isNewWorkflow, workflowData, setNodes, setEdges]);

  const { data: blocksData } = useAuthSWR<{
    blocks: BlockDescription[];
    kinds_connections: KindsConnections;
  }>('/api/reef/workflows/blocks/describe/all');

  useEffect(() => {
    if (blocksData) {
      setAvailableNodes(blocksData.blocks);
      setKindsConnections(blocksData.kinds_connections);
    }
  }, [blocksData]);

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find((node) => node.id === params.source);
      const targetNode = nodes.find((node) => node.id === params.target);

      if (!sourceNode || !targetNode) return;

      const connectableManifests = getConnectableNodeManifests(sourceNode);
      const targetManifest = targetNode.data.manifest_type_identifier;

      if (!connectableManifests.includes(targetManifest)) {
        toast({
          title: '连接错误',
          description: '两个节点不可相连',
          variant: 'destructive'
        });
        return;
      }

      // Connection is allowed.
      setEdges((eds) => addEdge(params, eds));

      // Do not update formData for the output node
      if (targetManifest === outputNode.data.manifest_type_identifier) {
        return;
      }

      // Update formData of targetNode
      const sourceManifest = sourceNode.data.manifest_type_identifier;
      const sourceNodeName = sourceNode.data.formData.name;
      const sourceHandleId = params.sourceHandle;

      const imageConnections = kindsConnections['*'] || [];
      const connectNodeDef: PropertyDefinition | undefined =
        imageConnections.find(
          (conn) =>
            conn.manifest_type_identifier === targetManifest &&
            conn.compatible_element === 'any_data'
        );

      let propertyValue: string | undefined = undefined;
      if (sourceHandleId) {
        if (sourceManifest === inputNode.data.manifest_type_identifier) {
          propertyValue = `$inputs.${sourceHandleId}`;
        } else {
          propertyValue = `$steps.${sourceNodeName}.${sourceHandleId}`;
        }
      }

      if (connectNodeDef && propertyValue) {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === targetNode.id
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    formData: {
                      ...node.data.formData,
                      [connectNodeDef.property_name]: propertyValue
                    }
                  }
                }
              : node
          )
        );
      }
    },
    [nodes, setEdges, getConnectableNodeManifests, kindsConnections]
  );

  const onDeleteNode = useCallback(() => {
    if (selectedNode && selectedNode.type !== 'builtInNode') {
      setSelectedNodeId(null);
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
        )
      );
    }
  }, [selectedNode]);

  const handleOpenConnectPanel = useCallback(
    (domEvent: React.MouseEvent, nodeId: string, handleId: string | null) => {
      domEvent.stopPropagation();

      if (!nodeId) return;

      const sourceNode = nodes.find((n) => n.id === nodeId);
      if (!sourceNode) return;

      const connectableManifests = getConnectableNodeManifests(sourceNode);

      const reactFlowWrapper = rfWrapperRef.current;
      if (!reactFlowWrapper) return;

      const rect = reactFlowWrapper.getBoundingClientRect();
      const position = {
        x: domEvent.clientX - rect.left + 20,
        y: domEvent.clientY - rect.top
      };

      setConnectMenu({
        position,
        sourceNodeId: nodeId,
        sourceHandleId: handleId,
        connectableManifests
      });
    },
    [nodes, getConnectableNodeManifests]
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

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // 确保点击时清除所有节点的选中状态，只选中当前点击的节点
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: n.id === node.id
      }))
    );
    setSelectedNodeId(node.id);
    setConnectMenu(null);
    setSelectedEdgeId(null);
  }, []);

  // Add this new function to handle key presses
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Delete') {
        if (selectedNode && selectedNode.type !== 'builtInNode') {
          onDeleteNode();
        } else if (selectedEdgeId) {
          // 删除选中的边线
          const deleteEvent = new CustomEvent('delete-edge', {
            detail: { id: selectedEdgeId }
          });
          window.dispatchEvent(deleteEvent);
        }
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
    [selectedNode, selectedEdgeId, onDeleteNode]
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
          addKindValue(kindValues, '*', image, node, {
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
          addKindValue(kindValues, '*', param, node, {
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
                element: 'any_data'
              });
              addKindValue(kindValues, '*', output, node, {
                prefix: `$steps.${node.data.formData.name}.`,
                description: 'Output',
                element: 'any_data'
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

  const onNodeDragStart = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (connectMenu && node.id === connectMenu.sourceNodeId) {
        setDragState({
          startNodePos: node.position,
          startPanelPos: connectMenu.position
        });
      }
    },
    [connectMenu]
  );

  const onNodeDrag = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (!dragState || !connectMenu || !rfInstance) {
        return;
      }

      const zoom = rfInstance.getZoom();

      const delta = {
        x: (node.position.x - dragState.startNodePos.x) * zoom,
        y: (node.position.y - dragState.startNodePos.y) * zoom
      };

      const newPosition = {
        x: dragState.startPanelPos.x + delta.x,
        y: dragState.startPanelPos.y + delta.y
      };

      setConnectMenu((menu) =>
        menu ? { ...menu, position: newPosition } : null
      );
    },
    [dragState, connectMenu, rfInstance]
  );

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setDragState(null);
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

  const onInit = (instance: ReactFlowInstance) => {
    setRfInstance(instance);
    // 确保初始化后不选中任何节点
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };

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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [setNodes]);

  useEffect(() => {
    const handleDeleteEdge = (e: Event) => {
      const { id } = (e as CustomEvent).detail;

      // 找到要删除的边线
      const edgeToDelete = edges.find((edge) => edge.id === id);
      if (!edgeToDelete) return;

      // 删除边线
      setEdges((eds) => eds.filter((edge) => edge.id !== id));

      // 如果删除的是当前选中的边线，清除选中状态
      if (selectedEdgeId === id) {
        setSelectedEdgeId(null);
      }

      // 找到目标节点并清理其formData中的连接数据
      const targetNode = nodes.find((node) => node.id === edgeToDelete.target);
      if (
        targetNode &&
        targetNode.data.manifest_type_identifier !==
          outputNode.data.manifest_type_identifier
      ) {
        const sourceNode = nodes.find(
          (node) => node.id === edgeToDelete.source
        );
        if (sourceNode) {
          const sourceManifest = sourceNode.data.manifest_type_identifier;
          const sourceNodeName = sourceNode.data.formData.name;
          const sourceHandleId = edgeToDelete.sourceHandle;

          // 构建要清理的属性值
          let propertyValueToRemove: string | undefined = undefined;
          if (sourceHandleId) {
            if (sourceManifest === inputNode.data.manifest_type_identifier) {
              propertyValueToRemove = `$inputs.${sourceHandleId}`;
            } else {
              propertyValueToRemove = `$steps.${sourceNodeName}.${sourceHandleId}`;
            }
          }

          // 清理目标节点formData中匹配的属性
          if (propertyValueToRemove) {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === targetNode.id
                  ? {
                      ...node,
                      data: {
                        ...node.data,
                        formData: Object.fromEntries(
                          Object.entries(node.data.formData).map(
                            ([key, value]) => [
                              key,
                              value === propertyValueToRemove ? null : value
                            ]
                          )
                        )
                      }
                    }
                  : node
              )
            );
          }
        }
      }

      // 显示删除成功提示
      toast({
        title: '连接已删除',
        description: '节点间的连接已成功移除',
        variant: 'default'
      });
    };

    const handleSelectEdge = (e: Event) => {
      const { id, selected } = (e as CustomEvent).detail;
      setSelectedEdgeId(selected ? id : null);
    };

    window.addEventListener('delete-edge', handleDeleteEdge);
    window.addEventListener('select-edge', handleSelectEdge);

    return () => {
      window.removeEventListener('delete-edge', handleDeleteEdge);
      window.removeEventListener('select-edge', handleSelectEdge);
    };
  }, [setEdges, edges, nodes, setNodes, selectedEdgeId]);

  useEffect(() => {
    const handleMockNodeEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { nodeId, domEvent } = customEvent.detail;
      const mockNode = nodes.find((n) => n.id === nodeId);
      if (!mockNode) return;

      const connectableManifests = kindsConnections['roboflow_model_id']?.map(
        (c) => c.manifest_type_identifier
      );

      const reactFlowWrapper = rfWrapperRef.current;
      if (!reactFlowWrapper) return;
      const rect = reactFlowWrapper.getBoundingClientRect();
      const position = {
        x: domEvent.clientX - rect.left + 20,
        y: domEvent.clientY - rect.top
      };

      setConnectMenu({
        position,
        sourceNodeId: nodeId, // This will be the mock node's ID
        sourceHandleId: null,
        connectableManifests: connectableManifests || []
      });
    };

    window.addEventListener('open-mock-replace-panel', handleMockNodeEvent);
    return () => {
      window.removeEventListener(
        'open-mock-replace-panel',
        handleMockNodeEvent
      );
    };
  }, [nodes, kindsConnections]);

  const handleNodeSelectFromPanel = useCallback(
    (selectedBlock: BlockDescription) => {
      if (!connectMenu) return;

      const { sourceNodeId, sourceHandleId } = connectMenu;
      const sourceNode = nodes.find((n) => n.id === sourceNodeId);
      if (!sourceNode) return;

      // 1. Create new node
      const newNodeId = `${selectedBlock.manifest_type_identifier}-${
        nodes.length + 1
      }`;
      const newNodeWidth = 200;
      let newNodePosition = {
        x: sourceNode.position.x + (sourceNode.width || 200) + 150,
        y: sourceNode.position.y
      };

      if (rfInstance && rfWrapperRef.current) {
        const { x: viewX, zoom } = rfInstance.getViewport();
        const { width: wrapperWidth } =
          rfWrapperRef.current.getBoundingClientRect();

        // Check if the new node would be off-screen to the right
        const viewportRightEdge = viewX + wrapperWidth / zoom;
        if (newNodePosition.x + newNodeWidth > viewportRightEdge) {
          // If so, place it below the source node
          newNodePosition = {
            x: sourceNode.position.x,
            y: sourceNode.position.y + (sourceNode.height || 100) + 50
          };
        }
      }

      const newNode = {
        id: newNodeId,
        type: 'customNode',
        position: newNodePosition,
        data: {
          ...selectedBlock,
          label: selectedBlock.human_friendly_block_name,
          formData: generateFormData(selectedBlock)
        } as NodeData,
        style: { width: newNodeWidth, fontSize: '12px' }
      };

      // 2. Connect logic (adapted from onConnect)
      const params = {
        source: sourceNodeId,
        sourceHandle: sourceHandleId,
        target: newNodeId,
        targetHandle: null // Assume one main input handle for now
      };

      const sourceManifest = sourceNode.data.manifest_type_identifier;
      const targetManifest = newNode.data.manifest_type_identifier;
      const sourceNodeName = sourceNode.data.formData.name;

      const imageConnections = kindsConnections['*'] || [];
      let connectNodeDef: PropertyDefinition | undefined = undefined;
      let propertyValue: string | undefined = undefined;

      if (sourceManifest === inputNode.data.manifest_type_identifier) {
        connectNodeDef = imageConnections.find(
          (conn) =>
            conn.manifest_type_identifier === targetManifest &&
            conn.compatible_element === 'any_data'
        );
        if (sourceHandleId) {
          propertyValue = `$inputs.${sourceHandleId}`;
        }
      } else {
        connectNodeDef = imageConnections.find(
          (conn) =>
            conn.manifest_type_identifier === targetManifest &&
            conn.compatible_element === 'any_data'
        );
        if (sourceHandleId) {
          propertyValue = `$steps.${sourceNodeName}.${sourceHandleId}`;
        }
      }

      let finalNewNode = newNode;
      if (connectNodeDef && propertyValue) {
        finalNewNode = {
          ...newNode,
          data: {
            ...newNode.data,
            formData: {
              ...newNode.data.formData,
              [connectNodeDef.property_name]: propertyValue
            }
          }
        };
      }

      setNodes((nds) => nds.concat(finalNewNode));
      setEdges((eds) => addEdge(params, eds));

      setConnectMenu(null);
    },
    [
      connectMenu,
      nodes,
      setNodes,
      setEdges,
      generateFormData,
      kindsConnections,
      availableKindValues,
      rfInstance
    ]
  );

  const handleReplaceMockNode = useCallback(
    (selectedBlock: BlockDescription) => {
      if (!connectMenu || !connectMenu.sourceNodeId.startsWith('mock-node'))
        return;

      const mockNodeId = connectMenu.sourceNodeId;
      const mockNode = nodes.find((n) => n.id === mockNodeId);
      if (!mockNode) return;

      const incomingEdge = edges.find((e) => e.target === mockNodeId);
      const outgoingEdge = edges.find((e) => e.source === mockNodeId);

      // 1. Create the new node
      const newNodeId = `${selectedBlock.manifest_type_identifier}-${
        nodes.length + 1
      }`;
      const newNode = {
        id: newNodeId,
        type: 'customNode',
        position: mockNode.position,
        data: {
          ...selectedBlock,
          label: selectedBlock.human_friendly_block_name,
          formData: generateFormData(selectedBlock)
        } as NodeData,
        style: { width: 200, fontSize: '12px' }
      };

      // 2. Prepare new edges
      const newEdges: Edge[] = [];
      if (incomingEdge) {
        newEdges.push({ ...incomingEdge, target: newNodeId });
      }
      if (outgoingEdge) {
        newEdges.push({ ...outgoingEdge, source: newNodeId });
      }

      // 3. Update state
      setNodes((nds) => nds.filter((n) => n.id !== mockNodeId).concat(newNode));
      setEdges((eds) =>
        eds
          .filter((e) => e.source !== mockNodeId && e.target !== mockNodeId)
          .concat(newEdges)
      );
      setConnectMenu(null);
    },
    [connectMenu, nodes, edges, generateFormData]
  );

  useEffect(() => {
    const handleOpenConnectPanelEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { domEvent, nodeId, handleId } = customEvent.detail;
      handleOpenConnectPanel(domEvent, nodeId, handleId);
    };

    window.addEventListener('open-connect-panel', handleOpenConnectPanelEvent);

    return () => {
      window.removeEventListener(
        'open-connect-panel',
        handleOpenConnectPanelEvent
      );
    };
  }, [handleOpenConnectPanel]);

  return (
    <PageContainer scrollable={true}>
      <div className="flex-1 space-y-4 p-4 md:p-8 md:pr-4">
        <div className="flex items-center justify-between">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="flex items-center gap-2">
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
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="default"
                  className="flex items-center gap-2"
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
          </div>
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
            width: '100%',
            height: 'calc(100vh - 140px)',
            transition: 'width 0.5s',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <ReactFlowProvider>
            <div
              ref={rfWrapperRef}
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
                edges={edgesWithSelection}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onNodeClick={onNodeClick}
                onNodeDragStart={onNodeDragStart}
                onNodeDragStop={onNodeDragStop}
                onNodeDrag={onNodeDrag}
                onInit={onInit}
                onPaneClick={() => {
                  setConnectMenu(null);
                  setSelectedNodeId(null);
                  setSelectedEdgeId(null);
                  // 清除所有节点的选中状态
                  setNodes((nds) =>
                    nds.map((n) => ({
                      ...n,
                      selected: false
                    }))
                  );
                  // 触发全局取消选中事件
                  window.dispatchEvent(new CustomEvent('deselect-all-edges'));
                }}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                multiSelectionKeyCode={null} // Disable multi-selection
                selectionKeyCode={null} // Disable selection
                nodesConnectable={true}
                nodesDraggable={true}
                elementsSelectable={false} // 禁用元素选中
                selectNodesOnDrag={false} // 禁用拖拽时选中节点
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
                {connectMenu && (
                  <ConnectNodePanel
                    position={connectMenu.position}
                    availableNodes={availableNodes.filter((n) =>
                      connectMenu.connectableManifests.includes(
                        n.manifest_type_identifier
                      )
                    )}
                    onNodeSelect={
                      connectMenu.sourceNodeId.startsWith('mock-node')
                        ? handleReplaceMockNode
                        : handleNodeSelectFromPanel
                    }
                    onClose={() => setConnectMenu(null)}
                  />
                )}
              </ReactFlow>
            </div>
          </ReactFlowProvider>

          {selectedNode && (
            <NodeDetail
              isOpen={!!selectedNode}
              onClose={() => {
                setSelectedNodeId(null);
              }}
              nodeData={selectedNode.data}
              onFormChange={onFormChange}
              availableKindValues={availableKindValues}
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
