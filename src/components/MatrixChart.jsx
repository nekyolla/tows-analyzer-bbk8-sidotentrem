import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Label,
} from 'recharts';
import { QUADRANTS } from '../lib/constants';
import { formatSigned } from '../lib/format';

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
        <p className="font-semibold text-slate-800">Posisi Organisasi</p>
        <p className="text-slate-600">SAP (X): <span className="font-bold">{formatSigned(data.x)}</span></p>
        <p className="text-slate-600">ETOP (Y): <span className="font-bold">{formatSigned(data.y)}</span></p>
        <p className="text-slate-600">Kuadran: <span className="font-bold">{data.quadrant}</span></p>
      </div>
    );
  }
  return null;
}

export default function MatrixChart({ SAP, ETOP, quadrant }) {
  // Calculate axis range dynamically based on data magnitude
  const maxAbs = Math.max(Math.abs(SAP), Math.abs(ETOP), 50);
  const axisRange = Math.ceil(maxAbs * 1.3 / 20) * 20; // Round up to nearest 20 with padding (keeps half-ticks whole)
  // Symmetric ticks so 0 (the quadrant boundary) is always labelled
  const ticks = [-axisRange, -axisRange / 2, 0, axisRange / 2, axisRange];
  const labelX = axisRange * 0.75;

  const data = [{ x: SAP, y: ETOP, quadrant }];

  const quadrantColor = QUADRANTS[quadrant]?.color || '#3b82f6';

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

          <XAxis
            type="number"
            dataKey="x"
            domain={[-axisRange, axisRange]}
            ticks={ticks}
            tickLine={false}
            axisLine={{ stroke: '#94a3b8' }}
            tick={{ fontSize: 11, fill: '#64748b' }}
          >
            <Label
              value="Kelemahan (W) ← SAP → Kekuatan (S)"
              position="bottom"
              offset={10}
              style={{ fontSize: 12, fill: '#475569', fontWeight: 500 }}
            />
          </XAxis>

          <YAxis
            type="number"
            dataKey="y"
            domain={[-axisRange, axisRange]}
            ticks={ticks}
            tickLine={false}
            axisLine={{ stroke: '#94a3b8' }}
            tick={{ fontSize: 11, fill: '#64748b' }}
          >
            <Label
              value="Ancaman (T) ← ETOP → Peluang (O)"
              position="left"
              angle={-90}
              offset={10}
              style={{ fontSize: 12, fill: '#475569', fontWeight: 500 }}
            />
          </YAxis>

          {/* Quadrant reference lines */}
          <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={1.5} />
          <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1.5} />

          {/* Quadrant labels — kept inside the plot so they don't collide with axis ticks */}
          {[
            { key: 'SO', x: labelX, position: 'insideTop' },
            { key: 'WO', x: -labelX, position: 'insideTop' },
            { key: 'WT', x: -labelX, position: 'insideBottom' },
            { key: 'ST', x: labelX, position: 'insideBottom' },
          ].map(({ key, x, position }) => (
            <ReferenceLine
              key={key}
              x={x}
              stroke="transparent"
              label={{ value: key, position, fill: QUADRANTS[key].color, fontSize: 16, fontWeight: 700, opacity: 0.4 }}
            />
          ))}

          <Tooltip content={<CustomTooltip />} />

          {/* Custom shape: recharts ignores `r` on <Cell>, which left the point ~9px wide */}
          <Scatter
            data={data}
            fill={quadrantColor}
            shape={({ cx, cy }) => (
              <circle cx={cx} cy={cy} r={10} fill={quadrantColor} stroke="#fff" strokeWidth={3} />
            )}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
