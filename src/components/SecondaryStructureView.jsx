import { useMemo } from 'react';

const SS_CONFIG = {
  H: { color: '#f87171', label: 'α-Helix', bg: 'rgba(248,113,113,0.15)' },
  E: { color: '#60a5fa', label: 'β-Sheet', bg: 'rgba(96,165,250,0.15)' },
  T: { color: '#fbbf24', label: 'Turn',    bg: 'rgba(251,191,36,0.15)'  },
  C: { color: '#4b7a63', label: 'Coil',    bg: 'rgba(75,122,99,0.1)'   },
};

export default function SecondaryStructureView({ data }) {
  if (!data?.length) return null;

  const stats = useMemo(() => {
    const counts = { H: 0, E: 0, T: 0, C: 0 };
    data.forEach(r => { counts[r.ss] = (counts[r.ss] || 0) + 1; });
    return Object.entries(counts).map(([ss, count]) => ({
      ss, count, pct: Math.round((count / data.length) * 100)
    }));
  }, [data]);

  // Compress into runs for the strip
  const runs = useMemo(() => {
    const r = [];
    let cur = null;
    for (const res of data) {
      if (cur && cur.ss === res.ss) { cur.len++; }
      else {
        cur = { ss: res.ss, len: 1, start: res.position };
        r.push(cur);
      }
    }
    return r;
  }, [data]);

  return (
    <div>
      {/* Legend + stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        {stats.map(({ ss, count, pct }) => (
          <div key={ss} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: SS_CONFIG[ss].bg,
            border: `1px solid ${SS_CONFIG[ss].color}30`,
            borderRadius: 6, padding: '4px 10px',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: SS_CONFIG[ss].color }} />
            <span style={{ fontSize: 10, fontFamily: 'IBM Plex Mono', color: SS_CONFIG[ss].color }}>
              {SS_CONFIG[ss].label}
            </span>
            <span style={{ fontSize: 10, fontFamily: 'IBM Plex Mono', color: '#6ee7b7', fontWeight: 500 }}>
              {pct}%
            </span>
            <span style={{ fontSize: 9, color: '#4b7a63' }}>({count} AA)</span>
          </div>
        ))}
      </div>

      {/* Structure strip */}
      <div style={{
        display: 'flex',
        height: 32,
        borderRadius: 6,
        overflow: 'hidden',
        border: '1px solid rgba(52,211,153,0.1)',
        marginBottom: 10,
      }}>
        {runs.map((run, i) => (
          <div
            key={i}
            title={`${SS_CONFIG[run.ss].label}: pos ${run.start}–${run.start + run.len - 1} (${run.len} AA)`}
            style={{
              flex: run.len,
              background: SS_CONFIG[run.ss].bg,
              borderRight: `1px solid rgba(0,0,0,0.2)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'default',
              transition: 'filter 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.4)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
          >
            {run.len > 4 && (
              <span style={{
                fontSize: 9, fontFamily: 'IBM Plex Mono',
                color: SS_CONFIG[run.ss].color, fontWeight: 500,
              }}>
                {run.ss}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Sequence annotation (first 80 AAs) */}
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'flex', minWidth: 'fit-content' }}>
          {data.slice(0, 80).map((r, i) => (
            <div key={i} style={{ textAlign: 'center', minWidth: 14 }}>
              <div style={{
                fontSize: 7, fontFamily: 'IBM Plex Mono',
                color: SS_CONFIG[r.ss].color,
                lineHeight: 1,
              }}>
                {r.ss}
              </div>
              <div style={{
                fontSize: 9, fontFamily: 'IBM Plex Mono',
                color: '#6ee7b7',
                background: SS_CONFIG[r.ss].bg,
                borderRadius: 2,
                lineHeight: 1.8,
              }}>
                {r.aa}
              </div>
              {(i + 1) % 10 === 0 && (
                <div style={{ fontSize: 7, color: '#4b7a63', fontFamily: 'IBM Plex Mono' }}>
                  {i + 1}
                </div>
              )}
            </div>
          ))}
          {data.length > 80 && (
            <div style={{
              display: 'flex', alignItems: 'center',
              padding: '0 10px',
              fontSize: 9, color: '#4b7a63', fontFamily: 'IBM Plex Mono',
            }}>
              +{data.length - 80} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
