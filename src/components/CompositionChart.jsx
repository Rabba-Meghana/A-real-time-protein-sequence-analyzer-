import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AA_GROUPS = {
  hydrophobic: { aas: ['A','I','L','M','F','V','W','Y'], color: '#f59e0b' },
  polar:       { aas: ['S','T','N','Q','C'], color: '#34d399' },
  positive:    { aas: ['R','K','H'], color: '#60a5fa' },
  negative:    { aas: ['D','E'], color: '#f87171' },
  special:     { aas: ['G','P'], color: '#a78bfa' },
};

function getColor(aa) {
  for (const [, g] of Object.entries(AA_GROUPS)) {
    if (g.aas.includes(aa)) return g.color;
  }
  return '#4b7a63';
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: 'rgba(10,20,18,0.95)',
      border: '1px solid rgba(52,211,153,0.2)',
      borderRadius: 8, padding: '8px 12px',
      fontFamily: 'IBM Plex Mono, monospace', fontSize: 10,
    }}>
      <div style={{ color: getColor(d.aa), fontWeight: 500, fontSize: 13 }}>{d.aa}</div>
      <div style={{ color: '#d1fae5' }}>{d.count} residues</div>
      <div style={{ color: '#4b7a63' }}>{d.percent.toFixed(1)}%</div>
    </div>
  );
};

export default function CompositionChart({ data }) {
  if (!data?.length) return null;
  const sorted = [...data].sort((a, b) => a.aa.localeCompare(b.aa));

  return (
    <div>
      {/* Group legend */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        {Object.entries(AA_GROUPS).map(([name, g]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: g.color }} />
            <span style={{ fontSize: 9, color: '#4b7a63', fontFamily: 'IBM Plex Mono', textTransform: 'capitalize' }}>
              {name}
            </span>
          </div>
        ))}
      </div>

      <div style={{ height: 160 }}>
        <ResponsiveContainer>
          <BarChart data={sorted} margin={{ top: 0, right: 0, left: -28, bottom: 0 }} barSize={14}>
            <XAxis
              dataKey="aa"
              tick={{ fontSize: 9, fill: '#6ee7b7', fontFamily: 'IBM Plex Mono', fontWeight: 500 }}
              axisLine={{ stroke: 'rgba(52,211,153,0.1)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 8, fill: '#4b7a63', fontFamily: 'IBM Plex Mono' }}
              axisLine={false} tickLine={false}
              tickFormatter={v => v + '%'}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(52,211,153,0.05)' }} />
            <Bar dataKey="percent" radius={[3, 3, 0, 0]}>
              {sorted.map((entry) => (
                <Cell key={entry.aa} fill={getColor(entry.aa)} fillOpacity={entry.count === 0 ? 0.2 : 0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
