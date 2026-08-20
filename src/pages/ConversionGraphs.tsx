import { useEffect, useState } from 'react';
import FormatGraph, { type GraphEdge } from '../components/FormatGraph';

interface Family {
  nodes: string[];
  edges: GraphEdge[];
}

interface GraphData {
  generated_at: string;
  framework_commit: string | null;
  trace: Family;
  policy: Family;
}

type Kind = 'trace' | 'policy';

export default function ConversionGraphs() {
  const [data, setData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<Kind>('trace');

  useEffect(() => {
    const url = new URL(`${import.meta.env.BASE_URL}graph.json`, window.location.href);
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return <div className="panel">Failed to load graph data: {error}</div>;
  if (!data) return <p className="muted">Loading conversion graphs…</p>;

  const family = data[kind];

  return (
    <>
      <h1>Conversion Graphs</h1>
      <p className="muted" style={{ maxWidth: 700 }}>
        MonitoringFace discovers its converters automatically and builds a
        directed graph per input family: a tool that does not understand the
        canonical format is fed through the shortest path of converters to the
        nearest format it supports. These are the graphs the engine actually
        routes on, exported from the platform's discovery function.
      </p>
      <div className="toggle">
        <button className={kind === 'trace' ? 'active' : ''} onClick={() => setKind('trace')}>
          Trace / data formats
        </button>
        <button className={kind === 'policy' ? 'active' : ''} onClick={() => setKind('policy')}>
          Policy formats
        </button>
      </div>
      <div className="panel">
        {/* key remounts the graph on toggle: hover state must never survive
            into a family with fewer edges */}
        <FormatGraph key={kind} nodes={family.nodes} edges={family.edges} />
        <div className="graph-legend muted small">
          <span>
            {family.nodes.length} formats · {family.edges.length} conversions
          </span>
          <span>hover an edge to see the converter, hover a format to see its conversions</span>
          {data.framework_commit && (
            <span className="mono">
              discovered @ {data.framework_commit.slice(0, 10)} · {data.generated_at.slice(0, 10)}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
