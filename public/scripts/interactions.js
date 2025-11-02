const initInteractions = () => {
  const serviceActions = document.querySelectorAll('.service-action');
  const tickerInput = document.querySelector('#ticker-input');
  const chatTriggers = document.querySelectorAll('[data-open-chat]');

  serviceActions.forEach((action) => {
    action.addEventListener('click', (event) => {
      const type = action.getAttribute('data-action');

      switch (type) {
        case 'chatbot': {
          window.dispatchEvent(new CustomEvent('polyscan-open-chat'));
          break;
        }
        case 'search': {
          event.preventDefault();
          if (tickerInput) {
            const field = tickerInput.closest('.ticker-search__field');
            try {
              tickerInput.focus({ preventScroll: true });
            } catch (error) {
              tickerInput.focus();
            }

            const ticker = action.getAttribute('data-symbol') || 'AAPL';
            tickerInput.value = '';

            const typeTicker = (index = 0) => {
              if (!tickerInput) return;
              tickerInput.value = ticker.slice(0, index);
              tickerInput.dispatchEvent(new Event('input', { bubbles: true }));
              tickerInput.setSelectionRange(tickerInput.value.length, tickerInput.value.length);

              if (index <= ticker.length) {
                setTimeout(() => typeTicker(index + 1), 90);
              }
            };

            typeTicker(1);

            if (field) {
              field.classList.add('search-highlight');
              setTimeout(() => field.classList.remove('search-highlight'), 1800);
            }
          }
          break;
        }
        default:
          break;
      }
    });
  });

  chatTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent('polyscan-open-chat'));
    });
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInteractions);
} else {
  initInteractions();
}
