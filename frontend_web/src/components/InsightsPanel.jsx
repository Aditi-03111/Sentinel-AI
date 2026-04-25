import { useState } from 'react';
import { Sparkles, Tag, BookOpen, BarChart2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TOPIC_STYLES = [
    { bg: 'bg-indigo-950',  border: 'border-indigo-500',  text: 'text-indigo-300' },
    { bg: 'bg-purple-950',  border: 'border-purple-500',  text: 'text-purple-300' },
    { bg: 'bg-cyan-950',    border: 'border-cyan-500',    text: 'text-cyan-300' },
    { bg: 'bg-violet-950',  border: 'border-violet-500',  text: 'text-violet-300' },
    { bg: 'bg-blue-950',    border: 'border-blue-500',    text: 'text-blue-300' },
    { bg: 'bg-fuchsia-950', border: 'border-fuchsia-500', text: 'text-fuchsia-300' },
];

const TERM_STYLES = [
    { bg: 'bg-teal-950',    border: 'border-teal-500',    text: 'text-teal-300' },
    { bg: 'bg-emerald-950', border: 'border-emerald-600', text: 'text-emerald-300' },
    { bg: 'bg-sky-950',     border: 'border-sky-500',     text: 'text-sky-300' },
    { bg: 'bg-green-950',   border: 'border-green-600',   text: 'text-green-300' },
    { bg: 'bg-lime-950',    border: 'border-lime-600',    text: 'text-lime-300' },
    { bg: 'bg-amber-950',   border: 'border-amber-500',   text: 'text-amber-300' },
    { bg: 'bg-orange-950',  border: 'border-orange-600',  text: 'text-orange-300' },
    { bg: 'bg-rose-950',    border: 'border-rose-600',    text: 'text-rose-300' },
];

function Chip({ label, style }) {
    return (
        <div className={`px-3 py-1.5 rounded-xl border ${style.bg} ${style.border} ${style.text} text-[11px] font-semibold leading-snug break-words w-full`}>
            {label}
        </div>
    );
}

function SectionBox({ icon: Icon, iconColor, label, children }) {
    return (
        <div className="flex flex-col rounded-2xl border overflow-hidden transition-colors"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0"
                style={{ borderColor: 'var(--border-subtle)' }}>
                <Icon className={`w-3.5 h-3.5 shrink-0 ${iconColor}`} />
                <span className={`text-[10px] font-bold uppercase tracking-widest ${iconColor}`}>{label}</span>
            </div>
            <div className="p-3 overflow-y-auto" style={{ maxHeight: '220px', color: 'var(--text-secondary)' }}>
                {children}
            </div>
        </div>
    );
}

function SkeletonBox() {
    return (
        <div className="rounded-2xl border p-4 animate-pulse flex flex-col gap-2 transition-colors"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
            <div className="h-3 w-20 rounded opacity-30" style={{ background: 'var(--text-muted)' }} />
            <div className="h-7 w-full rounded-xl opacity-20" style={{ background: 'var(--text-muted)' }} />
            <div className="h-7 w-4/5 rounded-xl opacity-15" style={{ background: 'var(--text-muted)' }} />
            <div className="h-7 w-3/5 rounded-xl opacity-10" style={{ background: 'var(--text-muted)' }} />
        </div>
    );
}

export default function InsightsPanel({ insights, isLoading }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="mx-4 mt-3 mb-2 rounded-2xl border overflow-hidden shrink-0 transition-colors"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            {/* Panel header */}
            <button
                onClick={() => setCollapsed(c => !c)}
                className="w-full flex items-center justify-between px-5 py-2.5 border-b hover:opacity-80 transition-colors"
                style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Document Insights</span>
                    {isLoading && <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />}
                    {insights && !isLoading && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold tracking-wide">
                            Ready
                        </span>
                    )}
                </div>
                {collapsed
                    ? <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    : <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                }
            </button>

            <AnimatePresence initial={false}>
                {!collapsed && (
                    <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isLoading ? (
                            <div className="p-4 grid grid-cols-4 gap-3">
                                <SkeletonBox /><SkeletonBox /><SkeletonBox /><SkeletonBox />
                            </div>
                        ) : insights ? (
                            <div className="p-4 grid grid-cols-4 gap-3 items-start">

                                {/* Summary box */}
                                <SectionBox icon={BookOpen} iconColor="text-indigo-400" label="Summary">
                                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{insights.summary}</p>
                                </SectionBox>

                                {/* Topics box */}
                                <SectionBox icon={Tag} iconColor="text-violet-400" label="Topics">
                                    <div className="flex flex-col gap-1.5">
                                        {insights.topics.map((t, i) => (
                                            <Chip key={i} label={t} style={TOPIC_STYLES[i % TOPIC_STYLES.length]} />
                                        ))}
                                    </div>
                                </SectionBox>

                                {/* Key Terms box */}
                                <SectionBox icon={Sparkles} iconColor="text-emerald-400" label="Key Terms">
                                    <div className="flex flex-col gap-1.5">
                                        {insights.key_terms.map((t, i) => (
                                            <Chip key={i} label={t} style={TERM_STYLES[i % TERM_STYLES.length]} />
                                        ))}
                                    </div>
                                </SectionBox>

                                {/* Stats box */}
                                <SectionBox icon={BarChart2} iconColor="text-amber-400" label="Stats">
                                    <div className="flex flex-col gap-2">
                                        <div className="rounded-xl border p-3 flex flex-col items-center justify-center"
                                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                                            <span className="text-3xl font-bold leading-none" style={{ color: 'var(--text-primary)' }}>{insights.stats.pages}</span>
                                            <span className="text-[10px] uppercase tracking-widest mt-1 font-semibold" style={{ color: 'var(--text-muted)' }}>Pages</span>
                                        </div>
                                        <div className="rounded-xl border border-violet-500/30 bg-violet-950/30 p-3 flex flex-col items-center justify-center">
                                            <span className="text-2xl font-bold text-violet-300 leading-none">{insights.stats.topics}</span>
                                            <span className="text-[10px] uppercase tracking-widest text-violet-400 mt-1 font-semibold">Topics</span>
                                        </div>
                                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 flex flex-col items-center justify-center">
                                            <span className="text-2xl font-bold text-emerald-300 leading-none">{insights.stats.terms}</span>
                                            <span className="text-[10px] uppercase tracking-widest text-emerald-400 mt-1 font-semibold">Terms</span>
                                        </div>
                                    </div>
                                </SectionBox>

                            </div>
                        ) : (
                            <div className="p-4 grid grid-cols-4 gap-3">
                                <SkeletonBox /><SkeletonBox /><SkeletonBox /><SkeletonBox />
                                <div className="col-span-4 text-center text-xs -mt-1 pb-1" style={{ color: 'var(--text-muted)' }}>
                                    Upload a PDF to generate insights
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
