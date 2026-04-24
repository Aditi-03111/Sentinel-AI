import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ onSendMessage, isGenerating, prefill, onPrefillConsumed }) {
    const [input, setInput] = useState('');

    useEffect(() => {
        if (prefill) { setInput(prefill); onPrefillConsumed?.(); }
    }, [prefill]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !isGenerating) { onSendMessage(input.trim()); setInput(''); }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
    };

    return (
        <div className="w-full pt-2 pb-3 px-4 z-20 shrink-0 transition-colors" style={{ background: 'var(--bg-base)' }}>
            <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit}
                    className="flex items-end gap-2 rounded-2xl shadow-lg p-2 border transition-all duration-200 focus-within:border-indigo-500/50"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question about your document..."
                        className="w-full max-h-36 min-h-[48px] bg-transparent border-none resize-none px-4 py-3 focus:outline-none focus:ring-0 text-[14px] font-medium leading-relaxed placeholder:opacity-40"
                        style={{ color: 'var(--text-primary)' }}
                        rows={1}
                        disabled={isGenerating}
                    />
                    <button type="submit" disabled={!input.trim() || isGenerating}
                        className="shrink-0 rounded-xl bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-500 transition-colors h-[40px] w-[40px] flex items-center justify-center m-1 group">
                        <Send className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    </button>
                </form>
                <p className="text-center text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                    AI can make mistakes. Verify important information using the citations provided.
                </p>
            </div>
        </div>
    );
}
