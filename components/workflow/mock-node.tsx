import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

const MockNode: React.FC<NodeProps> = ({ id }) => {
  const handleOpenPanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    const event = new CustomEvent('open-mock-replace-panel', {
      detail: { nodeId: id, domEvent: e }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="relative flex h-24 w-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-400 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !-translate-x-1/2 !transform !border-2 !border-gray-400 !bg-white hover:!bg-gray-200 dark:!border-gray-500 dark:!bg-gray-700"
      />
      <Button onClick={handleOpenPanel}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Select Node
      </Button>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !translate-x-1/2 !transform !border-2 !border-gray-400 !bg-white hover:!bg-gray-200 dark:!border-gray-500 dark:!bg-gray-700"
      />
    </div>
  );
};

export default MockNode;
