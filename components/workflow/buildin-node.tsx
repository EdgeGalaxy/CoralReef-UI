import React from 'react';
import {
  LogInIcon,
  LogOutIcon,
  ImageIcon,
  SlidersHorizontalIcon,
  PlusIcon,
  BoxIcon,
  PlusCircle
} from 'lucide-react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '@/constants/block';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const InputSpecificComponent: React.FC = () => {
  return (
    <div className="flex flex-col items-stretch space-y-2">
      <Button
        variant="ghost"
        className="h-6 justify-start truncate bg-lime-200 px-2 text-xs dark:bg-green-900 dark:text-green-100"
        disabled
      >
        <PlusIcon className="mr-2 h-4 w-4" /> Add Image
      </Button>
      <Button
        variant="ghost"
        className="h-6 justify-start truncate bg-lime-200 px-2 text-xs dark:bg-green-900 dark:text-green-100"
      >
        <PlusIcon className="mr-2 h-4 w-4" /> Add Params
      </Button>
    </div>
  );
};

const OutputSpecificComponent: React.FC = () => {
  return (
    <div>
      <Button
        variant="ghost"
        className="h-6 justify-start truncate bg-lime-200 px-2 text-xs dark:bg-green-900 dark:text-green-100"
      >
        <PlusIcon className="mr-2 h-4 w-4" /> Add Response
      </Button>
    </div>
  );
};

const BuiltInNode: React.FC<NodeProps<NodeData>> = ({
  data,
  isConnectable,
  selected,
  id
}) => {
  const { sources = [], params = [] } = data.formData;
  const isInput = data.manifest_type_identifier === 'input';
  const isOutput = data.manifest_type_identifier === 'output';
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'input':
        return 'border-green-200 bg-green-100 dark:border-green-600 dark:bg-green-900';
      case 'output':
        return 'border-green-200 bg-green-100 dark:border-green-600 dark:bg-green-900';
      default:
        return 'border-stone-500 bg-stone-100 dark:border-stone-600 dark:bg-stone-800';
    }
  };

  const nodeColor = getNodeColor(data.manifest_type_identifier);
  const [borderColor, bgColor] = nodeColor.split(' ');

  const handleAddClick = (e: React.MouseEvent, handleId: string) => {
    e.stopPropagation();
    const event = new CustomEvent('open-connect-panel', {
      detail: {
        nodeId: id,
        handleId: handleId,
        domEvent: e
      }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="group">
      <Card
        className={`border-2 ${borderColor} rounded-lg dark:bg-sidebar ${
          selected
            ? `ring-2 ring-offset-2 ${borderColor.replace('border', 'ring')}`
            : ''
        }`}
      >
        {!isInput && (
          <Handle
            type="target"
            position={Position.Left}
            isConnectable={isConnectable}
            className="dark:border-sidebar-border dark:bg-sidebar-accent"
          />
        )}
        <CardHeader
          className={`py-3 ${bgColor} rounded-t-lg dark:bg-sidebar-accent dark:!bg-opacity-60`}
        >
          <div className="flex items-center space-x-2 truncate text-sm">
            <span className="node-icon text-gray-800 dark:text-white">
              {isInput ? (
                <LogInIcon className="h-4 w-4" />
              ) : (
                <LogOutIcon className="h-4 w-4" />
              )}
            </span>
            <span className="truncate font-medium text-gray-800 dark:text-white">
              {data.human_friendly_block_name}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 py-2 dark:bg-sidebar dark:text-sidebar-foreground">
          <div className="flex flex-col items-stretch space-y-2 text-xs">
            {sources.map((image: any, index: number) => (
              <Button
                key={`image-${index}`}
                variant="ghost"
                className="h-6 justify-start truncate bg-slate-200 px-2 text-xs dark:bg-slate-700 dark:text-slate-100"
              >
                <ImageIcon className="mr-2 h-4 w-4" /> {image.name}
              </Button>
            ))}
            {params.map((param: any, index: number) => (
              <Button
                key={`param-${index}`}
                variant="ghost"
                className="h-6 justify-start truncate bg-slate-200 px-2 text-xs dark:bg-slate-700 dark:text-slate-100"
              >
                <SlidersHorizontalIcon className="mr-2 h-4 w-4" />
                {param.name}
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  ({param.type || 'string'})
                </span>
              </Button>
            ))}
            {isInput && <InputSpecificComponent />}
            {isOutput && <OutputSpecificComponent />}
          </div>
        </CardContent>
        {isInput && (
          <>
            <Handle
              type="source"
              position={Position.Right}
              isConnectable={isConnectable}
              id="output"
              className="custom-handle !right-[-5px]"
            />
            <button
              onClick={(e) => handleAddClick(e, 'output')}
              className="add-node-btn absolute right-[-28px] top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <PlusCircle className="h-4 w-4" />
            </button>
          </>
        )}
      </Card>
    </div>
  );
};

export default BuiltInNode;
