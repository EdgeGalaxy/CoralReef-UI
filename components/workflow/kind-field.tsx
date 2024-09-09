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

import { buildInNodes } from '@/constants/init-data';
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
    uiSchema = {}
  } = props;
  const originalSchema = uiSchema['ui:options']?.originalSchema as RJSFSchema;

  const [isKindMode, setIsKindMode] = useState(false);
  const [inputValue, setInputValue] = useState(formData || '');

  const hasKindOption = originalSchema.anyOf?.some((item: any) => item.kind);

  const kindOptions = originalSchema.anyOf?.flatMap((item: any) => {
    if (item.kind && Array.isArray(item.kind)) {
      const currentNodeName = nodeData.formData.name;

      const _kindOptions = item.kind.flatMap((kindItem: Kind) => {
        const relevantConnections = kindsConnections[kindItem.name] || [];
        // FIXME: 特殊处理, 当 selected_element 为 workflow_param 时, 使用 string 作为 kindName
        const kindName =
          item.selected_element === 'workflow_parameter'
            ? 'string'
            : kindItem.name;
        const availableKinds = availableKindValues[kindName] || [];

        const sameElementKinds = availableKinds.filter(
          (prop: PropertyDefinition) =>
            prop.compatible_element === item.selected_element &&
            !prop.property_name.startsWith(`$output.${currentNodeName}.`)
        );
        const sameKindsConnections = relevantConnections.filter(
          (prop: PropertyDefinition) =>
            prop.compatible_element === item.selected_element
        );
        // 取 sameKindsConnections 和 sameElementKinds 的交集, 当prop.manifest_type_identifier 与 buildInNodes 的 manifest_type_identifier 相同时 或者 与 sameElementKinds 的 manifest_type_identifier 相同
        const intersection = sameElementKinds.filter(
          (prop: PropertyDefinition) =>
            buildInNodes.some(
              (node: Node) =>
                node.data.manifest_type_identifier ===
                prop.manifest_type_identifier
            ) ||
            sameKindsConnections.some(
              (kind: PropertyDefinition) =>
                kind.manifest_type_identifier === prop.manifest_type_identifier
            )
        );
        // const intersection = sameElementKinds.filter((prop: PropertyDefinition) => (buildInNodes.some((node: Node) => node.data.manifest_type_identifier === prop.manifest_type_identifier) || sameKindsConnections.some((kind: PropertyDefinition) => kind.manifest_type_identifier === prop.manifest_type_identifier)))
        return intersection.map(
          (prop: PropertyDefinition) => prop.property_name
        );
      });
      return _kindOptions;
    }
    return [];
  });

  useEffect(() => {
    setInputValue(formData || '');
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleSelectChange = (selectedValue: string) => {
    setInputValue(selectedValue);
    onChange(selectedValue);
  };

  const toggleKindMode = () => {
    setIsKindMode(!isKindMode);
    setInputValue('');
    onChange('');
  };

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
            {originalSchema.title || props.name}
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
            className="w-full"
            placeholder="Enter a value"
            required={isRequired}
          />
        )}
        {hasKindOption && (
          <Button variant="ghost" size="icon" onClick={toggleKindMode}>
            <Link1Icon className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default KindField;
