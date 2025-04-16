import React, { useCallback, useEffect } from 'react';
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
import AnyOfKindField from './anyof-kind-field';
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
      <Label className="text-sm font-medium text-gray-900 dark:text-white">
        <span className="font-bold">可用模型列表</span>
      </Label>

      {/* 添加模型选择器 */}
      <Select onValueChange={handleAddModel}>
        <SelectTrigger className="border-gray-300 dark:border-sidebar-border dark:bg-sidebar dark:text-white">
          <SelectValue placeholder="选择要添加的模型" />
        </SelectTrigger>
        <SelectContent className="dark:border-sidebar-border dark:bg-sidebar">
          {availableModels
            ?.filter((model) => !selectedModelIds.has(model.id))
            .map((model) => (
              <SelectItem
                key={model.id}
                value={model.id}
                className="dark:text-white"
              >
                {model.name} {model.version ? `(${model.version})` : ''}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {/* 显示已选模型列表 */}
      {models && models.length > 0 ? (
        <Card className="border border-gray-200 dark:border-sidebar-border">
          <CardContent className="space-y-2 p-4 dark:bg-sidebar-accent">
            {models.map((model, index) => (
              <div
                key={index}
                className="flex items-center rounded-md bg-blue-50 p-2 dark:bg-sidebar"
              >
                <BoxIcon className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-300" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {model.name} {model.version ? `(${model.version})` : ''}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="text-sm italic text-gray-500 dark:text-gray-200">
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
    // 为深色模式添加自定义样式
    useEffect(() => {
      if (isOpen) {
        // 为深色模式添加CSS覆盖样式
        const style = document.createElement('style');
        style.id = 'form-dark-mode-styles';
        style.innerHTML = `
          /* 字段标签样式 */
          .dark .ui.form .field > label,
          .dark .ui.form .fields .field > label,
          .dark .ui.form .field > .label,
          .dark label,
          .dark .ui.form label,
          .dark .ui.header,
          .dark .ui.dividing.header,
          .dark .field > label,
          .dark .ui.form .inline.field > label,
          .dark .ui.form .inline.field > p,
          .dark .ui.form .grouped.field > label,
          .dark .ui.checkbox label,
          .dark .ui.form .field > .selection.dropdown > .text {
            color: #ffffff !important;
            font-weight: 500 !important;
            text-shadow: 0 0 1px rgba(0, 0, 0, 0.2) !important;
          }

          /* 必填字段的星号 */
          .dark .ui.form .required.field > label:after {
            color: #ff6b6b !important;
            text-shadow: 0 0 2px rgba(255, 0, 0, 0.4) !important;
          }

          /* 输入框、文本域和下拉框样式 - 使用反差色 */
          .dark .ui.form input[type="text"],
          .dark .ui.form input[type="number"],
          .dark .ui.form input[type="password"],
          .dark .ui.form input[type="email"],
          .dark .ui.form input[type="url"],
          .dark .ui.form input[type="date"],
          .dark .ui.form input[type="datetime-local"],
          .dark .ui.form input[type="tel"],
          .dark .ui.form input[type="time"],
          .dark .ui.form input[type="file"],
          .dark .ui.form textarea,
          .dark .ui.input input {
            background-color: #f3f4f6 !important;
            color: #111827 !important;
            border-color: #9ca3af !important;
            font-weight: 500 !important;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
          }

          /* 下拉框样式 */
          .dark .ui.selection.dropdown {
            background-color: #f3f4f6 !important;
            color: #111827 !important;
            border-color: #9ca3af !important;
          }

          .dark .ui.dropdown .menu > .item {
            background-color: #f3f4f6 !important;
            color: #111827 !important;
            border-color: #9ca3af !important;
          }

          /* 表单元素聚焦状态 */
          .dark .ui.form input:focus,
          .dark .ui.form textarea:focus,
          .dark .ui.selection.dropdown:focus,
          .dark .ui.dropdown.active {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3) !important;
          }

          /* 占位符文本颜色 */
          .dark .ui.form input::placeholder,
          .dark .ui.form textarea::placeholder {
            color: #6b7280 !important;
          }

          /* 下拉菜单 */
          .dark .ui.selection.dropdown .menu,
          .dark .ui.dropdown .menu {
            background-color: #f3f4f6 !important;
            border-color: #9ca3af !important;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1) !important;
          }
          
          .dark .ui.selection.dropdown .menu > .item,
          .dark .ui.dropdown .menu > .item {
            color: #111827 !important;
            border-color: #9ca3af !important;
          }
          
          .dark .ui.selection.dropdown .menu > .item:hover,
          .dark .ui.dropdown .menu > .item:hover {
            background-color: #e5e7eb !important;
            color: #000000 !important;
          }

          /* 其他UI元素 */
          .dark .ui.segment,
          .dark .ui.segments .segment {
            background-color: var(--sidebar) !important;
            color: #ffffff !important;
            border-color: var(--sidebar-border) !important;
          }

          /* 数组项的背景 */
          .dark .array-item {
            background-color: var(--sidebar) !important;
            border-color: var(--sidebar-border) !important;
          }

          /* 文字颜色 */
          .dark .ui.form .field .text,
          .dark .ui.form .fields .field .text,
          .dark .ui.form .field .text label,
          .dark span,
          .dark div,
          .dark p,
          .dark h1, .dark h2, .dark h3, .dark h4, .dark h5 {
            color: #ffffff !important;
          }

          /* 表单内文字颜色例外 */
          .dark .ui.form input,
          .dark .ui.form textarea,
          .dark .ui.dropdown,
          .dark .ui.dropdown .text,
          .dark .ui.dropdown .menu > .item {
            color: #111827 !important;
          }

          /* 可读字段样式 */
          .dark .ui.form .read-only.field {
            background-color: #e2e8f0 !important;
            color: #1f2937 !important;
          }

          /* 表单描述文本 */
          .dark .ui.form .field .description {
            color: #cbd5e1 !important;
            font-style: italic !important;
          }

          /* 按钮样式 */
          .dark .ui.button:not(.primary) {
            background-color: var(--sidebar-accent) !important;
            color: #ffffff !important;
            border-color: var(--sidebar-border) !important;
            font-weight: 500 !important;
          }

          .dark .ui.button:hover:not(.primary) {
            background-color: var(--sidebar-accent) !important;
            filter: brightness(1.1) !important;
          }

          .dark .ui.primary.button {
            background-color: var(--primary) !important;
            color: #ffffff !important;
            font-weight: 500 !important;
          }

          .dark .ui.primary.button:hover {
            background-color: var(--primary) !important;
            filter: brightness(1.1) !important;
          }

          /* 增强表单字段高亮显示 */
          .dark .ui.form .field.error .input,
          .dark .ui.form .field.error label,
          .dark .ui.form .fields.error .field .input,
          .dark .ui.form .fields.error .field label {
            color: #ff8787 !important;
          }

          .dark .ui.form .field.error input,
          .dark .ui.form .field.error textarea,
          .dark .ui.form .fields.error .field input {
            background-color: #fef2f2 !important;
            border-color: #ff8787 !important;
            color: #7f1d1d !important;
          }

          /* 提高选中项和活动项的对比度 */
          .dark .ui.selection.active.dropdown,
          .dark .ui.selection.active.dropdown .menu {
            border-color: #3b82f6 !important;
          }

          .dark .ui.selection.dropdown .menu > .active.item {
            background-color: #dbeafe !important;
            color: #1e40af !important;
            font-weight: 700 !important;
          }

          /* 下拉菜单中的选中文本颜色 */
          .dark .ui.selection.dropdown > .text {
            color: #111827 !important;
          }
        `;
        document.head.appendChild(style);

        return () => {
          const existingStyle = document.getElementById(
            'form-dark-mode-styles'
          );
          if (existingStyle) {
            existingStyle.remove();
          }
        };
      }
    }, [isOpen]);

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
            <AnyOfKindField
              {...props}
              availableKindValues={availableKindValues}
              nodeData={nodeData}
              kindsConnections={kindsConnections}
            />
          );
        },
        [availableKindValues, nodeData, kindsConnections]
      ),
      KindField: React.useCallback(
        (props: any) => {
          return (
            <KindField
              {...props}
              nodeData={nodeData}
              availableKindValues={availableKindValues}
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
          } else if (property !== null && 'kind' in property) {
            acc[key] = {
              'ui:field': 'KindField',
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
      'ui:classNames': 'form-dark-mode',
      // // 添加source字段的UI配置
      sources: {
        'ui:options': {
          addable: false,
          orderable: false,
          removable: false
        },
        items: {
          'ui:widget': 'readonly',
          'ui:readonly': true,
          'ui:order': ['name']
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

    // 在组件加载后应用额外的深色模式类
    useEffect(() => {
      // 启用深色模式检测
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === 'attributes' &&
            mutation.attributeName === 'class'
          ) {
            const isDarkMode =
              document.documentElement.classList.contains('dark');
            const formElements = document.querySelectorAll(
              '.ui.form .field label'
            );

            formElements.forEach((el) => {
              if (isDarkMode) {
                el.classList.add('dark-mode-label');
              } else {
                el.classList.remove('dark-mode-label');
              }
            });
          }
        });
      });

      observer.observe(document.documentElement, { attributes: true });

      return () => {
        observer.disconnect();
      };
    }, []);

    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent
          side="right"
          className="flex w-[600px] flex-col dark:border-sidebar-border dark:bg-sidebar dark:text-white sm:w-[800px]"
        >
          <SheetHeader>
            <SheetTitle className="font-bold dark:text-white">
              {nodeData.human_friendly_block_name}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto">
            <div className="form-container dark:text-white">
              <Form
                schema={newSchema}
                uiSchema={uiSchema}
                validator={validator}
                formData={filteredFormData}
                onChange={handleFormChange}
                fields={customFields}
                className="form-dark-mode"
              />
            </div>
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
