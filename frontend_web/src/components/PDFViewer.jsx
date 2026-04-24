import React from 'react';
import { FileText, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PDFViewer({ pdfUrl, activePage, onClose }) {
    if (!pdfUrl) return null;

    const viewUrl = activePage ? `${pdfUrl}#page=${activePage}` : pdfUrl;

    return (
        <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="w-[340px] h-full flex flex-col z-10 shrink-0 shadow-2xl border-l transition-colors"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        >
            <div className="h-11 border-b flex items-center justify-between px-4 shrink-0"
                style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Document Viewer</span>
                    {activePage && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 uppercase tracking-wider">
                            P.{activePage}
                        </span>
                    )}
                </div>
                <button onClick={onClose}
                    className="p-1 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-200 transition-colors">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="flex-1 p-1.5 min-h-0" style={{ background: 'var(--bg-base)' }}>
                <iframe
                    src={viewUrl}
                    className="w-full h-full rounded-lg border border-slate-800/60 bg-white"
                    title="PDF Viewer"
                />
            </div>
        </motion.div>
    );
}
