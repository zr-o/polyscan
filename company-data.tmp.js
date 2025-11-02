"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCompanyData = void 0;
const yahoo_finance2_1 = require("yahoo-finance2");
const DAY_MS = 1000 * 60 * 60 * 24;
const RANGE_CONFIG = {
    '1M': { interval: '1d', durationDays: 30 },
    '3M': { interval: '1d', durationDays: 90 },
    '6M': { interval: '1d', durationDays: 180 },
    '1Y': { interval: '1d', durationDays: 365 },
    '5Y': { interval: '1wk', durationDays: 365 * 5 },
    MAX: { interval: '1mo', fromDate: new Date('1980-01-01') },
};
const toNumber = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (value && typeof value === 'object' && 'raw' in value) {
        const rawValue = value.raw;
        return typeof rawValue === 'number' && Number.isFinite(rawValue) ? rawValue : null;
    }
    return null;
};
async function fetchCompanyData(symbol, range = '6M') {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
    const config = (_a = RANGE_CONFIG[range]) !== null && _a !== void 0 ? _a : RANGE_CONFIG['6M'];
    const now = new Date();
    const period2 = now;
    const period1 = (_b = config.fromDate) !== null && _b !== void 0 ? _b : new Date(now.getTime() - ((_c = config.durationDays) !== null && _c !== void 0 ? _c : 180) * DAY_MS);
    const [quote, chart, summary] = await Promise.all([
        yahoo_finance2_1.default.quote(symbol).catch(() => null),
        yahoo_finance2_1.default
            .chart(symbol, {
            period1,
            period2,
            interval: config.interval,
        })
            .catch(() => ({ quotes: [] })),
        yahoo_finance2_1.default.quoteSummary(symbol, { modules: ['summaryProfile'] }).catch(() => []),
    ]);
    const summaryProfile = Array.isArray(summary) ? (_d = summary[0]) === null || _d === void 0 ? void 0 : _d.summaryProfile : null;
    let chartPoints = [];
    if (Array.isArray(chart === null || chart === void 0 ? void 0 : chart.quotes) && chart.quotes.length) {
        chartPoints =
            (_e = chart.quotes
                .map((entry) => ({
                date: entry.date,
                close: typeof entry.close === 'number' ? entry.close : Number(entry.close),
            }))
                .filter((point) => point.date instanceof Date && Number.isFinite(point.close))) !== null && _e !== void 0 ? _e : [];
    }
    else if ((_g = (_f = chart === null || chart === void 0 ? void 0 : chart.chart) === null || _f === void 0 ? void 0 : _f.result) === null || _g === void 0 ? void 0 : _g[0]) {
        const result = chart.chart.result[0];
        const timestamps = (_h = result.timestamp) !== null && _h !== void 0 ? _h : [];
        const closes = (_m = (_l = (_k = (_j = result.indicators) === null || _j === void 0 ? void 0 : _j.quote) === null || _k === void 0 ? void 0 : _k[0]) === null || _l === void 0 ? void 0 : _l.close) !== null && _m !== void 0 ? _m : [];
        chartPoints = timestamps
            .map((ts, index) => {
            const closeValue = closes[index];
            if (typeof closeValue !== 'number' || !Number.isFinite(closeValue))
                return null;
            return {
                date: new Date(ts * 1000),
                close: closeValue,
            };
        })
            .filter((point) => !!point);
    }
    const price = quote ? toNumber(quote.regularMarketPrice) : null;
    const changePercent = quote ? toNumber(quote.regularMarketChangePercent) : null;
    const change = quote ? toNumber(quote.regularMarketChange) : null;
    const marketCap = quote ? toNumber(quote.marketCap) : null;
    const volume = quote ? toNumber(quote.regularMarketVolume) : null;
    const averageVolume = quote ? toNumber(quote.averageDailyVolume3Month) : null;
    const indicators = computeIndicators(chartPoints);
    return {
        name: (_p = (_o = quote === null || quote === void 0 ? void 0 : quote.longName) !== null && _o !== void 0 ? _o : quote === null || quote === void 0 ? void 0 : quote.shortName) !== null && _p !== void 0 ? _p : symbol,
        symbol: symbol.toUpperCase(),
        price,
        changePercent,
        change,
        marketCap,
        volume,
        averageVolume,
        businessSummary: (_q = summaryProfile === null || summaryProfile === void 0 ? void 0 : summaryProfile.longBusinessSummary) !== null && _q !== void 0 ? _q : null,
        sector: (_r = summaryProfile === null || summaryProfile === void 0 ? void 0 : summaryProfile.sector) !== null && _r !== void 0 ? _r : null,
        industry: (_s = summaryProfile === null || summaryProfile === void 0 ? void 0 : summaryProfile.industry) !== null && _s !== void 0 ? _s : null,
        website: (_t = summaryProfile === null || summaryProfile === void 0 ? void 0 : summaryProfile.website) !== null && _t !== void 0 ? _t : null,
        employees: (_u = summaryProfile === null || summaryProfile === void 0 ? void 0 : summaryProfile.fullTimeEmployees) !== null && _u !== void 0 ? _u : null,
        analystRating: typeof (quote === null || quote === void 0 ? void 0 : quote.averageAnalystRating) === 'string' ? quote.averageAnalystRating : null,
        chartPoints,
        chartRange: range,
        indicators,
    };
}
exports.fetchCompanyData = fetchCompanyData;
const computeIndicators = (points) => {
    if (points.length < 15) {
        return null;
    }
    const closes = points.map((point) => point.close);
    const rsiPeriod = selectRsiPeriod(closes.length);
    const rsi = calculateRSI(closes, rsiPeriod);
    let rsiStatus = null;
    if (typeof rsi === 'number') {
        if (rsi >= 70) {
            rsiStatus = 'bad';
        }
        else if (rsi <= 30) {
            rsiStatus = 'good';
        }
        else {
            rsiStatus = 'neutral';
        }
    }
    const { shortPeriod, longPeriod } = selectMovingAveragePeriods(closes.length);
    const maShort = shortPeriod ? calculateSMA(closes, shortPeriod) : null;
    const maLong = longPeriod ? calculateSMA(closes, longPeriod) : null;
    let movingAverageTrend = null;
    if (maShort !== null && maLong !== null) {
        if (maShort > maLong * 1.01) {
            movingAverageTrend = 'bullish';
        }
        else if (maShort < maLong * 0.99) {
            movingAverageTrend = 'bearish';
        }
        else {
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
    const volatility = calculateStdDev(returns.slice(-30));
    let volatilityStatus = null;
    if (typeof volatility === 'number') {
        if (volatility <= 0.015) {
            volatilityStatus = 'stable';
        }
        else if (volatility >= 0.04) {
            volatilityStatus = 'volatile';
        }
        else {
            volatilityStatus = 'neutral';
        }
    }
    return {
        rsi,
        rsiStatus,
        movingAverageTrend,
        movingAverageShortPeriod: shortPeriod,
        movingAverageLongPeriod: longPeriod,
        volatilityStatus,
    };
};
const selectMovingAveragePeriods = (length) => {
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
const selectRsiPeriod = (length) => {
    if (length <= 20)
        return Math.max(5, length - 1);
    if (length <= 65)
        return 14;
    if (length <= 130)
        return 21;
    if (length <= 260)
        return 30;
    return 45;
};
const calculateSMA = (values, period) => {
    if (values.length < period)
        return null;
    const slice = values.slice(-period);
    const total = slice.reduce((sum, value) => sum + value, 0);
    return total / period;
};
const calculateRSI = (values, period) => {
    if (values.length <= period)
        return null;
    let gains = 0;
    let losses = 0;
    for (let i = 1; i <= period; i += 1) {
        const change = values[i] - values[i - 1];
        if (change > 0) {
            gains += change;
        }
        else {
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
        }
        else {
            averageGain = (averageGain * (period - 1)) / period;
            averageLoss = (averageLoss * (period - 1) - change) / period;
        }
    }
    if (averageLoss === 0)
        return 100;
    const rs = averageGain / averageLoss;
    return 100 - 100 / (1 + rs);
};
const calculateStdDev = (values) => {
    if (!values.length)
        return null;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + (v - mean) * (v - mean), 0) / values.length;
    return Math.sqrt(variance);
};
