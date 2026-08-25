'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck2,
  Lock,
} from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  gateName: string;
  role: string;
  reason?: string;
  onApprove: (reason: string) => void;
  onReject: (reason: string) => void;
}

export function ApprovalModal({
  isOpen,
  gateName,
  role,
  reason = 'Policy P-02 requires explicit human authorization for student diagnostic data retention.',
  onApprove,
  onReject,
}: ApprovalModalProps) {
  const [approvalNote, setApprovalNote] = useState(
    'Authorized 90-day automatic student diagnostic log expiration under Policy P-02.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApprove = () => {
    setIsSubmitting(true);
    onApprove(approvalNote);
  };

  const handleReject = () => {
    setIsSubmitting(true);
    onReject('Rejected by human operator.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <GlassCard
        tier="thick"
        className="w-full max-w-lg p-6 flex flex-col gap-5 border-amber-500/40 shadow-2xl shadow-amber-950/40"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Human Approval Gate Required
              </h3>
              <StatusBadge status="WAITING_FOR_HUMAN" className="text-[10px]" />
            </div>
            <span className="text-xs font-mono text-amber-300">
              Gate: {gateName} · Role: {role}
            </span>
          </div>
        </div>

        {/* Policy Notice Box */}
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/20 flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-amber-300 font-semibold uppercase">
            <Lock className="w-3.5 h-3.5" /> Policy P-02: Sensitive Data Retention
          </div>
          <p className="text-slate-300 leading-relaxed">
            {reason}
          </p>
        </div>

        {/* Operator Justification Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-slate-400">
            Operator Authorization Justification:
          </label>
          <textarea
            value={approvalNote}
            onChange={(e) => setApprovalNote(e.target.value)}
            rows={2}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none font-mono"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={handleReject}
            disabled={isSubmitting}
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-mono text-xs gap-1.5"
          >
            <XCircle className="w-4 h-4" /> Reject Mission
          </GlassButton>

          <GlassButton
            variant="primary"
            size="sm"
            onClick={handleApprove}
            disabled={isSubmitting}
            className="bg-amber-600 hover:bg-amber-500 border-amber-400/50 shadow-lg shadow-amber-900/30 font-mono text-xs gap-1.5 font-semibold text-white"
          >
            <CheckCircle2 className="w-4 h-4" /> Approve & Resume DAG
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
}
