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
import { Button } from '@/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useAuthSWR } from '@/components/hooks/useAuthReq';
import { PropertyDefinition, NodeData } from '@/constants/block';
import { useSession } from 'next-auth/react';
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
}

const ModelSelectorField: React.FC<ModelSelectorFieldProps> = (props) => {
  const { onChange, formData, schema, uiSchema = {}, required } = props;

  const originalSchema = uiSchema['ui:options']?.originalSchema as RJSFSchema;

  // 判断是否所有选项都是kind类型
  const allKindOptions = (originalSchema || schema)?.anyOf?.every(
    (item: any) => item.kind
  );

  // 状态管理
  const [isKindMode, setIsKindMode] = useState(allKindOptions);
  const [inputValue, setInputValue] = useState(formData || '');

  const session = useSession();
  const workspaceId = session.data?.user.select_workspace_id;

  // 从API获取模型列表，使用list_models接口
  const {
    data: modelsResponse,
    error,
    mutate
  } = workspaceId
    ? useAuthSWR<MLModel[]>(
        `/api/reef/workspaces/${workspaceId}/models?is_public=true`
      )
    : {
        data: undefined,
        error: undefined,
        mutate: (() => Promise.resolve([])) as any
      };

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

  const findModelNameById = (modelId: string): string => {
    if (!modelList.length || !modelId) return '';
    const model = modelList.find((m) => m.id === modelId);
    return model ? model.name : modelId;
  };

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

  const handleRetry = () => {
    mutate();
  };

  const isLoading = !modelsResponse && !error;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {/* <Label className="text-sm font-medium dark:text-white">
          <span className="font-bold">{schema?.title || props.name}</span>
          {required && (
            <span className="ml-1 text-red-500 dark:text-red-400">*</span>
          )}
        </Label> */}
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
        {/* 直接输入模式：显示模型选择器 */}
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
                <SelectItem key={model.id} value={model.name}>
                  {model.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
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
