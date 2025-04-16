import React, { useState, useEffect, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { FieldProps, RJSFSchema } from '@rjsf/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link1Icon, ReloadIcon } from '@radix-ui/react-icons';
import { useSession } from 'next-auth/react';
import { useAuthSWR } from '@/components/hooks/useAuthReq';
import {
  PropertyDefinition,
  KindsConnections,
  NodeData
} from '@/constants/block';
import { useToast } from '@/components/ui/use-toast';
import { MLModel } from '@/constants/models';

// 检查字段是否为Roboflow模型ID字段
export const isRoboflowModelField = (schema: any): boolean => {
  if (!schema?.anyOf) return false;

  // 递归检查anyOf项中的kind数组
  const hasRoboflowModelId = (item: any): boolean => {
    // 直接检查kind数组
    if (item.kind && Array.isArray(item.kind)) {
      return item.kind.some((k: any) => k.name === 'roboflow_model_id');
    }

    // 检查description是否包含Roboflow model id
    if (item.description && item.description.includes('Roboflow model id')) {
      return true;
    }

    return false;
  };

  return schema.anyOf.some(hasRoboflowModelId);
};

interface ModelSelectorFieldProps extends FieldProps {
  title?: string;
  nodeData: NodeData;
  availableKindValues: Record<string, PropertyDefinition[]>;
  kindsConnections: KindsConnections;
}

const ModelSelectorField: React.FC<ModelSelectorFieldProps> = (props) => {
  const {
    onChange,
    formData,
    schema,
    uiSchema = {},
    nodeData,
    availableKindValues,
    kindsConnections,
    required
  } = props;

  const originalSchema = uiSchema['ui:options']?.originalSchema as RJSFSchema;

  // 判断是否所有选项都是kind类型
  const allKindOptions = (originalSchema || schema)?.anyOf?.every(
    (item: any) => item.kind
  );

  // 是否存在kind选项
  const hasKindOption = (originalSchema || schema)?.anyOf?.some(
    (item: any) => item.kind
  );

  // 状态管理
  const [isKindMode, setIsKindMode] = useState(allKindOptions);
  const [inputValue, setInputValue] = useState(formData || '');

  const session = useSession();
  const workspaceId = session.data?.user.select_workspace_id;
  const { toast } = useToast();

  // 从API获取模型列表，使用list_models接口
  const {
    data: modelsResponse,
    error,
    mutate
  } = workspaceId
    ? useAuthSWR<MLModel[]>(`/api/reef/workspaces/${workspaceId}/models`)
    : {
        data: undefined,
        error: undefined,
        mutate: (() => Promise.resolve([])) as any
      };

  // 在全局工作流状态中检查input节点是否有models数据
  const hasInputNodeModels = useMemo(() => {
    // 检查是否存在input节点且有models数据
    if (!kindsConnections?.nodes) return false;

    // 使用类型断言获取节点数据
    const nodes = kindsConnections.nodes as Record<string, any>;
    const inputNode = Object.values(nodes).find(
      (node) => node.data?.manifest_type_identifier === 'input'
    );

    return !!(inputNode?.data?.formData?.models?.length > 0);
  }, [kindsConnections?.nodes]);

  // 从kind值中提取可用选项，类似KindField实现
  const kindOptions = useMemo(() => {
    return (
      (originalSchema || schema)?.anyOf?.flatMap((item: any) => {
        if (item.kind && Array.isArray(item.kind)) {
          const currentNodeName = nodeData.formData.name;

          const _kindOptions = item.kind.flatMap((kindItem: any) => {
            const kindName = kindItem.name;
            const availableKinds = availableKindValues[kindName] || [];

            const intersection = availableKinds.filter(
              (prop: PropertyDefinition) =>
                prop.compatible_element === item.selected_element &&
                !prop.property_name.startsWith(`$output.${currentNodeName}.`)
            );
            return intersection.map(
              (prop: PropertyDefinition) => prop.property_name
            );
          });
          return _kindOptions;
        }
        return [];
      }) || []
    );
  }, [schema, nodeData, availableKindValues, originalSchema]);

  // 检查是否有可用的kind选项
  const hasAvailableKindOptions = useMemo(() => {
    return kindOptions && kindOptions.length > 0;
  }, [kindOptions]);

  // 提取模型列表数据
  const modelList = useMemo(() => {
    if (!modelsResponse) return [];

    // 使用MLModel类型的具体字段，同时添加安全检查
    return modelsResponse.map((model) => ({
      id: model.id || '',
      name: model.name || '未命名模型',
      version: model.version || '',
      task_type: model.task_type,
      platform: model.platform,
      is_public: model.is_public,
      created_at: model.created_at,
      updated_at: model.updated_at
    }));
  }, [modelsResponse]);

  // 检查是否有兼容的引用可用
  const hasCompatibleReferences = useMemo(() => {
    if (!kindOptions || kindOptions.length === 0) return false;

    const fieldName = props.name;
    const fieldSchema = nodeData.block_schema.properties?.[fieldName];

    return !!findCompatibleReference(
      kindOptions,
      fieldSchema,
      originalSchema || schema
    );
  }, [
    kindOptions,
    props.name,
    nodeData.block_schema.properties,
    originalSchema,
    schema
  ]);

  // 根据ID查找模型名称
  const findModelNameById = (modelId: string): string => {
    if (!modelList.length || !modelId) return '';
    const model = modelList.find((m) => m.id === modelId);
    return model
      ? `${model.name} ${model.version ? `(${model.version})` : ''}`
      : modelId;
  };

  // 在非引用模式下，显示下拉框时的值应该是模型名称而非ID
  const displayValue = useMemo(() => {
    if (isKindMode) return inputValue;
    return findModelNameById(inputValue);
  }, [isKindMode, inputValue, modelList]);

  useEffect(() => {
    setInputValue(formData || '');
    if (formData && typeof formData === 'string' && formData.includes('$')) {
      setIsKindMode(true);
    }
  }, [formData]);

  const handleSelectChange = (selectedValue: string) => {
    setInputValue(selectedValue);
    onChange(selectedValue);
  };

  const toggleKindMode = () => {
    // 如果没有输入节点中的模型数据，则不允许切换到引用模式
    if (!isKindMode && !hasInputNodeModels) {
      toast?.({
        title: '无法切换到引用模式',
        description: '当前工作区没有可用的模型数据，无法使用引用模式',
        variant: 'destructive'
      });
      return;
    }

    // 切换前检查：如果要切换到引用模式但没有可用选项，则不切换
    if (!isKindMode && !hasCompatibleReferences) {
      toast?.({
        title: '无兼容引用值',
        description: '当前没有与该字段类型兼容的引用值可用',
        variant: 'destructive'
      });
      return;
    }

    const newKindMode = !isKindMode;
    setIsKindMode(newKindMode);

    if (!newKindMode) {
      // 切换到直接输入模式
      setInputValue('');
      onChange('');
    } else {
      // 切换到引用模式
      if (kindOptions && kindOptions.length > 0) {
        // 获取字段类型信息，确保选择合适的引用
        const fieldName = props.name;
        const fieldSchema = nodeData.block_schema.properties?.[fieldName];

        // 查找与字段类型兼容的引用
        let compatibleRef = findCompatibleReference(
          kindOptions,
          fieldSchema,
          originalSchema || schema
        );

        if (compatibleRef) {
          setInputValue(compatibleRef);
          onChange(compatibleRef);
        } else if (kindOptions.length > 0) {
          // 如果没有找到完全兼容的，则使用第一个可用的引用，但这可能导致验证错误
          const newValue = kindOptions[0];
          setInputValue(newValue);
          onChange(newValue);
        }
      }
    }
  };

  // 查找与字段类型兼容的引用值
  const findCompatibleReference = (
    refs: string[],
    fieldSchema: any,
    schema: any
  ): string | undefined => {
    // 如果是模型ID字段，优先使用模型ID类型的引用
    if (props.name.includes('model_id')) {
      return refs.find(
        (ref) =>
          ref.startsWith('$inputs.') &&
          availableKindValues.roboflow_model_id?.some(
            (prop) => prop.property_name === ref
          )
      );
    }

    // 默认返回第一个引用
    return refs[0];
  };

  const handleRetry = () => {
    mutate();
  };

  const isLoading = !modelsResponse && !error;

  // 当模型数据加载完成时，更新workflow context中input节点的models字段
  useEffect(() => {
    if (
      modelsResponse &&
      workspaceId &&
      kindsConnections?.nodes &&
      !hasInputNodeModels
    ) {
      try {
        // 使用类型断言获取节点数据
        const nodes = kindsConnections.nodes as Record<string, any>;

        // 查找input节点
        const inputNode = Object.values(nodes).find(
          (node) => node.data?.manifest_type_identifier === 'input'
        );

        if (inputNode && inputNode.id) {
          // 获取转换后的模型列表
          const modelList = modelsResponse.map((model) => ({
            id: model.id || '',
            name: model.name || '未命名模型',
            version: model.version || '',
            task_type: model.task_type
          }));

          // 使用全局事件来通知更新
          // 注意：这是一个临时解决方案，理想情况下应该使用Context API
          // 或者Redux等状态管理库来处理状态更新
          const event = new CustomEvent('workflow:update_input_models', {
            detail: {
              nodeId: inputNode.id,
              models: modelList
            }
          });
          window.dispatchEvent(event);

          // 如果可以，直接更新nodes中的数据
          if (typeof window.updateWorkflowNode === 'function') {
            window.updateWorkflowNode(inputNode.id, {
              ...inputNode.data,
              formData: {
                ...inputNode.data.formData,
                models: modelList
              }
            });
          }

          console.log('已更新input节点的models字段', modelList);
        }
      } catch (err) {
        console.error('更新input节点models失败', err);
      }
    }
  }, [
    modelsResponse,
    workspaceId,
    kindsConnections?.nodes,
    hasInputNodeModels
  ]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium dark:text-white">
          <span className="font-bold">
            {originalSchema?.title || props.name}
          </span>
          {required && (
            <span className="ml-1 text-red-500 dark:text-red-400">*</span>
          )}
        </Label>
        {!isKindMode && error && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-300"
          >
            <ReloadIcon className="h-3 w-3" />
            重试
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {isKindMode ? (
          // 引用模式：显示kind选择器
          <Select
            onValueChange={handleSelectChange}
            value={
              inputValue || (hasAvailableKindOptions ? kindOptions[0] : '')
            }
            disabled={!hasAvailableKindOptions}
          >
            <SelectTrigger
              className={`w-full ${
                !hasAvailableKindOptions ? 'bg-gray-100' : ''
              }`}
            >
              <SelectValue
                placeholder={
                  hasAvailableKindOptions ? '选择引用值' : '无可用引用值'
                }
              />
            </SelectTrigger>
            <SelectContent sideOffset={4}>
              {hasAvailableKindOptions ? (
                kindOptions.map((val: string) => (
                  <SelectItem key={val} value={val}>
                    {val}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  无可用引用值
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        ) : (
          // 直接输入模式：显示模型选择器
          <Select
            onValueChange={handleSelectChange}
            value={inputValue}
            disabled={isLoading || (!modelList.length && !error)}
          >
            <SelectTrigger
              className={`w-full ${isLoading ? 'animate-pulse' : ''}`}
            >
              <SelectValue placeholder={isLoading ? '加载中...' : '选择模型'}>
                {displayValue}
              </SelectValue>
            </SelectTrigger>
            <SelectContent sideOffset={4}>
              {isLoading ? (
                <SelectItem value="" disabled>
                  加载中...
                </SelectItem>
              ) : error ? (
                <SelectItem value="" disabled>
                  加载模型列表失败
                </SelectItem>
              ) : !modelList.length ? (
                <SelectItem value="" disabled>
                  无可用模型
                </SelectItem>
              ) : (
                modelList.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name} {model.version ? `(${model.version})` : ''}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
        {/* 模式切换按钮 */}
        {hasKindOption && !allKindOptions && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleKindMode}
            className={`transition-colors ${
              isKindMode
                ? 'border border-blue-200 bg-blue-50 text-blue-500 dark:border-blue-400 dark:bg-blue-100 dark:text-blue-700'
                : 'text-gray-500 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700'
            }`}
            disabled={
              (isKindMode && !hasAvailableKindOptions) ||
              (!isKindMode && !hasInputNodeModels)
            }
            title={
              !hasInputNodeModels
                ? '当前工作区没有可用模型，无法切换到引用模式'
                : isKindMode
                ? '切换到模型选择模式'
                : '切换到引用模式'
            }
          >
            <Link1Icon
              className={`h-4 w-4 ${
                !hasInputNodeModels && !isKindMode ? 'text-gray-300' : ''
              }`}
            />
          </Button>
        )}
      </div>
      {/* 错误和提示信息 */}
      {!isKindMode && error && (
        <p className="mt-1 text-xs text-red-500 dark:text-red-300">
          加载模型列表失败，请重试
        </p>
      )}
      {!isKindMode && !isLoading && !error && modelList.length === 0 && (
        <p className="mt-1 text-xs text-orange-500 dark:text-orange-300">
          当前工作区没有可用的模型，请先导入或创建模型
        </p>
      )}
      {!isKindMode && !hasInputNodeModels && (
        <p className="mt-1 text-xs text-orange-500 dark:text-orange-300">
          输入节点没有模型数据，引用模式不可用。模型数据将在首次加载后自动添加。
        </p>
      )}
      {isKindMode && !hasAvailableKindOptions && (
        <p className="mt-1 text-xs text-orange-500 dark:text-orange-300">
          当前节点没有可用的引用值。请先配置其他节点或切换到模型选择模式。
        </p>
      )}
      {isKindMode &&
        hasAvailableKindOptions &&
        props.name.includes('model_id') && (
          <p className="mt-1 text-xs text-blue-500 dark:text-blue-300">
            提示：此为模型ID字段，请选择合适的输入参数引用
          </p>
        )}
    </div>
  );
};

export default ModelSelectorField;

// 为TypeScript声明全局方法
declare global {
  interface Window {
    updateWorkflowNode?: (nodeId: string, data: any) => void;
  }
}
