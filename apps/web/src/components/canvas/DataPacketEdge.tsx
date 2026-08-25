'use client';

import React, { memo } from 'react';
import { getBezierPath, type EdgeProps } from 'reactflow';

export const DataPacketEdge = memo(
  ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps) => {
    const [edgePath] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const isActive = data?.active ?? true;

    return (
      <>
        {/* Base Edge Path */}
        <path
          id={id}
          className="react-flow__edge-path transition-all duration-300"
          d={edgePath}
          fill="none"
          stroke={isActive ? 'rgba(124, 58, 237, 0.45)' : 'rgba(255, 255, 255, 0.08)'}
          strokeWidth={isActive ? 2 : 1}
          strokeDasharray={isActive ? '6 4' : 'none'}
        />

        {/* Animated Traveling Data Packet Particle Dot */}
        {isActive && (
          <g>
            <circle r="4" fill="#06b6d4" className="filter drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]">
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                path={edgePath}
                keyPoints="0;1"
                keyTimes="0;1"
              />
            </circle>
          </g>
        )}
      </>
    );
  }
);

DataPacketEdge.displayName = 'DataPacketEdge';
