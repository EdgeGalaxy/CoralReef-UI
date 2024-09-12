import React, { useState, useEffect } from 'react';
import { ShieldAlertIcon } from 'lucide-react';
import { Handle, Position } from 'reactflow';
import { NodeData } from '@/constants/block';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { skipFormFields } from '@/constants/block';
import { getNodeColor } from '@/lib/node-utils';

const CustomNode = ({ data }: { data: NodeData }) => {
  const [missRequiredFields, setMissRequiredFields] = useState(false);

  useEffect(() => {
    const checkRequiredFields = () => {
      const missingFields = data.block_schema.required
        ?.filter((field: string) => !skipFormFields.includes(field))
        .some((field: string) => !data.formData[field]);

      setMissRequiredFields(missingFields ?? false);
    };

    checkRequiredFields();
  }, [data.formData, data.block_schema.required]);

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
              className="h-6 justify-start truncate bg-slate-200 px-2 text-xs"
            >
              {data.formData.name}
            </Button>
            {missRequiredFields ? (
              <Button
                variant="ghost"
                className="flex h-6 justify-start truncate bg-yellow-100 px-2 text-xs"
              >
                <ShieldAlertIcon className="mr-1 h-3 w-3 flex-shrink-0" />
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
