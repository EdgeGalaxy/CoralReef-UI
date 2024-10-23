'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';

interface EditableFieldProps {
  value: string;
  label: string;
  onUpdate: (newValue: string) => Promise<void>;
}

export function EditableField({ value, label, onUpdate }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = async () => {
    setIsEditing(false);
    if (currentValue !== value) {
      try {
        await onUpdate(currentValue);
      } catch (error) {
        console.error('Failed to update value:', error);
        setCurrentValue(value);
      }
    }
  };

  return (
    <div className="flex flex-col">
      <span className="text-sm text-muted-foreground">{label}</span>
      {isEditing ? (
        <Input
          ref={inputRef}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
          className="w-3/4 font-medium"
        />
      ) : (
        <div className="flex items-center">
          <span className="mr-2 font-medium">{currentValue}</span>
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Icons.editable className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
