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

import {
  NodeData,
  PropertyDefinition,
  KindsConnections,
  skipFormFields
} from '@/constants/block';

import KindField from './kind-field';
import { Button } from '@/components/ui/button'; // Add this import

const Form = withTheme(SemanticUITheme);

interface NodeDetailProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: NodeData;
  onFormChange: (formData: any) => void;
  availableKindValues: Record<string, PropertyDefinition[]>;
  kindsConnections: KindsConnections;
  onDeleteNode: () => void; // Add this new prop
}

const NodeDetail: React.FC<NodeDetailProps> = React.memo(
  ({
    isOpen,
    onClose,
    nodeData,
    onFormChange,
    availableKindValues,
    kindsConnections,
    onDeleteNode // Add this new prop
  }) => {
    const customFields = {
      AnyOfField: React.useCallback(
        (props: any) => (
          <KindField
            {...props}
            availableKindValues={availableKindValues}
            nodeData={nodeData}
            kindsConnections={kindsConnections}
          />
        ),
        [availableKindValues, nodeData, kindsConnections]
      )
    };

    // 创建一个新的 schema，移除重复的 anyOf 字段
    const newSchema = {
      ...nodeData.block_schema,
      properties: Object.entries(nodeData.block_schema.properties || {}).reduce(
        (acc, [key, value]) => {
          // TODO: 指定字段特殊赋值
          if (skipFormFields.includes(key)) {
            return acc; // Skip fields in skipFormFields
          }
          if (typeof value === 'object' && value !== null && 'anyOf' in value) {
            acc[key] = {
              type: 'string',
              title: value.title || key
            };
          } else if (
            typeof value === 'object' &&
            value !== null &&
            key === 'name'
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

    const uiSchema = Object.keys(nodeData.block_schema.properties || {}).reduce(
      (acc, key) => {
        const property = nodeData.block_schema.properties?.[key];
        if (
          typeof property === 'object' &&
          property !== null &&
          'anyOf' in property
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
      {
        // Add this configuration to hide the submit button
        'ui:submitButtonOptions': {
          norender: true
        }
      } as Record<string, any>
    );

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
            <SheetTitle>
              {nodeData.human_friendly_block_name} 详细信息
            </SheetTitle>
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
