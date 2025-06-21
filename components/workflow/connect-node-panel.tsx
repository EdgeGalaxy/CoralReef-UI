import React, { useRef, useEffect, useState } from 'react';
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
  const [panelPosition, setPanelPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

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

  useEffect(() => {
    if (ref.current) {
      const panelRect = ref.current.getBoundingClientRect();
      const parentElement = ref.current.parentElement;
      if (!parentElement) return;

      const parentRect = parentElement.getBoundingClientRect();

      let newX = position.x;
      let newY = position.y;

      if (position.x + panelRect.width > parentRect.width) {
        newX = parentRect.width - panelRect.width - 5; // 5px buffer
      }
      if (newX < 0) {
        newX = 5;
      }
      if (position.y + panelRect.height > parentRect.height) {
        newY = parentRect.height - panelRect.height - 5;
      }
      if (newY < 0) {
        newY = 5;
      }
      setPanelPosition({ x: newX, y: newY });
    }
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a, input, textarea')) {
      return;
    }
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - panelPosition.x,
      y: e.clientY - panelPosition.y
    };
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !ref.current) return;

    const parentElement = ref.current.parentElement;
    if (!parentElement) return;
    const parentRect = parentElement.getBoundingClientRect();
    const panelRect = ref.current.getBoundingClientRect();

    let newX = e.clientX - dragOffset.current.x;
    let newY = e.clientY - dragOffset.current.y;

    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX + panelRect.width > parentRect.width) {
      newX = parentRect.width - panelRect.width;
    }
    if (newY + panelRect.height > parentRect.height) {
      newY = parentRect.height - panelRect.height;
    }

    setPanelPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={ref}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        top: panelPosition.y,
        left: panelPosition.x,
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      className="flex h-auto max-h-[50vh] w-80 flex-col overflow-y-auto rounded-lg border bg-popover shadow-md dark:border-sidebar-border"
    >
      <NodeSelector nodes={availableNodes} onNodeSelect={onNodeSelect} />
    </div>
  );
};

export default ConnectNodePanel;
