'use client';

import React from 'react';

export function AuroraBg() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="absolute rounded-full filter blur-[80px] opacity-70"
        style={{
          width: '60vw',
          height: '60vw',
          top: '-20%',
          left: '-10%',
          background: 'radial-gradient(circle, var(--aurora-violet), transparent 70%)',
          animation: 'aurora-drift 20s linear infinite',
        }}
      />
      <div
        className="absolute rounded-full filter blur-[80px] opacity-70"
        style={{
          width: '50vw',
          height: '50vw',
          top: '30%',
          right: '-10%',
          background: 'radial-gradient(circle, var(--aurora-cyan), transparent 70%)',
          animation: 'aurora-drift 25s linear infinite -8s',
        }}
      />
      <div
        className="absolute rounded-full filter blur-[80px] opacity-70"
        style={{
          width: '40vw',
          height: '40vw',
          bottom: '-10%',
          left: '30%',
          background: 'radial-gradient(circle, var(--aurora-emerald), transparent 70%)',
          animation: 'aurora-drift 18s linear infinite -14s',
        }}
      />
      <div
        className="absolute rounded-full filter blur-[80px] opacity-70"
        style={{
          width: '35vw',
          height: '35vw',
          top: '60%',
          left: '15%',
          background: 'radial-gradient(circle, var(--aurora-rose), transparent 70%)',
          animation: 'aurora-drift 22s linear infinite -5s',
        }}
      />
    </div>
  );
}
