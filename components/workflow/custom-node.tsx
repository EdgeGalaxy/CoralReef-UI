import React, { useState, useEffect } from 'react';
import { ShieldAlertIcon, PlusCircle } from 'lucide-react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '@/constants/block';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { skipFormFields } from '@/constants/block';
import { getNodeColor } from '@/lib/node-utils';
import './custom-edge.css';

const CustomNode = ({ data, selected, id }: NodeProps<NodeData>) => {
  const [missRequiredFields, setMissRequiredFields] = useState(false);
  const [missingFieldNames, setMissingFieldNames] = useState<string[]>([]);

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

  useEffect(() => {
    const checkRequiredFields = () => {
      const missing: string[] = [];

      // 检查缺少的必填字段
      if (
        data.block_schema.required &&
        Array.isArray(data.block_schema.required)
      ) {
        data.block_schema.required
          .filter((field: string) => !skipFormFields.includes(field))
          .forEach((field: string) => {
            const value = data.formData[field];
            // 检查字段值是否为空（null、undefined、空字符串或空数组）
            if (
              value === null ||
              value === undefined ||
              value === '' ||
              (Array.isArray(value) && value.length === 0)
            ) {
              missing.push(field);
            }
          });
      }

      setMissingFieldNames(missing);
      setMissRequiredFields(missing.length > 0);
    };

    checkRequiredFields();
  }, [data.formData, data.block_schema.required]);

  const nodeColor = getNodeColor(data.block_schema.block_type);

  return (
    <div className="group">
      <Card
        className={`border-2 ${nodeColor.border} rounded-lg dark:bg-sidebar ${
          missRequiredFields
            ? 'shadow-[0_0_0_1px] shadow-orange-300 dark:shadow-orange-700'
            : ''
        } ${
          selected
            ? `ring-2 ring-offset-2 ${nodeColor.border.replace(
                'border',
                'ring'
              )}`
            : ''
        }`}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="!left-[-5px] !h-3 !w-3 dark:border-sidebar-border dark:bg-sidebar-accent"
        />
        <CardHeader
          className={`py-3 ${nodeColor.bg} rounded-t-lg dark:bg-sidebar-accent dark:!bg-opacity-60`}
        >
          <div className="flex items-center space-x-2 truncate text-sm font-normal">
            <span className="node-icon text-gray-800 dark:text-white">
              {nodeColor.icon}
            </span>
            <span className="truncate font-medium text-gray-800 dark:text-white">
              {data.human_friendly_block_name}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 py-2 dark:bg-sidebar dark:text-sidebar-foreground">
          <div className="flex flex-col items-stretch space-y-2 text-xs">
            <Button
              variant="ghost"
              className="h-6 justify-start truncate bg-slate-200 px-2 text-xs dark:bg-slate-700 dark:text-slate-100"
            >
              {data.formData.name}
            </Button>
            {missRequiredFields ? (
              <Button
                variant="ghost"
                className="flex h-6 justify-start truncate bg-yellow-100 px-2 text-xs text-orange-700 dark:bg-yellow-900 dark:text-yellow-100"
              >
                <ShieldAlertIcon className="mr-1 h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {missingFieldNames.length > 1
                    ? `${missingFieldNames.length} 必填字段未配置`
                    : `"${missingFieldNames[0]}" 字段未配置`}
                </span>
              </Button>
            ) : null}
          </div>
        </CardContent>
        <Handle
          type="source"
          id="output"
          position={Position.Right}
          className="custom-handle !right-[-5px]"
        />
        <button
          onClick={(e) => handleAddClick(e, 'output')}
          className="add-node-btn absolute right-[-28px] top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <PlusCircle className="h-4 w-4" />
        </button>
      </Card>
    </div>
  );
};

export default CustomNode;
