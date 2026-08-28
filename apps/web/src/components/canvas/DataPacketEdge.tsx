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
        <defs>
          <linearGradient id={`grad_${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Base Glow Tube */}
        {isActive && (
          <path
            d={edgePath}
            fill="none"
            stroke="rgba(168, 85, 247, 0.2)"
            strokeWidth={5}
            className="filter blur-[2px]"
          />
        )}

        {/* Main Edge Path */}
        <path
          id={id}
          className="react-flow__edge-path transition-all duration-300"
          d={edgePath}
          fill="none"
          stroke={isActive ? `url(#grad_${id})` : 'rgba(255, 255, 255, 0.1)'}
          strokeWidth={isActive ? 2.5 : 1}
          strokeDasharray={isActive ? '5 5' : 'none'}
        />

        {/* Primary Animated Traveling Data Packet Particle */}
        {isActive && (
          <g>
            <circle r="4.5" fill="#06b6d4" className="filter drop-shadow-[0_0_8px_#06b6d4]">
              <animateMotion
                dur="1.8s"
                repeatCount="indefinite"
                path={edgePath}
                keyPoints="0;1"
                keyTimes="0;1"
              />
            </circle>
            {/* Secondary Staggered Pulse Dot */}
            <circle r="3" fill="#a855f7" className="filter drop-shadow-[0_0_6px_#a855f7]">
              <animateMotion
                dur="1.8s"
                begin="0.9s"
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
