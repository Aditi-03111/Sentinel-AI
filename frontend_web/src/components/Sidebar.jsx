import React from 'react';
import { Bot, FileText, UploadCloud, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function formatBytes(bytes) {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Sidebar({ isUploading, uploadedDoc, onFileUpload }) {
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) onFileUpload(e.target.files[0]);
    };
    const uploadSuccess = !!uploadedDoc && !isUploading;

    return (
        <div className="w-56 h-full flex flex-col py-4 px-4 shadow-2xl relative z-10 shrink-0 border-r transition-colors"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>

            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center border border-indigo-500/25">
                    <Bot className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-sm font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                        Devmox
                    </h1>
                    <p className="text-[9px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Smart Study Assistant</p>
                </div>
            </div>

            {/* Upload label */}
            <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Upload Document</p>

            {/* Upload zone — compact row */}
            <div className="relative group cursor-pointer mb-4">
                <input type="file" accept=".pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    onChange={handleFileChange} disabled={isUploading} />
                <div className={`relative rounded-xl border-2 border-dashed transition-all duration-300 flex items-center gap-3 px-3 py-3 ${
                    uploadSuccess ? 'border-emerald-500/40 bg-emerald-500/5'
                    : isUploading  ? 'border-indigo-500/50 bg-indigo-500/5'
                    : 'border-slate-600/40 hover:border-indigo-500/40'
                }`} style={!uploadSuccess && !isUploading ? { background: 'var(--bg-elevated)' } : {}}>
                    <AnimatePresence mode="wait">
                        {isUploading ? (
                            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex items-center gap-2 text-indigo-400 w-full">
                                <UploadCloud className="w-5 h-5 shrink-0 animate-bounce" />
                                <p className="text-xs font-medium">Processing...</p>
                            </motion.div>
                        ) : uploadSuccess ? (
                            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex items-center gap-2 text-emerald-400 w-full">
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                <div>
                                    <p className="text-xs font-medium leading-tight">Ready to Analyze</p>
                                    <p className="text-[10px] text-emerald-500/60">Click to replace</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex items-center gap-2 w-full transition-colors group-hover:text-indigo-400"
                                style={{ color: 'var(--text-secondary)' }}>
                                <FileText className="w-5 h-5 shrink-0" />
                                <div>
                                    <p className="text-xs font-medium leading-tight">Drop PDF here</p>
                                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>or click to browse</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Knowledge Base */}
            <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Knowledge Base</p>
                {uploadedDoc && (
                    <span className="bg-indigo-500/20 text-indigo-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold">1</span>
                )}
            </div>

            <div className="flex-1 flex flex-col gap-2 min-h-0">
                <AnimatePresence>
                    {uploadedDoc && (
                        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 p-2.5 rounded-xl border transition-colors"
                            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{uploadedDoc.filename}</p>
                                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatBytes(uploadedDoc.size)} · {uploadedDoc.pages}p</p>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        </motion.div>
                    )}
                </AnimatePresence>
                {!uploadedDoc && (
                    <p className="text-[11px] text-center mt-4" style={{ color: 'var(--text-muted)' }}>No documents yet.</p>
                )}
            </div>

            <div className="pt-3 border-t flex justify-between items-center text-[9px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <span>Devmox v1.0</span>
                <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Online
                </span>
            </div>
        </div>
    );
}
