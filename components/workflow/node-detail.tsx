import React, { useCallback, useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { withTheme } from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { Theme as shadcnTheme } from '@rjsf/shadcn';
import { JSONSchema7 } from 'json-schema';

import {
  NodeData,
  PropertyDefinition,
  skipFormFields
} from '@/constants/block';

import KindField from './custom-fields/kind-field';
import AnyOfKindField from './custom-fields/anyof-kind-field';
import ModelSelectorField, {
  isRoboflowModelField
} from './custom-fields/model-selector-field';
import ParamTypeField from './custom-fields/param-type-field';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';
import { FieldTemplateProps, ObjectFieldTemplateProps } from '@rjsf/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';

interface ExtendedJSONSchema7 extends JSONSchema7 {
  'x-internal-type'?: string;
  'x-field-type'?: string;
}

const Form = withTheme(shadcnTheme);

interface NodeDetailProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: NodeData;
  onFormChange: (formData: any) => void;
  availableKindValues: Record<string, PropertyDefinition[]>;
  onDeleteNode: () => void;
}

const CustomFieldTemplate = (props: FieldTemplateProps) => {
  const {
    id,
    children,
    classNames,
    style,
    displayLabel,
    hidden,
    label,
    required,
    rawErrors = [],
    errors,
    help,
    rawDescription,
    schema
  } = props;

  if (hidden) {
    return <div style={{ display: 'none' }}>{children}</div>;
  }

  return (
    <div className={`${classNames} mb-4`} style={style}>
      {displayLabel && (label || schema.title) && (
        <div className="mb-2 flex items-center">
          <Label
            htmlFor={id}
            className={rawErrors.length > 0 ? 'text-destructive' : ''}
          >
            {label || schema.title}
            {required && <span className="text-destructive"> *</span>}
          </Label>
          {rawDescription && (
            <TooltipProvider>
              <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="ml-2"
                    onClick={(e) => e.preventDefault()}
                  >
                    <InfoIcon className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm border-gray-300 bg-gray-50 text-gray-900 dark:border-sidebar-border dark:bg-sidebar-accent dark:text-white">
                  <p>{rawDescription}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
      {children}
      {errors}
      {help}
    </div>
  );
};

const CustomObjectFieldTemplate = (
  props: ObjectFieldTemplateProps & {
    nodeData?: NodeData;
    /** 来自父组件的初始展开状态 */
    initialOpen?: boolean;
    /** 当展开状态变化时回调给父组件 */
    onOpenChangeExternal?: (open: boolean) => void;
  }
) => {
  const {
    properties,
    schema,
    nodeData,
    initialOpen = false,
    onOpenChangeExternal
  } = props;

  const [isOpen, setIsOpen] = useState<boolean>(initialOpen);

  // 当外部状态发生变化时，同步内部状态
  useEffect(() => {
    setIsOpen(initialOpen);
  }, [initialOpen]);

  // 统一处理展开状态的更改
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChangeExternal?.(open);
    },
    [onOpenChangeExternal]
  );

  const requiredFieldsList = schema.required || [];

  const requiredFields = properties.filter((prop) =>
    requiredFieldsList.includes(prop.name)
  );
  const optionalFields = properties.filter(
    (prop) => !requiredFieldsList.includes(prop.name)
  );

  // 如果是 input 或 output 节点，直接显示所有字段，不使用高级选项
  const isInputOrOutput =
    nodeData?.manifest_type_identifier === 'input' ||
    nodeData?.manifest_type_identifier === 'output';

  if (isInputOrOutput) {
    return <div>{properties.map((prop) => prop.content)}</div>;
  }

  return (
    <div>
      {requiredFields.map((prop) => prop.content)}

      {optionalFields.length > 0 && (
        <Collapsible
          open={isOpen}
          onOpenChange={handleOpenChange}
          className="mt-4"
        >
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <ChevronRight
                className={`mr-1 h-4 w-4 transition-transform duration-200 ${
                  isOpen ? 'rotate-90' : ''
                }`}
              />
              高级选项
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-4 border-l-2 border-gray-200 pl-4 dark:border-gray-700">
            {optionalFields.map((prop) => prop.content)}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

const NodeDetail: React.FC<NodeDetailProps> = ({
  isOpen,
  onClose,
  nodeData,
  onFormChange,
  availableKindValues,
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
            />
          );
        }

        return (
          <AnyOfKindField
            {...props}
            availableKindValues={availableKindValues}
            nodeData={nodeData}
          />
        );
      },
      [availableKindValues, nodeData]
    ),
    KindField: React.useCallback(
      (props: any) => {
        return (
          <KindField
            {...props}
            nodeData={nodeData}
            availableKindValues={availableKindValues}
          />
        );
      },
      [availableKindValues, nodeData]
    ),
    ParamTypeField: React.useCallback((props: any) => {
      return <ParamTypeField {...props} />;
    }, [])
  };

  // ----------------- 记录各 ObjectField 折叠状态 -----------------
  const [collapsibleState, setCollapsibleState] = useState<
    Record<string, boolean>
  >({});

  const handleCollapsibleChange = useCallback((id: string, open: boolean) => {
    setCollapsibleState((prev) => ({ ...prev, [id]: open }));
  }, []);

  // 包装 ObjectFieldTemplate，注入受控展开状态
  const ObjectFieldTemplateWrapper = useCallback(
    (props: ObjectFieldTemplateProps) => {
      const collapsibleId =
        (props.idSchema as any)?.$id ||
        (props.idSchema as any)?.id ||
        (props.idSchema as any)?.__id ||
        '';

      const isOpen = collapsibleState[collapsibleId] ?? false;

      return (
        <CustomObjectFieldTemplate
          {...props}
          nodeData={nodeData}
          initialOpen={isOpen}
          onOpenChangeExternal={(open) =>
            handleCollapsibleChange(collapsibleId, open)
          }
        />
      );
    },
    [collapsibleState, nodeData, handleCollapsibleChange]
  );

  const newSchema = {
    ...nodeData.block_schema,
    properties: Object.entries(nodeData.block_schema.properties || {}).reduce(
      (acc, [key, value]) => {
        if (skipFormFields.includes(key)) {
          return acc;
        }

        const schemaValue =
          typeof value === 'object' && value !== null ? (value as any) : null;
        const title = schemaValue
          ? schemaValue.cn_title || schemaValue.title || key
          : key;
        const description = schemaValue
          ? schemaValue.cn_description || schemaValue.description
          : undefined;

        if (typeof value === 'object' && value !== null && 'anyOf' in value) {
          const isRoboflowModel = isRoboflowModelField(value);
          acc[key] = {
            ...value,
            'x-internal-type': 'anyOf-field',
            'x-field-type': isRoboflowModel ? 'roboflow-model' : undefined,
            title,
            description
          };
        } else {
          acc[key] =
            typeof value === 'object' && value !== null
              ? { ...value, title, description }
              : value;
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
    // 隐藏 type 字段但保留在表单数据中
    type: {
      'ui:widget': 'hidden'
    },
    // name 字段置灰（只读）
    name: {
      'ui:readonly': true
    },
    'ui:submitButtonOptions': {
      norender: true
    },
    'ui:title': '',
    'ui:classNames': 'form-dark-mode',
    ...(nodeData.manifest_type_identifier === 'input'
      ? {
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
          },
          params: {
            'ui:options': {
              addable: true,
              orderable: true,
              removable: true
            },
            items: {
              'ui:field': 'ParamTypeField'
            }
          }
        }
      : {})
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
              templates={{
                FieldTemplate: CustomFieldTemplate,
                ObjectFieldTemplate: ObjectFieldTemplateWrapper
              }}
              className="form-dark-mode"
            />
          </div>
          {nodeData.block_schema.block_type !== 'buildin' &&
            nodeData.manifest_type_identifier !== 'input' &&
            nodeData.manifest_type_identifier !== 'output' && (
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
};

export default NodeDetail;
