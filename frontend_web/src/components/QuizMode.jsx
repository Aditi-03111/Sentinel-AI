import React, { useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Trophy, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizMode({ quiz, isLoading, onRegenerate, grade }) {
    const [selected, setSelected] = useState({});
    const [revealed, setRevealed] = useState({});

    const handleSelect = (qIdx, option) => {
        if (revealed[qIdx]) return;
        setSelected(prev => ({ ...prev, [qIdx]: option }));
        setRevealed(prev => ({ ...prev, [qIdx]: true }));
    };

    const handleReset = () => {
        setSelected({});
        setRevealed({});
    };

    const score = quiz?.questions
        ? quiz.questions.filter((q, i) => revealed[i] && selected[i] === q.answer).length
        : 0;
    const total = quiz?.questions?.length || 0;
    const allAnswered = total > 0 && Object.keys(revealed).length === total;

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ color: 'var(--text-secondary)' }}>
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                <p className="text-sm">Generating quiz for Class {grade}...</p>
            </div>
        );
    }

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-500">
                <Trophy className="w-12 h-12 opacity-30" />
                <p className="text-sm">Upload a document and click "Generate Quiz" to start.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto px-8 py-6 transition-colors" style={{ background: 'var(--bg-base)' }}>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>Quiz · Class {grade}</h2>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{total} questions based on your document</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {allAnswered && (
                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                <Trophy className="w-4 h-4 text-indigo-400" />
                                <span className="text-sm font-bold text-indigo-300">{score}/{total}</span>
                            </motion.div>
                        )}
                        <button onClick={() => { handleReset(); onRegenerate(); }}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs hover:border-indigo-500/40 transition-colors">
                            <RefreshCw className="w-3.5 h-3.5" /> New Quiz
                        </button>
                    </div>
                </div>

                {/* Questions */}
                <div className="flex flex-col gap-5 pb-8">
                    {quiz.questions.map((q, qIdx) => {
                        const isAnswered = revealed[qIdx];
                        const userAnswer = selected[qIdx];
                        return (
                            <motion.div key={qIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: qIdx * 0.05 }}
                                className="rounded-2xl border border-slate-700/50 bg-slate-800/40 overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-700/30">
                                    <div className="flex items-start gap-3">
                                        <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 text-xs font-bold flex items-center justify-center mt-0.5">
                                            {qIdx + 1}
                                        </span>
                                        <p className="text-sm text-slate-200 leading-relaxed">{q.question}</p>
                                    </div>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-2">
                                    {q.options.map((opt, oIdx) => {
                                        const isCorrect = opt === q.answer;
                                        const isSelected = userAnswer === opt;
                                        let cls = 'border-slate-700/50 bg-slate-800/30 text-slate-300 hover:border-indigo-500/40 hover:bg-slate-800/60 cursor-pointer';
                                        if (isAnswered) {
                                            if (isCorrect) cls = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 cursor-default';
                                            else if (isSelected) cls = 'border-red-500/50 bg-red-500/10 text-red-300 cursor-default';
                                            else cls = 'border-slate-700/30 bg-slate-800/20 text-slate-500 cursor-default opacity-50';
                                        }
                                        return (
                                            <button key={oIdx} onClick={() => handleSelect(qIdx, opt)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium text-left transition-all ${cls}`}>
                                                {isAnswered && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                                                {isAnswered && isSelected && !isCorrect && <XCircle className="w-3.5 h-3.5 shrink-0" />}
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                                <AnimatePresence>
                                    {isAnswered && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                            className="px-5 pb-4">
                                            <div className="px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/30">
                                                <p className="text-xs text-slate-400 leading-relaxed">
                                                    <span className="text-indigo-400 font-semibold">Explanation: </span>
                                                    {q.explanation}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
