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
import { NodeData, PropertyDefinition, Kind } from '@/constants/block';

interface KindFieldProps extends FieldProps {
  nodeData: NodeData;
  availableKindValues: Record<string, PropertyDefinition[]>;
}

const AnyOfKindField: React.FC<KindFieldProps> = (props) => {
  const {
    onChange,
    nodeData,
    formData,
    availableKindValues,
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
    if (formData && typeof formData === 'string' && formData.includes('$')) {
      setIsKindMode(true);
    }
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    if (inputValue !== formData) {
      onChange(inputValue);
    }
  };

  const handleSelectChange = (selectedValue: string) => {
    setInputValue(selectedValue);
    onChange(selectedValue);
  };

  const hasKindOption = (originalSchema || schema)?.anyOf?.some(
    (item: any) => item.kind
  );

  const defaultKindOptions = useMemo(() => {
    return [
      ...(availableKindValues['string'] || []).map(
        (item: PropertyDefinition) => item.property_name
      ),
      ...(availableKindValues['number'] || []).map(
        (item: PropertyDefinition) => item.property_name
      ),
      ...(availableKindValues['boolean'] || []).map(
        (item: PropertyDefinition) => item.property_name
      ),
      ...(availableKindValues['dict'] || []).map(
        (item: PropertyDefinition) => item.property_name
      )
    ];
  }, [availableKindValues]);

  const kindOptions = useMemo(() => {
    if (
      nodeData.manifest_type_identifier ===
      outputNode.data.manifest_type_identifier
    ) {
      return Object.values(availableKindValues)
        .flat()
        .map((item: PropertyDefinition) => item.property_name);
    }
    return (
      (originalSchema || schema)?.anyOf?.flatMap((item: any) => {
        if (item.kind && Array.isArray(item.kind)) {
          const currentNodeName = nodeData.formData.name;
          const manifestTypeIdntifier = nodeData.manifest_type_identifier;

          const _kindOptions = item.kind.flatMap((kindItem: Kind) => {
            const kindName = kindItem.name;
            const availableKinds = availableKindValues[kindName] || [];

            const intersection = availableKinds.filter(
              (prop: PropertyDefinition) =>
                prop.manifest_type_identifier !== manifestTypeIdntifier &&
                !prop.property_name.startsWith(`$output.${currentNodeName}.`)
            );
            return intersection.map(
              (prop: PropertyDefinition) => prop.property_name
            );
          });
          return [...defaultKindOptions, ..._kindOptions];
        }
        return [];
      }) || []
    );
  }, [schema, nodeData, availableKindValues, originalSchema]);

  const hasAvailableKindOptions = useMemo(() => {
    console.log('has', kindOptions);
    return kindOptions && kindOptions.length > 0;
  }, [kindOptions]);

  const toggleKindMode = () => {
    if (!isKindMode && (!kindOptions || kindOptions.length === 0)) {
      return;
    }

    const newKindMode = !isKindMode;
    setIsKindMode(newKindMode);

    setInputValue('');

    if (newKindMode && kindOptions && kindOptions.length > 0) {
      const newValue = kindOptions[0];
      setInputValue(newValue);
      onChange(newValue);
    } else {
      onChange('');
    }
  };

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
        {isKindMode ? (
          <Select
            onValueChange={handleSelectChange}
            value={inputValue}
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
          <Input
            id={props.id}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-full dark:border-gray-400 dark:bg-white dark:text-gray-900 dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:ring-2 dark:focus:ring-blue-400 dark:focus:ring-opacity-20"
            placeholder="输入一个值"
            required={isRequired}
          />
        )}
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
            disabled={isKindMode && !hasAvailableKindOptions}
            title={isKindMode ? '切换到直接输入模式' : '切换到引用模式'}
          >
            <Link1Icon className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isKindMode && !hasAvailableKindOptions && (
        <p className="mt-1 text-xs text-orange-500 dark:text-orange-300">
          当前节点没有可用的引用值。请先配置其他节点或切换到直接输入模式。
        </p>
      )}
    </div>
  );
};

export default AnyOfKindField;
