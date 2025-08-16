import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, Zap, Info } from 'lucide-react';
import { signalsService } from '@/services/signals';
import Button from '@/components/button';
import CheckButton from '@/components/check-button';
import type { Signal, ImproveSignalRequest, NumericOrComposite } from '@/types/signals';

interface ImprovementModalProps {
  signal: Signal;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImprovementModal({ signal, isOpen, onClose, onSuccess }: ImprovementModalProps) {
  const [editEntry, setEditEntry] = useState(false);
  const [editSL, setEditSL] = useState(false);
  const [editTP, setEditTP] = useState(false);
  const [addAnalysis, setAddAnalysis] = useState(false);

  const [newEntry, setNewEntry] = useState<number>(signal.entryPrice);
  const [newSL, setNewSL] = useState<number>(signal.stopLoss ?? signal.entryPrice);
  const [newTP, setNewTP] = useState<number>(signal.takeProfit ?? signal.entryPrice);
  const [reasoning, setReasoning] = useState('');

  const [checking, setChecking] = useState(false);
  const [minting, setMinting] = useState(false);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [canMint, setCanMint] = useState(false);
  const [improvementIndex, setImprovementIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setEditEntry(false);
      setEditSL(false);
      setEditTP(false);
      setAddAnalysis(false);
      setNewEntry(signal.entryPrice);
      setNewSL(signal.stopLoss ?? signal.entryPrice);
      setNewTP(signal.takeProfit ?? signal.entryPrice);
      setReasoning('');
      setChecking(false);
      setMinting(false);
      setQualityScore(null);
      setCanMint(false);
      setImprovementIndex(null);
    }
  }, [isOpen, signal]);

  const hasAnyChange = useMemo(() => {
    const changedEntry = editEntry && newEntry !== signal.entryPrice;
    const changedSL = editSL && newSL !== (signal.stopLoss ?? signal.entryPrice);
    const changedTP = editTP && newTP !== (signal.takeProfit ?? signal.entryPrice);
    const wroteAnalysis = addAnalysis && reasoning.trim().length > 0;
    return changedEntry || changedSL || changedTP || wroteAnalysis;
  }, [editEntry, editSL, editTP, addAnalysis, newEntry, newSL, newTP, signal, reasoning]);

  const buildImprovementPayload = (): ImproveSignalRequest => {
    const original: Record<string, number | undefined> = {};
    const improved: Record<string, number | undefined> = {};

    if (editEntry) {
      original.entryPrice = signal.entryPrice;
      improved.entryPrice = newEntry;
    }
    if (editSL) {
      original.stopLoss = signal.stopLoss;
      improved.stopLoss = newSL;
    }
    if (editTP) {
      original.takeProfit = signal.takeProfit;
      improved.takeProfit = newTP;
    }

    const changedKeys = Object.keys(improved);

    let improvementType: ImproveSignalRequest['improvementType'] = 'analysis-enhancement';
    if (changedKeys.length === 1) {
      const only = changedKeys[0];
      if (only === 'entryPrice') improvementType = 'entry-adjustment';
      if (only === 'stopLoss') improvementType = 'stop-loss-adjustment';
      if (only === 'takeProfit') improvementType = 'take-profit-adjustment';
    }

    const originalValue: NumericOrComposite =
      changedKeys.length === 0
        ? null
        : changedKeys.length === 1
        ? (original as any)[changedKeys[0]]!
        : (original as NumericOrComposite);

    const improvedValue: NumericOrComposite =
      changedKeys.length === 0
        ? null
        : changedKeys.length === 1
        ? (improved as any)[changedKeys[0]]!
        : (improved as NumericOrComposite);

    return {
      improvementType,
      originalValue,
      improvedValue,
      reasoning: addAnalysis ? reasoning.trim() : '',
    };
  };

  const handleCheck = async () => {
    if (!hasAnyChange) return;
    setChecking(true);
    setQualityScore(null);
    setCanMint(false);
    try {
      const payload = buildImprovementPayload();
      await signalsService.improveSignal(signal.id, payload);
      const latest = await signalsService.getSignal(signal.id);
      const idx = (latest.signal.improvements?.length || 1) - 1;
      setImprovementIndex(idx);

      const score = calcScore(payload);
      setQualityScore(score);
      setCanMint(score >= 50);
    } catch (e: any) {
      const msg: string = e?.message || '';
      const m = msg.match(/\((\d+)\/100\)/);
      if (m) {
        setQualityScore(Number(m[1]));
        setCanMint(false);
      } else {
        setQualityScore(20);
        setCanMint(false);
      }
    } finally {
      setChecking(false);
    }
  };

  const handleMint = async () => {
    if (improvementIndex == null) return;
    setMinting(true);
    try {
      await signalsService.mintImprovement(signal.id, improvementIndex);
      onSuccess();
      onClose();
    } finally {
      setMinting(false);
    }
  };

  const calcScore = (imp: ImproveSignalRequest) => {
    let score = 0;
    const r = imp.reasoning || '';
    if (r.length >= 50) score += 20;
    if (r.length >= 100) score += 10;
    if (r.length >= 150) score += 10;

    const orig = imp.originalValue as any;
    const next = imp.improvedValue as any;

    const pct = (a?: number, b?: number) =>
      typeof a === 'number' && typeof b === 'number' && a !== 0
        ? Math.abs((b - a) / a)
        : 0;

    const p1 = pct(orig?.entryPrice ?? orig, next?.entryPrice ?? next);
    const p2 = pct(orig?.stopLoss ?? orig, next?.stopLoss ?? next);
    const p3 = pct(orig?.takeProfit ?? orig, next?.takeProfit ?? next);

    const maxChange = Math.max(p1, p2, p3, 0);
    if (maxChange > 0.01) score += 15;
    if (maxChange > 0.02) score += 15;

    const terms = ['support','resistance','volume','momentum','rsi','macd','fibonacci','trend','breakout','liquidity'];
    const used = terms.filter(t => r.toLowerCase().includes(t)).length;
    score += Math.min(20, used * 3);

    if (r.includes('.')) score += 5;
    if (r.split(' ').length >= 15) score += 5;

    return Math.min(100, score);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
            onClick={() => { if (!minting && !checking) onClose(); }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-3xl rounded-xl border border-neutral-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">Improve Signal</h2>
                <p className="text-sm text-neutral-500">{signal.symbol} — Select changes, justify, then evaluate.</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                title="Close"
                className="p-2 rounded-lg hover:bg-neutral-100 active:scale-95 transition h-auto"
                disabled={minting || checking}
              >
                <X className="w-5 h-5 text-neutral-700" />
              </Button>
            </div>

            <div className="px-6 py-5 space-y-6 max-h-[72vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="secondary"
                  onClick={() => setEditEntry(v => !v)}
                  className={`text-left rounded-lg border p-4 transition w-full h-auto ${
                    editEntry ? 'border-blue-500 bg-blue-50' : 'border-neutral-300 hover:border-neutral-400'
                  }`}
                  disabled={minting || checking}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">Entry</span>
                    <input type="checkbox" checked={editEntry} readOnly />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 w-full">Current: ${signal.entryPrice}</p>
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => setEditSL(v => !v)}
                  className={`text-left rounded-lg border p-4 transition w-full h-auto ${
                    editSL ? 'border-blue-500 bg-blue-50' : 'border-neutral-300 hover:border-neutral-400'
                  }`}
                  disabled={minting || checking}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">Stop Loss</span>
                    <input type="checkbox" checked={editSL} readOnly />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 w-full">Current: ${signal.stopLoss ?? '-'}</p>
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => setEditTP(v => !v)}
                  className={`text-left rounded-lg border p-4 transition w-full h-auto ${
                    editTP ? 'border-blue-500 bg-blue-50' : 'border-neutral-300 hover:border-neutral-400'
                  }`}
                  disabled={minting || checking}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">Take Profit</span>
                    <input type="checkbox" checked={editTP} readOnly />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 w-full">Current: ${signal.takeProfit ?? '-'}</p>
                </Button>
              </div>

              {editEntry && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">New Entry</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newEntry}
                    onChange={e => setNewEntry(Number(e.target.value))}
                    disabled={minting || checking}
                  />
                </div>
              )}

              {editSL && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">New Stop Loss</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newSL}
                    onChange={e => setNewSL(Number(e.target.value))}
                    disabled={minting || checking}
                  />
                </div>
              )}

              {editTP && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">New Take Profit</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTP}
                    onChange={e => setNewTP(Number(e.target.value))}
                    disabled={minting || checking}
                  />
                </div>
              )}

              <div className={`rounded-lg border ${addAnalysis ? 'border-blue-500 bg-blue-50' : 'border-neutral-300'}`}>
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
                  onClick={() => setAddAnalysis(v => !v)}
                >
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={addAnalysis} readOnly />
                    <span className="font-medium">Add analysis / justification</span>
                  </div>
                  <div className="flex items-center text-xs text-neutral-500 gap-1">
                    <Info className="w-3.5 h-3.5" />
                    Boosts quality score
                  </div>
                </div>
                {addAnalysis && (
                  <div className="px-4 pb-4">
                    <textarea
                      rows={6}
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="Explain your improvement with technical analysis, market structure, liquidity, momentum, risk, etc."
                      value={reasoning}
                      onChange={e => setReasoning(e.target.value)}
                      disabled={minting || checking}
                    />
                    <div className="mt-1 text-xs text-neutral-500">{reasoning.length}/1000</div>
                  </div>
                )}
              </div>

              {signal.registeredAsIP && (
                <div className="text-xs text-neutral-600">
                  Parent minted: <span className="font-medium">Yes</span>{' '}
                  {signal.ipTokenId && (
                    <span className="text-neutral-500">
                      (#{String(signal.ipTokenId).slice(0, 6)}…{String(signal.ipTokenId).slice(-6)})
                    </span>
                  )}
                </div>
              )}

              {qualityScore !== null && (
                <div
                  className={`rounded-lg border px-4 py-3 ${
                    canMint ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {canMint ? <Check className="w-5 h-5 text-green-700" /> : <AlertCircle className="w-5 h-5 text-red-700" />}
                    <div className="font-medium">
                      Quality Assessment: {qualityScore}/100 {canMint ? '— Eligible to mint.' : '— Needs more work.'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-neutral-200">
              <Button
                variant="secondary"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-50"
                disabled={minting || checking}
              >
                Cancel
              </Button>
              {canMint ? (
                <Button
                  onClick={handleMint}
                  disabled={minting}
                  className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-white font-medium bg-green-600 hover:bg-green-700 disabled:opacity-60"
                >
                  {minting ? (
                    <span className="inline-flex items-center">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent" />
                      Minting…
                    </span>
                  ) : (
                    <span className="inline-flex items-center">
                      <Zap className="w-4 h-4 mr-2" />
                      Mint as Derivative IP
                    </span>
                  )}
                </Button>
              ) : (
                <CheckButton
                  onClick={handleCheck}
                  loading={checking}
                  disabled={!hasAnyChange}
                  label="Ask AI to Check"
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}