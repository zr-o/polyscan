import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
import { z } from 'zod';

const QuerySchema = z.object({
  ticker: z
    .string({ required_error: 'ticker is required' })
    .min(1, 'ticker is required')
    .transform((value) => value.trim().toUpperCase()),
});

const QuoteSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  change: z.number().nullable(),
  changePct: z.number().nullable(),
  currency: z.string().nullable(),
  marketState: z.string().nullable(),
  series: z
    .array(
      z.object({
        date: z.string(),
        price: z.number(),
      })
    )
    .min(1),
});

type QuotePayload = z.infer<typeof QuoteSchema>;

type HistoricalRow = Awaited<ReturnType<typeof yahooFinance.historical>> extends Array<infer Item>
  ? Item
  : never;

type QuoteRow = Awaited<ReturnType<typeof yahooFinance.quote>>;

const SERIES_DAYS = 30;

const toIsoDate = (value: Date) => value.toISOString().split('T')[0];

const normaliseSeries = (history: HistoricalRow[], fallbackPrice: number): QuotePayload['series'] => {
  const cleaned = history
    .filter((row) => row.date instanceof Date && typeof row.close === 'number')
    .map((row) => ({
      date: toIsoDate(row.date as Date),
      price: row.close as number,
    }));

  if (cleaned.length > 0) {
    return cleaned;
  }

  return [
    {
      date: toIsoDate(new Date()),
      price: fallbackPrice,
    },
  ];
};

const resolvePrice = (quote: QuoteRow): number | null => {
  const candidates = [
    quote.regularMarketPrice,
    quote.postMarketPrice,
    quote.preMarketPrice,
    quote.bid,
    quote.ask,
  ];
  const price = candidates.find((value): value is number => typeof value === 'number');
  return price ?? null;
};

const resolveChange = (quote: QuoteRow): { change: number | null; changePct: number | null } => {
  const changes = [
    quote.regularMarketChange,
    quote.postMarketChange,
    quote.preMarketChange,
  ];
  const change = changes.find((value): value is number => typeof value === 'number') ?? null;

  const pctChanges = [
    quote.regularMarketChangePercent,
    quote.postMarketChangePercent,
    quote.preMarketChangePercent,
  ];
  const changePct = pctChanges.find((value): value is number => typeof value === 'number') ?? null;

  return { change, changePct };
};

export async function GET(request: NextRequest) {
  const parseResult = QuerySchema.safeParse({ ticker: request.nextUrl.searchParams.get('ticker') });

  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: 'ticker query parameter is required',
        issues: parseResult.error.issues,
      },
      { status: 400 }
    );
  }

  const ticker = parseResult.data.ticker;

  try {
    const quote = await yahooFinance.quote(ticker);

    if (!quote) {
      return NextResponse.json(
        { error: `No market data returned for ticker ${ticker}` },
        { status: 404 }
      );
    }

    const price = resolvePrice(quote);

    if (price === null) {
      return NextResponse.json(
        { error: `No price information available for ticker ${ticker}` },
        { status: 404 }
      );
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - SERIES_DAYS);

    const history = await yahooFinance.historical(ticker, {
      period1: startDate,
      period2: endDate,
      interval: '1d',
    });

    const { change, changePct } = resolveChange(quote);

    const payload: QuotePayload = QuoteSchema.parse({
      symbol: quote.symbol ?? ticker,
      price,
      change,
      changePct,
      currency: (quote.currency ?? quote.financialCurrency ?? null) as string | null,
      marketState: (quote.marketState ?? quote.market ?? null) as string | null,
      series: normaliseSeries(history ?? [], price),
    });

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Failed to resolve quote', error);
    return NextResponse.json(
      { error: `Failed to resolve quote for ${ticker}` },
      { status: 500 }
    );
  }
}

/*
Example client usage:

async function loadQuote() {
  const response = await fetch('/api/quote?ticker=AAPL');
  if (!response.ok) {
    throw new Error('Unable to fetch quote');
  }
  const data = await response.json();
  console.log(data);
}
*/
