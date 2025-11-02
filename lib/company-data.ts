import yahooFinance from 'yahoo-finance2';

export type ChartRange = '1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX';

type ChartConfig = {
  interval: string;
  durationDays?: number;
  fromDate?: Date;
};

const DAY_MS = 1000 * 60 * 60 * 24;
const RANGE_CONFIG: Record<ChartRange, ChartConfig> = {
  '1M': { interval: '1d', durationDays: 30 },
  '3M': { interval: '1d', durationDays: 90 },
  '6M': { interval: '1d', durationDays: 180 },
  '1Y': { interval: '1d', durationDays: 365 },
  '5Y': { interval: '1wk', durationDays: 365 * 5 },
  MAX: { interval: '1mo', fromDate: new Date('1980-01-01') },
};

export type CompanyData = {
  name: string;
  symbol: string;
  price: number | null;
  changePercent: number | null;
  change: number | null;
  marketCap: number | null;
  volume: number | null;
  averageVolume: number | null;
  businessSummary: string | null;
  sector: string | null;
  industry: string | null;
  website: string | null;
  employees: number | null;
  analystRating: string | null;
  chartPoints: Array<{ date: Date; close: number }>;
  chartRange: ChartRange;
  indicators: CompanyIndicators | null;
};

export type CompanyIndicators = {
  rsi: number | null;
  rsiStatus: 'good' | 'neutral' | 'bad' | null;
  movingAverageTrend: 'bullish' | 'bearish' | 'neutral' | null;
  movingAverageShortPeriod: number | null;
  movingAverageLongPeriod: number | null;
  volatilityStatus: 'stable' | 'volatile' | 'neutral' | null;
};
const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (value && typeof value === 'object' && 'raw' in value) {
    const rawValue = (value as { raw?: unknown }).raw;
    return typeof rawValue === 'number' && Number.isFinite(rawValue) ? rawValue : null;
  }
  return null;
};

export async function fetchCompanyData(symbol: string, range: ChartRange = '6M'): Promise<CompanyData> {
  const config = RANGE_CONFIG[range] ?? RANGE_CONFIG['6M'];

  const now = new Date();
  const period2 = now;
  const period1 =
    config.fromDate ??
    new Date(now.getTime() - (config.durationDays ?? 180) * DAY_MS);

  const [quote, chart, summary] = await Promise.all([
    yahooFinance.quote(symbol).catch(() => null),
    yahooFinance
      .chart(symbol, {
        period1,
        period2,
        interval: config.interval,
      })
      .catch(() => ({ quotes: [] })),
    yahooFinance.quoteSummary(symbol, { modules: ['summaryProfile'] }).catch(() => null),
  ]);

  const summaryProfile =
    summary && !Array.isArray(summary)
      ? (summary as { summaryProfile?: { longBusinessSummary?: string } }).summaryProfile ?? null
      : Array.isArray(summary)
      ? (summary[0] as { summaryProfile?: { longBusinessSummary?: string } })?.summaryProfile ?? null
      : null;
  let chartPoints: Array<{ date: Date; close: number }> = [];

  if (Array.isArray(chart?.quotes) && chart.quotes.length) {
    chartPoints =
      chart.quotes
        .map((entry) => {
          const rawClose =
            typeof entry.close === 'number'
              ? entry.close
              : entry.close != null
              ? Number(entry.close)
              : Number.NaN;

          if (!(entry.date instanceof Date) || !Number.isFinite(rawClose)) {
            return null;
          }

          return {
            date: entry.date,
            close: rawClose,
          };
        })
        .filter((point): point is { date: Date; close: number } => point !== null) ?? [];
  } else if (chart?.chart?.result?.[0]) {
    const result = chart.chart.result[0];
    const timestamps = result.timestamp ?? [];
    const closes = result.indicators?.quote?.[0]?.close ?? [];

    chartPoints = timestamps
      .map((ts: number, index: number) => {
        const closeValue = closes[index];
        if (typeof closeValue !== 'number' || !Number.isFinite(closeValue)) return null;
        return {
          date: new Date(ts * 1000),
          close: closeValue,
        };
      })
      .filter((point): point is { date: Date; close: number } => !!point);
  }

  const price = quote ? toNumber(quote.regularMarketPrice) : null;
  const changePercent = quote ? toNumber(quote.regularMarketChangePercent) : null;
  const change = quote ? toNumber(quote.regularMarketChange) : null;
  const marketCap = quote ? toNumber(quote.marketCap) : null;
  const volume = quote ? toNumber(quote.regularMarketVolume) : null;
  const averageVolume = quote ? toNumber(quote.averageDailyVolume3Month) : null;
  const indicators = computeIndicators(chartPoints);
  return {
    name: quote?.longName ?? quote?.shortName ?? symbol,
    symbol: symbol.toUpperCase(),
    price,
    changePercent,
    change,
    marketCap,
    volume,
    averageVolume,
    businessSummary: summaryProfile?.longBusinessSummary ?? null,
    sector: summaryProfile?.sector ?? null,
    industry: summaryProfile?.industry ?? null,
    website: summaryProfile?.website ?? null,
    employees: summaryProfile?.fullTimeEmployees ?? null,
    analystRating: typeof quote?.averageAnalystRating === 'string' ? quote.averageAnalystRating : null,
    chartPoints,
    chartRange: range,
    indicators,
  };
}

