import { useEffect, useMemo, useRef, useState } from 'react';

export interface GraphEdge {
  from: string;
  to: string;
  converters: string[];
}

interface Props {
  nodes: string[];
  edges: GraphEdge[];
}

const W = 920;
const H = 640;
const CX = W / 2;
const CY = H / 2;
const NODE_H = 32;
const BEND = 30;
const GAP = 6; // breathing room between arrowhead and node border

interface Pt {
  x: number;
  y: number;
}

function nodeWidth(label: string): number {
  return Math.max(70, label.length * 7.8 + 26);
}

/** Point on the border of the node's rect, walking from its center toward
 * `toward`. Straight-line approximation; fine for gentle curves. */
function borderPoint(center: Pt, label: string, toward: Pt): Pt {
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;
  const hw = nodeWidth(label) / 2 + GAP;
  const hh = NODE_H / 2 + GAP;
  const scale = 1 / Math.max(Math.abs(dx) / hw, Math.abs(dy) / hh, 1e-9);
  return { x: center.x + dx * scale, y: center.y + dy * scale };
}

/** Curved directed edge: quadratic bezier bowing to the left of travel, so
 * A→B and B→A separate naturally. */
function edgePath(a: Pt, b: Pt): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  return `M ${a.x} ${a.y} Q ${mx + px * BEND} ${my + py * BEND} ${b.x} ${b.y}`;
}

/** Self-loop drawn on the side of the node facing away from the center.
 * Both anchors are computed with borderPoint so they always sit on the
 * node's border, regardless of the node's angle or label width. */
function loopPath(center: Pt, label: string): string {
  const L = Math.hypot(center.x - CX, center.y - CY) || 1;
  const ux = (center.x - CX) / L;
  const uy = (center.y - CY) / L;
  const a = borderPoint(center, label, {
    x: center.x + ux * 120 - uy * 48,
    y: center.y + uy * 120 + ux * 48,
  });
  const b = borderPoint(center, label, {
    x: center.x + ux * 120 + uy * 48,
    y: center.y + uy * 120 - ux * 48,
  });
  const c1 = { x: a.x + ux * 52 - uy * 30, y: a.y + uy * 52 + ux * 30 };
  const c2 = { x: b.x + ux * 52 + uy * 30, y: b.y + uy * 52 - ux * 30 };
  return `M ${a.x} ${a.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${b.x} ${b.y}`;
}

export default function FormatGraph({ nodes, edges }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [hoverEdge, setHoverEdge] = useState<number | null>(null);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  // switching families swaps the edges array; a stale hover index would
  // point into the wrong graph
  useEffect(() => {
    setHoverEdge(null);
    setHoverNode(null);
    setTip(null);
  }, [nodes, edges]);

  const pos = useMemo(() => {
    const r = Math.min(CX, CY) - 90;
    const map = new Map<string, Pt>();
    nodes.forEach((n, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / nodes.length;
      map.set(n, { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) });
    });
    return map;
  }, [nodes]);

  const anyHover = hoverEdge !== null || hoverNode !== null;

  function edgeState(i: number, e: GraphEdge): 'hot' | 'dim' | '' {
    if (hoverEdge === i) return 'hot';
    if (hoverNode && (e.from === hoverNode || e.to === hoverNode)) return 'hot';
    return anyHover ? 'dim' : '';
  }

  function nodeState(n: string): 'hot' | 'dim' | '' {
    if (hoverNode === n) return 'hot';
    if (hoverEdge !== null) {
      const e = edges[hoverEdge]; // may be stale for one render; never assume
      if (e && (e.from === n || e.to === n)) return 'hot';
    }
    if (anyHover) return 'dim';
    return '';
  }

  function moveTip(ev: React.MouseEvent) {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTip({ x: ev.clientX - rect.left, y: ev.clientY - rect.top });
  }

  const hovered = hoverEdge !== null ? edges[hoverEdge] : null;

  return (
    <div className="graph-wrap" ref={wrapRef}>
      <svg
        className="graph-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Directed graph of formats; edges are converters"
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#9db4d8" />
          </marker>
          <marker id="arrowHot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#175cd3" />
          </marker>
        </defs>

        {edges.map((e, i) => {
          const pa = pos.get(e.from);
          const pb = pos.get(e.to);
          if (!pa || !pb) return null;
          const state = edgeState(i, e);
          const d =
            e.from === e.to
              ? loopPath(pa, e.from)
              : edgePath(borderPoint(pa, e.from, pb), borderPoint(pb, e.to, pa));
          return (
            <g key={i} className={`graph-edge ${state}`}>
              <path
                className="line"
                d={d}
                markerEnd={state === 'hot' ? 'url(#arrowHot)' : 'url(#arrow)'}
              />
              <path
                className="hit"
                d={d}
                onMouseEnter={(ev) => {
                  setHoverEdge(i);
                  moveTip(ev);
                }}
                onMouseLeave={() => {
                  setHoverEdge(null);
                  setTip(null);
                }}
                onMouseMove={moveTip}
              />
            </g>
          );
        })}

        {nodes.map((n) => {
          const p = pos.get(n)!;
          const w = nodeWidth(n);
          return (
            <g
              key={n}
              className={`graph-node ${nodeState(n)}`}
              onMouseEnter={() => setHoverNode(n)}
              onMouseLeave={() => setHoverNode(null)}
            >
              <rect x={p.x - w / 2} y={p.y - NODE_H / 2} width={w} height={NODE_H} rx={8} />
              <text x={p.x} y={p.y + 4.5} textAnchor="middle">
                {n}
              </text>
            </g>
          );
        })}
      </svg>

      {hovered && tip && (
        <div
          className="graph-tip"
          style={{
            left: Math.min(tip.x + 14, (wrapRef.current?.clientWidth ?? W) - 240),
            top: Math.min(tip.y + 12, (wrapRef.current?.clientHeight ?? H) - 64),
          }}
        >
          <div className="route">
            {hovered.from} → {hovered.to}
          </div>
          <div className="conv">
            via {hovered.converters.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}
