import React, { useState, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { BlockDescription } from '@/constants/block';
import { Input } from '@/components/ui/input';
import { getNodeColor } from '@/lib/node-utils';

interface NodeSelectorProps {
  nodes: BlockDescription[];
  onNodeSelect: (node: BlockDescription) => void;
}

const NodeSelector: React.FC<NodeSelectorProps> = ({ nodes, onNodeSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNodes = useMemo(() => {
    return nodes.filter((node) =>
      node.human_friendly_block_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [nodes, searchTerm]);

  const groupedNodes = useMemo(() => {
    return filteredNodes.reduce(
      (acc, node) => {
        if (!acc[node.block_schema.block_type]) {
          acc[node.block_schema.block_type] = [];
        }
        acc[node.block_schema.block_type].push(node);
        return acc;
      },
      {} as Record<string, BlockDescription[]>
    );
  }, [filteredNodes]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (type: string) => {
    setOpenSections((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div>
      <div className="p-4">
        <Input
          type="text"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="dark:text-white dark:placeholder:text-gray-400"
        />
      </div>
      <div className="p-4 pt-0">
        {Object.entries(groupedNodes).map(([type, nodeList]) => (
          <Collapsible
            key={type}
            open={openSections[type] ?? false}
            onOpenChange={() => toggleSection(type)}
          >
            <CollapsibleTrigger className="mb-2 flex w-full items-center text-lg font-semibold dark:text-white">
              {openSections[type] ? (
                <ChevronDown className="mr-2" />
              ) : (
                <ChevronRight className="mr-2" />
              )}
              {type}
            </CollapsibleTrigger>
            <CollapsibleContent>
              {nodeList.map((node) => {
                const nodeColor = getNodeColor(node.block_schema.block_type);
                return (
                  <Card
                    key={node.manifest_type_identifier}
                    className={`mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-sidebar-accent ${nodeColor.border} group dark:border-sidebar-border`}
                    onClick={() => onNodeSelect(node)}
                  >
                    <CardHeader
                      className={`p-3 ${nodeColor.bg} dark:bg-sidebar-accent/30`}
                    >
                      <div className="flex items-center space-x-2 truncate font-normal">
                        <span className="node-icon">{nodeColor.icon}</span>
                        <span className="truncate">
                          {node.human_friendly_block_name}
                        </span>
                      </div>
                      <CardDescription className="text-xs">
                        {node.block_schema.short_description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default NodeSelector;