const computeIndicators = (points: Array<{ date: Date; close: number }>): CompanyIndicators | null => {
  if (points.length < 15) {
    return null;
  }

  const closes = points.map((point) => point.close);
  const averageSpacingDays = calculateAverageSpacingDays(points);

  const rsiPeriod = selectRsiPeriod(closes.length);
  const rsi = calculateRSI(closes, rsiPeriod);
  let rsiStatus: CompanyIndicators['rsiStatus'] = null;
  if (typeof rsi === 'number') {
    if (rsi >= 70) {
      rsiStatus = 'bad';
    } else if (rsi <= 30) {
      rsiStatus = 'good';
    } else {
      rsiStatus = 'neutral';
    }
  }

  const { shortPeriod, longPeriod } = selectMovingAveragePeriods(closes.length);
  const maShort = shortPeriod ? calculateSMA(closes, shortPeriod) : null;
  const maLong = longPeriod ? calculateSMA(closes, longPeriod) : null;
  let movingAverageTrend: CompanyIndicators['movingAverageTrend'] = null;
  if (maShort !== null && maLong !== null) {
    if (maShort > maLong * 1.01) {
      movingAverageTrend = 'bullish';
    } else if (maShort < maLong * 0.99) {
      movingAverageTrend = 'bearish';
    } else {
      movingAverageTrend = 'neutral';
    }
  }

  const returns = [];
  for (let i = 1; i < closes.length; i += 1) {
    const prev = closes[i - 1];
    if (prev) {
      returns.push((closes[i] - prev) / prev);
    }
  }
  const volatilityStatus = evaluateVolatility(returns, averageSpacingDays);

  return {
    rsi,
    rsiStatus,
    movingAverageTrend,
    movingAverageShortPeriod: shortPeriod,
    movingAverageLongPeriod: longPeriod,
    volatilityStatus,
  };
};

const calculateAverageSpacingDays = (points: Array<{ date: Date }>): number => {
  if (points.length < 2) {
    return 1;
  }

  let totalDiff = 0;
  let count = 0;

  for (let i = 1; i < points.length; i += 1) {
    const current = points[i].date;
    const previous = points[i - 1].date;
    if (current instanceof Date && previous instanceof Date) {
      const diff = Math.abs(current.getTime() - previous.getTime());
      if (Number.isFinite(diff) && diff > 0) {
        totalDiff += diff;
        count += 1;
      }
    }
  }

  if (count === 0) {
    return 1;
  }

  return totalDiff / count / DAY_MS;
};

type VolatilityConfig = {
  shortWindow: number;
  longWindow: number;
  ratioStable: number;
  ratioVolatile: number;
  absoluteStable: number;
  absoluteVolatile: number;
};

