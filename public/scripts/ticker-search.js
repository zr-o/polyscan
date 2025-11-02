(() => {
  const CONSTITUENTS_URL = '/data/sp500.csv';
  const DEFAULT_VISIBLE = 8;
  const DEBOUNCE_DELAY = 220;

  const input = document.querySelector('#ticker-input');
  const resultsList = document.querySelector('#ticker-results');

  if (!input || !resultsList) {
    return;
  }

  let debounceTimer = null;
  let currentItems = [];
  let activeIndex = -1;
  let lastQuery = '';
  let constituents = [];
  let constituentsPromise = null;
  const quoteCache = new Map();

  const formatPrice = (value) => (typeof value === 'number' ? `$${value.toFixed(2)}` : 'N/A');

  const formatTrend = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return 'Flat N/A';
    }
    const direction = value > 0 ? 'Up' : value < 0 ? 'Down' : 'Flat';
    const sign = value > 0 ? '+' : value < 0 ? '' : '';
    return `${direction} ${sign}${value.toFixed(2)}%`;
  };

  const trendClass = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return 'ticker-search__change ticker-search__change--flat';
    if (value > 0) return 'ticker-search__change ticker-search__change--up';
    if (value < 0) return 'ticker-search__change ticker-search__change--down';
    return 'ticker-search__change ticker-search__change--flat';
  };

  const setStatus = (message) => {
    resultsList.innerHTML = `<li class="ticker-search__status" role="status">${message}</li>`;
    resultsList.hidden = false;
    activeIndex = -1;
    currentItems = [];
    input.removeAttribute('aria-activedescendant');
  };

  const loadConstituents = async () => {
    if (constituents.length) {
      return constituents;
    }
    if (!constituentsPromise) {
      constituentsPromise = fetch(CONSTITUENTS_URL)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return response.text();
        })
        .then((csv) => {
          const lines = csv
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

          const [header, ...rows] = lines;
          if (!header) {
            return [];
          }

          return rows
            .map((line) => {
              const cells = line.match(/([^",]+|"[^"]*")+/g) || [];
              const [symbolRaw, nameRaw] = cells;
              const symbol = symbolRaw ? symbolRaw.replace(/"/g, '').trim() : '';
              const name = nameRaw ? nameRaw.replace(/"/g, '').trim() : '';
              return symbol && name ? { symbol, name } : null;
            })
            .filter((item) => item !== null);
        })
        .catch((error) => {
          console.error('Unable to load S&P 500 list:', error);
          return [];
        });
    }
    constituents = await constituentsPromise;
    return constituents;
  };

  const fetchQuote = async (symbol, signal) => {
    if (quoteCache.has(symbol)) {
      return quoteCache.get(symbol);
    }
    const response = await fetch(`/api/quote?ticker=${encodeURIComponent(symbol)}`, { signal });
    if (!response.ok) {
      throw new Error(`Quote request failed with status ${response.status}`);
    }
    const data = await response.json();
    quoteCache.set(symbol, data);
    return data;
  };

  const filterConstituents = (query, list) => {
    if (!query) {
      return list.slice(0, DEFAULT_VISIBLE);
    }
    const normalized = query.trim().toLowerCase();
    return list
      .filter(
        (item) =>
          item.symbol.toLowerCase().includes(normalized) ||
          item.name.toLowerCase().includes(normalized)
      )
      .slice(0, DEFAULT_VISIBLE);
  };

  const renderItems = (items) => {
    if (!items.length) {
      setStatus('Aucune compagnie trouvée.');
      return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'ticker-search__item';
      li.dataset.ticker = item.symbol;
      li.dataset.name = item.name;
      li.id = `ticker-option-${item.symbol.toLowerCase()}`;
      li.tabIndex = -1;
      li.setAttribute('role', 'option');
      li.innerHTML = `
        <span class="ticker-search__symbol">${item.symbol}</span>
        <span class="ticker-search__name">${item.name}</span>
        <span class="ticker-search__price">${formatPrice(item.price)}</span>
        <span class="${trendClass(item.changePct)}">${formatTrend(item.changePct)}</span>
      `;
      fragment.appendChild(li);
    });

    resultsList.innerHTML = '';
    resultsList.appendChild(fragment);
    resultsList.hidden = false;
    currentItems = Array.from(resultsList.querySelectorAll('.ticker-search__item'));
    activeIndex = -1;
    input.removeAttribute('aria-activedescendant');
  };

  const handleError = (error) => {
    console.error('Ticker search error:', error);
    setStatus("Impossible de récupérer les données financières.");
  };

  let currentController = null;

  const performSearch = async (query) => {
    lastQuery = query;

    if (currentController) {
      currentController.abort();
    }
    currentController = new AbortController();
    const { signal } = currentController;

    try {
      const list = await loadConstituents();
      if (!list.length) {
        throw new Error('Liste S&P 500 indisponible');
      }

      const matches = filterConstituents(query, list);
      if (!matches.length) {
        renderItems([]);
        return;
      }

      setStatus('Chargement...');
      const quotes = await Promise.all(
        matches.map((meta) =>
          fetchQuote(meta.symbol, signal).catch((error) => {
            console.error(`Failed to fetch quote for ${meta.symbol}:`, error);
            return null;
          })
        )
      );

      if (query !== lastQuery) {
        return;
      }

      const combined = matches.map((meta, index) => {
        const quote = quotes[index];
        return {
          symbol: meta.symbol,
          name: meta.name,
          price: quote?.price ?? null,
          changePct: quote?.changePct ?? null,
        };
      });

      renderItems(combined);
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
      handleError(error);
    }
  };

  const highlightItem = (index) => {
    currentItems.forEach((item, idx) => {
      item.classList.toggle('is-active', idx === index);
    });

    if (index >= 0 && currentItems[index]) {
      input.setAttribute('aria-activedescendant', currentItems[index].id);
      currentItems[index].scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  };

  const applySelection = (element) => {
    if (!element) return;
    input.value = `${element.dataset.ticker} - ${element.dataset.name}`;
    resultsList.hidden = true;
  };

  input.addEventListener('input', (event) => {
    const value = event.target.value;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      performSearch(value);
    }, DEBOUNCE_DELAY);
  });

  input.addEventListener('focus', () => {
    if (!input.value.trim()) {
      performSearch('');
    }
  });

  input.addEventListener('keydown', (event) => {
    if (resultsList.hidden && event.key !== 'Escape') {
      performSearch(event.target.value);
    }

    if (!currentItems.length) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        activeIndex = (activeIndex + 1) % currentItems.length;
        highlightItem(activeIndex);
        break;
      case 'ArrowUp':
        event.preventDefault();
        activeIndex = (activeIndex - 1 + currentItems.length) % currentItems.length;
        highlightItem(activeIndex);
        break;
      case 'Enter':
        if (activeIndex >= 0) {
          event.preventDefault();
          applySelection(currentItems[activeIndex]);
        }
        break;
      case 'Escape':
        resultsList.hidden = true;
        activeIndex = -1;
        highlightItem(activeIndex);
        break;
      default:
        break;
    }
  });

  resultsList.addEventListener('mousedown', (event) => {
    const item = event.target.closest('.ticker-search__item');
    if (!item) return;
    event.preventDefault();
    applySelection(item);
  });

  document.addEventListener('click', (event) => {
    if (event.target === input || event.target.closest('.ticker-search')) {
      return;
    }
    resultsList.hidden = true;
  });

  input.addEventListener('blur', () => {
    setTimeout(() => {
      if (!resultsList.matches(':hover')) {
        resultsList.hidden = true;
      }
    }, 120);
  });

  performSearch('');
})();
