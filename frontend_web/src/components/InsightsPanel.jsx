import { useState, useEffect } from 'react';
import { Sparkles, Tag, BookOpen, BarChart2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function useIsLight() {
    const [isLight, setIsLight] = useState(document.documentElement.classList.contains('light'));
    useEffect(() => {
        const obs = new MutationObserver(() => setIsLight(document.documentElement.classList.contains('light')));
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);
    return isLight;
}

const TOPIC_STYLES = [
    { darkBg: '#1e1b4b', darkBorder: '#6366f1', darkText: '#a5b4fc', lightBg: '#ede9fe', lightBorder: '#a78bfa', lightText: '#3730a3' },
    { darkBg: '#1a1040', darkBorder: '#a855f7', darkText: '#d8b4fe', lightBg: '#f3e8ff', lightBorder: '#c084fc', lightText: '#581c87' },
    { darkBg: '#0c2a3a', darkBorder: '#06b6d4', darkText: '#67e8f9', lightBg: '#ecfeff', lightBorder: '#22d3ee', lightText: '#164e63' },
    { darkBg: '#1a0a2e', darkBorder: '#8b5cf6', darkText: '#c4b5fd', lightBg: '#f5f3ff', lightBorder: '#8b5cf6', lightText: '#4c1d95' },
    { darkBg: '#0a1a3a', darkBorder: '#3b82f6', darkText: '#93c5fd', lightBg: '#eff6ff', lightBorder: '#60a5fa', lightText: '#1e3a8a' },
    { darkBg: '#2a0a2e', darkBorder: '#d946ef', darkText: '#f0abfc', lightBg: '#fdf4ff', lightBorder: '#e879f9', lightText: '#701a75' },
];

const TERM_STYLES = [
    { darkBg: '#0a2a28', darkBorder: '#14b8a6', darkText: '#5eead4', lightBg: '#f0fdfa', lightBorder: '#2dd4bf', lightText: '#134e4a' },
    { darkBg: '#0a2a1a', darkBorder: '#10b981', darkText: '#6ee7b7', lightBg: '#ecfdf5', lightBorder: '#34d399', lightText: '#064e3b' },
    { darkBg: '#0a1e2e', darkBorder: '#0ea5e9', darkText: '#7dd3fc', lightBg: '#f0f9ff', lightBorder: '#38bdf8', lightText: '#0c4a6e' },
    { darkBg: '#0a2a10', darkBorder: '#22c55e', darkText: '#86efac', lightBg: '#f0fdf4', lightBorder: '#4ade80', lightText: '#14532d' },
    { darkBg: '#1a2a0a', darkBorder: '#84cc16', darkText: '#bef264', lightBg: '#f7fee7', lightBorder: '#a3e635', lightText: '#365314' },
    { darkBg: '#2a1a0a', darkBorder: '#f59e0b', darkText: '#fcd34d', lightBg: '#fffbeb', lightBorder: '#fbbf24', lightText: '#78350f' },
    { darkBg: '#2a100a', darkBorder: '#f97316', darkText: '#fdba74', lightBg: '#fff7ed', lightBorder: '#fb923c', lightText: '#7c2d12' },
    { darkBg: '#2a0a10', darkBorder: '#f43f5e', darkText: '#fda4af', lightBg: '#fff1f2', lightBorder: '#fb7185', lightText: '#881337' },
];

function Chip({ label, style }) {
    const isLight = useIsLight();
    const s = isLight
        ? { background: style.lightBg, borderColor: style.lightBorder, color: style.lightText }
        : { background: style.darkBg, borderColor: style.darkBorder, color: style.darkText };
    return (
        <div className="px-3 py-1.5 rounded-xl border text-[11px] font-semibold leading-snug break-words w-full" style={s}>
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
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <SkeletonBox /><SkeletonBox /><SkeletonBox /><SkeletonBox />
                            </div>
                        ) : insights ? (
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start">

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
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
