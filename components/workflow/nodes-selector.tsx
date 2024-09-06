import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { BlockDescription } from '@/constants/block';

interface NodeSelectorProps {
  nodes: BlockDescription[];
  onNodeSelect: (node: BlockDescription) => void;
}

const NodeSelector: React.FC<NodeSelectorProps> = ({ nodes, onNodeSelect }) => {
  const groupedNodes = nodes.reduce(
    (acc, node) => {
      if (!acc[node.block_schema.block_type]) {
        acc[node.block_schema.block_type] = [];
      }
      acc[node.block_schema.block_type].push(node);
      return acc;
    },
    {} as Record<string, BlockDescription[]>
  );

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.keys(groupedNodes).reduce(
      (acc, type) => ({ ...acc, [type]: true }),
      {}
    )
  );

  const toggleSection = (type: string) => {
    setOpenSections((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <ScrollArea className="h-[calc(100vh-100px)] w-full rounded-md border">
      <div className="p-4">
        {Object.entries(groupedNodes).map(([type, nodeList]) => (
          <Collapsible
            key={type}
            open={openSections[type]}
            onOpenChange={() => toggleSection(type)}
          >
            <CollapsibleTrigger className="mb-2 flex w-full items-center text-lg font-semibold">
              {openSections[type] ? (
                <ChevronDown className="mr-2" />
              ) : (
                <ChevronRight className="mr-2" />
              )}
              {type}
            </CollapsibleTrigger>
            <CollapsibleContent>
              {nodeList.map((node) => (
                <Card
                  key={node.human_friendly_block_name}
                  className="mb-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => onNodeSelect(node)}
                >
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">
                      {node.human_friendly_block_name}
                    </CardTitle>
                    <CardDescription className="truncate text-xs">
                      {node.block_schema.short_description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </ScrollArea>
  );
};

export default NodeSelector;
