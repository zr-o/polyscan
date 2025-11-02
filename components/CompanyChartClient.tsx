'use client';

import { useMemo, useState } from 'react';

type Point = {
  date: string;
  close: number;
};

type CompanyChartClientProps = {
  points: Point[];
  width: number;
  height: number;
  indicators?: {
    rsi: number | null;
    rsiStatus: 'good' | 'neutral' | 'bad' | null;
    movingAverageTrend: 'bullish' | 'bearish' | 'neutral' | null;
    volatilityStatus: 'stable' | 'volatile' | 'neutral' | null;
  } | null;
};

type TooltipState = {
  index: number;
  x: number;
  y: number;
  date: Date;
  close: number;
};

type GaugeVariant = 'status' | 'rsi';

type IndicatorItem = {
  label: string;
  status: 'good' | 'neutral' | 'bad' | 'bullish' | 'bearish' | 'stable' | 'volatile' | null;
  value: string;
  variant?: GaugeVariant;
  numericValue?: number | null;
};

const buildPaths = (points: Point[], width: number, height: number) => {
  if (points.length < 2) {
    return { line: '', area: '', min: null, max: null, coords: [] as Array<[number, number]> };
  }

  const closes = points.map((point) => point.close);
  const max = Math.max(...closes);
  const min = Math.min(...closes);
  const span = max - min || 1;

  const step = width / (points.length - 1);

  const coords = points.map((point, index) => {
    const x = Number((index * step).toFixed(2));
    const ratio = (point.close - min) / span;
    const y = Number((height - ratio * height).toFixed(2));
    return [x, y] as const;
  });

  const line = coords
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`)
    .join(' ');

  const area =
    `M 0 ${height} ` +
    coords.map(([x, y]) => `L ${x} ${y}`).join(' ') +
    ` L ${coords[coords.length - 1][0]} ${height} Z`;

  return { line, area, min, max, coords };
};

const buildAxisLabels = (points: Point[]) => {
  if (!points.length) return [];

  const formatter = new Intl.DateTimeFormat('fr-CA', {
    year: 'numeric',
    month: 'short',
  });

  const positions = [0, Math.floor(points.length / 2), points.length - 1] as const;

  return positions.map((index) => {
    const date = new Date(points[index].date);
    return {
      label: formatter.format(date),
      position: (index / (points.length - 1 || 1)) * 100,
    };
  });
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const statusToAngle = (
  status: 'good' | 'neutral' | 'bad' | 'bullish' | 'bearish' | 'stable' | 'volatile' | null
) => {
  switch (status) {
    case 'good':
    case 'bullish':
    case 'stable':
      return 330;
    case 'bad':
    case 'bearish':
    case 'volatile':
      return 210;
    default:
      return 270;
  }
};

const normalizeStatus = (
  status: 'good' | 'neutral' | 'bad' | 'bullish' | 'bearish' | 'stable' | 'volatile' | null
) => {
  if (!status) return 'neutral';
  if (status === 'bullish' || status === 'stable') return 'good';
  if (status === 'bearish' || status === 'volatile') return 'bad';
  return status;
};

const describeArc = (start: number, end: number) => {
  const radius = 60;
  const centerX = 70;
  const centerY = 70;

  const polarToCartesian = (angle: number) => {
    const rad = (Math.PI / 180) * angle;
    return {
      x: centerX + radius * Math.cos(rad),
      y: centerY + radius * Math.sin(rad),
    };
  };

  const startPoint = polarToCartesian(start);
  const endPoint = polarToCartesian(end);
  const largeArcFlag = end - start <= 180 ? 0 : 1;
  return `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`;
};

const IndicatorGauge = ({
  label,
  status,
  value,
  variant = 'status',
  numericValue = null,
}: {
  label: string;
  status: 'good' | 'neutral' | 'bad' | 'bullish' | 'bearish' | 'stable' | 'volatile' | null;
  value: string;
  variant?: GaugeVariant;
  numericValue?: number | null;
}) => {
  const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

  const sanitizedValue =
    variant === 'rsi' && typeof numericValue === 'number' && Number.isFinite(numericValue)
      ? clamp(numericValue, 0, 100)
      : null;

  const angle =
    variant === 'rsi' && sanitizedValue !== null
      ? 180 + (sanitizedValue / 100) * 180
      : statusToAngle(status);
  const pointerLength = 50;
  const pointerRadians = (Math.PI / 180) * angle;
  const pointerX = 70 + pointerLength * Math.cos(pointerRadians);
  const pointerY = 70 + pointerLength * Math.sin(pointerRadians);

  const defaultSegments = [
    { start: 180, end: 210, color: '#d64550', active: false },
    { start: 210, end: 240, color: '#f07d3b', active: false },
    { start: 240, end: 270, color: '#f4a261', active: false },
    { start: 270, end: 300, color: '#e9c46a', active: false },
    { start: 300, end: 330, color: '#2a9d8f', active: false },
    { start: 330, end: 360, color: '#2b9e57', active: false },
  ] as const;

  const rsiSegments = [
    { min: 0, max: 20, color: '#d64550' },
    { min: 20, max: 40, color: '#f07d3b' },
    { min: 40, max: 60, color: '#f4a261' },
    { min: 60, max: 80, color: '#e9c46a' },
    { min: 80, max: 100, color: '#2a9d8f' },
  ] as const;

  const segments =
    variant === 'rsi'
      ? rsiSegments.map((segment, index) => {
          const start = 180 + (segment.min / 100) * 180;
          const end = 180 + (segment.max / 100) * 180;
          const isLast = index === rsiSegments.length - 1;
          const active =
            sanitizedValue !== null &&
            sanitizedValue >= segment.min &&
            (sanitizedValue < segment.max || (isLast && sanitizedValue <= segment.max));
          return { start, end, color: segment.color, active };
        })
      : defaultSegments;

  return (
    <div className={`company-gauge company-gauge--${normalizeStatus(status)}`}>
      <svg className="company-gauge__svg" viewBox="0 0 140 90" aria-hidden="true">
        <defs>
          <clipPath id="company-gauge-clip">
            <rect x="0" y="0" width="140" height="72" />
          </clipPath>
        </defs>
        <g clipPath="url(#company-gauge-clip)">
          {segments.map((segment, index) => (
            <path
              key={`segment-${index}`}
              d={describeArc(segment.start, segment.end)}
              stroke={segment.color}
              strokeWidth={12}
              strokeLinecap="round"
              fill="none"
            />
          ))}
          <line
            x1="70"
            y1="70"
            x2={pointerX}
            y2={pointerY}
            stroke="rgba(23, 18, 13, 0.5)"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <circle cx={pointerX} cy={pointerY} r={6} fill="#fefbf6" stroke="var(--accent)" strokeWidth={2} />
        </g>
      </svg>
      <div className="company-gauge__value">{value}</div>
      <p className="company-gauge__label">{label}</p>
    </div>
  );
};

export default function CompanyChartClient({ points, width, height, indicators }: CompanyChartClientProps) {
  const { line, area, min, max, coords } = useMemo(
    () => buildPaths(points, width, height),
    [points, width, height]
  );
  const axisLabels = useMemo(() => buildAxisLabels(points), [points]);

  const [hover, setHover] = useState<TooltipState | null>(null);

  const handlePointer = (event: React.PointerEvent<SVGRectElement>) => {
    if (!coords.length) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const ratio = x / bounds.width;
    const index = Math.min(
      coords.length - 1,
      Math.max(0, Math.round(ratio * (coords.length - 1)))
    );

    const [pointX, pointY] = coords[index];
    const point = points[index];

    setHover({
      index,
      x: pointX,
      y: pointY,
      date: new Date(point.date),
      close: point.close,
    });
  };

  const resetHover = () => setHover(null);

  if (!line) {
    return <p className="company-chart__empty">Aucune donnée récente disponible pour afficher le graphique.</p>;
  }

  const tooltipFormatter = new Intl.DateTimeFormat('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const indicatorItems = useMemo<IndicatorItem[]>(() => {
    const rsiValue = indicators?.rsi != null ? Math.round(indicators.rsi).toString() : 'n/a';
    const trendValue =
      indicators?.movingAverageTrend === 'bullish'
        ? `Haussière · MA${indicators?.movingAverageShortPeriod ?? '?'} / MA${indicators?.movingAverageLongPeriod ?? '?'}`
        : indicators?.movingAverageTrend === 'bearish'
        ? `Baissière · MA${indicators?.movingAverageShortPeriod ?? '?'} / MA${indicators?.movingAverageLongPeriod ?? '?'}`
        : indicators?.movingAverageTrend === 'neutral'
        ? `Neutre · MA${indicators?.movingAverageShortPeriod ?? '?'} / MA${indicators?.movingAverageLongPeriod ?? '?'}`
        : 'Données insuffisantes';
    const volatilityValue =
      indicators?.volatilityStatus === 'stable'
        ? 'Faible'
        : indicators?.volatilityStatus === 'volatile'
        ? 'Forte'
        : indicators?.volatilityStatus === 'neutral'
        ? 'Modérée'
        : 'n/a';

    return [
      {
        label: 'RSI',
        status: indicators?.rsiStatus ?? null,
        value: rsiValue,
        variant: 'rsi' as const,
        numericValue: indicators?.rsi ?? null,
      },
      {
        label: 'Tendance',
        status: indicators?.movingAverageTrend ?? null,
        value:
          indicators?.movingAverageShortPeriod && indicators?.movingAverageLongPeriod
            ? trendValue
            : 'Données insuffisantes',
      },
      {
        label: 'Risque',
        status: indicators?.volatilityStatus ?? null,
        value: volatilityValue,
      },
    ];
  }, [indicators]);

  return (
    <div className="company-chart-wrapper">
      <div className="company-chart__panel">
        <svg
          className="company-chart"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby="company-chart-title"
        >
          <title id="company-chart-title">Évolution des clôtures quotidiennes</title>
          <defs>
            <linearGradient id="company-chart-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(23,18,13,0.18)" />
              <stop offset="100%" stopColor="rgba(23,18,13,0)" />
            </linearGradient>
          </defs>
          <path className="company-chart__area" d={area} fill="url(#company-chart-gradient)" />
          <path className="company-chart__line" d={line} />

          <rect
            className="company-chart__interaction"
            x={0}
            y={0}
            width={width}
            height={height}
            fill="transparent"
            onPointerMove={handlePointer}
            onPointerEnter={handlePointer}
            onPointerLeave={resetHover}
          />

          {hover && (
            <g className="company-chart__hover">
              <line
                x1={hover.x}
                x2={hover.x}
                y1={0}
                y2={height}
                stroke="rgba(23, 18, 13, 0.4)"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <circle cx={hover.x} cy={hover.y} r={4} fill="var(--accent)" />
            </g>
          )}
        </svg>

        {hover ? (
          <div className="company-chart__hover-card">
            <p className="company-chart__hover-date">{tooltipFormatter.format(hover.date)}</p>
            <p className="company-chart__hover-value">{currencyFormatter.format(hover.close)}</p>
          </div>
        ) : (
          <div className="company-chart__meta">
            <div>
              <p className="company-chart__range-label">Min</p>
              <p className="company-chart__range-value">
                {typeof min === 'number' ? currencyFormatter.format(min) : '—'}
              </p>
            </div>
            <div>
              <p className="company-chart__range-label">Max</p>
              <p className="company-chart__range-value">
                {typeof max === 'number' ? currencyFormatter.format(max) : '—'}
              </p>
            </div>
          </div>
        )}

        <div className="company-chart__axis">
          {axisLabels.map((item, index) => (
            <span key={`${item.label}-${index}`} style={{ left: `${item.position}%` }}>
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <aside className="company-indicators">
        {indicatorItems.map((item) => (
          <IndicatorGauge
            key={item.label}
            label={item.label}
            status={item.status}
            value={item.value}
            variant={item.variant}
            numericValue={item.numericValue}
          />
        ))}
      </aside>
    </div>
  );
}
