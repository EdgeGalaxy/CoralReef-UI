import React, { useRef, useEffect } from 'react';
import NodeSelector from './nodes-selector';
import { BlockDescription } from '@/constants/block';

interface ConnectNodePanelProps {
  position: { x: number; y: number };
  availableNodes: BlockDescription[];
  onNodeSelect: (node: BlockDescription) => void;
  onClose: () => void;
}

const ConnectNodePanel: React.FC<ConnectNodePanelProps> = ({
  position,
  availableNodes,
  onNodeSelect,
  onClose
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setTimeout(onClose, 100); // Delay to allow onNodeSelect to fire
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: position.y,
        left: position.x,
        zIndex: 1000
      }}
      className="w-80 rounded-lg border bg-popover shadow-md dark:border-sidebar-border"
    >
      <NodeSelector nodes={availableNodes} onNodeSelect={onNodeSelect} />
    </div>
  );
};

export default ConnectNodePanel;
