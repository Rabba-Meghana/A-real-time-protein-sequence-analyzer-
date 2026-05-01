import { AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: 'rgba(10,20,18,0.92)',
      border: '1px solid rgba(52,211,153,0.25)',
      borderRadius: 8,
      padding: '8px 12px',
      backdropFilter: 'blur(12px)',
      fontSize: 11,
      fontFamily: 'IBM Plex Mono, monospace',
    }}>
      <div style={{ color: '#6ee7b7', marginBottom: 2 }}>pos {d.position} · {d.aa}</div>
      <div style={{ color: d.score >= 0 ? '#34d399' : '#60a5fa', fontWeight: 500 }}>
        {d.score >= 0 ? '+' : ''}{d.score}
      </div>
      <div style={{ color: '#4b7a63', fontSize: 9, marginTop: 2 }}>
        {d.score > 1.5 ? 'Strongly hydrophobic' :
         d.score > 0   ? 'Hydrophobic' :
         d.score > -1  ? 'Slightly hydrophilic' : 'Strongly hydrophilic'}
      </div>
    </div>
  );
};

export default function HydrophobicityChart({ data }) {
  if (!data?.length) return null;

  // Downsample if long sequence
  const maxPoints = 200;
  const step = Math.max(1, Math.floor(data.length / maxPoints));
  const sampled = data.filter((_, i) => i % step === 0);

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <AreaChart data={sampled} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="hydro-pos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="hydro-neg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="position"
            tick={{ fontSize: 9, fill: '#4b7a63', fontFamily: 'IBM Plex Mono' }}
            axisLine={{ stroke: 'rgba(52,211,153,0.1)' }}
            tickLine={false}
          />
          <YAxis
            domain={[-4.5, 4.5]}
            tick={{ fontSize: 9, fill: '#4b7a63', fontFamily: 'IBM Plex Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
          <ReferenceLine y={1.6} stroke="rgba(52,211,153,0.15)" strokeDasharray="2 4"
            label={{ value: 'TM threshold', fill: '#4b7a63', fontSize: 8, fontFamily: 'IBM Plex Mono' }} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#34d399"
            strokeWidth={1.5}
            fill="url(#hydro-pos)"
            dot={false}
            activeDot={{ r: 3, fill: '#34d399', stroke: 'none' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
