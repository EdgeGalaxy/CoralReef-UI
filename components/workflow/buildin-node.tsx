import React from 'react';
import {
  LogInIcon,
  LogOutIcon,
  ImageIcon,
  SlidersHorizontalIcon,
  PlusIcon,
  BoxIcon
} from 'lucide-react';
import { Handle, Position } from 'reactflow';
import { NodeData } from '@/constants/block';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const InputSpecificComponent: React.FC = () => {
  return (
    <div className="flex flex-col items-stretch space-y-2">
      <Button
        variant="ghost"
        className="h-6 justify-start truncate bg-lime-200 px-2 text-xs"
      >
        <PlusIcon className="mr-2 h-4 w-4" /> Add Image
      </Button>
      <Button
        variant="ghost"
        className="h-6 justify-start truncate bg-lime-200 px-2 text-xs"
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
        className="h-6 justify-start truncate bg-lime-200 px-2 text-xs"
      >
        <PlusIcon className="mr-2 h-4 w-4" /> Add Response
      </Button>
    </div>
  );
};

const BuiltInNode: React.FC<{ data: NodeData; isConnectable: boolean }> = ({
  data,
  isConnectable
}) => {
  const { images = [], params = [], models = [] } = data.formData;
  const isInput = data.manifest_type_identifier === 'input';
  const isOutput = data.manifest_type_identifier === 'output';
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'input':
        return 'border-green-200 bg-green-100';
      case 'output':
        return 'border-green-200 bg-green-100';
      default:
        return 'border-stone-500 bg-stone-100';
    }
  };

  const nodeColor = getNodeColor(data.manifest_type_identifier);

  return (
    <div>
      <Card className={`border-2 ${nodeColor.split(' ')[0]} rounded-lg`}>
        {!isInput && (
          <Handle
            type="target"
            position={Position.Left}
            isConnectable={isConnectable}
          />
        )}
        <CardHeader className={`py-3 ${nodeColor.split(' ')[1]} rounded-t-lg`}>
          <div className="flex items-center space-x-2 text-sm font-medium">
            <span className="node-icon">
              {isInput ? (
                <LogInIcon className="h-4 w-4" />
              ) : (
                <LogOutIcon className="h-4 w-4" />
              )}
            </span>
            <span>{data.human_friendly_block_name}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 py-2">
          <div className="flex flex-col items-stretch space-y-2 text-xs">
            {images.map((image: any, index: number) => (
              <Button
                key={`image-${index}`}
                variant="ghost"
                className="h-6 justify-start truncate bg-slate-200 px-2 text-xs"
              >
                <ImageIcon className="mr-2 h-4 w-4" /> {image.name}
              </Button>
            ))}
            {params.map((param: any, index: number) => (
              <Button
                key={`param-${index}`}
                variant="ghost"
                className="h-6 justify-start truncate bg-slate-200 px-2 text-xs"
              >
                <SlidersHorizontalIcon className="mr-2 h-4 w-4" /> {param.name}
              </Button>
            ))}
            {isInput &&
              models.map((model: any, index: number) => (
                <Button
                  key={`model-${index}`}
                  variant="ghost"
                  className="h-6 justify-start truncate bg-blue-200 px-2 text-xs"
                >
                  <BoxIcon className="mr-2 h-4 w-4" /> {model.name}{' '}
                  {model.version ? `(${model.version})` : ''}
                </Button>
              ))}
            {isInput && <InputSpecificComponent />}
            {isOutput && <OutputSpecificComponent />}
          </div>
        </CardContent>
        {isInput && (
          <Handle
            type="source"
            position={Position.Right}
            isConnectable={isConnectable}
          />
        )}
      </Card>
    </div>
  );
};

export default BuiltInNode;
