import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { BlockDescription } from '@/constants/block';
import NodeDetail from './node-detail';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit } from 'lucide-react';

const CustomNode = ({ data }: { data: BlockDescription }) => {
  const getNodeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'model':
        return 'bg-purple-100';
      case 'formatter':
        return 'bg-green-100';
      case 'fusion':
        return 'bg-orange-100';
      case 'flow_control':
        return 'bg-blue-100';
      case 'sink':
        return 'bg-red-100';
      case 'transformation':
        return 'bg-yellow-100';
      case 'visualization':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <Card className={`w-64 ${getNodeColor(data.block_schema.block_type)}`}>
      <Handle type="target" position={Position.Left} />
      <CardHeader className="py-3">
        <div className="flex items-center space-x-2 text-sm font-medium">
          <span className="node-icon">{/* Add icon based on node type */}</span>
          <span>{data.human_friendly_block_name}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 py-2">
        {data.block_schema.required?.map((field) => (
          <div
            key={field}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center space-x-2">
              <span className="field-icon">
                {/* Add field-specific icon */}
              </span>
              <span>{field}</span>
            </div>
            {typeof data.block_schema.properties?.[field] === 'object' &&
            'default' in data.block_schema.properties[field] ? (
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                <PlusCircle className="mr-1 h-3 w-3" />
                No {field} Selected
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <Edit className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
      <Handle type="source" position={Position.Right} />
    </Card>
  );
};

export default CustomNode;
