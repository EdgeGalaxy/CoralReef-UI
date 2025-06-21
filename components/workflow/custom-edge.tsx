import React from 'react';
import { getBezierPath, EdgeProps } from 'reactflow';
import './custom-edge.css';

const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const edgeStyle = {
    fill: 'none',
    stroke: '#5a67d8',
    ...style
  };

  return (
    <path
      id={id}
      className="react-flow__edge-path-animated"
      d={edgePath}
      markerEnd={markerEnd}
      style={edgeStyle}
    />
  );
};

export default CustomEdge;
