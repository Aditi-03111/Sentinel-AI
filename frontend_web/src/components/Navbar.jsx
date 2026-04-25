import React from 'react';
import { MessageSquare, HelpCircle, GraduationCap, Settings, GitBranch, Sun, Moon, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeContext';

const GRADE_LABELS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Class ${i + 1}` }));

export default function Navbar({ activeTab, onTabChange, grade, onGradeChange, onGenerateQuiz, onGenerateMindMap, hasDocument, isSummarizing, isMindMapping, onMenuOpen }) {
    const { theme, toggle } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="h-11 shrink-0 border-b flex items-center px-3 md:px-4 gap-2 md:gap-3 z-20 transition-colors"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>

            {/* Hamburger — mobile only */}
            <button onClick={onMenuOpen}
                className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center border shrink-0"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                <Menu className="w-4 h-4 text-indigo-400" />
            </button>

            {/* Tabs */}
            <div className="flex items-center gap-0.5 rounded-lg p-0.5 shrink-0" style={{ background: 'var(--bg-elevated)' }}>
                {[
                    { id: 'chat',    icon: MessageSquare, label: 'Chat' },
                    { id: 'quiz',    icon: HelpCircle,    label: 'Quiz' },
                    { id: 'mindmap', icon: GitBranch,     label: 'Map' },
                ].map(({ id, icon: Icon, label }) => (
                    <button key={id} onClick={() => onTabChange(id)}
                        className="relative flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all"
                        style={{ color: activeTab === id ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {activeTab === id && (
                            <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-md"
                                style={{ background: isDark ? '#334155' : '#e2e8f0' }} />
                        )}
                        <Icon className="w-3.5 h-3.5 relative z-10" />
                        <span className="relative z-10 hidden sm:inline">{label}</span>
                    </button>
                ))}
            </div>

            {/* Action buttons */}
            {activeTab === 'quiz' && hasDocument && (
                <button onClick={onGenerateQuiz} disabled={isSummarizing}
                    className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[11px] font-semibold transition-colors shrink-0">
                    {isSummarizing ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HelpCircle className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">Generate Quiz</span>
                </button>
            )}
            {activeTab === 'mindmap' && hasDocument && (
                <button onClick={onGenerateMindMap} disabled={isMindMapping}
                    className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[11px] font-semibold transition-colors shrink-0">
                    {isMindMapping ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <GitBranch className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">Generate Map</span>
                </button>
            )}

            <div className="flex-1" />

            {/* Grade selector */}
            <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-1 rounded-lg border transition-colors shrink-0"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <select value={grade} onChange={(e) => onGradeChange(Number(e.target.value))}
                    className="border-none text-[11px] font-semibold focus:outline-none cursor-pointer bg-transparent w-16 md:w-auto"
                    style={{ color: 'var(--text-primary)' }}>
                    {GRADE_LABELS.map(({ value, label }) => (
                        <option key={value} value={value}
                            style={{ background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#e2e8f0' : '#0f172a' }}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Theme toggle */}
            <button onClick={toggle}
                className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all hover:border-indigo-500/50 shrink-0"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            </button>

            {/* User avatar — hidden on small screens */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l" style={{ borderColor: 'var(--border)' }}>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-[9px] font-bold text-white">U</div>
                <Settings className="w-3.5 h-3.5 cursor-pointer transition-colors" style={{ color: 'var(--text-muted)' }} />
            </div>
        </div>
    );
}
