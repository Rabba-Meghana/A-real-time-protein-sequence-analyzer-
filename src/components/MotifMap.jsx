export default function MotifMap({ motifs, seqLength }) {
  if (!seqLength) return null;

  return (
    <div>
      {motifs.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '24px',
          color: '#4b7a63', fontSize: 11,
          fontFamily: 'IBM Plex Mono',
          border: '1px dashed rgba(52,211,153,0.1)',
          borderRadius: 8,
        }}>
          No known motifs detected in this sequence
        </div>
      ) : (
        <>
          {/* Linear map */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              position: 'relative',
              height: 24,
              background: 'rgba(52,211,153,0.05)',
              border: '1px solid rgba(52,211,153,0.1)',
              borderRadius: 4,
              marginBottom: 6,
            }}>
              {/* Ruler ticks */}
              {[0, 25, 50, 75, 100].map(pct => (
                <div key={pct} style={{
                  position: 'absolute',
                  left: `${pct}%`,
                  top: 0, bottom: 0,
                  borderLeft: '1px solid rgba(52,211,153,0.08)',
                }} />
              ))}
              {motifs.map((m, i) => (
                <div
                  key={i}
                  title={`${m.name}: ${m.desc} (pos ${m.start + 1}–${m.end + 1})`}
                  style={{
                    position: 'absolute',
                    left: `${(m.start / seqLength) * 100}%`,
                    width: `${Math.max(2, ((m.end - m.start + 1) / seqLength) * 100)}%`,
                    top: 4, bottom: 4,
                    background: m.color,
                    borderRadius: 3,
                    opacity: 0.85,
                    cursor: 'default',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {[1, Math.round(seqLength * 0.25), Math.round(seqLength * 0.5),
                Math.round(seqLength * 0.75), seqLength].map(pos => (
                <span key={pos} style={{ fontSize: 8, color: '#4b7a63', fontFamily: 'IBM Plex Mono' }}>
                  {pos}
                </span>
              ))}
            </div>
          </div>

          {/* Motif list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {motifs.map((m, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${m.color}22`,
                borderLeft: `3px solid ${m.color}`,
                borderRadius: 6,
                padding: '8px 12px',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 500, color: m.color,
                    fontFamily: 'IBM Plex Mono', marginBottom: 2,
                  }}>
                    {m.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#6ee7b7', opacity: 0.7 }}>
                    {m.desc}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: 10, fontFamily: 'IBM Plex Mono',
                    color: '#4b7a63', marginBottom: 1,
                  }}>
                    pos {m.start + 1}–{m.end + 1}
                  </div>
                  <div style={{
                    fontSize: 9, fontFamily: 'IBM Plex Mono',
                    background: `${m.color}18`,
                    color: m.color,
                    padding: '1px 6px', borderRadius: 3,
                  }}>
                    {m.sequence}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
