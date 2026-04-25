import React from 'react';
import { FileText, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PDFViewer({ pdfUrl, activePage, onClose }) {
    if (!pdfUrl) return null;

    // #view=FitH fits the PDF width to the viewer, page= jumps to citation
    const viewUrl = `${pdfUrl}#view=FitH&toolbar=1${activePage ? `&page=${activePage}` : ''}`;

    return (
        <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 360, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="w-[360px] h-full flex-col z-10 shrink-0 shadow-2xl border-l transition-colors hidden md:flex"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        >
            {/* Header */}
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
                    className="p-1 rounded-md text-slate-500 hover:text-slate-200 transition-colors">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* PDF iframe — fills remaining height exactly */}
            <div className="flex-1 overflow-hidden" style={{ background: 'var(--bg-base)' }}>
                <iframe
                    key={viewUrl}
                    src={viewUrl}
                    className="w-full h-full border-0"
                    title="PDF Viewer"
                    style={{ display: 'block' }}
                />
            </div>
        </motion.div>
    );
}
