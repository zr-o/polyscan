import fs from 'fs/promises';
import path from 'path';

type Constituent = {
  symbol: string;
  name: string;
};

let cachedConstituents: Constituent[] | null = null;

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'sp500.csv');

const parseCsv = (content: string): Constituent[] => {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const [, ...rows] = lines;
  return rows
    .map((line) => {
      const cells = line.match(/([^",]+|"[^"]*")+/g) || [];
      const [symbolRaw, nameRaw] = cells;
      const symbol = symbolRaw ? symbolRaw.replace(/"/g, '').trim() : '';
      const name = nameRaw ? nameRaw.replace(/"/g, '').trim() : '';
      return symbol && name ? { symbol, name } : null;
    })
    .filter((item): item is Constituent => item !== null);
};

export const loadConstituents = async (): Promise<Constituent[]> => {
  if (cachedConstituents) {
    return cachedConstituents;
  }

  try {
    const file = await fs.readFile(DATA_PATH, 'utf-8');
    cachedConstituents = parseCsv(file);
    return cachedConstituents;
  } catch (error) {
    console.error('Unable to load S&P 500 constituents:', error);
    cachedConstituents = [];
    return cachedConstituents;
  }
};

export const findConstituent = async (symbol: string): Promise<Constituent | null> => {
  const list = await loadConstituents();
  const upperSymbol = symbol.toUpperCase();
  return list.find((item) => item.symbol.toUpperCase() === upperSymbol) ?? null;
};
