import React, { useState, useEffect, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Node } from 'reactflow';

import { FieldProps, RJSFSchema } from '@rjsf/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link1Icon } from '@radix-ui/react-icons';
import { Label } from '@/components/ui/label';

import { buildInNodes, outputNode } from '@/constants/init-data';
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

  const allKindOptions = (originalSchema || schema)?.anyOf?.every(
    (item: any) => item.kind
  );
  const [isKindMode, setIsKindMode] = useState(allKindOptions);
  const [inputValue, setInputValue] = useState(formData || '');

  useEffect(() => {
    setInputValue(formData || '');
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    onChange(inputValue);
  };

  const handleSelectChange = (selectedValue: string) => {
    setInputValue(selectedValue);
    onChange(selectedValue);
  };

  const toggleKindMode = () => {
    setIsKindMode(!isKindMode);
  };

  const hasKindOption = (originalSchema || schema)?.anyOf?.some(
    (item: any) => item.kind
  );

  const kindOptions = useMemo(() => {
    // TODO: 特殊处理，当节点为output时，直接取所有的availableKindValues的值中的property_name
    if (
      nodeData.manifest_type_identifier ===
      outputNode.data.manifest_type_identifier
    ) {
      return Object.values(availableKindValues)
        .flat()
        .map((item: PropertyDefinition) => item.property_name);
    }
    return (originalSchema || schema)?.anyOf?.flatMap((item: any) => {
      if (item.kind && Array.isArray(item.kind)) {
        const currentNodeName = nodeData.formData.name;

        const _kindOptions = item.kind.flatMap((kindItem: Kind) => {
          // TODO: 特殊处理, 当 selected_element 为 workflow_param 时, 使用 string 作为 kindName
          const kindName =
            item.selected_element === 'workflow_parameter'
              ? 'string'
              : kindItem.name;
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
    });
  }, [schema, nodeData, kindsConnections, availableKindValues]);

  const isRequired = useMemo(() => {
    return Array.isArray(nodeData.block_schema.required)
      ? nodeData.block_schema.required.includes(props.name)
      : !!nodeData.block_schema.required;
  }, [nodeData.block_schema.required, props.name]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={props.id} className="text-sm font-medium">
          <span className="font-bold">
            {originalSchema?.title || props.name}
          </span>
          {isRequired && <span className="ml-1 text-red-500">*</span>}
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        {isKindMode ? (
          <Select onValueChange={handleSelectChange} value={inputValue}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a kind" />
            </SelectTrigger>
            <SelectContent>
              {kindOptions?.map((val: string) => (
                <SelectItem key={val} value={val}>
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={props.id}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-full"
            placeholder="Enter a value"
            required={isRequired}
          />
        )}
        {hasKindOption && !allKindOptions && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleKindMode}
            className={isKindMode ? 'text-green-500' : 'text-gray-500'}
            disabled={kindOptions?.length === 0}
          >
            <Link1Icon className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default KindField;
