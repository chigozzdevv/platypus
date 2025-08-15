import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { signalsService } from '@/services/signals';
import type { Signal, ImproveSignalRequest } from '@/types/signals';

interface ImprovementModalProps {
  signal: Signal;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type MultiForm = {
  changeEntry: boolean;
  changeStop: boolean;
  changeTake: boolean;
  extraAnalysis: boolean;
  newEntry?: number | '';
  newStop?: number | '';
  newTake?: number | '';
  reasoning: string;
};

export default function ImprovementModal({
  signal,
  isOpen,
  onClose,
  onSuccess,
}: ImprovementModalProps) {
  const [form, setForm] = useState<MultiForm>({
    changeEntry: false,
    changeStop: false,
    changeTake: false,
    extraAnalysis: true,
    newEntry: signal.entryPrice ?? '',
    newStop: signal.stopLoss ?? '',
    newTake: signal.takeProfit ?? '',
    reasoning: '',
  });

  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [canMint, setCanMint] = useState(false);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasAnySelection = form.changeEntry || form.changeStop || form.changeTake || form.extraAnalysis;
  const multiSelected =
    Number(!!form.changeEntry) +
      Number(!!form.changeStop) +
      Number(!!form.changeTake) +
      Number(!!form.extraAnalysis) >
    1;

  const disableEvaluate = useMemo(() => {
    if (!hasAnySelection) return true;
    if (form.changeEntry && (form.newEntry === '' || isNaN(Number(form.newEntry)))) return true;
    if (form.changeStop && (form.newStop === '' || isNaN(Number(form.newStop)))) return true;
    if (form.changeTake && (form.newTake === '' || isNaN(Number(form.newTake)))) return true;
    if ((multiSelected || form.extraAnalysis) && form.reasoning.trim().length < 30) return true;
    return false;
  }, [form, hasAnySelection, multiSelected]);

  function resetAssessment() {
    setQualityScore(null);
    setCanMint(false);
    setError(null);
  }

  function update<K extends keyof MultiForm>(key: K, value: MultiForm[K]) {
    setForm((s) => ({ ...s, [key]: value }));
    resetAssessment();
  }

  function buildPayload(): ImproveSignalRequest {

    if (multiSelected) {
      const improved = {
        entryPrice: form.changeEntry ? Number(form.newEntry) : signal.entryPrice,
        stopLoss: form.changeStop ? Number(form.newStop) : signal.stopLoss,
        takeProfit: form.changeTake ? Number(form.newTake) : signal.takeProfit,
      };
      const original = {
        entryPrice: signal.entryPrice,
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit,
      };
      const reasoning =
        form.reasoning ||
        [
          'Consolidated improvement:',
          form.changeEntry ? `• Entry → ${improved.entryPrice}` : null,
          form.changeStop ? `• Stop Loss → ${improved.stopLoss}` : null,
          form.changeTake ? `• Take Profit → ${improved.takeProfit}` : null,
        ]
          .filter(Boolean)
          .join('\n');

      return {
        improvementType: 'analysis-enhancement',
        originalValue: original,
        improvedValue: improved,
        reasoning,
      };
    }

    if (form.changeEntry) {
      return {
        improvementType: 'entry-adjustment',
        originalValue: signal.entryPrice,
        improvedValue: Number(form.newEntry),
        reasoning: form.reasoning,
      };
    }
    if (form.changeStop) {
      return {
        improvementType: 'stop-loss-adjustment',
        originalValue: signal.stopLoss,
        improvedValue: Number(form.newStop),
        reasoning: form.reasoning,
      };
    }
    if (form.changeTake) {
      return {
        improvementType: 'take-profit-adjustment',
        originalValue: signal.takeProfit,
        improvedValue: Number(form.newTake),
        reasoning: form.reasoning,
      };
    }

    return {
      improvementType: 'analysis-enhancement',
      originalValue: null,
      improvedValue: null,
      reasoning: form.reasoning,
    };
  }

  async function handleCheckQuality() {
    setChecking(true);
    setError(null);
    setQualityScore(null);
    setCanMint(false);
    try {
      const payload = buildPayload();
      const res = await signalsService.checkImprovementQuality(signal.id, payload);
      setQualityScore(res.qualityScore);
      setCanMint(!!res.canMint);
    } catch (e: any) {
      setError(e?.message || 'Failed to evaluate improvement.');
    } finally {
      setChecking(false);
    }
  }

  async function handleSubmitImprovement() {
    setSubmitting(true);
    setError(null);
    try {
      const payload = buildPayload();
      await signalsService.improveSignal(signal.id, payload);
      onSuccess(); // refresh lists
    } catch (e: any) {
      setError(e?.message || 'Failed to submit improvement.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMintDerivative() {
    setMinting(true);
    setError(null);
    try {
      // server only allows one improvement per signal; it will be index 0
      await signalsService.mintImprovement(signal.id, 0);
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to mint derivative.');
    } finally {
      setMinting(false);
    }
  }

  const originalEntry = signal.entryPrice;
  const originalStop = signal.stopLoss;
  const originalTake = signal.takeProfit;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Improve Signal</h2>
                <p className="text-sm text-neutral-600">
                  {signal.symbol} — Select changes, justify, then evaluate.
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
              {/* Select fields to change */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-2 rounded-lg border p-3">
                  <input
                    type="checkbox"
                    checked={form.changeEntry}
                    onChange={(e) => update('changeEntry', e.target.checked)}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Entry</div>
                    <div className="text-xs text-neutral-500">Current: ${originalEntry}</div>
                  </div>
                </label>
                <label className="flex items-center gap-2 rounded-lg border p-3">
                  <input
                    type="checkbox"
                    checked={form.changeStop}
                    onChange={(e) => update('changeStop', e.target.checked)}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Stop Loss</div>
                    <div className="text-xs text-neutral-500">
                      Current: {originalStop !== undefined && originalStop !== null ? `$${originalStop}` : '—'}
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-2 rounded-lg border p-3">
                  <input
                    type="checkbox"
                    checked={form.changeTake}
                    onChange={(e) => update('changeTake', e.target.checked)}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Take Profit</div>
                    <div className="text-xs text-neutral-500">
                      Current: {originalTake !== undefined && originalTake !== null ? `$${originalTake}` : '—'}
                    </div>
                  </div>
                </label>
              </div>

              {(form.changeEntry || form.changeStop || form.changeTake) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {form.changeEntry && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">New Entry</label>
                      <input
                        type="number"
                        value={form.newEntry as any}
                        onChange={(e) => update('newEntry', e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. 1234.56"
                      />
                    </div>
                  )}
                  {form.changeStop && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">New Stop Loss</label>
                      <input
                        type="number"
                        value={form.newStop as any}
                        onChange={(e) => update('newStop', e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. 1180.00"
                      />
                    </div>
                  )}
                  {form.changeTake && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">New Take Profit</label>
                      <input
                        type="number"
                        value={form.newTake as any}
                        onChange={(e) => update('newTake', e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. 1320.00"
                      />
                    </div>
                  )}
                </div>
              )}

              <label className="flex items-center gap-2 rounded-lg border p-3">
                <input
                  type="checkbox"
                  checked={form.extraAnalysis}
                  onChange={(e) => update('extraAnalysis', e.target.checked)}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">Add analysis / justification</div>
                  <div className="text-xs text-neutral-500">Boosts quality score</div>
                </div>
              </label>

              {form.extraAnalysis && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Improvement Reasoning
                  </label>
                  <textarea
                    value={form.reasoning}
                    onChange={(e) => update('reasoning', e.target.value)}
                    placeholder="Explain the adjustments with TA/market context (support/resistance, momentum, volume, risk/reward, etc.)"
                    rows={6}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-neutral-500 mt-1">{form.reasoning.length}/1000 characters</p>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
                  {error}
                </div>
              )}

              {qualityScore !== null && (
                <div
                  className={`p-4 rounded-lg border ${
                    canMint ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    {canMint ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
                    )}
                    <h3 className={`font-semibold ${canMint ? 'text-green-900' : 'text-orange-900'}`}>
                      Quality Assessment: {qualityScore}/100
                    </h3>
                  </div>
                  <p className={`${canMint ? 'text-green-800' : 'text-orange-800'} text-sm`}>
                    {canMint
                      ? 'Great! You can submit and mint this as a derivative IP.'
                      : 'Needs stronger justification or more substantive adjustments.'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t p-6">
              <div className="text-xs text-neutral-500">
                Parent minted:{' '}
                {signal.registeredAsIP && signal.ipTokenId ? `Yes (#${signal.ipTokenId})` : 'No'}
              </div>

              <div className="flex gap-3">
                {qualityScore === null ? (
                  <button
                    onClick={handleCheckQuality}
                    disabled={disableEvaluate || checking}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
                  >
                    {checking ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking Quality...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Check Improvement Impact
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSubmitImprovement}
                      disabled={submitting || !hasAnySelection}
                      className="flex-1 bg-neutral-900 text-white py-3 px-4 rounded-lg hover:bg-neutral-800 transition-colors font-medium disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Improvement'
                      )}
                    </button>

                    <button
                      onClick={handleMintDerivative}
                      disabled={
                        minting ||
                        !canMint ||
                        !signal.registeredAsIP ||
                        !signal.ipTokenId
                      }
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
                      title={
                        !signal.registeredAsIP
                          ? 'Original must be minted first'
                          : !canMint
                          ? 'Quality not high enough'
                          : 'Mint derivative'
                      }
                    >
                      {minting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Minting IP...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Mint as Derivative IP
                        </>
                      )}
                    </button>
                  </>
                )}

                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}