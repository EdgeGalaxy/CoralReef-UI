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

export interface NodeData {
  name: string;
  type: string;
  description: string;
  block_type: string;
  properties: Record<string, any>;
  required: string[];
  outputs_manifest: Array<{
    name: string;
    kind: Array<{
      name: string;
      description: string;
    }>;
  }>;
}

interface NodeSelectorProps {
  nodes: NodeData[];
  onNodeSelect: (node: NodeData) => void;
}

const NodeSelector: React.FC<NodeSelectorProps> = ({ nodes, onNodeSelect }) => {
  const groupedNodes = nodes.reduce(
    (acc, node) => {
      if (!acc[node.type]) {
        acc[node.block_type] = [];
      }
      acc[node.block_type].push(node);
      return acc;
    },
    {} as Record<string, NodeData[]>
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
                  key={node.name}
                  className="mb-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => onNodeSelect(node)}
                >
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">{node.name}</CardTitle>
                    <CardDescription className="truncate text-xs">
                      {node.description}
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
