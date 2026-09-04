'use client';

import React, { useState } from 'react';
import { useRecoverStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { WebhookSimulatorModal } from '@/components/webhooks/WebhookSimulatorModal';
import { formatINR } from '@/lib/utils';
import { 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  RotateCcw, 
  Layers, 
  Play, 
  Radio, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    analytics, 
    providerConfig, 
    isProcessingHeroDemo, 
    heroDemoStep, 
    runHeroSingleEventDemo, 
    runHeroBatchCampaignDemo, 
    resetToSeedData 
  } = useRecoverStore();
  
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-7xl mx-auto">
          {/* Left Brand & Track */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Sparkles className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  RecoverAI
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                    Track 03
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">
                  Autonomous AI Revenue Recovery Agent
                </span>
              </div>
            </div>

            {/* Provider Pill */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Mode:</span>
              <strong className="text-white">
                {providerConfig.activeProvider === 'RAZORPAY_TEST' ? 'Razorpay Test Env' : 'Mock Gateway Simulator'}
              </strong>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Live Hero Demo CTA 1: Single Event (₹4,999) */}
            <Button
              variant="glow"
              size="sm"
              onClick={runHeroSingleEventDemo}
              isLoading={isProcessingHeroDemo}
              className="text-xs font-semibold"
            >
              <Play className="w-3.5 h-3.5 mr-1 text-slate-950 fill-slate-950" />
              Hero Demo (₹4,999 Event)
            </Button>

            {/* Live Hero Demo CTA 2: Batch Campaign (100 Cases / ₹8.4L) */}
            <Button
              variant="secondary"
              size="sm"
              onClick={runHeroBatchCampaignDemo}
              disabled={isProcessingHeroDemo}
              className="text-xs border-indigo-500/40 hover:bg-indigo-950/40 text-indigo-300"
            >
              <Layers className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              Hero Batch Campaign
            </Button>

            {/* Webhook Simulator */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWebhookModalOpen(true)}
              className="text-xs text-amber-300 border-amber-800/50 hover:bg-amber-950/30"
            >
              <Zap className="w-3.5 h-3.5 mr-1 text-amber-400" />
              Simulate Webhook
            </Button>

            {/* Reset Seed Data */}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToSeedData}
              title="Reset to clean Indian fintech seed dataset"
              className="text-slate-400 hover:text-slate-200 text-xs px-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Live Hero Demo Progress Banner */}
        {isProcessingHeroDemo && (
          <div className="mt-2.5 max-w-7xl mx-auto p-2.5 rounded-lg bg-gradient-to-r from-indigo-950/90 via-slate-900 to-emerald-950/90 border border-indigo-500/50 flex items-center justify-between text-xs text-white animate-pulse">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
              <span className="font-mono font-medium">{heroDemoStep || 'AI Agent executing bounded recovery workflow...'}</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
              Live Autonomous Execution
            </span>
          </div>
        )}
      </header>

      {/* Webhook Simulator Modal */}
      <WebhookSimulatorModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
      />
    </>
  );
};
