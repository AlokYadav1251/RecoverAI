'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRecoverStore } from '@/lib/store';
import { CopilotEngine, CopilotMessage } from '@/lib/copilotEngine';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatINR, formatDateTime, formatTimeOnly } from '@/lib/utils';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  Terminal, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function CopilotPage() {
  const { events, analytics, campaigns, approveCampaign, executeCampaignBatch } = useRecoverStore();
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init_1',
      sender: 'COPILOT',
      text: `Hello! I am your **Autonomous Revenue Recovery Copilot**.\n\nI monitor all payment failures, abandoned checkouts, subscriptions, and B2B invoices across your business. I execute bounded recovery actions safely within your configured policies.\n\nHow can I assist your revenue recovery operations today?`,
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [campaignActionMsg, setCampaignActionMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: CopilotMessage = {
      id: `usr_${Date.now()}`,
      sender: 'USER',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    setTimeout(() => {
      const response = CopilotEngine.processUserQuery(text, events, analytics, campaigns);
      setMessages((prev) => [...prev, response]);
      setIsThinking(false);
    }, 450);
  };

  const handleApproveCopilotCampaign = async () => {
    const activeCamp = campaigns[0];
    if (activeCamp) {
      approveCampaign(activeCamp.id);
      setCampaignActionMsg('Campaign approved! Executing bounded recovery batch across all channels...');
      await executeCampaignBatch(activeCamp.id);
      setCampaignActionMsg(`Campaign completed! ₹${(activeCamp.actualRecovered || 391500).toLocaleString('en-IN')} recovered.`);
    }
  };

  const SUGGESTIONS = [
    'How much money did we actually recover today?',
    'Show me all revenue at risk above ₹10,000.',
    'Which customers have the highest recovery probability?',
    'Show failed payments caused by bank issues.',
    'Show overdue invoices older than 15 days.',
    'Which intervention works best?',
    'Start a recovery campaign for high-probability payments.',
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Recovery Copilot
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Grounded Agent
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Query live risk events, diagnose churn patterns, and stage bounded recovery campaigns using natural language.
          </p>
        </div>
      </div>

      {/* Main Chat Container */}
      <Card className="flex-1 flex flex-col overflow-hidden bg-slate-950/80 border-slate-800 shadow-2xl">
        {/* Message Stream */}
        <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                msg.sender === 'COPILOT'
                  ? 'bg-gradient-to-tr from-indigo-600 to-emerald-500 border-indigo-400 text-slate-950 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}>
                {msg.sender === 'COPILOT' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2.5 ${msg.sender === 'USER' ? 'items-end' : ''}`}>
                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border ${
                  msg.sender === 'USER'
                    ? 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none'
                    : 'bg-slate-900/90 border-slate-800 text-slate-200 rounded-tl-none shadow-lg'
                }`}>
                  <div className="whitespace-pre-line font-sans">
                    {msg.text}
                  </div>

                  {/* Tool Calling Trace Indicator */}
                  {msg.toolCall && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-2 text-[11px] font-mono text-indigo-300 bg-slate-950/60 p-2 rounded-lg border">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <div>
                        <span>Tool: <strong className="text-white">{msg.toolCall.name}</strong></span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{msg.toolCall.resultSummary}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Structured Interactive Action Cards */}
                {msg.actionCard && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/40 text-xs space-y-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        {msg.actionCard.title}
                      </h4>
                      {msg.actionCard.casesCount && (
                        <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                          {msg.actionCard.casesCount} cases
                        </span>
                      )}
                    </div>

                    <p className="text-slate-300 text-[11px]">{msg.actionCard.description}</p>

                    {/* Breakdown if Campaign */}
                    {msg.actionCard.suggestedBreakdown && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400">Smart Retries</span>
                          <div className="font-bold text-white">{msg.actionCard.suggestedBreakdown.retries} cases</div>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400">Payment Links</span>
                          <div className="font-bold text-teal-300">{msg.actionCard.suggestedBreakdown.paymentLinks} cases</div>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400">Reminders</span>
                          <div className="font-bold text-amber-300">{msg.actionCard.suggestedBreakdown.reminders} cases</div>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400">Manual Reviews</span>
                          <div className="font-bold text-purple-300">{msg.actionCard.suggestedBreakdown.manualReviews} cases</div>
                        </div>
                      </div>
                    )}

                    {/* Action Confirmation Buttons */}
                    {msg.actionCard.type === 'CAMPAIGN_APPROVAL' && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                        <Button
                          variant="glow"
                          size="sm"
                          onClick={handleApproveCopilotCampaign}
                          className="text-xs font-semibold"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-slate-950" />
                          Approve & Execute Campaign
                        </Button>
                        <Link href="/campaigns">
                          <Button variant="outline" size="sm" className="text-xs">
                            Review in Hub
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-[10px] text-slate-500 font-mono px-1">
                  {formatTimeOnly(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-300">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <span>Querying live database & computing explainable scoring...</span>
            </div>
          )}

          {campaignActionMsg && (
            <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {campaignActionMsg}
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Prompt Suggestions Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar text-[11px]">
            <span className="text-slate-400 font-mono text-[10px] uppercase shrink-0">Prompts:</span>
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-700/60 text-slate-300 hover:text-white whitespace-nowrap transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Text Input */}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              placeholder="Ask Copilot about revenue at risk, recovery metrics, or start campaigns..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Button
              variant="primary"
              size="md"
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isThinking}
              className="h-10 px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
