import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link1Icon } from '@radix-ui/react-icons';

interface KindFieldProps {
  schema: any;
  formData: string;
  onChange: (value: string) => void;
  availableKindValues: Record<string, string[]>;
}

const KindField: React.FC<KindFieldProps> = ({
  schema,
  formData,
  onChange,
  availableKindValues
}) => {
  const [isKindMode, setIsKindMode] = useState(false);
  const [inputValue, setInputValue] = useState(formData || '');

  const hasKindOption = schema.anyOf?.some((item: any) => item.kind);

  const kindOptions = schema.anyOf?.flatMap((item: any) => {
    const kindName = item.kind?.[0]?.name;
    return availableKindValues[kindName] || [];
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

  return (
    <div className="space-y-2">
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
            value={inputValue}
            onChange={handleInputChange}
            className="w-full"
            placeholder="Enter a value"
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
