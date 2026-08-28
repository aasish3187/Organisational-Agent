'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  baseAlpha: number;
  pulsePhase: number;
  pulseSpeed: number;
}

interface SynapsePulse {
  sourceIdx: number;
  targetIdx: number;
  progress: number;
  speed: number;
}

export function NeuralBackground({
  className = '',
  particleCount = 65,
  connectionDistance = 140,
  mouseRadius = 180,
}: {
  className?: string;
  particleCount?: number;
  connectionDistance?: number;
  mouseRadius?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; isHovering: boolean }>({
    x: -1000,
    y: -1000,
    isHovering: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    const colors = [
      '#a855f7', // Purple
      '#06b6d4', // Cyan
      '#8b5cf6', // Violet
      '#3b82f6', // Electric Blue
      '#10b981', // Emerald
    ];

    let particles: Particle[] = [];
    let pulses: SynapsePulse[] = [];

    const initParticles = () => {
      particles = [];
      const count = Math.min(Math.max(Math.floor((width * height) / 18000), 40), 90);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          radius: Math.random() * 2.2 + 1.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          baseAlpha: Math.random() * 0.5 + 0.3,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.03,
        });
      }
    };

    initParticles();

    // Mouse movement handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.isHovering = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.isHovering = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Spawn periodic data pulses along synapses
    const pulseInterval = setInterval(() => {
      if (particles.length < 2) return;
      const src = Math.floor(Math.random() * particles.length);
      // find a close neighbor
      for (let j = 0; j < particles.length; j++) {
        if (src === j) continue;
        const dx = particles[src].x - particles[j].x;
        const dy = particles[src].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectionDistance) {
          pulses.push({
            sourceIdx: src,
            targetIdx: j,
            progress: 0,
            speed: 0.015 + Math.random() * 0.025,
          });
          if (pulses.length > 25) pulses.shift();
          break;
        }
      }
    }, 280);

    // Main 60 FPS Render Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      // 1. Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Organic motion
        p.x += p.vx;
        p.y += p.vy;

        // Bounce gently off boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Pulse size
        p.pulsePhase += p.pulseSpeed;
        const currentRadius = p.radius + Math.sin(p.pulsePhase) * 0.6;

        // Mouse gravity & interaction
        let mouseGlow = 0;
        if (mouse.isHovering) {
          const mdx = mouse.x - p.x;
          const mdy = mouse.y - p.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < mouseRadius) {
            const force = (1 - mdist / mouseRadius) * 0.8;
            p.x += mdx * force * 0.02;
            p.y += mdy * force * 0.02;
            mouseGlow = (1 - mdist / mouseRadius) * 0.6;
          }
        }

        // Draw particle node with outer aura
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(currentRadius, 1), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(p.baseAlpha + mouseGlow, 1);
        ctx.shadowBlur = 10 + mouseGlow * 15;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();

        // 2. Draw connections (Synapses)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            let lineAlpha = (1 - dist / connectionDistance) * 0.22;

            // Check if synapse is near mouse
            if (mouse.isHovering) {
              const midX = (p.x + p2.x) / 2;
              const midY = (p.y + p2.y) / 2;
              const mDist = Math.hypot(mouse.x - midX, mouse.y - midY);
              if (mDist < mouseRadius) {
                lineAlpha += (1 - mDist / mouseRadius) * 0.45;
              }
            }

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);

            // Dynamic gradient between node colors
            const grad = ctx.createLinearGradient(p.x, p.y, p2.x, p2.y);
            grad.addColorStop(0, p.color);
            grad.addColorStop(1, p2.color);

            ctx.strokeStyle = grad;
            ctx.globalAlpha = Math.min(lineAlpha, 0.85);
            ctx.lineWidth = lineAlpha > 0.4 ? 1.4 : 0.8;
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // 3. Render animated data packet pulses along active synapses
      for (let k = pulses.length - 1; k >= 0; k--) {
        const pulse = pulses[k];
        const p1 = particles[pulse.sourceIdx];
        const p2 = particles[pulse.targetIdx];

        if (!p1 || !p2) {
          pulses.splice(k, 1);
          continue;
        }

        pulse.progress += pulse.speed;
        if (pulse.progress >= 1) {
          pulses.splice(k, 1);
          continue;
        }

        const px = p1.x + (p2.x - p1.x) * pulse.progress;
        const py = p1.y + (p2.y - p1.y) * pulse.progress;

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#06b6d4';
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(pulseInterval);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [particleCount, connectionDistance, mouseRadius]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 opacity-70 transition-opacity duration-1000 ${className}`}
      aria-hidden="true"
    />
  );
}
