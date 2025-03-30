import React, { useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { withTheme } from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { Theme as SemanticUITheme } from '@rjsf/semantic-ui';
import 'semantic-ui-css/semantic.min.css';
import { JSONSchema7 } from 'json-schema';
import { useAuthSWR } from '@/components/hooks/useAuthReq';
import { useSession } from 'next-auth/react';

import {
  NodeData,
  PropertyDefinition,
  KindsConnections,
  skipFormFields
} from '@/constants/block';

import KindField from './kind-field';
import ModelSelectorField, {
  isRoboflowModelField
} from './model-selector-field';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { BoxIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface ExtendedJSONSchema7 extends JSONSchema7 {
  'x-internal-type'?: string;
  'x-field-type'?: string;
}

const Form = withTheme(SemanticUITheme);

// 自定义模型列表显示组件
const ModelsArrayField = ({
  models,
  nodeData,
  onFormChange
}: {
  models: any[];
  nodeData: NodeData;
  onFormChange: (formData: any) => void;
}) => {
  const session = useSession();
  const workspaceId = session.data?.user.select_workspace_id;
  const { data: availableModels } = useAuthSWR<any[]>(
    `/api/reef/workspaces/${workspaceId}/models`
  );

  const handleAddModel = useCallback(
    (modelId: string) => {
      if (!availableModels) return;

      const selectedModel = availableModels.find((m) => m.id === modelId);
      if (!selectedModel) return;

      const newModel = {
        id: selectedModel.id,
        name: selectedModel.name,
        version: selectedModel.version
      };

      const newModels = [...(models || []), newModel];
      onFormChange({
        ...nodeData.formData,
        models: newModels
      });
    },
    [availableModels, models, nodeData, onFormChange]
  );

  // 获取已选择的模型ID列表
  const selectedModelIds = new Set(models?.map((m) => m.id) || []);

  return (
    <div className="mb-4 space-y-2">
      <Label className="text-sm font-medium">
        <span className="font-bold">可用模型列表</span>
      </Label>

      {/* 添加模型选择器 */}
      <Select onValueChange={handleAddModel}>
        <SelectTrigger>
          <SelectValue placeholder="选择要添加的模型" />
        </SelectTrigger>
        <SelectContent>
          {availableModels
            ?.filter((model) => !selectedModelIds.has(model.id))
            .map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name} {model.version ? `(${model.version})` : ''}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {/* 显示已选模型列表 */}
      {models && models.length > 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="space-y-2 p-4">
            {models.map((model, index) => (
              <div
                key={index}
                className="flex items-center rounded-md bg-blue-50 p-2"
              >
                <BoxIcon className="mr-2 h-4 w-4 text-blue-500" />
                <span className="text-sm">
                  {model.name} {model.version ? `(${model.version})` : ''}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="text-sm italic text-gray-500">
          没有可用的模型。请从下拉框中选择要添加的模型。
        </div>
      )}
    </div>
  );
};

interface NodeDetailProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: NodeData;
  onFormChange: (formData: any) => void;
  availableKindValues: Record<string, PropertyDefinition[]>;
  kindsConnections: KindsConnections;
  onDeleteNode: () => void;
}

const NodeDetail: React.FC<NodeDetailProps> = React.memo(
  ({
    isOpen,
    onClose,
    nodeData,
    onFormChange,
    availableKindValues,
    kindsConnections,
    onDeleteNode
  }) => {
    const customFields = {
      AnyOfField: React.useCallback(
        (props: any) => {
          // 检查是否为Roboflow模型字段
          if (props.schema['x-field-type'] === 'roboflow-model') {
            return (
              <ModelSelectorField
                {...props}
                nodeData={nodeData}
                availableKindValues={availableKindValues}
                kindsConnections={kindsConnections}
              />
            );
          }

          return (
            <KindField
              {...props}
              availableKindValues={availableKindValues}
              nodeData={nodeData}
              kindsConnections={kindsConnections}
            />
          );
        },
        [availableKindValues, nodeData, kindsConnections]
      )
    };

    const newSchema = {
      ...nodeData.block_schema,
      properties: Object.entries(nodeData.block_schema.properties || {}).reduce(
        (acc, [key, value]) => {
          if (skipFormFields.includes(key)) {
            return acc;
          }

          if (typeof value === 'object' && value !== null && 'anyOf' in value) {
            const isRoboflowModel = isRoboflowModelField(value);
            acc[key] = {
              ...value,
              'x-internal-type': 'anyOf-field',
              'x-field-type': isRoboflowModel ? 'roboflow-model' : undefined
            };
          } else if (
            typeof value === 'object' &&
            value !== null &&
            (key === 'name' || key === 'type')
          ) {
            acc[key] = {
              type: 'string',
              title: value.title || key,
              readOnly: true
            };
          } else {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>
      )
    };

    const uiSchema = {
      ...Object.keys(nodeData.block_schema.properties || {}).reduce(
        (acc, key) => {
          const property = nodeData.block_schema.properties?.[
            key
          ] as ExtendedJSONSchema7;
          if (
            property !== null &&
            property['x-internal-type'] === 'anyOf-field'
          ) {
            acc[key] = {
              'ui:field': 'AnyOfField',
              'ui:options': {
                originalSchema: property
              }
            };
          }
          return acc;
        },
        {} as Record<string, any>
      ),
      'ui:submitButtonOptions': {
        norender: true
      },
      'ui:title': '',
      // 添加models字段的UI配置
      models: {
        'ui:options': {
          addable: true,
          orderable: false,
          removable: true
        },
        items: {
          'ui:order': ['name', 'id', 'version']
        }
      }
    };

    const filteredFormData = Object.fromEntries(
      Object.entries(nodeData.formData).filter(
        ([key]) => !skipFormFields.includes(key)
      )
    );

    const handleFormChange = useCallback(
      (e: any) => {
        onFormChange(e.formData);
      },
      [onFormChange]
    );

    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent
          side="right"
          className="flex w-[600px] flex-col sm:w-[800px]"
        >
          <SheetHeader>
            <SheetTitle>{nodeData.human_friendly_block_name}</SheetTitle>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto">
            <Form
              schema={newSchema}
              uiSchema={uiSchema}
              validator={validator}
              formData={filteredFormData}
              onChange={handleFormChange}
              fields={customFields}
            />
            {nodeData.block_schema.block_type !== 'buildin' && (
              <Button
                variant="destructive"
                onClick={onDeleteNode}
                className="mt-4 w-full"
              >
                删除节点
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  }
);

export default NodeDetail;
