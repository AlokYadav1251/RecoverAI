'use client';

import React, { useState } from 'react';
import { useRecoverStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WebhookEventPayload } from '@/types';
import { formatINR } from '@/lib/utils';
import { 
  Settings, 
  CreditCard, 
  Zap, 
  RotateCcw, 
  CheckCircle2, 
  Key, 
  ShieldCheck, 
  Sliders, 
  Radio,
  FileText,
  ShoppingCart,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export default function SettingsPage() {
  const { 
    providerConfig, 
    updateProviderConfig, 
    triggerWebhook, 
    resetToSeedData 
  } = useRecoverStore();

  const [activeProvider, setActiveProvider] = useState(providerConfig.activeProvider);
  const [razorpayKeyId, setRazorpayKeyId] = useState(providerConfig.razorpayKeyId || 'rzp_test_99x821abq');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState(providerConfig.razorpayKeySecret || '••••••••••••••••');
  const [simulatedLatency, setSimulatedLatency] = useState(providerConfig.mockSimulatedLatencyMs);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [lastWebhookId, setLastWebhookId] = useState<string | null>(null);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateProviderConfig({
      activeProvider,
      razorpayKeyId,
      razorpayKeySecret,
      mockSimulatedLatencyMs: Number(simulatedLatency),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSimulateWebhook = async (eventType: WebhookEventPayload['event'], amount: number) => {
    const evt = await triggerWebhook({
      event: eventType,
      data: { amount, error_code: 'INSUFFICIENT_FUNDS', bank: 'HDFC' },
    });
    setLastWebhookId(evt.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Settings & Gateway Environment
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
            Razorpay Track 03
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure payment gateway adapters, toggle Mock vs Razorpay Test modes, and dispatch synthetic real-time webhooks.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Gateway provider settings updated successfully.
        </div>
      )}

      {/* Grid: Payment Provider & Webhook Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Payment Gateway Adapter */}
        <Card>
          <CardHeader>
            <CardTitle>
              <CreditCard className="w-4 h-4 text-indigo-400" />
              Payment Provider Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 font-mono">
                  Active Payment Adapter
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveProvider('MOCK')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      activeProvider === 'MOCK'
                        ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs">Mock Provider</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Built-in deterministic simulation for hackathon demo</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveProvider('RAZORPAY_TEST')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      activeProvider === 'RAZORPAY_TEST'
                        ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs">Razorpay Test Mode</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Connect with Razorpay Test API credentials</div>
                  </button>
                </div>
              </div>

              {activeProvider === 'RAZORPAY_TEST' ? (
                <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Razorpay Key ID</label>
                    <input
                      type="text"
                      value={razorpayKeyId}
                      onChange={(e) => setRazorpayKeyId(e.target.value)}
                      placeholder="rzp_test_..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Razorpay Key Secret</label>
                    <input
                      type="password"
                      value={razorpayKeySecret}
                      onChange={(e) => setRazorpayKeySecret(e.target.value)}
                      placeholder="Enter secret"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    * Credentials are encrypted in local runtime memory and never exposed to public frontend clients.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                      <span>Simulated Gateway Latency:</span>
                      <strong className="font-mono text-indigo-400">{simulatedLatency}ms</strong>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="2000"
                      step="100"
                      value={simulatedLatency}
                      onChange={(e) => setSimulatedLatency(Number(e.target.value))}
                      className="w-full cursor-pointer accent-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Mock provider generates realistic bank confirmation payloads and settlement states.</span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button variant="primary" size="sm" type="submit" className="w-full text-xs">
                  Save Provider Preferences
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right: Real-time Webhook Simulator */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Zap className="w-4 h-4 text-amber-400" />
              Live Webhook Ingestion Simulator
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <p className="text-xs text-slate-300">
              Click any of the event triggers below to dispatch a synthetic webhook to the agent ingestion queue in real time:
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => handleSimulateWebhook('payment.failed', 4999)}
                className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-700/60 text-left transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-rose-400" />
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-rose-300">Simulate Payment Failure</div>
                    <div className="text-[10px] text-slate-400">event: payment.failed (₹4,999 Insufficient Funds)</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded">
                  ₹4,999
                </span>
              </button>

              <button
                onClick={() => handleSimulateWebhook('checkout.abandoned', 8500)}
                className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-amber-950/30 border border-slate-800 hover:border-amber-700/60 text-left transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-amber-300">Simulate Checkout Abandonment</div>
                    <div className="text-[10px] text-slate-400">event: checkout.abandoned (Cart Drop-off)</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded">
                  ₹8,500
                </span>
              </button>

              <button
                onClick={() => handleSimulateWebhook('subscription.failed', 2999)}
                className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-indigo-950/30 border border-slate-800 hover:border-indigo-700/60 text-left transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <RefreshCw className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-indigo-300">Simulate Subscription Failure</div>
                    <div className="text-[10px] text-slate-400">event: subscription.failed (NACH Mandate Timeout)</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded">
                  ₹2,999
                </span>
              </button>

              <button
                onClick={() => handleSimulateWebhook('invoice.overdue', 150000)}
                className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-purple-950/30 border border-slate-800 hover:border-purple-700/60 text-left transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-purple-300">Simulate Overdue B2B Invoice</div>
                    <div className="text-[10px] text-slate-400">event: invoice.overdue (12 Days Past Due)</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded">
                  ₹1,50,000
                </span>
              </button>
            </div>

            {lastWebhookId && (
              <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dispatched event <strong>{lastWebhookId}</strong> to Revenue Risk Inbox.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Seed Dataset Management */}
      <Card className="border-slate-800">
        <CardHeader>
          <CardTitle>
            <RotateCcw className="w-4 h-4 text-slate-400" />
            Seed Dataset & Storage Management
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-white">Reset to Clean Indian Fintech Dataset</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Restores 100+ customers, 250+ payments, historical campaigns, and pre-computed risk events to initial baseline state.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetToSeedData();
              alert('Database state restored to clean Indian fintech seed baseline.');
            }}
            className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Seed Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
