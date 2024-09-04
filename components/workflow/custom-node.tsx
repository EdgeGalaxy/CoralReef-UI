import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeData } from './nodes-selector';
import NodeDetail from './node-detail';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit } from 'lucide-react';

const CustomNode = ({ data }: { data: NodeData }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getNodeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'objectdetectionmodel':
        return 'bg-purple-100';
      case 'crop':
        return 'bg-green-100';
      case 'classificationmodel':
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <Card className={`w-64 ${getNodeColor(data.type)}`}>
      <Handle type="target" position={Position.Left} />
      <CardHeader className="py-3">
        <div className="flex items-center space-x-2 text-sm font-medium">
          <span className="node-icon">{/* Add icon based on node type */}</span>
          <span>{data.name}</span>
        </div>
      </CardHeader>
      <CardContent
        className="space-y-2 py-2"
        onClick={() => setIsExpanded(true)}
      >
        {data.required.map((field) => (
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
            {data.properties[field]?.default ? (
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
      {isExpanded && (
        <NodeDetail
          isOpen={isExpanded}
          onClose={() => setIsExpanded(false)}
          nodeData={data}
        />
      )}
    </Card>
  );
};

export default CustomNode;