const selectVolatilityConfig = (spacingDays: number): VolatilityConfig => {
  if (!Number.isFinite(spacingDays) || spacingDays <= 0) {
    return {
      shortWindow: 30,
      longWindow: 120,
      ratioStable: 0.85,
      ratioVolatile: 1.15,
      absoluteStable: 0.012,
      absoluteVolatile: 0.04,
    };
  }

  if (spacingDays <= 2) {
    return {
      shortWindow: 30,
      longWindow: 120,
      ratioStable: 0.85,
      ratioVolatile: 1.15,
      absoluteStable: 0.012,
      absoluteVolatile: 0.04,
    };
  }

  if (spacingDays <= 10) {
    return {
      shortWindow: 16,
      longWindow: 64,
      ratioStable: 0.85,
      ratioVolatile: 1.2,
      absoluteStable: 0.03,
      absoluteVolatile: 0.09,
    };
  }

  return {
    shortWindow: 12,
    longWindow: 48,
    ratioStable: 0.85,
    ratioVolatile: 1.25,
    absoluteStable: 0.08,
    absoluteVolatile: 0.25,
  };
};

const evaluateVolatility = (
  returns: number[],
  spacingDays: number
): CompanyIndicators['volatilityStatus'] => {
  const config = selectVolatilityConfig(spacingDays);
  const shortSample = returns.slice(-config.shortWindow);
  if (shortSample.length < 5) {
    return null;
  }

  const shortVol = calculateStdDev(shortSample);
  if (shortVol == null) {
    return null;
  }

  const longSample = returns.slice(-config.longWindow);
  const longVol =
    longSample.length >= Math.max(10, Math.floor(config.longWindow / 2))
      ? calculateStdDev(longSample)
      : null;

  if (longVol && longVol > 0) {
    const ratio = shortVol / longVol;
    if (Number.isFinite(ratio)) {
      if (ratio <= config.ratioStable) {
        return 'stable';
      }
      if (ratio >= config.ratioVolatile) {
        return 'volatile';
      }
    }
  }

  if (shortVol <= config.absoluteStable) {
    return 'stable';
  }
  if (shortVol >= config.absoluteVolatile) {
    return 'volatile';
  }

  return 'neutral';
};

const selectMovingAveragePeriods = (length: number) => {
  if (length >= 220) {
    return { shortPeriod: 50, longPeriod: 200 };
  }
  if (length >= 150) {
    return { shortPeriod: 30, longPeriod: 120 };
  }
  if (length >= 90) {
    return { shortPeriod: 20, longPeriod: 60 };
  }
  if (length >= 40) {
    return { shortPeriod: 14, longPeriod: 40 };
  }
  if (length >= 15) {
    const shortPeriod = Math.max(7, Math.floor(length / 3));
    const longPeriod = Math.max(shortPeriod + 3, Math.floor((length * 2) / 3));
    return { shortPeriod, longPeriod };
  }
  return { shortPeriod: null, longPeriod: null };
};

const selectRsiPeriod = (length: number) => {
  if (length <= 20) return Math.max(5, length - 1);
  if (length <= 65) return 14;
  if (length <= 130) return 21;
  if (length <= 260) return 30;
  return 45;
};

const calculateSMA = (values: number[], period: number): number | null => {
  if (values.length < period) return null;
  const slice = values.slice(-period);
  const total = slice.reduce((sum, value) => sum + value, 0);
  return total / period;
};

const calculateRSI = (values: number[], period: number): number | null => {
  if (values.length <= period) return null;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i += 1) {
    const change = values[i] - values[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  let averageGain = gains / period;
  let averageLoss = losses / period;

  for (let i = period + 1; i < values.length; i += 1) {
    const change = values[i] - values[i - 1];
    if (change > 0) {
      averageGain = (averageGain * (period - 1) + change) / period;
      averageLoss = (averageLoss * (period - 1)) / period;
    } else {
      averageGain = (averageGain * (period - 1)) / period;
      averageLoss = (averageLoss * (period - 1) - change) / period;
    }
  }

  if (averageLoss === 0) return 100;
  const rs = averageGain / averageLoss;
  return 100 - 100 / (1 + rs);
};

const calculateStdDev = (values: number[]): number | null => {
  if (!values.length) return null;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) * (v - mean), 0) / values.length;
  return Math.sqrt(variance);
};
