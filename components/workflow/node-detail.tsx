import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { withTheme } from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { Theme as SemanticUITheme } from '@rjsf/semantic-ui';
import 'semantic-ui-css/semantic.min.css';

import { BlockDescription } from '@/constants/block';

export type NodeData = BlockDescription & {
  label: string;
  formData: Record<string, any>;
};

const Form = withTheme(SemanticUITheme);

interface NodeDetailProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: NodeData;
  onFormChange: (formData: any) => void;
}

const NodeDetail: React.FC<NodeDetailProps> = ({
  isOpen,
  onClose,
  nodeData,
  onFormChange
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="flex w-[600px] flex-col sm:w-[800px]"
      >
        <SheetHeader>
          <SheetTitle>{nodeData.human_friendly_block_name} 详细信息</SheetTitle>
        </SheetHeader>
        <div className="flex-grow overflow-y-auto">
          <Form
            schema={nodeData.block_schema}
            validator={validator}
            formData={nodeData.formData}
            onChange={(e) => onFormChange(e.formData)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NodeDetail;
