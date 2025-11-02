import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchCompanyData, type ChartRange } from '../../../lib/company-data';
import { findConstituent } from '../../../lib/sp500';

type CompanyPageProps = {
  params: { symbol: string };
  searchParams?: { range?: string };
};

import CompanyChartClient from '../../../components/CompanyChartClient';
import CompanyProfile from '../../../components/CompanyProfile';

const CHART_WIDTH = 720;
const CHART_HEIGHT = 280;

const formatCurrency = (value: number | null) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercent = (value: number | null) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  const percent = new Intl.NumberFormat('fr-CA', {
    signDisplay: 'always',
    maximumFractionDigits: Math.abs(value) >= 10 ? 1 : 2,
  }).format(value);
  return `${percent}%`;
};

export const dynamic = 'force-dynamic';

const AVAILABLE_RANGES: ChartRange[] = ['1M', '3M', '6M', '1Y', '5Y', 'MAX'];

export async function generateMetadata({ params, searchParams }: CompanyPageProps): Promise<Metadata> {
  const symbol = params.symbol.toUpperCase();
  const company = await findConstituent(symbol);
  if (!company) {
    return { title: `Société introuvable | PolyScan` };
  }

  return {
    title: `${company.name} (${company.symbol}) | PolyScan`,
    description: `Historique du cours pour ${company.name} généré par PolyScan ${
      searchParams?.range ? `(plage ${searchParams.range.toUpperCase()})` : ''
    }.`,
  };
}

export default async function CompanyPage({ params, searchParams }: CompanyPageProps) {
  const symbol = params.symbol.toUpperCase();
  const company = await findConstituent(symbol);
  if (!company) {
    notFound();
  }

  const requestedRange = (searchParams?.range ?? '6M').toUpperCase() as ChartRange;
  const range = AVAILABLE_RANGES.includes(requestedRange) ? requestedRange : '6M';

  let data = null;
  try {
    data = await fetchCompanyData(symbol, range);
  } catch (error) {
    console.error(`Unable to fetch data for ${symbol}:`, error);
  }

  if (!data) {
    notFound();
  }

  const chartPoints = data.chartPoints;

  const buildRangeHref = (targetRange: ChartRange) =>
    targetRange === '6M' ? `/compagnies/${symbol}` : `/compagnies/${symbol}?range=${targetRange}`;

  return (
    <div className="company-page company-page--compact">
      <section className="company-hero">
        <div>
          <p className="eyebrow">Historique du titre</p>
          <div className="company-hero__header">
            <h1>
              <span className="company-name">{data.name.toUpperCase()}</span>{' '}
              <span aria-hidden="true" className="company-hero__ticker">
                {data.symbol}
              </span>
            </h1>
            <CompanyProfile summary={data.businessSummary} name={data.name} />
          </div>
          <p className="company-price-inline">
            <span
              className={`company-price-inline__value${
                typeof data.changePercent === 'number'
                  ? data.changePercent > 0
                    ? ' company-price-inline__value--up'
                    : data.changePercent < 0
                    ? ' company-price-inline__value--down'
                    : ''
                  : ''
              }`}
            >
              {formatCurrency(data.price)}
            </span>
            <span
              className={`company-price-inline__delta${
                typeof data.changePercent === 'number'
                  ? data.changePercent > 0
                    ? ' company-price-inline__delta--up'
                    : data.changePercent < 0
                    ? ' company-price-inline__delta--down'
                    : ''
                  : ''
              }`}
            >
              {' '}
              · {formatPercent(data.changePercent)}
            </span>
          </p>
        </div>
      </section>

      <section className="company-chart-card" aria-label="Graphique de l'évolution du cours">
        <nav className="company-chart-controls" aria-label="Plage temporelle du graphique">
          {AVAILABLE_RANGES.map((option) => (
            <Link
              key={option}
              href={buildRangeHref(option)}
              scroll={false}
              className={`company-chart-control${
                data.chartRange === option ? ' company-chart-control--active' : ''
              }`}
            >
              {option}
            </Link>
          ))}
        </nav>

        <CompanyChartClient
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          points={chartPoints.map((point) => ({
            date: point.date.toISOString(),
            close: point.close,
          }))}
          indicators={data.indicators ?? undefined}
        />
      </section>

    </div>
  );
}
