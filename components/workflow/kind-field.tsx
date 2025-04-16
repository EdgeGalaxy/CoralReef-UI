import React, { useState, useEffect, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { FieldProps, RJSFSchema } from '@rjsf/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link1Icon } from '@radix-ui/react-icons';
import { Label } from '@/components/ui/label';

import { outputNode } from '@/constants/init-data';
import {
  NodeData,
  PropertyDefinition,
  KindsConnections,
  Kind
} from '@/constants/block';

interface KindFieldProps extends FieldProps {
  nodeData: NodeData;
  availableKindValues: Record<string, PropertyDefinition[]>;
  kindsConnections: KindsConnections;
}

const KindField: React.FC<KindFieldProps> = (props) => {
  const {
    onChange,
    nodeData,
    formData,
    availableKindValues,
    kindsConnections,
    uiSchema = {},
    schema
  } = props;
  const originalSchema = uiSchema['ui:options']?.originalSchema as RJSFSchema;

  const handleSelectChange = (selectedValue: string) => {
    onChange(selectedValue);
  };

  const kindOptions = useMemo(() => {
    if (
      nodeData.manifest_type_identifier ===
      outputNode.data.manifest_type_identifier
    ) {
      return Object.values(availableKindValues)
        .flat()
        .map((item: PropertyDefinition) => item.property_name);
    }

    const schemaToUse = originalSchema || schema;
    if (!schemaToUse) {
      return [];
    }
    // 处理 kind 字段
    if (schemaToUse.kind && Array.isArray(schemaToUse.kind)) {
      const currentNodeName = nodeData.formData.name;
      return schemaToUse.kind.flatMap((kindItem: Kind) => {
        const kindName =
          schemaToUse.selected_element === 'workflow_parameter'
            ? 'string'
            : kindItem.name;
        const availableKinds = availableKindValues[kindName] || [];

        return availableKinds
          .filter(
            (prop: PropertyDefinition) =>
              prop.compatible_element === schemaToUse.selected_element &&
              !prop.property_name.startsWith(`$output.${currentNodeName}.`)
          )
          .map((prop: PropertyDefinition) => prop.property_name);
      });
    }

    return [];
  }, [schema, nodeData, kindsConnections, availableKindValues, originalSchema]);

  const hasAvailableKindOptions = useMemo(() => {
    return kindOptions && kindOptions.length > 0;
  }, [kindOptions]);

  const isRequired = useMemo(() => {
    return Array.isArray(nodeData.block_schema.required)
      ? nodeData.block_schema.required.includes(props.name)
      : !!nodeData.block_schema.required;
  }, [nodeData.block_schema.required, props.name]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={props.id}
          className="text-sm font-medium dark:text-white"
        >
          <span className="font-bold">
            {originalSchema?.title || props.name}
          </span>
          {isRequired && (
            <span className="ml-1 text-red-500 dark:text-red-400">*</span>
          )}
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Select
          onValueChange={handleSelectChange}
          disabled={!hasAvailableKindOptions}
          defaultValue={hasAvailableKindOptions ? kindOptions[0] : undefined}
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
      </div>
    </div>
  );
};

export default KindField;
