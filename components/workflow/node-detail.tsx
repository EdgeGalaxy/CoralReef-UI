import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { RJSFSchema } from '@rjsf/utils';
import { withTheme } from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { Theme as SemanticUITheme } from '@rjsf/semantic-ui';
import 'semantic-ui-css/semantic.min.css';

import { NodeData } from './nodes-selector';

const Form = withTheme(SemanticUITheme);

interface NodeDetailProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: NodeData;
}

const NodeDetail: React.FC<NodeDetailProps> = ({
  isOpen,
  onClose,
  nodeData
}) => {
  const schema: RJSFSchema = {
    title: nodeData.name,
    type: 'object',
    properties: nodeData.properties,
    required: nodeData.required
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="flex w-[400px] flex-col sm:w-[540px]"
      >
        <SheetHeader>
          <SheetTitle>{nodeData.name} 详细信息</SheetTitle>
        </SheetHeader>
        <div className="flex-grow overflow-y-auto">
          <Form schema={schema} validator={validator} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NodeDetail;
