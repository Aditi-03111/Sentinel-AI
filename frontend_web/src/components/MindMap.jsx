import React, { useCallback, useMemo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Loader2, GitBranch } from 'lucide-react';

// Assign radial positions: root at center, others in rings
function buildLayout(rawNodes, rawEdges) {
    if (!rawNodes || rawNodes.length === 0) return { nodes: [], edges: [] };

    const rootId = 'root';
    const CENTER = { x: 0, y: 0 };
    const RING1_R = 220;
    const RING2_R = 420;

    // BFS to assign depth
    const depthMap = { [rootId]: 0 };
    const queue = [rootId];
    const adjacency = {};
    rawEdges.forEach(e => {
        if (!adjacency[e.source]) adjacency[e.source] = [];
        adjacency[e.source].push(e.target);
    });

    while (queue.length) {
        const cur = queue.shift();
        (adjacency[cur] || []).forEach(child => {
            if (depthMap[child] === undefined) {
                depthMap[child] = depthMap[cur] + 1;
                queue.push(child);
            }
        });
    }

    // Group by depth
    const ring1 = rawNodes.filter(n => n.id !== rootId && depthMap[n.id] === 1);
    const ring2 = rawNodes.filter(n => n.id !== rootId && (depthMap[n.id] === undefined || depthMap[n.id] >= 2));

    const posMap = { [rootId]: CENTER };

    ring1.forEach((n, i) => {
        const angle = (2 * Math.PI * i) / ring1.length - Math.PI / 2;
        posMap[n.id] = { x: Math.cos(angle) * RING1_R, y: Math.sin(angle) * RING1_R };
    });

    ring2.forEach((n, i) => {
        const angle = (2 * Math.PI * i) / ring2.length - Math.PI / 2;
        posMap[n.id] = { x: Math.cos(angle) * RING2_R, y: Math.sin(angle) * RING2_R };
    });

    const NODE_COLORS = [
        { bg: '#1e1b4b', border: '#6366f1', text: '#a5b4fc' }, // indigo
        { bg: '#1a1040', border: '#8b5cf6', text: '#c4b5fd' }, // violet
        { bg: '#0c2a3a', border: '#06b6d4', text: '#67e8f9' }, // cyan
        { bg: '#1a0a2e', border: '#a855f7', text: '#d8b4fe' }, // purple
        { bg: '#0a2a1a', border: '#10b981', text: '#6ee7b7' }, // emerald
        { bg: '#1a2a0a', border: '#84cc16', text: '#bef264' }, // lime
        { bg: '#2a1a0a', border: '#f59e0b', text: '#fcd34d' }, // amber
        { bg: '#2a0a0a', border: '#ef4444', text: '#fca5a5' }, // red
    ];

    const nodes = rawNodes.map((n, i) => {
        const isRoot = n.id === rootId;
        const color = isRoot
            ? { bg: '#1e1b4b', border: '#818cf8', text: '#e0e7ff' }
            : NODE_COLORS[i % NODE_COLORS.length];
        const pos = posMap[n.id] || { x: Math.random() * 600 - 300, y: Math.random() * 400 - 200 };

        return {
            id: n.id,
            position: pos,
            data: { label: n.label },
            style: {
                background: color.bg,
                border: `2px solid ${color.border}`,
                color: color.text,
                borderRadius: isRoot ? '16px' : '12px',
                padding: isRoot ? '12px 20px' : '8px 14px',
                fontSize: isRoot ? '14px' : '12px',
                fontWeight: isRoot ? '700' : '600',
                minWidth: isRoot ? '120px' : '90px',
                textAlign: 'center',
                boxShadow: `0 0 ${isRoot ? 20 : 10}px ${color.border}40`,
            },
        };
    });

    const edges = rawEdges.map((e, i) => ({
        id: `e-${i}`,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#4f4f6a', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#4f4f6a', width: 12, height: 12 },
    }));

    return { nodes, edges };
}

export default function MindMap({ mindmap, isLoading, onGenerate, hasDocument }) {
    const { nodes: initNodes, edges: initEdges } = useMemo(
        () => mindmap ? buildLayout(mindmap.nodes, mindmap.edges) : { nodes: [], edges: [] },
        [mindmap]
    );

    const [nodes, , onNodesChange] = useNodesState(initNodes);
    const [edges, , onEdgesChange] = useEdgesState(initEdges);

    // Re-sync when mindmap data changes
    const layoutNodes = useMemo(() => initNodes, [mindmap]);
    const layoutEdges = useMemo(() => initEdges, [mindmap]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                <p className="text-sm">Building mind map from document...</p>
                <p className="text-xs text-slate-600">Extracting concepts and relationships</p>
            </div>
        );
    }

    if (!mindmap || !mindmap.nodes || mindmap.nodes.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 text-slate-500">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <GitBranch className="w-8 h-8 text-indigo-400" />
                </div>
                <div className="text-center">
                    <p className="text-slate-300 font-semibold mb-1">Visual Mind Map</p>
                    <p className="text-sm text-slate-500 mb-5">
                        {hasDocument
                            ? 'Generate a visual map of all concepts and their relationships.'
                            : 'Upload a PDF first, then generate a mind map.'}
                    </p>
                    {hasDocument && (
                        <button onClick={onGenerate}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors mx-auto">
                            <GitBranch className="w-4 h-4" />
                            Generate Mind Map
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 relative">
            <ReactFlow
                nodes={layoutNodes}
                edges={layoutEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.3}
                maxZoom={2}
                style={{ background: 'var(--bg-base)' }}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#1e1e2e" gap={24} size={1} />
                <Controls
                    style={{ background: '#1e1e2e', border: '1px solid #334155', borderRadius: '12px' }}
                />
            </ReactFlow>

            {/* Central topic label */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-sm text-xs text-slate-400 font-medium pointer-events-none">
                {mindmap.central || 'Mind Map'} · {mindmap.nodes.length} concepts
            </div>
        </div>
    );
}
