import React from 'react';
import { Handle, Position } from 'reactflow';

import { NodeData } from '@/constants/block';

type BuiltInNodeProps = {
  data: NodeData;
  isConnectable: boolean;
};

const BuiltInNode: React.FC<BuiltInNodeProps> = ({ data, isConnectable }) => {
  const { images = [], params = [] } = data.formData;
  const isInput = data.manifest_type_identifier === 'input';

  return (
    <div className="rounded-md border-2 border-stone-400 bg-white px-4 py-2 shadow-md">
      <div className="font-bold">{data.human_friendly_block_name}</div>
      {images.map((image: any, index: number) => (
        <div key={`image-${index}`} className="mt-2">
          <span>Image: {image.name}</span>
        </div>
      ))}
      {params.map((param: any, index: number) => (
        <div key={`param-${index}`} className="mt-2">
          <span>{param.name}: </span>
          <span>
            {param.type} - {param.value}
          </span>
        </div>
      ))}
      {isInput ? (
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
        />
      ) : (
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
        />
      )}
    </div>
  );
};

export default BuiltInNode;
