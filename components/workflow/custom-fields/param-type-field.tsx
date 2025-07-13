import React, { useState, useEffect } from 'react';
import { FieldProps } from '@rjsf/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AnnotationDialogField from './annotation-dialog-field';

interface ParamTypeFieldProps extends FieldProps {
  onChange: (value: any) => void;
  formData: any;
  name: string;
  required: boolean;
}

const TYPE_OPTIONS = [
  { value: 'string', label: '字符串' },
  { value: 'number', label: '数值' },
  { value: 'boolean', label: '布尔值' },
  { value: 'dict', label: 'JSON对象' },
  { value: 'list_of_values', label: '画布' }
];

const getDefaultValueForType = (type: string) => {
  switch (type) {
    case 'string':
      return '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'dict':
      return {};
    case 'list_of_values':
      return [];
    default:
      return '';
  }
};

const ParamTypeField: React.FC<ParamTypeFieldProps> = (props) => {
  const { onChange, formData } = props;

  // 确保初始状态使用formData中的值，如果没有则使用默认值
  const initialType = formData?.type || 'string';
  const initialValue = formData?.value ?? getDefaultValueForType(initialType);

  const [type, setType] = useState(initialType);
  const [value, setValue] = useState(initialValue);

  // 当formData发生变化时更新本地状态
  useEffect(() => {
    if (formData) {
      const newType = formData.type || 'string';
      setType(newType);
      // 如果formData中有值就用formData中的值，否则用对应类型的默认值
      setValue(formData.value ?? getDefaultValueForType(newType));
    }
  }, [formData]);

  const handleTypeChange = (newType: string) => {
    setType(newType);
    // 当类型改变时，设置新类型对应的默认值
    const defaultValue = getDefaultValueForType(newType);
    setValue(defaultValue);
    // 更新表单数据
    onChange({
      type: newType,
      value: defaultValue,
      name: formData?.name || '' // 保持原有的name值
    });
  };

  const handleValueChange = (newValue: any) => {
    let processedValue = newValue;

    // 根据类型处理值
    if (type === 'number') {
      processedValue = parseFloat(newValue) || 0;
    } else if (type === 'boolean') {
      processedValue = Boolean(newValue);
    } else if (type === 'dict') {
      try {
        if (typeof newValue === 'string') {
          processedValue = JSON.parse(newValue);
        }
      } catch {
        // 如果解析失败，保持原值
        processedValue = newValue;
      }
    }

    setValue(processedValue);
    // 更新表单数据
    onChange({
      type,
      value: processedValue,
      name: formData?.name || '' // 保持原有的name值
    });
  };

  const handleNameChange = (newName: string) => {
    onChange({
      type,
      value,
      name: newName
    });
  };

  const renderValueInput = () => {
    switch (type) {
      case 'string':
        return (
          <Input
            value={value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            className="dark:border-gray-400 dark:bg-white dark:text-gray-900"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value || 0}
            onChange={(e) => handleValueChange(e.target.value)}
            className="dark:border-gray-400 dark:bg-white dark:text-gray-900"
            placeholder="请输入数值（支持小数）"
          />
        );
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch checked={!!value} onCheckedChange={handleValueChange} />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {value ? '是' : '否'}
            </span>
          </div>
        );
      case 'dict':
        return (
          <Textarea
            value={
              typeof value === 'object'
                ? JSON.stringify(value, null, 2)
                : value || '{}'
            }
            onChange={(e) => handleValueChange(e.target.value)}
            className="min-h-[100px] font-mono dark:border-gray-400 dark:bg-white dark:text-gray-900"
          />
        );
      case 'list_of_values':
        return (
          <AnnotationDialogField
            formData={value}
            onChange={handleValueChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium dark:text-white">参数名称</Label>
        <Input
          value={formData?.name || ''}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="请输入参数名称"
          className="dark:border-gray-400 dark:bg-white dark:text-gray-900"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium dark:text-white">参数类型</Label>
        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger className="dark:border-gray-400 dark:bg-white dark:text-gray-900">
            <SelectValue placeholder="选择参数类型" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium dark:text-white">参数值</Label>
        {renderValueInput()}
      </div>
    </div>
  );
};

export default ParamTypeField;
