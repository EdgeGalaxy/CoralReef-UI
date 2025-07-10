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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { outputNode } from '@/constants/init-data';
import { NodeData, PropertyDefinition, Kind } from '@/constants/block';

interface KindFieldProps extends FieldProps {
  nodeData: NodeData;
  availableKindValues: Record<string, PropertyDefinition[]>;
}

// 使用纯 onBlur 策略，确保输入流畅不卡顿
const AnyOfKindField: React.FC<KindFieldProps> = (props) => {
  const {
    name,
    onChange,
    nodeData,
    formData,
    availableKindValues,
    uiSchema = {},
    schema,
    ...restProps
  } = props;
  const originalSchema = uiSchema['ui:options']?.originalSchema as RJSFSchema;

  const allKindOptions = (originalSchema || schema)?.anyOf?.every(
    (item: any) => item.kind
  );
  const property = nodeData.block_schema.properties?.[name];
  const defaultInputValue =
    typeof property === 'object' && 'default' in property
      ? property.default
      : '';
  const [isKindMode, setIsKindMode] = useState(allKindOptions);
  const [inputValue, setInputValue] = useState(formData || '');

  useEffect(() => {
    setInputValue(formData || '');
    if (formData && typeof formData === 'string' && formData.includes('$')) {
      setIsKindMode(true);
    }
  }, [formData]);

  const { inputType, inputSchema } = useMemo(() => {
    const anyOfSchema = (originalSchema || schema)?.anyOf;
    if (Array.isArray(anyOfSchema)) {
      const nonKindItem = anyOfSchema.find((item: any) => !item.kind);
      if (nonKindItem && typeof nonKindItem === 'object') {
        return {
          inputType: 'type' in nonKindItem ? nonKindItem.type : 'string',
          inputSchema: nonKindItem
        };
      }
    }
    return { inputType: 'string', inputSchema: { type: 'string' } };
  }, [originalSchema, schema]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // 不立即触发 onChange，等待 blur 事件
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // 只有值真正改变时才触发 onChange
    if (newValue !== formData) {
      onChange(newValue);
    }
  };

  const handleSelectChange = (selectedValue: string) => {
    setInputValue(selectedValue);
    // Select 选择时立即触发，因为是明确的用户操作
    onChange(selectedValue);
  };

  // 处理不同类型字段的值变化 - 仅更新本地状态
  const handleTypedFieldChange = (value: any) => {
    setInputValue(value);
    // 不立即触发 onChange，等待 blur 事件
  };

  // 处理字段失焦时的最终更新
  const handleTypedFieldBlur = (value: any) => {
    // 只有值真正改变时才触发 onChange
    if (value !== formData) {
      onChange(value);
    }
  };

  // 处理文本域变化 - 仅更新本地状态
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // 不立即触发 onChange，等待 blur 事件
  };

  // 处理文本域失焦
  const handleTextareaBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    if (inputType === 'array') {
      try {
        const parsedValue = JSON.parse(newValue);
        if (Array.isArray(parsedValue)) {
          handleTypedFieldBlur(parsedValue);
          return;
        }
      } catch {
        // 解析失败，回退到字符串
      }
      handleTypedFieldBlur(newValue);
    } else if (inputType === 'object') {
      try {
        const parsedValue = JSON.parse(newValue);
        if (typeof parsedValue === 'object' && parsedValue !== null) {
          handleTypedFieldBlur(parsedValue);
          return;
        }
      } catch {
        // 解析失败，回退到字符串
      }
      handleTypedFieldBlur(newValue);
    } else {
      handleTypedFieldBlur(newValue);
    }
  };

  // 处理Switch组件的变化（特殊处理，因为没有blur事件）
  const handleSwitchChange = (checked: boolean) => {
    setInputValue(checked);
    onChange(checked); // Switch立即更新，因为是明确的用户操作
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
      return Array.from(
        new Set(
          Object.values(availableKindValues)
            .flat()
            .map((item: PropertyDefinition) => item.property_name)
        )
      );
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

  // 根据类型渲染对应的字段组件
  const renderTypedField = () => {
    const commonClassName =
      'w-full dark:border-gray-400 dark:bg-white dark:text-gray-900 dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:ring-2 dark:focus:ring-blue-400 dark:focus:ring-opacity-20';

    switch (inputType) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={!!inputValue}
              onCheckedChange={handleSwitchChange}
              className="dark:bg-gray-200"
            />
            <Label className="text-sm text-gray-600 dark:text-gray-300">
              {inputValue ? '是' : '否'}
            </Label>
          </div>
        );

      case 'number':
      case 'integer':
        return (
          <Input
            id={props.id}
            value={inputValue || ''}
            type="number"
            step={inputType === 'integer' ? 1 : 0.01}
            onChange={(e) => {
              const value = e.target.value;
              setInputValue(value);
              // 不立即触发 onChange，等待 blur 事件
            }}
            onBlur={(e) => {
              const value = e.target.value;
              const numValue =
                inputType === 'integer' ? parseInt(value) : parseFloat(value);
              if (!isNaN(numValue)) {
                handleTypedFieldBlur(numValue);
              } else {
                handleTypedFieldBlur(value); // 保持原始输入，让验证处理
              }
            }}
            className={commonClassName}
            placeholder={
              defaultInputValue ? `${defaultInputValue}` : '输入数值'
            }
            required={isRequired}
            min={
              typeof inputSchema === 'object' && 'minimum' in inputSchema
                ? inputSchema.minimum
                : undefined
            }
            max={
              typeof inputSchema === 'object' && 'maximum' in inputSchema
                ? inputSchema.maximum
                : undefined
            }
          />
        );

      case 'array':
        const arrayDisplayValue = Array.isArray(inputValue)
          ? JSON.stringify(inputValue, null, 2)
          : typeof inputValue === 'string'
          ? inputValue
          : '[]';

        return (
          <div className="space-y-1">
            <Textarea
              id={props.id}
              value={arrayDisplayValue}
              onChange={handleTextareaChange}
              onBlur={handleTextareaBlur}
              className={`${commonClassName} min-h-[80px] font-mono`}
              placeholder={
                defaultInputValue
                  ? JSON.stringify(defaultInputValue, null, 2)
                  : '[\n  "item1",\n  "item2"\n]'
              }
              required={isRequired}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              输入有效的 JSON 数组格式
            </p>
          </div>
        );

      case 'object':
        const objectDisplayValue =
          typeof inputValue === 'object' && inputValue !== null
            ? JSON.stringify(inputValue, null, 2)
            : typeof inputValue === 'string'
            ? inputValue
            : '{}';

        return (
          <div className="space-y-1">
            <Textarea
              id={props.id}
              value={objectDisplayValue}
              onChange={handleTextareaChange}
              onBlur={handleTextareaBlur}
              className={`${commonClassName} min-h-[100px] font-mono`}
              placeholder={
                defaultInputValue
                  ? JSON.stringify(defaultInputValue, null, 2)
                  : '{\n  "key": "value"\n}'
              }
              required={isRequired}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              输入有效的 JSON 对象格式
            </p>
          </div>
        );

      case 'string':
      default:
        return (
          <Input
            id={props.id}
            value={inputValue || ''}
            type="text"
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={commonClassName}
            placeholder={
              defaultInputValue ? `${defaultInputValue}` : '输入一个值'
            }
            required={isRequired}
            maxLength={
              typeof inputSchema === 'object' && 'maxLength' in inputSchema
                ? inputSchema.maxLength
                : undefined
            }
            minLength={
              typeof inputSchema === 'object' && 'minLength' in inputSchema
                ? inputSchema.minLength
                : undefined
            }
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1">
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
            renderTypedField()
          )}
        </div>
        {hasKindOption && !allKindOptions && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleKindMode}
            className={`flex-shrink-0 transition-colors ${
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
