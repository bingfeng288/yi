import { useRef, useEffect, useState } from 'react';
import { LEVELS, DOMAIN_COLORS } from '../data/knowledgeTree';
import { crossReferences } from '../data/crossReferences';

// Build domain-level connection map from cross-references
function buildDomainEdges(tree) {
  const topicToDomain = {};
  for (const domain of tree) {
    for (const topic of domain.children) {
      topicToDomain[topic.id] = domain.id;
    }
  }

  const edgeMap = {};
  for (const [from, refs] of Object.entries(crossReferences)) {
    const fromDomain = topicToDomain[from];
    if (!fromDomain) continue;
    for (const ref of refs) {
      const toDomain = topicToDomain[ref.id];
      if (!toDomain || fromDomain === toDomain) continue;
      const key = [fromDomain, toDomain].sort().join('-');
      if (!edgeMap[key]) {
        edgeMap[key] = { from: fromDomain, to: toDomain, count: 0, labels: [] };
      }
      edgeMap[key].count++;
      edgeMap[key].labels.push(ref.label);
    }
  }
  return Object.values(edgeMap);
}

export default function KnowledgeGraph({ tree, visited, onSelect }) {
  const canvasRef = useRef(null);
  const hoveredRef = useRef(null); // track hover via ref, not state
  const [tooltip, setTooltip] = useState(null);
  const [popup, setPopup] = useState(null); // { domain, x, y }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const W = canvas.parentElement.getBoundingClientRect().width;
    const H = canvas.parentElement.getBoundingClientRect().height;
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) * 0.35;

    // Position domains in a circle
    const nodes = tree.map((domain, i) => {
      const angle = (i / tree.length) * Math.PI * 2 - Math.PI / 2;
      const visitedCount = domain.children.filter(c => visited.has(c.id)).length;
      return {
        id: domain.id,
        name: domain.name,
        icon: domain.icon,
        x: cx + R * Math.cos(angle),
        y: cy + R * Math.sin(angle),
        color: DOMAIN_COLORS[domain.id]?.accent || '#666',
        total: domain.children.length,
        visited: visitedCount,
        domain,
      };
    });

    const nodeMap = {};
    for (const n of nodes) nodeMap[n.id] = n;

    const edges = buildDomainEdges(tree).map(e => ({
      ...e,
      fromNode: nodeMap[e.from],
      toNode: nodeMap[e.to],
    })).filter(e => e.fromNode && e.toNode);

    // Draw function — reads hoveredNode from ref
    const draw = () => {
      const hoveredNode = hoveredRef.current;
      ctx.clearRect(0, 0, W, H);

      // Draw edges
      for (const edge of edges) {
        const { fromNode, toNode } = edge;
        const isHighlighted = hoveredNode && (hoveredNode === edge.from || hoveredNode === edge.to);

        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);

        // Curved edge via center offset
        const mx = (fromNode.x + toNode.x) / 2 + (cy - (fromNode.y + toNode.y) / 2) * 0.15;
        const my = (fromNode.y + toNode.y) / 2 + ((fromNode.x + toNode.x) / 2 - cx) * 0.15;
        ctx.quadraticCurveTo(mx, my, toNode.x, toNode.y);

        ctx.strokeStyle = isHighlighted ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)';
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.stroke();
      }

      // Draw nodes
      for (const node of nodes) {
        const isHovered = hoveredNode === node.id;
        const nodeR = isHovered ? 28 : 24;

        // Outer ring (visited progress)
        const pct = node.total > 0 ? node.visited / node.total : 0;
        if (pct > 0) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeR + 3, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? node.color : '#fff';
        ctx.fill();
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Icon
        ctx.fillStyle = isHovered ? '#fff' : node.color;
        ctx.font = `${isHovered ? 18 : 16}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.icon, node.x, node.y);

        // Label
        ctx.fillStyle = isHovered ? node.color : '#333';
        ctx.font = `${isHovered ? 'bold 12px' : '11px'} system-ui, sans-serif`;
        ctx.fillText(node.name, node.x, node.y + nodeR + 14);

        // Progress text
        ctx.fillStyle = '#999';
        ctx.font = '10px system-ui, sans-serif';
        ctx.fillText(`${node.visited}/${node.total}`, node.x, node.y + nodeR + 27);
      }
    };

    draw();

    // Mouse interaction — updates ref and redraws, no React re-render
    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let found = null;
      for (const node of nodes) {
        const dx = mx - node.x;
        const dy = my - node.y;
        if (dx * dx + dy * dy < 28 * 28) {
          found = node.id;
          break;
        }
      }

      if (found !== hoveredRef.current) {
        hoveredRef.current = found;
        setPopup(null);
        if (found) {
          const node = nodes.find(n => n.id === found);
          setTooltip({
            x: node.x,
            y: node.y - 40,
            name: node.name,
            icon: node.icon,
            progress: `${node.visited}/${node.total}`,
          });
        } else {
          setTooltip(null);
        }
        draw();
      }
    };

    const handleClick = () => {
      if (hoveredRef.current) {
        const node = nodes.find(n => n.id === hoveredRef.current);
        if (node) {
          setPopup({ domain: node.domain, x: node.x, y: node.y });
        }
      }
    };

    const handleMouseLeave = () => {
      hoveredRef.current = null;
      setTooltip(null);
      draw();
    };

    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const onResize = () => { resize(); draw(); };
    window.addEventListener('resize', onResize);

    return () => {
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', onResize);
    };
  }, [tree, visited]); // hoveredNode removed from deps!

  return (
    <div className="relative w-full" style={{ height: 400 }}>
      <canvas ref={canvasRef} className="cursor-pointer" />
      {tooltip && !popup && (
        <div
          className="absolute pointer-events-none bg-ink-950 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translateX(-50%)' }}
        >
          {tooltip.icon} {tooltip.name} · {tooltip.progress}
        </div>
      )}

      {/* Topic picker popup */}
      {popup && (
        <>
          <div className="absolute inset-0 z-10" onClick={() => setPopup(null)} />
          <div
            className="absolute z-20 yi-card shadow-xl p-3 w-56 max-h-72 overflow-y-auto animate-scaleIn"
            style={{
              left: Math.max(8, Math.min(popup.x, (canvasRef.current?.parentElement?.getBoundingClientRect().width || 400) - 232)),
              top: Math.min(popup.y + 30, (canvasRef.current?.parentElement?.getBoundingClientRect().height || 400) - 260),
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{popup.domain.icon}</span>
                <span className="text-sm font-bold text-ink-950">{popup.domain.name}</span>
              </div>
              <button onClick={() => setPopup(null)} className="text-ink-300 hover:text-ink-500 text-xs">✕</button>
            </div>
            <div className="space-y-0.5">
              {popup.domain.children.map((topic) => {
                const level = LEVELS[topic.level];
                const isVisited = visited.has(topic.id);
                return (
                  <button
                    key={topic.id}
                    onClick={() => {
                      onSelect(topic, popup.domain);
                      setPopup(null);
                    }}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-ink-50 transition-colors text-sm group"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: level.color }}
                    />
                    <span className="flex-1 truncate text-ink-700 group-hover:text-ink-950">{topic.name}</span>
                    <span className="text-[9px] px-1 py-0.5 rounded" style={{ background: level.color + '20', color: level.color }}>
                      {level.name}
                    </span>
                    {isVisited && <span className="text-green-500 text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <p className="text-[10px] text-ink-300 text-center mt-2">点击学科节点展开专题列表 · 悬停查看详情</p>
    </div>
  );
}
