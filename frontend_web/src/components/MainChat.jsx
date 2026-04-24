import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Sparkles, GraduationCap, FileSearch, List, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

const SUGGESTED_PROMPTS = [
    { icon: FileSearch, text: 'Summarize the key points of this document' },
    { icon: List,       text: 'What are the main topics covered?' },
    { icon: Lightbulb,  text: 'List the most important definitions' },
];

export default function MainChat({ messages, isGenerating, onCitationClick, onSuggestedPrompt, hasDocument }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isGenerating]);

    return (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col relative scroll-smooth transition-colors"
            style={{ background: 'var(--bg-base)' }}>

            {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl mx-auto w-full">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 relative">
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Ask anything about your docs</h2>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                        I'll search through your document and provide answers with page citations.
                    </p>
                    {hasDocument && (
                        <div className="flex flex-col gap-2 w-full">
                            {SUGGESTED_PROMPTS.map(({ icon: Icon, text }, i) => (
                                <motion.button key={i}
                                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.07 }}
                                    onClick={() => onSuggestedPrompt(text)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all group hover:border-indigo-500/40"
                                    style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                    <Icon className="w-4 h-4 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
                                    {text}
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-full max-w-3xl mx-auto flex flex-col gap-5 pb-4">
                    {messages.map((message, index) => (
                        <motion.div key={index}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex gap-3 w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                            {message.role === 'assistant' && (
                                <div className="w-8 h-8 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mt-1">
                                    <Bot className="w-4 h-4 text-indigo-400" />
                                </div>
                            )}

                            <div className={`max-w-[82%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                                style={message.role === 'user'
                                    ? { background: '#4f46e5', color: '#ffffff' }
                                    : { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>

                                {message.role === 'assistant' ? (
                                    <div className="prose max-w-none text-[13px] leading-relaxed"
                                        style={{ '--tw-prose-body': 'var(--text-primary)', '--tw-prose-headings': 'var(--text-primary)', '--tw-prose-code': 'var(--text-primary)' }}>
                                        {message.grade && (
                                            <div className="flex items-center gap-1.5 mb-2 not-prose">
                                                <GraduationCap className="w-3 h-3 text-indigo-400" />
                                                <span className="text-[10px] text-indigo-400 font-semibold">Class {message.grade}</span>
                                            </div>
                                        )}
                                        <ReactMarkdown>{message.content}</ReactMarkdown>
                                        {message.citations?.length > 0 && (
                                            <div className="mt-2.5 pt-2.5 border-t flex flex-wrap gap-1.5 items-center not-prose"
                                                style={{ borderColor: 'var(--border)' }}>
                                                <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Sources:</span>
                                                {message.citations.map((page, i) => (
                                                    <span key={i} onClick={() => onCitationClick?.(page)}
                                                        className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-medium cursor-pointer hover:bg-indigo-500/20 transition-colors">
                                                        Page {page}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-[13px] leading-relaxed">{message.content}</p>
                                )}
                            </div>

                            {message.role === 'user' && (
                                <div className="w-8 h-8 shrink-0 rounded-xl flex items-center justify-center mt-1 border"
                                    style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                                    <User className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {isGenerating && (
                        <div className="flex gap-3 w-full justify-start">
                            <div className="w-8 h-8 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mt-1">
                                <Bot className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div className="rounded-2xl rounded-tl-sm px-4 py-3 border"
                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                <div className="flex items-center gap-1.5">
                                    {[0, 150, 300].map(delay => (
                                        <div key={delay} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                                            style={{ animationDelay: `${delay}ms` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            )}
        </div>
    );
}
