import React from 'react';

import { ReaderIcon } from '@radix-ui/react-icons';
import { Handle, Position } from 'reactflow';
import { NodeData } from '@/constants/block';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit } from 'lucide-react';

const CustomNode = ({ data }: { data: NodeData }) => {
  const getNodeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'model':
        return {
          icon: <ReaderIcon className="h-4 w-4" />,
          border: 'border-purple-200',
          bg: 'bg-purple-100'
        };
      case 'formatter':
        return {
          icon: <ReaderIcon className="h-4 w-4" />,
          border: 'border-green-200',
          bg: 'bg-green-100'
        };
      case 'fusion':
        return {
          icon: <ReaderIcon className="h-4 w-4" />,
          border: 'border-orange-200',
          bg: 'bg-orange-100'
        };
      case 'flow_control':
        return {
          icon: <ReaderIcon className="h-4 w-4" />,
          border: 'border-blue-200',
          bg: 'bg-blue-100'
        };
      case 'sink':
        return {
          icon: <ReaderIcon className="h-4 w-4" />,
          border: 'border-red-200',
          bg: 'bg-red-100'
        };
      case 'transformation':
        return {
          icon: <ReaderIcon className="h-4 w-4" />,
          border: 'border-yellow-200',
          bg: 'bg-yellow-100'
        };
      case 'visualization':
        return {
          icon: <ReaderIcon className="h-4 w-4" />,
          border: 'border-green-200',
          bg: 'bg-green-100'
        };
      default:
        return {
          icon: <ReaderIcon className="h-4 w-4" />,
          border: 'border-gray-200',
          bg: 'bg-gray-100'
        };
    }
  };

  const nodeColor = getNodeColor(data.block_schema.block_type);

  return (
    <div>
      <Card className={`border-2 ${nodeColor.border} rounded-lg`}>
        <Handle type="target" position={Position.Left} />
        <CardHeader className={`py-3 ${nodeColor.bg} rounded-t-lg`}>
          <div className="flex items-center space-x-2 truncate text-sm font-normal">
            <span className="node-icon">{nodeColor.icon}</span>
            <span className="truncate">{data.human_friendly_block_name}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 py-2">
          <div className="flex flex-col items-stretch space-y-2 text-xs">
            <Button
              variant="ghost"
              className="h-6 truncate bg-slate-200 px-2 text-xs"
            >
              {data.formData.name}
            </Button>
            {data.block_schema.required?.some(
              (field) => !data.formData[field]
            ) ? (
              <Button
                variant="ghost"
                className="flex h-6 items-center justify-center truncate bg-yellow-100 px-2 text-xs"
              >
                <PlusCircle className="mr-1 h-3 w-3 flex-shrink-0" />
                <span className="truncate">Configuration Required</span>
              </Button>
            ) : null}
          </div>
        </CardContent>
        <Handle type="source" position={Position.Right} />
      </Card>
    </div>
  );
};

export default CustomNode;
