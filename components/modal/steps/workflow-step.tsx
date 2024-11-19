import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Workflow } from '@/constants/deploy';
import { Input } from '@/components/ui/input';

interface WorkflowParameter {
  type: 'WorkflowImage' | 'WorkflowParameter';
  name: string;
  default_value?: string;
}

interface WorkflowStepSelectedItemProps {
  selectedItem: Workflow;
  handleRemoveItem: () => void;
  onParameterChange?: (name: string, value: string) => void;
}

export const WorkflowStepSelectedItem: React.FC<
  WorkflowStepSelectedItemProps
> = ({ selectedItem, handleRemoveItem, onParameterChange }) => {
  const parameters: WorkflowParameter[] =
    selectedItem.specification?.inputs || [];

  return (
    <Card className="relative mt-4">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2"
        onClick={() => handleRemoveItem()}
      >
        <X className="h-4 w-4" />
      </Button>
      <CardHeader>
        <CardTitle>{selectedItem.name}</CardTitle>
        <CardDescription className="space-y-1">
          {selectedItem.description && <p>{selectedItem.description}</p>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {parameters.map((param) => (
            <div key={param.name} className="space-y-2">
              {param.type === 'WorkflowParameter' && (
                <Input
                  placeholder={`输入 ${param.name}`}
                  defaultValue={param.default_value}
                  onChange={(e) =>
                    onParameterChange?.(param.name, e.target.value)
                  }
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
